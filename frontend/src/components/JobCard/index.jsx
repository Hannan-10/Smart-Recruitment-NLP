import './JobCard.css'
import { FiBriefcase, FiMapPin, FiUsers } from 'react-icons/fi'
import { FiBookmark, FiSend } from 'react-icons/fi'

function JobCard({
  title,
  company,
  location,
  type = 'FULL-TIME',
  date = '',
  actionText,
  onAction,
  onSave,
  onCardClick,
  status,
  isSaved,
  actionIcon,
}) {
  const handleButtonClick = (event, callback) => {
    event.stopPropagation()
    callback?.()
  }

  const ActionIcon = actionIcon

  return (
    <article
      className={`job-card premium-card${onCardClick ? ' clickable' : ''}`}
      onClick={onCardClick}
    >
      <div className="job-card-top">
        <div className="job-card-title-area">
          <div className="logo-placeholder" />
          <h3>{title}</h3>
        </div>
        <span className="job-type">{type}</span>
      </div>

      <div className="job-card-body">
        <div className="job-meta-group">
          <span className="job-meta-item">
            <FiBriefcase className="meta-icon" />
            {type.toLowerCase().replace('-', ' ')}
          </span>
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
          {onSave ? (
            <button
              onClick={(e) => handleButtonClick(e, onSave)}
              className={`save-btn${isSaved ? ' saved' : ''}`}
            >
              <FiBookmark className="btn-icon" />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          ) : null}
          {onAction && actionText ? (
            <button
              onClick={(e) => handleButtonClick(e, onAction)}
              className="apply-btn"
            >
              {ActionIcon ? <ActionIcon className="btn-icon" /> : <FiSend className="btn-icon" />}
              {actionText}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default JobCard