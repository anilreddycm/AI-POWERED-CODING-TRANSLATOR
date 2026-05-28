import { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext.jsx';
import { register, emailLogin, googleLogin, verifyOTP, resendOTP } from '../services/authService.js';
import '../styles/login.css';

const features = [
  { icon: '</>', title: 'Code Translation', desc: 'Translate between 10+ languages' },
  { icon: 'Cx', title: 'Complexity Analysis', desc: 'Time & space complexity breakdown' },
  { icon: '#', title: 'AI Optimization', desc: 'Smart code suggestions' },
  { icon: '?', title: 'Code Explanation', desc: 'Understand code in plain English' },
];

function LoginPage() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!email || !password) return toast.error('Please fill in all fields.');
    if (isSignUp && !name) return toast.error('Please enter your name.');
    if (password.length < 6) return toast.error('Password must be at least 6 characters.');

    setLoading(true);
    try {
      if (isSignUp) {
        const result = await register(name, email, password);
        setOtpEmail(result.email || email);
        setShowOtpVerification(true);
        toast.success(result.message || 'OTP verification sent to your email.');
      } else {
        const result = await emailLogin(email, password);
        login(result.token, result.user);
        toast.success(`Welcome back, ${result.user.name}!`);
        navigate('/');
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.isNotVerified) {
        setOtpEmail(err.response.data.email || email);
        setShowOtpVerification(true);
        toast.error(err.response.data.message || 'Please verify your email.');
      } else {
        toast.error(err.response?.data?.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!otpCode || otpCode.length !== 6) {
      return toast.error('Please enter a valid 6-digit verification code.');
    }

    setLoading(true);
    try {
      const result = await verifyOTP(otpEmail, otpCode);
      login(result.token, result.user);
      toast.success(`Email verified! Welcome, ${result.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await resendOTP(otpEmail);
      toast.success(result.message || 'Verification code resent successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await googleLogin(credentialResponse.credential);
      login(result.token, result.user);
      toast.success(`Welcome, ${result.user.name}!`);
      navigate('/');
    } catch {
      toast.error('Login failed. Please try again.');
    }
  };

  // Branding Panel component to reuse
  const renderBrandingPanel = () => (
    <div className="login-left">
      <div>
        <div className="login-logo">
          <div className="login-logo-icon">{`</>`}</div>
          <span className="login-logo-text">CodeTranslator</span>
        </div>

        <h1 className="login-hero-title">Translate, Analyze &amp; Optimize Your Code</h1>
        <p className="login-hero-subtitle">
          AI-powered code assistant that helps you work across programming languages effortlessly.
        </p>

        <div className="login-features">
          {features.map((f, i) => (
            <div key={i} className="login-feature-card">
              <div className="login-feature-icon">{f.icon}</div>
              <div>
                <div className="login-feature-title">{f.title}</div>
                <div className="login-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="login-footer">Powered by AI. Built for developers.</div>
      </div>
    </div>
  );

  if (showOtpVerification) {
    return (
      <div className="login-page">
        {renderBrandingPanel()}
        <div className="login-right">
          <div className="login-form">
            <h2>Verify Your Email</h2>
            <p className="login-form-subtitle">
              We've sent a 6-digit code to <strong>{otpEmail}</strong>. Enter it below to activate your account.
            </p>
            <p className="login-form-subtitle" style={{ fontSize: '13px', color: '#e056fd', marginTop: '-12px', marginBottom: '24px' }}>
              <strong>Note:</strong> If you don't receive the email, please check your <strong>Spam / Junk</strong> folder.
            </p>

            <form className="login-email-form" onSubmit={handleVerifyOtp}>
              <input
                type="text"
                className="login-input"
                placeholder="0 0 0 0 0 0"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                maxLength={6}
                required
                style={{
                  textAlign: 'center',
                  fontSize: '22px',
                  letterSpacing: '8px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}
              />
              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button
                type="button"
                className="login-toggle-btn"
                onClick={() => {
                  setShowOtpVerification(false);
                  setOtpCode('');
                }}
              >
                Back to Sign In
              </button>
              <button
                type="button"
                className="login-toggle-btn"
                onClick={handleResendOtp}
                disabled={loading}
              >
                Resend Code
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      {renderBrandingPanel()}
      <div className="login-right">
        <div className="login-form">
          <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
          <p className="login-form-subtitle">
            {isSignUp ? 'Create your account to get started' : 'Enter your credentials to continue'}
          </p>

          <form className="login-email-form" onSubmit={handleSubmit}>
            {isSignUp && (
              <input
                type="text"
                className="login-input"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              type="email"
              className="login-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <p className="login-toggle">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              className="login-toggle-btn"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setName('');
                setEmail('');
                setPassword('');
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="login-google-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed.')}
              theme="outline"
              shape="rectangular"
              size="large"
              text="continue_with"
              width="300"
            />
          </div>

          <p className="login-terms">
            By continuing you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
