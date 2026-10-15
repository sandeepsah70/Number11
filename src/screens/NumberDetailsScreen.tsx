import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { VirtualNumber } from '../lib/types';

export default function NumberDetailsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const number = location.state?.number as VirtualNumber;
  const [countdown, setCountdown] = useState(600);

  const isIN = number?.country === 'IN';
  const flag = isIN ? '🇮🇳' : '🇺🇸';
  const price = isIN ? '₹150' : '$250';
  const currency = isIN ? 'INR' : 'USD';

  useEffect(() => {
    if (!number) { navigate('/home'); return; }
    reserveNumber();
    const timer = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const reserveNumber = async () => {
    if (!user) return;
    try {
      await supabase.from('virtual_numbers').update({
        status: 'reserved',
        reserved_by: user.id,
        reserved_until: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      }).eq('id', number.id);
    } catch {
      // safe fallback
    }
  };

  const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const features = [
    { icon: '📞', label: 'Receive Calls' },
    { icon: '💬', label: 'Receive SMS' },
    { icon: '🔑', label: 'Receive OTP' },
    { icon: '📅', label: 'Valid for 30 Days' },
  ];

  if (!number) return null;

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="page-header-title">Number Details</div>
      </div>

      <div className="number-detail-body" style={{ paddingBottom: 100 }}>
        <div className="detail-card">
          <div className="detail-flag">{flag}</div>
          <div className="detail-number">{number.number}</div>
          <div className="detail-type">{isIN ? 'Indian Number' : 'US Number'}</div>
          <div className="detail-price">{price} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3)' }}>/ 30 days</span></div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: 'var(--green-light)', color: '#15803D', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>✅ Available</span>
            <span style={{ background: 'var(--blue-light)', color: 'var(--blue)', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>⚡ Instant Activation</span>
          </div>
        </div>

        <div className="reserve-note">
          ⏱️ Number reserved for you — expires in <strong style={{ marginLeft: 4 }}>{formatCountdown(countdown)}</strong>
        </div>

        <div className="section-title" style={{ padding: '0 4px' }}>What You Get</div>
        <div className="features-list">
          {features.map(f => (
            <div key={f.label} className="feature-row">
              <div className="feature-icon">
                <span style={{ color: 'var(--green)', fontWeight: 800 }}>✓</span>
              </div>
              <span style={{ fontSize: 22, marginRight: 4 }}>{f.icon}</span>
              <div className="feature-text">{f.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--radius-sm)', padding: '14px 16px', boxShadow: '0 2px 8px rgba(31,95,224,0.07)', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>📋 Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Number', number.number],
              ['Country', isIN ? '🇮🇳 India (+91)' : '🇺🇸 United States (+1)'],
              ['Validity', '30 Days'],
              ['Price', price],
              ['Activation', 'Instant after payment'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-3)' }}>{k}</span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/payment', { state: { number, price, currency } })}>
          💳 Proceed to Payment — {price}
        </button>
      </div>
    </div>
  );
}
