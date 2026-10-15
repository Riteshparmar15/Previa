import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-sm shadow-primary-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Previa</span>
            <span className="ml-1 text-[11px] font-semibold uppercase tracking-wider text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded-md border border-primary-200">Preschool AI</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-primary-700 transition-colors">Features</a>
          <a href="#samples" className="hover:text-primary-700 transition-colors">Example Outputs</a>
          <a href="#pricing" className="hover:text-primary-700 transition-colors">Pricing (₹)</a>
          <a href="#security" className="hover:text-primary-700 transition-colors">Child Privacy</a>
          <a href="#faq" className="hover:text-primary-700 transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/app/dashboard" className="previa-btn-primary">
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-primary-700 px-3 py-2 transition-colors">
                Sign in
              </Link>
              <Link to="/register" className="previa-btn-primary">
                Start Free Trial
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
