import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [toast, setToast] = useState('');

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: '📱', label: 'My Numbers', color: 'menu-icon-blue', action: () => navigate('/my-numbers') },
    { icon: '💳', label: 'Payment History', color: 'menu-icon-blue', action: () => navigate('/payments') },
    { icon: '⚙️', label: 'Settings', color: 'menu-icon-blue', action: () => showToast('⚙️ Settings coming soon!') },
    { icon: '🛟', label: 'Help & Support', color: 'menu-icon-blue', action: () => showToast('📞 Support: support@virtualnumber.in') },
    { icon: '📜', label: 'Terms of Service', color: 'menu-icon-blue', action: () => showToast('📜 Terms coming soon!') },
    { icon: '🔒', label: 'Privacy Policy', color: 'menu-icon-blue', action: () => showToast('🔒 Policy coming soon!') },
  ];

  return (
    <div className="screen pb-nav" style={{ background: 'var(--bg)' }}>
      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}

      {/* Profile top */}
      <div className="profile-top" style={{ paddingBottom: 48 }}>
        <div className="avatar">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="Avatar" />
            : <span style={{ fontSize: 28, color: 'white' }}>{initials}</span>
          }
        </div>
        <div className="profile-name">{displayName}</div>
        <div className="profile-email">{email}</div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          {profile?.phone && (
            <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
              📱 {profile.phone}
            </span>
          )}
          <span style={{ background: 'rgba(34,197,94,0.25)', color: '#86EFAC', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
            ● Verified
          </span>
        </div>
      </div>

      <div className="profile-body">
        {/* Edit Profile quick button */}
        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <button className="btn btn-outline" style={{ fontSize: 14, minHeight: 40 }} onClick={() => showToast('✏️ Edit Profile coming soon!')}>
            ✏️ Edit Profile
          </button>
        </div>

        {/* Menu */}
        <div className="profile-menu" style={{ margin: '0 16px' }}>
          {menuItems.map(item => (
            <button key={item.label} className="profile-menu-item" onClick={item.action}>
              <div className={`menu-icon ${item.color}`}>{item.icon}</div>
              <span className="menu-label">{item.label}</span>
              <span className="menu-arrow">›</span>
            </button>
          ))}

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

          {/* Logout */}
          <button className="profile-menu-item" onClick={handleLogout}>
            <div className="menu-icon menu-icon-red">🚪</div>
            <span className="menu-label menu-label-red">Logout</span>
          </button>
        </div>

        {/* App version */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-3)' }}>
          Virtual Number v1.0.0 · Made with ❤️ in India
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
