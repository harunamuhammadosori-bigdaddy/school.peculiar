import React from 'react';
import {
  ShieldCheck,
  Target,
  Eye,
  Heart,
  BookOpen,
  Award,
  Users,
  Compass,
  ArrowRight,
  CheckCircle,
  Building2,
} from 'lucide-react';
import { SchoolLogo } from '../SchoolLogo';

interface AboutViewProps {
  onNavigate: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-8 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-emerald-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/40">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <span>Rooted in Doma Since 2006</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            About Peculiar College Doma
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Nurturing minds, building character, and raising God-fearing leaders equipped to excel in academics and civic responsibility.
          </p>
        </div>
      </section>

      {/* 1. School History & Origin */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Our Foundations
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              A Noble Educational Heritage
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Established in 2006, <strong>Peculiar College Doma</strong> (encompassing Nursery, Primary, and Secondary arms) was founded in the historic town of Doma, Nasarawa State, with a clear mandate: to provide accessible, high-standard private education anchored on Christian and moral principles.
            </p>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              What began with foundational classes has blossomed into a comprehensive learning institution known throughout the community for punctuality, orderly morning assemblies, solid literacy and numeracy foundations, and outstanding performance in external examinations.
            </p>
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <p className="text-xs sm:text-sm text-amber-950 font-medium italic">
                "Our name 'Peculiar' reflects 1 Peter 2:9 — a chosen generation, a peculiar people called out to show forth excellence and moral distinction wherever they go."
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900">
              <img
                src="/school-media/front-view-gate.jpg"
                alt="Peculiar College Doma Main Entrance & Gate"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="p-4 bg-slate-900 text-white text-xs">
                <span className="font-semibold text-amber-400">Peculiar College Doma Main Entrance & Gated Compound</span>
                <p className="text-slate-400 mt-0.5">
                  A safe, secure, and peaceful learning sanctuary in Doma, Nasarawa State.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Vision, Mission & Core Values */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Vision */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Vision</h3>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  To be a premier learning institution in Nasarawa State, renowned for grooming intellectually vibrant, morally upright, and socially responsible future leaders who excel globally.
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  To deliver qualitative, balanced, and affordable education from early childhood to secondary graduation; fostering critical thinking, godliness, integrity, and discipline through dedicated educators and modern pedagogical standards.
                </p>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h3 className="text-2xl font-bold text-slate-900">Our Pillars of Character</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                The non-negotiable core values that guide our teaching and student conduct.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Excellence', desc: 'Highest standard in all pursuits', icon: Award },
                { label: 'Character', desc: 'Moral uprightness & truth', icon: ShieldCheck },
                { label: 'Discipline', desc: 'Orderliness & self-control', icon: Compass },
                { label: 'Knowledge', desc: 'Curiosity & deep understanding', icon: BookOpen },
                { label: 'Diligence', desc: 'Hard work and perseverance', icon: Target },
                { label: 'Compassion', desc: 'Care, respect, and humility', icon: Heart },
              ].map((val, idx) => {
                const Icon = val.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-2xs hover:border-emerald-500 transition-colors"
                  >
                    <div className="w-9 h-9 mx-auto rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">{val.label}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">{val.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Campus Infrastructure & Facilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>Infrastructure & Learning Spaces</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Our Purpose-Built Campus in Doma
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Every building, laboratory, and compound space at Peculiar College has been intentionally designed to support academic excellence and spiritual calm.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Item 1: Admin & Office */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all">
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src="/school-media/administrative-block-office.jpg"
                alt="Administrative Office Block"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded backdrop-blur-xs">
                Administration
              </span>
            </div>
            <div className="p-5">
              <h4 className="font-bold text-slate-900 text-base">Administrative & Principal Office Block</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Centralized administration managing admissions, parent inquiries, academic records, and institutional leadership.
              </p>
            </div>
          </div>

          {/* Item 2: Senior Secondary Block */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all">
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src="/school-media/senior-secondary-block.jpg"
                alt="Senior Secondary Block"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded backdrop-blur-xs">
                Academics
              </span>
            </div>
            <div className="p-5">
              <h4 className="font-bold text-slate-900 text-base">Senior Secondary Classroom Block</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Dedicated learning wings for SSS 1 to SSS 3 featuring dual desks and disciplined study atmospheres.
              </p>
            </div>
          </div>

          {/* Item 3: Chemistry & Science Labs */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all">
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src="/school-media/chemistry-lab-glassware.jpg"
                alt="Chemistry Laboratory Equipment"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded backdrop-blur-xs">
                Laboratories
              </span>
            </div>
            <div className="p-5">
              <h4 className="font-bold text-slate-900 text-base">Chemistry & Science Laboratories</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Equipped with burettes, pipettes, test tubes, and certified chemicals for WAEC and NECO practicals.
              </p>
            </div>
          </div>

          {/* Item 4: Grand Examination Hall */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all">
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src="/school-media/exam-hall-exterior.jpg"
                alt="Examination Hall Exterior"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded backdrop-blur-xs">
                Examination
              </span>
            </div>
            <div className="p-5">
              <h4 className="font-bold text-slate-900 text-base">Purpose-Built Examination Hall</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Spacious multipurpose hall designed for external certifications, mock examinations, and school gatherings.
              </p>
            </div>
          </div>

          {/* Item 5: Solar Power Room */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all">
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src="/school-media/solar-power-room.jpg"
                alt="Solar Power Inverter Room"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded backdrop-blur-xs">
                Green Power
              </span>
            </div>
            <div className="p-5">
              <h4 className="font-bold text-slate-900 text-base">24/7 Solar Inverter Power Plant</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Clean and reliable energy plant powering computer workstations, laboratory devices, and classroom fans.
              </p>
            </div>
          </div>

          {/* Item 6: Teachers' Staff Room */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all">
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src="/school-media/teachers-staff-room.jpg"
                alt="Teachers Staff Room"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded backdrop-blur-xs">
                Faculty
              </span>
            </div>
            <div className="p-5">
              <h4 className="font-bold text-slate-900 text-base">Educators' Staff Room & Lounge</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Professional workspace where subject teachers collaborate, mark continuous assessments, and prepare lessons.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => onNavigate('gallery')}
            className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <span>View All School Facilities in Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. Principal's Message */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-md">
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-emerald-100 shrink-0 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?auto=format&fit=crop&w=400&q=80"
                alt="Principal of Peculiar College Doma"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
                Office of the Principal
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                A Warm Welcome to Peculiar College
              </h3>
              <p className="text-xs text-slate-500">
                Peculiar College Doma, Nasarawa State
              </p>
            </div>
          </div>

          <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed border-t border-slate-100 pt-6">
            <p>
              "Dear Parents, Guardians, and Friends of Peculiar College Doma,
            </p>
            <p>
              It is my heartfelt joy to welcome you to our school community. For nearly two decades, Peculiar College has remained steadfast in our sacred trust: nurturing the next generation not just for academic triumph, but for noble living.
            </p>
            <p>
              We recognize that every child who walks through our gates is unique—imbued with distinct gifts and potential. Whether in Nursery, Primary, or our Secondary College, our staff are committed to patient instruction, rigorous continuous assessment, and personal character guidance.
            </p>
            <p>
              We look forward to welcoming your family into our close-knit, disciplined school family as we partner together to raise leaders for tomorrow."
            </p>
            <div className="pt-2">
              <span className="font-bold text-slate-900 block text-sm">Mrs. R. A. Adams</span>
              <span className="text-xs text-emerald-800 font-semibold">Principal, Peculiar College Doma</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Educational Philosophy & Pastoral Care */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-900 text-white rounded-3xl p-8 sm:p-12">
          <div className="max-w-3xl space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300 bg-emerald-800/80 px-3 py-1 rounded-full border border-amber-400/30">
              Our Educational Philosophy
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Whole-Child Development & Pastoral Care
            </h3>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              We believe education must transcend rote memorization. Our teachers work hand-in-hand with parents through our open-door policy and digital portal updates to monitor intellectual, emotional, and spiritual growth.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-emerald-800/60 p-4 rounded-xl border border-emerald-700">
                <span className="text-amber-400 font-bold text-sm block mb-1">Strict Anti-Bullying</span>
                <span className="text-xs text-emerald-100">Zero tolerance for misconduct; a caring family atmosphere.</span>
              </div>
              <div className="bg-emerald-800/60 p-4 rounded-xl border border-emerald-700">
                <span className="text-amber-400 font-bold text-sm block mb-1">House System</span>
                <span className="text-xs text-emerald-100">Healthy competition across Faith, Grace, Peace, and Hope houses.</span>
              </div>
              <div className="bg-emerald-800/60 p-4 rounded-xl border border-emerald-700">
                <span className="text-amber-400 font-bold text-sm block mb-1">Parent Partnership</span>
                <span className="text-xs text-emerald-100">Regular PTA consultations and instant terminal report cards.</span>
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={() => onNavigate('admissions')}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-all inline-flex items-center gap-2"
              >
                <span>Enroll Your Child for 2026/2027</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
