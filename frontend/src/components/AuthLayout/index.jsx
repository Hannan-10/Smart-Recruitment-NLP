import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded'
import './AuthLayout.css'
import { images } from '../../assets'

function AuthLayout({
  title,
  subtitle,
  children,
  panelTitle,
  panelSubtitle,
  panelAction,
  panelImage = images.authHero,
  panelSide = 'left',
  showLogoAboveForm = false,
}) {
  return (
    <div className="auth-wrapper">
      <div className={`auth-shell panel-${panelSide}`}>
        <aside className="auth-panel">
          <div className="panel-overlay" />
          <img src={panelImage} alt="" className="panel-image" />
          <div className="panel-content">
            <h2>{panelTitle}</h2>
            {panelSubtitle ? <p>{panelSubtitle}</p> : null}
            {panelAction}
          </div>
        </aside>
        <div className="auth-card">
          {showLogoAboveForm ? (
            <div className="auth-card-brand">
              <span className="auth-card-icon-ring" aria-hidden>
                <BusinessCenterRoundedIcon className="auth-card-mui-icon" />
              </span>
            </div>
          ) : null}
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
