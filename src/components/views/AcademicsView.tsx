import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Beaker,
  FileCheck,
  Calendar,
  CheckCircle2,
  Award,
  ArrowRight,
  Sparkles,
  Trophy,
  Building2,
} from 'lucide-react';

interface AcademicsViewProps {
  onNavigate: (view: string) => void;
}

export const AcademicsView: React.FC<AcademicsViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'nursery' | 'primary' | 'secondary'>('secondary');

  return (
    <div className="space-y-16 py-8 pb-20">
      {/* Banner */}
      <section className="bg-gradient-to-b from-emerald-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/40">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Curriculum & Intellectual Rigor</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Academic Programs & Standards
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Delivering quality instruction from early childhood through secondary graduation with certified national curriculum standards and strong moral values.
          </p>
        </div>
      </section>

      {/* Arm Selector Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300 shadow-inner">
            <button
              onClick={() => setActiveTab('nursery')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'nursery'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Nursery Arm (Ages 2 – 5)
            </button>
            <button
              onClick={() => setActiveTab('primary')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'primary'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Primary Arm (Basic 1 – 6)
            </button>
            <button
              onClick={() => setActiveTab('secondary')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'secondary'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Secondary College (JSS 1 – SSS 3)
            </button>
          </div>
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === 'nursery' && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Early Childhood Foundation
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Nursery & Pre-School Program
                </h2>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  Our Nursery Arm provides a warm, happy, and intellectually stimulating environment for young learners. In their signature yellow and green uniforms, children develop love for learning through structured sensory play, Montessori-inspired manipulative activities, and teacher-led phonics instruction.
                </p>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Core Learning Areas:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      <span>Early Phonics & Reading Readiness</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      <span>Number Work & Pattern Discovery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      <span>Handwriting & Fine Motor Skills</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      <span>Moral Instruction & Courtesy Habits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      <span>Nursery Rhymes, Music & Creative Arts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      <span>Basic Health Habits & Hygiene</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('admissions')}
                    className="px-6 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition-all"
                  >
                    Enroll for Nursery (2026/2027)
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-900">
                  <img
                    src="/school-media/classroom-trees-compound.jpg"
                    alt="Peculiar Nursery & Early Learning Compound"
                    className="w-full h-80 object-cover"
                  />
                  <div className="p-4 bg-slate-900 text-white text-xs">
                    <span className="text-amber-400 font-bold">Nursery Grounds & Shaded Courtyard</span>
                    <p className="text-slate-400 mt-0.5">
                      Safe, tree-shaded outdoor compound and ventilated classrooms designed for early years discovery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'primary' && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Basic Education 1 – 6
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Primary Arm Curriculum
                </h2>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  Our Primary curriculum is designed in alignment with the Nigerian Universal Basic Education (UBE) guidelines. We place immense priority on solid foundational literacy, mental arithmetic, scientific curiosity, and moral discipline.
                </p>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Core Subject Offerings:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>English Studies, Grammar & Composition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Mathematics & Quantitative Reasoning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Basic Science & Technology</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Social Studies & Civic Education</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Christian Religious Studies (CRS)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Agricultural Science & Practical School Farm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verbal & Quantitative Aptitude</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Physical & Health Education</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('admissions')}
                    className="px-6 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Enroll for Primary (2026/2027)
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-900">
                  <img
                    src="/school-media/students-outdoor-gathering.jpg"
                    alt="Peculiar Primary School Pupils"
                    className="w-full h-80 object-cover"
                  />
                  <div className="p-4 bg-slate-900 text-white text-xs">
                    <span className="text-emerald-400 font-bold">Attentive Primary Pupils</span>
                    <p className="text-slate-400 mt-0.5">
                      Orderly students gathered on the school compound in full uniform with strong pastoral discipline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'secondary' && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Junior & Senior College (JSS 1 – SSS 3)
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Secondary College Curriculum
                </h2>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  Peculiar College prepares students rigorously for the Junior WAEC / BECE exams (ERC/NECO) and Senior School Certificate Examinations (SSCE WAEC, NECO) as well as the UTME/JAMB entrance examination for university admission.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-blue-900 uppercase block mb-2">
                      🔬 Science Dept
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• Physics & Practicals</li>
                      <li>• Chemistry & Practicals</li>
                      <li>• Biology & Physiology</li>
                      <li>• Further Mathematics</li>
                      <li>• Agricultural Science</li>
                      <li>• Geography</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-amber-900 uppercase block mb-2">
                      📚 Arts & Humanities
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• Literature in English</li>
                      <li>• Government & Politics</li>
                      <li>• Christian Rel. Studies</li>
                      <li>• History of Nigeria</li>
                      <li>• Civic Education</li>
                      <li>• French Language</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-emerald-900 uppercase block mb-2">
                      📊 Commercial Dept
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• Financial Accounting</li>
                      <li>• Commerce & Trade</li>
                      <li>• Economics</li>
                      <li>• Business Methods</li>
                      <li>• Marketing</li>
                      <li>• Data Processing</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('admissions')}
                    className="px-6 py-2.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Enroll for Secondary College (2026/2027)
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-900">
                  <img
                    src="/school-media/sss1-class-session.jpg"
                    alt="Secondary Students in Class Session"
                    className="w-full h-80 object-cover"
                  />
                  <div className="p-4 bg-slate-900 text-white text-xs">
                    <span className="text-blue-400 font-bold">Senior Class in Active Session</span>
                    <p className="text-slate-400 mt-0.5">
                      Focused learning environment preparing students for WAEC, NECO, and UTME/JAMB exams.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Assessment System & Continuous Grading */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Assessment Standards
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Terminal Grading & Continuous Assessment
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              Every student's terminal performance is computed through balanced continuous assessment and examination scores.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-xs">
              <span className="text-3xl font-black text-emerald-800 block">20%</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">1st Continuous Assessment (CA1)</span>
              <span className="text-xs text-slate-500 mt-1 block">Class tests, assignments, and weekly exercises.</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-xs">
              <span className="text-3xl font-black text-amber-600 block">20%</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">2nd Continuous Assessment (CA2)</span>
              <span className="text-xs text-slate-500 mt-1 block">Mid-term test, practical projects, and notebooks.</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-xs">
              <span className="text-3xl font-black text-blue-700 block">60%</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">Terminal Examination</span>
              <span className="text-xs text-slate-500 mt-1 block">End-of-term standardized objective and essay paper.</span>
            </div>
          </div>

          {/* Grade Table */}
          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Score Range</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Official Classification</th>
                  <th className="py-3 px-4">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-4 font-semibold">80% – 100%</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-700">A</td>
                  <td className="py-2.5 px-4">Distinction</td>
                  <td className="py-2.5 px-4 text-xs text-slate-500">Exceptional mastery; recommend for honors.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold">70% – 79%</td>
                  <td className="py-2.5 px-4 font-bold text-blue-700">B</td>
                  <td className="py-2.5 px-4">Very Good</td>
                  <td className="py-2.5 px-4 text-xs text-slate-500">Commendable knowledge; maintain effort.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold">60% – 69%</td>
                  <td className="py-2.5 px-4 font-bold text-teal-700">C</td>
                  <td className="py-2.5 px-4">Credit</td>
                  <td className="py-2.5 px-4 text-xs text-slate-500">Satisfactory credit pass; room for improvement.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold">50% – 59%</td>
                  <td className="py-2.5 px-4 font-bold text-amber-600">D</td>
                  <td className="py-2.5 px-4">Pass</td>
                  <td className="py-2.5 px-4 text-xs text-slate-500">Marginal pass; remedial assistance advised.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold">0% – 49%</td>
                  <td className="py-2.5 px-4 font-bold text-red-600">F</td>
                  <td className="py-2.5 px-4">Fail / Repeat</td>
                  <td className="py-2.5 px-4 text-xs text-slate-500">Below standard; mandatory parental intervention.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modern Science Laboratories & Examination Facilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700/60">
                <Beaker className="w-3.5 h-3.5" />
                <span>Hands-On Practical Science</span>
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
                Equipped Science Laboratories & Examination Halls
              </h3>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Peculiar College provides fully accredited science and technical laboratories equipped for WAEC, NECO, and BECE practical examinations.
              </p>
            </div>
            <button
              onClick={() => onNavigate('gallery')}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0"
            >
              <span>View All Lab Photos</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Lab 1: Chemistry */}
            <div className="bg-slate-950/80 rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
              <div className="relative h-44 overflow-hidden">
                <img
                  src="/school-media/chemistry-lab-glassware.jpg"
                  alt="Chemistry Laboratory Equipment"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  Chemistry Lab
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-white text-sm">Glassware & Analytical Reagents</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Volumetric flasks, burettes, pipettes, and standard acids/bases for qualitative and quantitative titration.
                </p>
              </div>
            </div>

            {/* Lab 2: Biology */}
            <div className="bg-slate-950/80 rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
              <div className="relative h-44 overflow-hidden">
                <img
                  src="/school-media/biology-lab-microscopes.jpg"
                  alt="Biology Microscopes & Specimens"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  Biology Lab
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-white text-sm">Monocular Microscopes & Slides</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Optical microscopes, dissection kits, biological preserved specimens, and anatomical study models.
                </p>
              </div>
            </div>

            {/* Lab 3: Physics */}
            <div className="bg-slate-950/80 rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
              <div className="relative h-44 overflow-hidden">
                <img
                  src="/school-media/physics-lab-circuit-components.jpg"
                  alt="Physics Lab Circuit Apparatus"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  Physics Lab
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-white text-sm">Circuits, Optics & Mechanics</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Resistance boxes, rheostats, galvanometers, optical benches, and prisms for SSCE practical physics experiments.
                </p>
              </div>
            </div>

            {/* Lab 4: Examination Hall */}
            <div className="bg-slate-950/80 rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
              <div className="relative h-44 overflow-hidden">
                <img
                  src="/school-media/examination-hall-interior.jpg"
                  alt="Examination Hall Interior"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  Exam Hall
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-white text-sm">Spacious Examination Hall</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Ventilated, standardized examination setting designed to accommodate external invigilators and multiple cohorts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Houses & Co-Curriculars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Beyond the Classroom
          </span>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Our Four Sports Houses & Co-Curricular Clubs
          </h3>
          <p className="text-slate-600 text-sm mt-1">
            Every pupil is allocated into one of our sports houses fostering camaraderie, sportsmanship, and leadership.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-200 shadow-2xs">
            <span className="text-2xl mb-2 block">🟣</span>
            <h4 className="text-base font-bold text-purple-950 mb-1">Faith House (Purple)</h4>
            <p className="text-xs text-purple-900 leading-relaxed">
              Motto: "Walking in Victory". Known for athletic determination, relays, and teamwork.
            </p>
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 shadow-2xs">
            <span className="text-2xl mb-2 block">🟠</span>
            <h4 className="text-base font-bold text-orange-950 mb-1">Grace House (Orange)</h4>
            <p className="text-xs text-orange-900 leading-relaxed">
              Motto: "Strength through Virtue". Reigning volleyball champions and debate finalists.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 shadow-2xs">
            <span className="text-2xl mb-2 block">🔵</span>
            <h4 className="text-base font-bold text-blue-950 mb-1">Peace House (Blue)</h4>
            <p className="text-xs text-blue-900 leading-relaxed">
              Motto: "Harmony & Distinction". Strong in football, high jump, and cultural displays.
            </p>
          </div>

          <div className="bg-red-50 p-6 rounded-2xl border border-red-200 shadow-2xs">
            <span className="text-2xl mb-2 block">🔴</span>
            <h4 className="text-base font-bold text-red-950 mb-1">Hope House (Red)</h4>
            <p className="text-xs text-red-900 leading-relaxed">
              Motto: "Reaching the Summit". Excellent in sprints, march past, and academic decathlon.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-900">
          <img
            src="/sport.jpg"
            alt="Peculiar College Doma Inter-House Sports Volleyball Championship"
            className="w-full h-72 sm:h-96 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
            <div className="text-white max-w-2xl">
              <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                Annual Inter-House Sports Championship
              </span>
              <h4 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                Peculiar College Athletes in Action
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 mt-1">
                Pupils and students competing in the volleyball championship during our annual Inter-House Sports tournament on the school grounds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
