import './Loader.css'

function Loader({ text = 'Loading…', size = 'md', overlay = false }) {
  const content = (
    <div className={`loader-wrap loader-wrap--${size}`}>
      <div className="loader-ring">
        <div /><div /><div /><div />
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  )

  if (overlay) {
    return <div className="loader-overlay">{content}</div>
  }
  return content
}

export default Loader
