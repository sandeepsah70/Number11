import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [pressed, setPressed] = useState(false);

  return (
    <div className="splash screen">
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Animated blobs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-60px',
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-80px',
          width: 260, height: 260, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)', pointerEvents: 'none'
        }} />

        <div className="splash-logo">📱</div>
        <h1 className="splash-title">Virtual Number</h1>
        <p className="splash-sub">
          Get a virtual number for calls, SMS and OTP.{'\n'}Keep your real number private and secure.
        </p>

        <div className="splash-features">
          {[
            { icon: '🔒', label: 'Privacy\nFirst' },
            { icon: '🌐', label: 'Global\nCoverage' },
            { icon: '⚡', label: 'Instant\nActivation' },
          ].map(f => (
            <div key={f.label} className="splash-feat">
              <div className="splash-feat-icon">{f.icon}</div>
              <span className="splash-feat-label">{f.label}</span>
            </div>
          ))}
        </div>

        <button
          className="btn btn-white"
          style={{ maxWidth: 280, transition: 'transform 0.15s', transform: pressed ? 'scale(0.96)' : 'scale(1)' }}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => { setPressed(false); navigate('/login'); }}
          onTouchStart={() => setPressed(true)}
          onTouchEnd={() => { setPressed(false); navigate('/login'); }}
        >
          🚀 &nbsp; Get Started
        </button>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 32, textAlign: 'center' }}>
          Join 10,000+ users keeping their privacy safe
        </p>
      </div>
    </div>
  );
}
