"""
AI Scoring Microservice — Smart Recruitment NLP
Runs separately on port 5001.

Start with:
    pip install -r requirements.txt
    python ai_service.py
"""

import os
import sys
import re

# Must run before any torch/sentence_transformers import on Windows.
# Background processes don't inherit the shell's DLL search directories,
# so we register them explicitly via os.add_dll_directory (Python 3.8+).
if sys.platform == 'win32' and hasattr(os, 'add_dll_directory'):
    import site
    for _sp in site.getsitepackages():
        _torch_lib = os.path.join(_sp, 'torch', 'lib')
        if os.path.isdir(_torch_lib):
            os.add_dll_directory(_torch_lib)
            break

import numpy as np
import joblib
import pdfplumber
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize
from flask import Flask, request, jsonify

# ── NLTK one-time downloads ───────────────────────────────────────────────────
nltk.download('wordnet',  quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('omw-1.4',  quiet=True)

# ── Load artifacts ─────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, 'ai-modal', 'relevance_model.pkl')

print("Loading XGBoost model …")
xgb_model = joblib.load(MODEL_PATH)

print("Loading SentenceTransformer (all-mpnet-base-v2) …")
embedder = SentenceTransformer('all-mpnet-base-v2')
print("✓ Models ready.")

# ── Text cleaning — must match training exactly (notebook cell-2) ─────────────
lemmatizer = WordNetLemmatizer()
stop_words  = set(stopwords.words('english'))

DOMAIN = {
    r'c\+\+':              'cplusplus',
    r'\.net':              'dotnet',
    r'node\.js':           'nodejs',
    r'react\.js':          'reactjs',
    r'next\.js':           'nextjs',
    r'vue\.js':            'vuejs',
    r'express\.js':        'expressjs',
    r'asp\.net':           'aspnet',
    r'ci/cd':              'cicd',
    r'rest api':           'restapi',
    r'machine learning':   'machinelearning',
    r'deep learning':      'deeplearning',
    r'natural language':   'naturallanguage',
    r'data science':       'datascience',
    r'computer vision':    'computervision',
    r'sql server':         'sqlserver',
    r'power bi':           'powerbi',
}

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ''
    text = text.lower()
    for pattern, replacement in DOMAIN.items():
        text = re.sub(pattern, replacement, text)
    text = re.sub(r'\S+@\S+',            ' ', text)   # emails
    text = re.sub(r'http\S+',            ' ', text)   # URLs
    text = re.sub(r'\+?[\d\s\-\(\)]{7,}', ' ', text)  # phone numbers
    text = re.sub(r'[^a-z\s]',           ' ', text)   # non-alpha
    text = re.sub(r'\s+',                ' ', text)   # collapse whitespace
    tokens = [
        lemmatizer.lemmatize(w)
        for w in text.split()
        if len(w) > 2 and w not in stop_words
    ]
    return ' '.join(tokens).strip()

# ── Feature helpers — must match notebook cell-5 ──────────────────────────────
def get_experience_score(raw_text: str) -> float:
    pattern = re.compile(
        r'(\d+)[\s\+]*(year|yr)s?[\s\w]{0,10}(experience|exp|work)',
        re.IGNORECASE
    )
    matches = pattern.findall(raw_text)
    if matches:
        years = max(int(m[0]) for m in matches if int(m[0]) < 50)
    else:
        year_mentions = re.findall(r'\b(19|20)\d{2}\b', raw_text)
        years = max(0, len(set(year_mentions)) - 1)
    return min(years, 15) / 15.0


def get_skill_match(cv_clean: str, jd_clean: str) -> float:
    jd_tokens = set(
        w for w in jd_clean.lower().split()
        if len(w) > 3 and w not in stop_words
    )
    cv_tokens = set(cv_clean.lower().split())
    if not jd_tokens:
        return 0.0
    return len(jd_tokens & cv_tokens) / len(jd_tokens)


def build_feature_vector(jd_emb, cv_emb, cv_raw: str, jd_clean: str, cv_clean: str):
    """1540-dim vector matching the training pipeline exactly."""
    cosine = float(np.dot(jd_emb, cv_emb))   # equals dot product (both L2-normalised)
    dot    = float(np.dot(jd_emb, cv_emb))
    diff   = np.abs(jd_emb - cv_emb)          # 768
    prod   = jd_emb * cv_emb                   # 768
    skill  = get_skill_match(cv_clean, jd_clean)
    exp    = get_experience_score(cv_raw)
    return np.concatenate([[cosine, dot, skill, exp], diff, prod])   # 1540


# ── PDF text extraction ────────────────────────────────────────────────────────
def extract_pdf_text(path: str) -> str:
    try:
        text = ''
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text += t + '\n'
        return text.strip()
    except Exception:
        return ''


# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'XGBoost 91.9% accuracy / AUC 0.9499'})


@app.route('/score-cvs', methods=['POST'])
def score_cvs():
    data        = request.get_json(force=True)
    jd_text     = data.get('job_description', '').strip()
    applications = data.get('applications', [])

    if not jd_text:
        return jsonify({'error': 'job_description is required'}), 400

    # Embed JD — encode original text (matches notebook cell-13)
    jd_clean = clean_text(jd_text)
    jd_emb   = normalize([embedder.encode(jd_text)])[0]

    results = []
    for app_data in applications:
        app_id  = app_data.get('id')
        cv_path = app_data.get('cv_path') or ''

        score     = 0.0
        breakdown = {'semantic': 0.0, 'skill_match': 0.0, 'experience': 0.0}
        error_msg = None

        if not cv_path:
            error_msg = 'No CV uploaded'
        else:
            cv_raw = extract_pdf_text(cv_path)
            if not cv_raw:
                error_msg = 'Could not extract text from CV'
            else:
                cv_clean = clean_text(cv_raw)
                if len(cv_clean) < 20:
                    error_msg = 'CV text too short to score'
                else:
                    # Encode cleaned CV text (matches how training CVs were embedded)
                    cv_emb = normalize([embedder.encode(cv_clean)])[0]
                    feat   = build_feature_vector(jd_emb, cv_emb, cv_raw, jd_clean, cv_clean)
                    feat   = np.array(feat, dtype=np.float32).reshape(1, -1)
                    prob   = float(xgb_model.predict_proba(feat)[0][1])
                    score  = round(prob * 100, 1)

                    cosine = float(np.dot(jd_emb, cv_emb))
                    breakdown = {
                        'semantic':    round(cosine * 100, 1),
                        'skill_match': round(get_skill_match(cv_clean, jd_clean) * 100, 1),
                        'experience':  round(get_experience_score(cv_raw) * 100, 1),
                    }

        entry = {'id': app_id, 'score': score, 'breakdown': breakdown}
        if error_msg:
            entry['error'] = error_msg
        results.append(entry)

    return jsonify(results)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
