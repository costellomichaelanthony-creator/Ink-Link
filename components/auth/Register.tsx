import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (signUpError) throw signUpError;

      // 2. Explicitly create the profile to ensure it exists immediately
      // This acts as a fallback or primary method if SQL triggers are delayed/missing
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          role: role,
          display_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Default empty values
          styles: [],
          years_experience: 0
        });

        if (profileError) {
          console.error('Profile creation warning:', profileError);
          // We continue even if this fails, as a trigger might have caught it
        }

        // 3. Refresh context to get the new profile data
        await refreshProfile();
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-ink-900 p-8 rounded-xl border border-ink-800">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">Join Ink Link</h2>
          <p className="mt-2 text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-medium text-brand hover:text-brand-hover">
              Log in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">I am a:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.CLIENT)}
                  className={`p-3 text-sm font-medium rounded-lg border flex flex-col items-center gap-2 ${
                    role === UserRole.CLIENT
                      ? 'bg-brand/20 border-brand text-white'
                      : 'bg-ink-950 border-ink-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <i className="fa-solid fa-user text-lg"></i>
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.ARTIST)}
                  className={`p-3 text-sm font-medium rounded-lg border flex flex-col items-center gap-2 ${
                    role === UserRole.ARTIST
                      ? 'bg-brand/20 border-brand text-white'
                      : 'bg-ink-950 border-ink-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <i className="fa-solid fa-pen-nib text-lg"></i>
                  Artist
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="full-name" className="sr-only">Full Name</label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-ink-700 placeholder-gray-500 text-white bg-ink-950 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                placeholder="Full Name / Display Name"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-ink-700 placeholder-gray-500 text-white bg-ink-950 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-ink-700 placeholder-gray-500 text-white bg-ink-950 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                placeholder="Password (min 6 characters)"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-ink-700 cursor-not-allowed' : 'bg-brand hover:bg-brand-hover'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand`}
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;