import { type FormEvent, useState } from 'react';
import { Link, useLocation } from 'react-router';
import imgGoogle from '../../imports/Group1/a5ec32389763b208dc6a3392b5de2d21577083ce.png';
import { register } from '../lib/api';
import { redirectToGoogleSignIn } from '../lib/googleAuth';

export default function Register() {
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [registrationSucceeded, setRegistrationSucceeded] = useState(false);
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';
  const loginPath = `/login?redirect=${encodeURIComponent(redirectTo)}`;

  const handleGoogleSignup = async () => {
    if (isGoogleSubmitting) return;

    setIsGoogleSubmitting(true);
    setNotice('');

    try {
      await redirectToGoogleSignIn(redirectTo);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to sign up with Google. Please try again.');
      setIsGoogleSubmitting(false);
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get('fullName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const acceptedTerms = formData.get('acceptedTerms') === 'on';

    if (!fullName || !email || !password) {
      setNotice('Fill in your name, email, and password to create an account.');
      return;
    }

    if (password.length < 8) {
      setNotice('Password must be at least 8 characters.');
      return;
    }

    if (!acceptedTerms) {
      setNotice('Accept the terms and privacy policy to continue.');
      return;
    }

    setIsSubmitting(true);
    setNotice('');

    try {
      const response = await register(fullName, email, password);
      setNotice(response.message ?? 'Registration successful. Please check your email to verify your account.');
      setRegistrationSucceeded(true);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-8">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-[#f1f5f9]">
          {registrationSucceeded ? (
            <div className="text-center">
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-[#f0fdf4] text-3xl font-bold text-[#15803d]">
                ✓
              </div>
              <h1 className="text-3xl font-bold text-[#0f172a] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Account Created
              </h1>
              {notice && <p className="text-[#64748b]">{notice}</p>}
              <Link
                to={loginPath}
                className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#ff9429] px-6 py-4 font-bold text-white shadow-lg transition-all hover:bg-[#ff8c1a] hover:shadow-xl"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Create Account
            </h1>
            <p className="text-[#64748b]">Start creating amazing designs today</p>
          </div>

          {/* Social Signup */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleSubmitting}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-[#e2e8f0] rounded-xl hover:border-[#ffa62b] hover:bg-[#fff5eb] transition-all mb-6 group"
          >
            <img src={imgGoogle} alt="Google" className="w-5 h-5" />
            <span className="font-semibold text-[#475569] group-hover:text-[#0f172a]">
              {isGoogleSubmitting ? 'Connecting to Google...' : 'Sign up with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2e8f0]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#94a3b8]">Or sign up with email</span>
            </div>
          </div>

          {notice && (
            <div className="mb-6 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#c2410c]">
              {notice}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-[#f8f7f5] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#ffa62b] focus:bg-white transition-all"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
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
              <p className="text-xs text-[#94a3b8] mt-2">
                Must be at least 8 characters
              </p>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input name="acceptedTerms" type="checkbox" className="w-4 h-4 mt-0.5 rounded border-[#cbd5e1] text-[#ff9429] focus:ring-[#ffa62b]" />
              <span className="text-sm text-[#64748b]">
                I agree to the{' '}
                <a href="#" className="text-[#ff9429] hover:text-[#ff8c1a]">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#ff9429] hover:text-[#ff8c1a]">Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-[#ff9429] text-white font-bold rounded-xl hover:bg-[#ff8c1a] transition-all shadow-lg hover:shadow-xl mt-6"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-[#64748b] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#ff9429] hover:text-[#ff8c1a] font-semibold">
              Sign in
            </Link>
          </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
