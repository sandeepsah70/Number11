import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="screen pb-nav" style={{ background: 'var(--bg)' }}>
      {/* Top Bar */}
      <div className="top-bar">
        <button className="top-bar-icon" aria-label="Menu">☰</button>
        <div className="top-bar-title">📱 Virtual Number</div>
        <button className="top-bar-icon" aria-label="Profile" onClick={() => navigate('/profile')}>
          👤
        </button>
      </div>

      <div className="home-body">
        {/* Hero Card */}
        <div className="hero-card">
          <div className="hero-text">
            <h2>Your Privacy,<br />Our Priority</h2>
            <p>Stay anonymous with<br />virtual numbers</p>
          </div>
          <div className="hero-icon">🛡️</div>
        </div>

        {/* Greeting */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Welcome back 👋</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{displayName}</p>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: '6px 14px', boxShadow: '0 2px 10px rgba(31,95,224,0.08)' }}>
            <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 700 }}>⚡ Instant</span>
          </div>
        </div>

        {/* Choose Number Type */}
        <div>
          <div className="section-title">Choose Number Type</div>
          <div className="number-cards">
            {/* Indian Number */}
            <div className="number-type-card" onClick={() => navigate('/numbers/IN')} role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate('/numbers/IN')}>
              <div className="number-type-icon">🇮🇳</div>
              <div className="number-type-info">
                <h3>Indian Number</h3>
                <p>+91 • Receive calls, SMS & OTP</p>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {['📞 Calls', '💬 SMS', '🔑 OTP'].map(t => (
                    <span key={t} style={{ fontSize: 11, background: 'var(--blue-light)', color: 'var(--blue)', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="number-type-price">₹150</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>/ 30 days</div>
              </div>
            </div>

            {/* US Number */}
            <div className="number-type-card" onClick={() => navigate('/numbers/US')} role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate('/numbers/US')}>
              <div className="number-type-icon">🇺🇸</div>
              <div className="number-type-info">
                <h3>US Number</h3>
                <p>+1 • Receive calls, SMS & OTP</p>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  {['📞 Calls', '💬 SMS', '🔑 OTP'].map(t => (
                    <span key={t} style={{ fontSize: 11, background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="number-type-price" style={{ color: '#B45309' }}>$250</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>/ 30 days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div>
          <div className="section-title">Why Choose Us?</div>
          <div className="why-grid">
            {[
              { icon: '🔒', title: '100%\nSecure' },
              { icon: '⚡', title: 'Instant\nDelivery' },
              { icon: '🛟', title: '24/7\nSupport' },
            ].map(w => (
              <div key={w.title} className="why-card">
                <div className="why-card-icon">{w.icon}</div>
                <p>{w.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '16px 20px', boxShadow: 'var(--shadow)', display: 'flex', justifyContent: 'space-between' }}>
          {[
            { value: '10K+', label: 'Users' },
            { value: '50K+', label: 'Numbers' },
            { value: '99.9%', label: 'Uptime' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--blue)', fontFamily: 'var(--font-head)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
