import { useNavigate } from 'react-router-dom';

type NavItem = 'home' | 'my-numbers' | 'payments' | 'profile';

const NAV = [
  { id: 'home', icon: '🏠', label: 'Home', path: '/home' },
  { id: 'my-numbers', icon: '📱', label: 'My Numbers', path: '/my-numbers' },
  { id: 'payments', icon: '💳', label: 'Payments', path: '/payments' },
  { id: 'profile', icon: '👤', label: 'Profile', path: '/profile' },
] as const;

export default function BottomNav({ active }: { active: NavItem }) {
  const navigate = useNavigate();
  return (
    <nav className="bottom-nav">
      {NAV.map(item => (
        <button
          key={item.id}
          className={`nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
          aria-label={item.label}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
