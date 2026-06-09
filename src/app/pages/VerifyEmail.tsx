import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { resendVerification, verifyEmail } from '../lib/api';

type VerificationState = 'waiting' | 'verifying' | 'success' | 'error';

export default function VerifyEmail() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get('token') ?? '';
  const initialEmail = params.get('email') ?? '';
  const redirectTo = params.get('redirect') || '/';
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState<VerificationState>(token ? 'verifying' : 'waiting');
  const [notice, setNotice] = useState(
    token ? 'Verifying your email...' : 'Check your inbox and click the verification link to activate your account.',
  );
  const [isResending, setIsResending] = useState(false);
  const verifiedToken = useRef('');

  useEffect(() => {
    if (!token || verifiedToken.current === token) return;
    verifiedToken.current = token;

    verifyEmail(token)
      .then((response) => {
        setState('success');
        setEmail(response.email ?? initialEmail);
        setNotice(response.message ?? 'Your email has been verified.');
      })
      .catch((error) => {
        setState('error');
        setNotice(error instanceof Error ? error.message : 'Unable to verify your email.');
      });
  }, [initialEmail, token]);

  const handleResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || isResending) return;

    setIsResending(true);
    try {
      const response = await resendVerification(email.trim());
      setNotice(response.message ?? 'A new verification email has been requested.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to resend the verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-8">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-[#f1f5f9] text-center">
          <h1 className="text-3xl font-bold text-[#0f172a] mb-3">
            {state === 'success' ? 'Email Verified' : 'Verify Your Email'}
          </h1>

          <div className="mb-6 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#c2410c]">
            {notice}
          </div>

          {state === 'success' ? (
            <Link
              to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
              className="block w-full px-6 py-4 bg-[#ff9429] text-white font-bold rounded-xl hover:bg-[#ff8c1a] transition-all"
            >
              Continue to Sign In
            </Link>
          ) : (
            <form onSubmit={handleResend} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-[#f8f7f5] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#ffa62b] focus:bg-white transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isResending}
                className="w-full px-6 py-4 bg-[#ff9429] text-white font-bold rounded-xl hover:bg-[#ff8c1a] transition-all disabled:opacity-60"
              >
                {isResending ? 'Requesting email...' : 'Resend Verification Email'}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-[#64748b]">
            <Link to="/login" className="text-[#ff9429] hover:text-[#ff8c1a] font-semibold">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
