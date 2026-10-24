import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { MapPin, Phone, Mail, Clock, MessageSquare, Shield, BookOpen, Award } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLogin }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Upper CTA Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 py-10 px-4 sm:px-6 lg:px-8 border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="inline-block bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded text-xs uppercase tracking-wider mb-2">
              2026/2027 Admission In Progress
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Secure Your Child's Place at Peculiar College
            </h3>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-2xl">
              Nursery, Primary, and Secondary arms are currently admitting prospective learners. Classes maintain small student-teacher ratios.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('admissions')}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-lg shadow-sm transition-all"
            >
              Apply Online Now
            </button>
            <a
              href="https://wa.me/2349043390882?text=Hello%20Peculiar%20College%20Doma%2C%20I%20would%20like%20to%20inquire%20about%20admissions."
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg border border-emerald-500/50 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>WhatsApp Admission Desk</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <SchoolLogo size="md" textColor="text-white" />
            <p className="text-sm text-slate-400 leading-relaxed">
              Peculiar College Doma is a premier private educational institution situated in Doma, Nasarawa State, Nigeria. We are committed to academic distinction, high moral standards, and raising well-rounded future leaders.
            </p>
            <div className="flex items-center gap-3 text-xs text-amber-400 font-medium">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Character
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Knowledge
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Excellence
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-tight border-b border-slate-800 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-400 transition-colors"
                >
                  About Our School & History
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('academics')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Academic Curriculum & Arms
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admissions')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Admissions & Online Form
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-amber-400 transition-colors"
                >
                  School Photo Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('news')}
                  className="hover:text-amber-400 transition-colors"
                >
                  News & Event Announcements
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenLogin}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Parent / Student Portal Login →
                </button>
              </li>
            </ul>
          </div>

          {/* School Levels / Arms */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-tight border-b border-slate-800 pb-2">
              Educational Arms
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="bg-slate-800/60 p-3 rounded-lg border border-slate-800">
                <span className="font-bold text-amber-300 block text-xs uppercase tracking-wide">
                  Nursery Arm
                </span>
                <span className="text-xs text-slate-400">
                  Early childhood foundation, phonics, numbers, and active discovery in cheerful yellow & green uniforms.
                </span>
              </li>
              <li className="bg-slate-800/60 p-3 rounded-lg border border-slate-800">
                <span className="font-bold text-amber-300 block text-xs uppercase tracking-wide">
                  Primary Arm (Basic 1 - 6)
                </span>
                <span className="text-xs text-slate-400">
                  Solid literacy, numeracy, basic science, and discipline developing future academic champions.
                </span>
              </li>
              <li className="bg-slate-800/60 p-3 rounded-lg border border-slate-800">
                <span className="font-bold text-amber-300 block text-xs uppercase tracking-wide">
                  Secondary College (JSS 1 - SSS 3)
                </span>
                <span className="text-xs text-slate-400">
                  Junior and Senior Secondary (Science, Arts, Commercial) with WAEC, NECO, and JAMB preparation.
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-tight border-b border-slate-800 pb-2">
              Contact School Office
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  Off Ruttu Road / 09 Peace Road, Doma, Nasarawa State, Nigeria.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+2349043390882" className="hover:text-amber-400 transition-colors">
                  +234 904 339 0882
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href="mailto:peculiarschoolsdoma2006@gmail.com"
                  className="hover:text-amber-400 transition-colors break-all"
                >
                  peculiarschoolsdoma2006@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-400 text-xs">
                  Monday – Friday: 8:00 AM – 3:30 PM
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <a
                href="https://wa.me/2349043390882"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                <span>Chat with School Admin on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Info */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Peculiar College Doma. All rights reserved. Registered Educational Institution in Nasarawa State, Nigeria.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('about')} className="hover:text-slate-400">
              School Policies
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-400">
              Locate Campus
            </button>
            <span>•</span>
            <button onClick={onOpenLogin} className="hover:text-slate-400">
              Staff & Parent Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
