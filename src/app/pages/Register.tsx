import { Link } from 'react-router';
import imgGoogle from '../../imports/Group1/a5ec32389763b208dc6a3392b5de2d21577083ce.png';

export default function Register() {
  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-8">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-[#f1f5f9]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Create Account
            </h1>
            <p className="text-[#64748b]">Start creating amazing designs today</p>
          </div>

          {/* Social Signup */}
          <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-[#e2e8f0] rounded-xl hover:border-[#ffa62b] hover:bg-[#fff5eb] transition-all mb-6 group">
            <img src={imgGoogle} alt="Google" className="w-5 h-5" />
            <span className="font-semibold text-[#475569] group-hover:text-[#0f172a]">
              Sign up with Google
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

          {/* Form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                Full Name
              </label>
              <input
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
              <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-[#cbd5e1] text-[#ff9429] focus:ring-[#ffa62b]" />
              <span className="text-sm text-[#64748b]">
                I agree to the{' '}
                <a href="#" className="text-[#ff9429] hover:text-[#ff8c1a]">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#ff9429] hover:text-[#ff8c1a]">Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              className="w-full px-6 py-4 bg-[#ff9429] text-white font-bold rounded-xl hover:bg-[#ff8c1a] transition-all shadow-lg hover:shadow-xl mt-6"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-[#64748b] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#ff9429] hover:text-[#ff8c1a] font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
