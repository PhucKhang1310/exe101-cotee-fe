import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getAuthClaims } from '../lib/auth';
import { completeGoogleRedirectSignIn } from '../lib/googleAuth';

export default function GoogleAuthCallback() {
  const [notice, setNotice] = useState('Finishing Google sign-in...');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    completeGoogleRedirectSignIn()
      .then(({ response, returnTo }) => {
        if (!isMounted) return;
        const role = response.user?.role ?? getAuthClaims(response.token)?.role;
        navigate(returnTo === '/' && role?.toLowerCase() === 'admin' ? '/admin' : returnTo, { replace: true });
      })
      .catch((error) => {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : 'Unable to finish Google sign-in.';
        setNotice(message);
        window.setTimeout(() => navigate('/login', { replace: true }), 2000);
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-8">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-[#e4f3fc] text-center">
          <h1 className="text-2xl font-bold text-[#102a56] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Google Sign-In
          </h1>
          <p className="text-sm font-semibold text-[#5a7899]">{notice}</p>
        </div>
      </div>
    </div>
  );
}
