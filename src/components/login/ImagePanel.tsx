import bhmpLogo from '../../assets/login/bhmp-logo.avif'
import teamPhoto from '../../assets/login/team-photo.jpg'

// BHMP Network brand palette + headline, from the reference banner.
const NAVY = '#0b1642'
const SKY_BLUE = '#afe0ff'
const LAVENDER = '#dcceff'

const CONTENT = {
  headline: 'Learn. Connect. Grow.',
  subtext: 'For students. For graduates. For professionals. For career changers.',
}

export function ImagePanel() {
  return (
    <div
      className="login-image-panel"
      style={{
        flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden',
        backgroundImage: `url(${teamPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center',
        padding: 40,
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(160deg, ${NAVY}e6 0%, #101d52e6 55%, #1c2a63e6 100%)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.55,
        background: `radial-gradient(circle at 15% 15%, ${SKY_BLUE}33, transparent 45%), radial-gradient(circle at 85% 80%, ${LAVENDER}2e, transparent 45%)`,
      }} />

      <div style={{ position: 'relative' }}>
        <img
          src={bhmpLogo} alt="BHMP Network"
          style={{ height: 52, width: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }}
        />
      </div>

      <div style={{ position: 'relative', color: '#fff', maxWidth: 440 }}>
        <p style={{
          fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, margin: '0 0 14px',
          letterSpacing: '0.01em', textTransform: 'uppercase',
        }}>
          {CONTENT.headline}
        </p>
        <p style={{
          fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.6, margin: 0,
          letterSpacing: '0.03em', textTransform: 'uppercase', opacity: 0.8,
        }}>
          {CONTENT.subtext}
        </p>
      </div>
    </div>
  )
}
