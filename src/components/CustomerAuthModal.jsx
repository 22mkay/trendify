import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function CustomerAuthModal({ isOpen, onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (onAuthenticated && data.session) onAuthenticated(data.session);
        onClose();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          if (onAuthenticated) onAuthenticated(data.session);
          onClose();
        } else {
          setInfoMsg(
            'Account created! Check your email to confirm, or sign in if confirmation is disabled.'
          );
          setMode('login');
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/80 p-4">
      <div className="w-full max-w-md border-2 border-purple-700 bg-white p-6 text-purple-950 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-purple-200 pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600">
              Account Required to Order
            </p>
            <h2 className="text-xl font-black uppercase">
              {mode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-purple-700 p-1.5 text-purple-700 hover:bg-purple-700 hover:text-white"
            aria-label="Close customer login"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className={`border border-purple-700 py-2 text-xs font-bold uppercase ${
              mode === 'login'
                ? 'bg-purple-700 text-white'
                : 'bg-white text-purple-700 hover:bg-purple-50'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className={`border border-purple-700 py-2 text-xs font-bold uppercase ${
              mode === 'signup'
                ? 'bg-purple-700 text-white'
                : 'bg-white text-purple-700 hover:bg-purple-50'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Customer Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-purple-700 p-2.5 text-sm outline-none focus:bg-purple-50"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-purple-700 p-2.5 pr-10 text-sm outline-none focus:bg-purple-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-purple-700 hover:text-purple-950"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {errorMsg && <p className="text-xs font-bold text-purple-800">{errorMsg}</p>}
          {infoMsg && <p className="text-xs font-bold text-purple-700">{infoMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-700 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-purple-800 disabled:opacity-50"
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Sign In & Continue to Order'
              : 'Create Account & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}