import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const { loginWithOAuth, loginWithCredentials, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }
    
    try {
      const response = await loginWithCredentials(email, password);
      console.log('Login successful:', response);
      navigate('/');
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setLocalError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-8 transform transition-all duration-500 hover:scale-[1.02]">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Skillshare
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome Back
          </h2>
          <p className="text-gray-600">Sign in to continue your learning journey</p>
        </div>

        {/* Error Message */}
        {(error || localError) && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm animate-shake">
            {error || localError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 placeholder-gray-400 text-gray-900"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 placeholder-gray-400 text-gray-900"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-300 transform hover:-translate-y-1"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="px-4 text-sm text-gray-500">or continue with</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* OAuth Button */}
        <button
          onClick={() => loginWithOAuth('google')}
          className="w-full py-3 px-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-1"
        >
          <FcGoogle size={24} />
          Sign in with Google
        </button>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};


// eslint-disable-next-line no-unused-vars
const tailwindConfig = {
  theme: {
    extend: {
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
      },
      animation: {
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
    },
  },
};

export default Login;