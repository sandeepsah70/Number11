import { useNavigate, useLocation } from 'react-router-dom';
import type { VirtualNumber } from '../lib/types';

export default function PaymentSuccessScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { number } = location.state as { number: VirtualNumber };
  const isIN = number?.country === 'IN';

  return (
    <div className="success-screen">
      <div className="success-icon">✓</div>
      <h1 className="success-title">Payment Successful!</h1>
      <p className="success-sub">Your virtual number has been activated.<br />Check your email for confirmation.</p>

      {/* Number card */}
      {number && (
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '20px 24px', width: '100%', boxShadow: 'var(--shadow)', textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{isIN ? '🇮🇳' : '🇺🇸'}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', fontFamily: 'monospace' }}>{number.number}</div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>{isIN ? 'Indian Number' : 'US Number'}</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: 'var(--green-light)', color: '#15803D', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>✅ Active</span>
            <span style={{ background: 'var(--blue-light)', color: 'var(--blue)', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>📅 30 Days</span>
          </div>
        </div>
      )}

      {/* What happens next */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-sm)', padding: '14px 16px', width: '100%', boxShadow: '0 2px 8px rgba(31,95,224,0.07)', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>What happens next?</div>
        {[
          '📩 Confirmation email sent to your inbox',
          '📞 Number ready to receive calls & SMS',
          '🔑 OTP messages appear in My Numbers',
          '⏰ Number valid for 30 days',
        ].map(item => (
          <div key={item} style={{ fontSize: 13, color: 'var(--text-2)', padding: '4px 0', display: 'flex', gap: 8 }}>
            {item}
          </div>
        ))}
      </div>

      <div className="success-btns">
        <button className="btn btn-primary" onClick={() => navigate('/my-numbers')}>
          📱 View My Numbers
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/home')}>
          🏠 Back to Home
        </button>
      </div>
    </div>
  );
}
