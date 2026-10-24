import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { User } from '../types';
import {
  Phone,
  Mail,
  MapPin,
  LogIn,
  Menu,
  X,
  UserCheck,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'academics', label: 'Academics' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'school-life', label: 'School Life' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'news', label: 'News & Events' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const getPortalName = () => {
    if (!currentUser) return 'Portal';
    switch (currentUser.role) {
      case 'SUPER_ADMIN':
        return 'Super Admin Dashboard';
      case 'ADMIN':
        return 'Admin Dashboard';
      case 'PRINCIPAL':
        return 'Principal Portal';
      case 'TEACHER':
        return 'Staff Portal';
      case 'ACCOUNTANT':
        return 'Bursary Portal';
      case 'PARENT':
        return 'Parent Portal';
      case 'STUDENT':
        return 'Student Portal';
      case 'APPLICANT':
        return 'Applicant Portal';
      default:
        return 'Portal';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs border-b border-slate-200">
      {/* Top Notification / Information Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-4 hidden md:block border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Off Ruttu Road, Doma, Nasarawa State, Nigeria</span>
            </div>
            <a
              href="tel:+2349043390882"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>+234 904 339 0882</span>
            </a>
            <a
              href="mailto:peculiarschoolsdoma2006@gmail.com"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>peculiarschoolsdoma2006@gmail.com</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <span className="bg-amber-500/20 text-amber-300 font-medium px-2 py-0.5 rounded text-[11px] border border-amber-400/30">
              2026/2027 Admission in Progress
            </span>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors text-[11px] flex items-center gap-1"
            >
              <span>Facebook</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Brand */}
          <button
            onClick={() => handleLinkClick('home')}
            className="flex items-center text-left focus:outline-hidden"
          >
            <SchoolLogo size="md" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-emerald-800 bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs & Auth */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLinkClick('portal')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <div className="text-left">
                    <span className="block leading-tight text-xs font-bold text-slate-800">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-emerald-700 uppercase tracking-wide">
                      {getPortalName()}
                    </span>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/60 transition-colors"
              >
                <LogIn className="w-4 h-4 text-emerald-700" />
                <span>Portal Login</span>
              </button>
            )}

            <button
              onClick={() => handleLinkClick('admissions')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg text-emerald-950 bg-amber-400 hover:bg-amber-300 shadow-xs hover:shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              <span>Apply for Admission</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={currentUser ? () => handleLinkClick('portal') : onOpenLogin}
              className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold"
            >
              {currentUser ? 'Portal' : <LogIn className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
          <div className="text-xs text-slate-500 py-1 border-b border-slate-100 mb-2">
            📞 +234 904 339 0882 • Doma, Nasarawa State
          </div>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === link.id
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <button
              onClick={() => handleLinkClick('admissions')}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs text-center shadow-xs"
            >
              Apply for Admission (2026/2027)
            </button>

            {currentUser ? (
              <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                <button
                  onClick={() => handleLinkClick('portal')}
                  className="text-left text-xs font-bold text-emerald-900"
                >
                  {currentUser.name} ({getPortalName()})
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full py-2 px-4 rounded-lg border border-emerald-600 text-emerald-800 font-semibold text-xs text-center hover:bg-emerald-50"
              >
                Portal Login (Parents / Students / Staff)
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
