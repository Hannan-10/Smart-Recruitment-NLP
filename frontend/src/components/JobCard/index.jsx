import './JobCard.css'
import { FiMapPin, FiUsers, FiBookmark, FiSend, FiTag } from 'react-icons/fi'

function logoColor(name = '') {
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return `hsl(${hue}, 58%, 48%)`
}

function logoInitials(name = '') {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}

function JobCard({
  title,
  company,
  location,
  type = 'full-time',
  category,
  date = '',
  logo,
  actionText,
  onAction,
  onSave,
  onCardClick,
  isSaved,
  actionIcon,
}) {
  const handleButtonClick = (e, cb) => { e.stopPropagation(); cb?.() }
  const ActionIcon = actionIcon

  const typeLabel = type.replace(/-/g, ' ')

  return (
    <article
      className={`job-card premium-card${onCardClick ? ' clickable' : ''}`}
      onClick={onCardClick}
    >
      <div className="job-card-top">
        <div className="job-card-title-area">
          {logo ? (
            <img src={logo} alt={company} className="company-logo-img" />
          ) : (
            <div
              className="company-logo-initials"
              style={{ background: logoColor(company) }}
              title={company}
            >
              {logoInitials(company)}
            </div>
          )}
          <div className="job-card-title-block">
            <h3>{title}</h3>
            <span className="company-name-label">{company}</span>
          </div>
        </div>
        <div className="job-card-badges">
          <span className="job-type">{typeLabel}</span>
          {category && <span className="job-category"><FiTag /> {category}</span>}
        </div>
      </div>

      <div className="job-card-body">
        <div className="job-meta-group">
          <span className="job-meta-item">
            <FiUsers className="meta-icon" />
            {company}
          </span>
          <span className="job-meta-item">
            <FiMapPin className="meta-icon" />
            {location}
          </span>
        </div>
      </div>

      <div className="job-card-footer">
        <span className="date">{date}</span>
        <div className="action-buttons">
          {onSave && (
            <button
              onClick={(e) => handleButtonClick(e, onSave)}
              className={`save-btn${isSaved ? ' saved' : ''}`}
            >
              <FiBookmark className="btn-icon" />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}
          {onAction && actionText && (
            <button onClick={(e) => handleButtonClick(e, onAction)} className="apply-btn">
              {ActionIcon ? <ActionIcon className="btn-icon" /> : <FiSend className="btn-icon" />}
              {actionText}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default JobCard
