import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import imgGoogle from '../../imports/Group1/a5ec32389763b208dc6a3392b5de2d21577083ce.png';
import { login } from '../lib/api';
import { signInWithToken } from '../lib/store';
import { getAuthClaims } from '../lib/auth';
import { redirectToGoogleSignIn } from '../lib/googleAuth';

export default function Login() {
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';

  const handleGoogleLogin = async () => {
    if (isGoogleSubmitting) return;

    setIsGoogleSubmitting(true);
    setNotice('');

    try {
      await redirectToGoogleSignIn(redirectTo);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to sign in with Google. Please try again.');
      setIsGoogleSubmitting(false);
    }
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
      const role = response.user?.role ?? getAuthClaims(response.token)?.role;
      navigate(redirectTo === '/' && role?.toLowerCase() === 'admin' ? '/admin' : redirectTo);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-8">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-[#e4f3fc]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#102a56] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Welcome Back
            </h1>
            <p className="text-[#5a7899]">Sign in to your CoTee account</p>
            {location.search.includes('redirect=') && (
              <p className="mt-3 rounded-xl border border-[#b8d2e8] bg-[#eef8ff] px-4 py-3 text-sm font-semibold text-[#244f92]">
                Please sign in before buying or adding items to your cart.
              </p>
            )}
          </div>

          {/* Social Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleSubmitting}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-[#c9deef] rounded-xl hover:border-[#6ecdf0] hover:bg-[#eaf7ff] transition-all mb-6 group"
          >
            <img src={imgGoogle} alt="Google" className="w-5 h-5" />
            <span className="font-semibold text-[#486f95] group-hover:text-[#102a56]">
              {isGoogleSubmitting ? 'Connecting to Google...' : 'Continue with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#c9deef]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#8ca9c5]">Or continue with email</span>
            </div>
          </div>

          {notice && (
            <div className="mb-6 rounded-xl border border-[#b8d2e8] bg-[#eef8ff] px-4 py-3 text-sm font-semibold text-[#244f92]">
              {notice}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#102a56] mb-2">
                Email or Username
              </label>
              <input
                name="account"
                type="text"
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-[#f3faff] border border-[#c9deef] rounded-xl focus:outline-none focus:border-[#6ecdf0] focus:bg-white transition-all"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#102a56] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#f3faff] border border-[#c9deef] rounded-xl focus:outline-none focus:border-[#6ecdf0] focus:bg-white transition-all pr-12"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ca9c5] hover:text-[#102a56] focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-[#b8d2e8] text-[#315fae] focus:ring-[#6ecdf0]" />
                <span className="text-[#5a7899]">Remember me</span>
              </label>
              <a href="#" className="text-[#315fae] hover:text-[#244f92] font-semibold">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-[#315fae] text-white font-bold rounded-xl hover:bg-[#244f92] transition-all shadow-lg hover:shadow-xl mt-6"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-[#5a7899] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#315fae] hover:text-[#244f92] font-semibold">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
