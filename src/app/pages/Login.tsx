import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import imgGoogle from '../../imports/Group1/a5ec32389763b208dc6a3392b5de2d21577083ce.png';
import { login } from '../lib/api';
import { signInWithToken } from '../lib/store';

export default function Login() {
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';

  const handleGoogleLogin = () => {
    setNotice('Google login is not connected on the backend yet. Please sign in with email.');
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    const account = String(formData.get('account') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!account || !password) {
      setNotice('Enter your account and password to sign in.');
      return;
    }

    if (!account.includes('@')) {
      setNotice('Enter the email address registered with your CoTee account.');
      return;
    }

    setIsSubmitting(true);
    setNotice('');

    try {
      const response = await login(account, password);
      if (!response.token) {
        throw new Error(response.message ?? 'Login did not return an auth token.');
      }

      signInWithToken(response.user?.email ?? account, response.token);
      navigate(redirectTo);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-8">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-[#f1f5f9]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Welcome Back
            </h1>
            <p className="text-[#64748b]">Sign in to your CoTee account</p>
            {location.search.includes('redirect=') && (
              <p className="mt-3 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#c2410c]">
                Please sign in before buying or adding items to your cart.
              </p>
            )}
          </div>

          {/* Social Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-[#e2e8f0] rounded-xl hover:border-[#ffa62b] hover:bg-[#fff5eb] transition-all mb-6 group"
          >
            <img src={imgGoogle} alt="Google" className="w-5 h-5" />
            <span className="font-semibold text-[#475569] group-hover:text-[#0f172a]">
              Continue with Google
            </span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2e8f0]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#94a3b8]">Or continue with email</span>
            </div>
          </div>

          {notice && (
            <div className="mb-6 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#c2410c]">
              {notice}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                Email or Username
              </label>
              <input
                name="account"
                type="text"
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-[#f8f7f5] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#ffa62b] focus:bg-white transition-all"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#f8f7f5] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#ffa62b] focus:bg-white transition-all"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-[#cbd5e1] text-[#ff9429] focus:ring-[#ffa62b]" />
                <span className="text-[#64748b]">Remember me</span>
              </label>
              <a href="#" className="text-[#ff9429] hover:text-[#ff8c1a] font-semibold">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-[#ff9429] text-white font-bold rounded-xl hover:bg-[#ff8c1a] transition-all shadow-lg hover:shadow-xl mt-6"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-[#64748b] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#ff9429] hover:text-[#ff8c1a] font-semibold">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
