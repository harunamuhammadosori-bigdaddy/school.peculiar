import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Users,
  Compass,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Calendar,
  Trophy,
  BookOpen,
  MapPin,
  Phone,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { GalleryMedia, NewsArticle } from '../../types';

interface HomeViewProps {
  onNavigate: (view: string) => void;
  newsArticles?: NewsArticle[];
  galleryItems?: GalleryMedia[];
  onSelectPhoto?: (item: GalleryMedia) => void;
  news?: NewsArticle[];
  gallery?: GalleryMedia[];
  onSelectGalleryItem?: (item: GalleryMedia) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  newsArticles,
  galleryItems,
  onSelectPhoto,
  news,
  gallery,
  onSelectGalleryItem,
}) => {
  const articles = newsArticles || news || [];
  const photos = galleryItems || gallery || [];
  const handlePhotoSelect = onSelectPhoto || onSelectGalleryItem || (() => {});
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] sm:min-h-[640px] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
        {/* Background Image with Layered Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/home.jpg"
            alt="Morning Assembly at Peculiar College Doma"
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Authentic deep green to dark slate gradient overlay for crystal clear contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-slate-950/80 to-emerald-950/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Nursery • Primary • Secondary Education in Doma</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            WELCOME TO <br />
            <span className="text-amber-400">PECULIAR COLLEGE DOMA</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-slate-200 font-normal leading-relaxed mb-10">
            "Nurturing minds, building character, and preparing students for a brighter future."
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('admissions')}
              className="px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Apply for Admission</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/25 backdrop-blur-xs transition-all"
            >
              Explore Our School
            </button>
          </div>

          {/* Quick Stat Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/15">
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400">2006</span>
              <span className="text-xs text-slate-300">Established in Doma</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-white">3 Arms</span>
              <span className="text-xs text-slate-300">Nursery, Primary & College</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400">100%</span>
              <span className="text-xs text-slate-300">Dedicated Teachers</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-white">4 Houses</span>
              <span className="text-xs text-slate-300">Sports & Leadership</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / CORE VALUES STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-20 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 hover:border-emerald-500/50 transition-all hover:shadow-lg group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Quality Education</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Thorough curriculum bridging foundational cognitive literacy up to rigorous secondary examination mastery.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 hover:border-emerald-500/50 transition-all hover:shadow-lg group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Moral & Discipline</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Uncompromising focus on integrity, respectful conduct, spiritual grounding, and disciplined character.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 hover:border-emerald-500/50 transition-all hover:shadow-lg group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Experienced Teachers</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Caring, qualified educators who provide individualized attention and mentorship to every child.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/80 hover:border-emerald-500/50 transition-all hover:shadow-lg group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Safe & Conducive</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Serene compound under natural shaded trees providing an open, secure, and peaceful learning sanctuary.
            </p>
          </div>
        </div>
      </section>

      {/* 3. OUR SCHOOL LEVELS (3 POLISHED CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Structured Pathways
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Our Three Educational Arms
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            One school compound, one shared standard of care, three progressive stages of growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Nursery */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
            <div className="relative h-56 overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
                alt="Nursery Arm at Peculiar College"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full shadow-sm">
                Ages 2 – 5 Years
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                  Early Years
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">Nursery Arm</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Playful, hands-on learning that builds early literacy, phonics, numeracy, and good moral habits in our cheerful yellow & green uniform.
                </p>
              </div>
              <button
                onClick={() => onNavigate('academics')}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Explore Nursery Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
            <div className="relative h-56 overflow-hidden bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80"
                alt="Primary Arm at Peculiar College"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-emerald-700 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-sm">
                Basic 1 – 6
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                  Foundational Learning
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">Primary Arm</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Structured national curriculum with strong pastoral care, developing every pupil's quantitative abilities, curiosity, and disciplined reading habits.
                </p>
              </div>
              <button
                onClick={() => onNavigate('academics')}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Explore Primary Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Secondary */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
            <div className="relative h-56 overflow-hidden bg-slate-100">
              <img
                src="/assembly.jpg"
                alt="Secondary Arm at Peculiar College"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-blue-700 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-sm">
                JSS 1 – SSS 3
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                  College Level
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">Secondary Arm</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Rigorous academics and mentorship preparing students for BECE, WAEC, NECO, and JAMB in Science, Arts, and Commercial departments.
                </p>
              </div>
              <button
                onClick={() => onNavigate('academics')}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Explore Secondary Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT & PROPRIETOR MESSAGE PREVIEW */}
      <section className="bg-slate-100/70 py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-900">
                <img
                  src="/home.jpg"
                  alt="Sports Day Celebration with Staff at Peculiar College Doma"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <span className="bg-amber-400 text-slate-950 text-[11px] font-bold px-2.5 py-0.5 rounded">
                      Staff & Students United
                    </span>
                    <p className="text-sm font-semibold mt-1 text-slate-100">
                      Celebrating Inter-House Championship Victory with the Principal Cup
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                About Peculiar College Doma
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                A Legacy of Discipline, Spiritual Values, and Academic Rigor
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Founded in 2006 in Doma, Nasarawa State, Peculiar College was born out of a profound passion to offer parents a safe, disciplined haven where children receive high-standard private education grounded in moral values.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Under the shade of our serene compound, every morning assembly begins with reverent devotion and national pride. Whether in the early childhood nursery playrooms, the foundational primary classes, or the college laboratories, our pupils are molded to stand out as peculiar leaders of tomorrow.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Full Educational Continuity</span>
                    <span className="text-xs text-slate-500">Nursery smoothly through Secondary graduation.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Transparent Portal Access</span>
                    <span className="text-xs text-slate-500">Parents view results and receipts securely online.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('about')}
                  className="px-6 py-3 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm transition-colors inline-flex items-center gap-2"
                >
                  <span>Read Our Full Story & Philosophy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY PARENTS CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Parental Confidence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Why Parents in Doma Choose Us
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Verified institutional strengths that make Peculiar College a trusted home for child upbringing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Qualified, Caring Teaching Staff',
              desc: 'Passionate teachers committed to nurturing both quick learners and students needing remedial attention.',
              icon: Users,
            },
            {
              title: 'Safe, Well-Supervised Compound',
              desc: 'Gated and secure perimeter with shaded open courtyards where daily assembly and orderly classes take place.',
              icon: ShieldCheck,
            },
            {
              title: 'Affordable Fees & Flexible Payment',
              desc: 'Structured installments accommodating working families while maintaining uncompromising educational standards.',
              icon: HeartHandshake,
            },
            {
              title: 'Strong Academic & Moral Foundation',
              desc: 'Regular continuous assessments (CA 1 & 2) combined with daily devotions and character mentorship.',
              icon: BookOpen,
            },
            {
              title: 'Co-Curriculars & Sports Houses',
              desc: 'Annual Inter-House Sports (Purple, Orange, Blue, Red), volleyball leagues, debate club, and cultural activities.',
              icon: Trophy,
            },
            {
              title: 'Modern Parent Portal & Results',
              desc: 'Instant access to terminal report sheets, attendance records, and verifiable payment receipts from any phone.',
              icon: Sparkles,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. SCHOOL LIFE & FACILITIES PHOTO PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Moments & Memories
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              School Life in Pictures
            </h2>
            <p className="text-slate-600 text-sm">
              Real scenes from morning assemblies, outdoor exams, and championship sports.
            </p>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-700 flex items-center gap-1 hover:underline"
          >
            <span>View All Gallery Photos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(photos || []).slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => handlePhotoSelect(item)}
              className="group relative h-64 rounded-xl overflow-hidden cursor-pointer shadow-xs border border-slate-200 bg-slate-900"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                  {item.category}
                </span>
                <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. LATEST NEWS & ANNOUNCEMENTS */}
      <section className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                School Bulletins
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                Latest News & Events
              </h2>
            </div>
            <button
              onClick={() => onNavigate('news')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-700 flex items-center gap-1 hover:underline"
            >
              <span>View All News & Circulars</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(articles || []).slice(0, 3).map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-emerald-900/90 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded backdrop-blur-xs">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{article.publishDate}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => onNavigate('news')}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <span>Read Full Article</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ADMISSION SESSION CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              Official Session 2026/2027
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Enrolling Nursery, Primary & Secondary Students
            </h3>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-8">
              Spaces are allocated on a strictly validated merit and interview basis. Begin your online application today or check the status of your existing submission.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('admissions')}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Start Online Application</span>
              </button>
              <button
                onClick={() => onNavigate('admissions')}
                className="px-6 py-3 bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl border border-emerald-400/40 transition-all"
              >
                Track Existing Application
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. LOCATION & CONTACT QUICK STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Physical Campus Location
              </span>
              <p className="text-base font-bold text-slate-900">
                Off Ruttu Road / 09 Peace Road, Doma, Nasarawa State, Nigeria
              </p>
              <span className="text-xs text-slate-500">
                Administrative desk open Monday – Friday, 8:00 AM – 3:30 PM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors"
            >
              Get Directions & Inquire
            </button>
            <a
              href="tel:+2349043390882"
              className="px-5 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>Call School Office</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
