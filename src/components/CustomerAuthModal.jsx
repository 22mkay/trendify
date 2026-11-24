import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function CustomerAuthModal({ isOpen, onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          setInfoMsg('Account created! Check your email to confirm, or sign in if confirmation is disabled.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md border-2 border-black bg-white p-6 text-black shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-black pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Account Required to Order
            </p>
            <h2 className="text-xl font-black uppercase">
              {mode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-black p-1.5 hover:bg-black hover:text-white"
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
            className={`border border-black py-2 text-xs font-bold uppercase ${
              mode === 'login' ? 'bg-black text-white' : 'bg-white text-black'
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
            className={`border border-black py-2 text-xs font-bold uppercase ${
              mode === 'signup' ? 'bg-black text-white' : 'bg-white text-black'
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
            className="w-full border border-black p-2.5 text-sm outline-none focus:bg-neutral-100"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-black p-2.5 text-sm outline-none focus:bg-neutral-100"
          />

          {errorMsg && <p className="text-xs font-bold text-black">{errorMsg}</p>}
          {infoMsg && <p className="text-xs font-bold text-neutral-700">{infoMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 disabled:opacity-50"
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