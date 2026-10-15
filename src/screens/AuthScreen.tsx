import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'login' | 'signup';

export default function AuthScreen({ defaultTab = 'login' }: { defaultTab?: Tab }) {
  const { signIn, signUp, signInWithGoogle, demoSignIn } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Signup form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!loginEmail) e.loginEmail = 'Email or phone required';
    if (!loginPass) e.loginPass = 'Password required';
    return e;
  };

  const validateSignup = () => {
    const e: Record<string, string> = {};
    if (!name) e.name = 'Full name required';
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = 'Valid email required';
    if (!phone || phone.length < 10) e.phone = 'Valid phone required';
    if (!password || password.length < 8) e.password = 'Min 8 characters';
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) e.password = 'Must contain letter and number';
    return e;
  };

  const handleLogin = async () => {
    const e = validateLogin();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPass);
    setLoading(false);
    if (error) showToast('❌ ' + (error.message || 'Login failed'));
    else navigate('/home');
  };

  const handleSignup = async () => {
    const e = validateSignup();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    const { error } = await signUp(email, password, name, phone);
    setLoading(false);
    if (error) showToast('❌ ' + (error.message || 'Sign up failed'));
    else { showToast('✅ Account created! Please check your email.'); setTab('login'); }
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) showToast('❌ Google sign-in failed');
  };

  const handleDemo = () => {
    demoSignIn();
    navigate('/home');
  };

  return (
    <div className="auth-screen screen">
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.startsWith('✅') ? 'toast-success' : 'toast-error'}`}>{toast}</div>
        </div>
      )}

      <div className="auth-top">
        <div className="auth-logo-sm">📱</div>
        <div className="auth-title">Virtual Number</div>
        <div className="auth-subtitle">
          {tab === 'login' ? 'Login to your account' : 'Create your account'}
        </div>
      </div>

      <div className="auth-body">
        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setErrors({}); }}>
            Login
          </button>
          <button className={`tab-btn ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setErrors({}); }}>
            Sign Up
          </button>
        </div>

        {tab === 'login' ? (
          <>
            <div className="form-group">
              <label className="form-label">Email or Phone Number</label>
              <input className={`form-input ${errors.loginEmail ? 'error' : ''}`} placeholder="email@example.com or 9876543210"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              {errors.loginEmail && <div className="form-error">{errors.loginEmail}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <input className={`form-input ${errors.loginPass ? 'error' : ''}`} type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password" value={loginPass} onChange={e => setLoginPass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                <button className="eye-btn" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</button>
              </div>
              {errors.loginPass && <div className="form-error">{errors.loginPass}</div>}
            </div>

            <a href="#" className="form-link">Forgot Password?</a>

            <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>
              {loading ? '⏳ Logging in...' : '🔐 Login'}
            </button>

            <div className="divider">OR</div>

            <button className="btn btn-google" onClick={handleGoogle}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="Google" />
              Continue with Google
            </button>

            <button
              type="button"
              className="btn btn-outline"
              style={{ marginTop: 10, borderColor: 'var(--blue)', color: 'var(--blue)', background: 'var(--blue-light)' }}
              onClick={handleDemo}
            >
              ⚡ Instant Demo Login (Sandeep Sah)
            </button>

            <div className="auth-footer" style={{ marginTop: 24 }}>
              Don't have an account? <a href="#" onClick={() => setTab('signup')}>Sign Up</a>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="John Doe"
                value={name} onChange={e => setName(e.target.value)} />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" placeholder="email@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className={`form-input ${errors.phone ? 'error' : ''}`} type="tel" placeholder="+91 98765 43210"
                value={phone} onChange={e => setPhone(e.target.value)} />
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <input className={`form-input ${errors.password ? 'error' : ''}`} type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 chars with letter & number" value={password} onChange={e => setPassword(e.target.value)} />
                <button className="eye-btn" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</button>
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <button className="btn btn-primary" onClick={handleSignup} disabled={loading}>
              {loading ? '⏳ Creating account...' : '🚀 Sign Up'}
            </button>

            <div className="divider">OR</div>

            <button className="btn btn-google" onClick={handleGoogle}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="Google" />
              Continue with Google
            </button>

            <div className="auth-footer" style={{ marginTop: 24 }}>
              Already have an account? <a href="#" onClick={() => setTab('login')}>Login</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
