import React, { useState } from 'react';
import { GalleryMedia } from '../../types';
import { Camera, X, ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';

interface GalleryViewProps {
  mediaItems: GalleryMedia[];
  selectedItem: GalleryMedia | null;
  onSelectItem: (item: GalleryMedia | null) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  mediaItems = [],
  selectedItem,
  onSelectItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Morning Assembly',
    'Sports & Inter-House',
    'Exams & Revision',
    'Awards & Staff',
    'Nursery Life',
    'Secondary Arm',
  ];

  const filteredItems =
    selectedCategory === 'All'
      ? mediaItems
      : mediaItems.filter((m) => m.category.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(m.category.toLowerCase()));

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItem) return;
    const currentIdx = mediaItems.findIndex((m) => m.id === selectedItem.id);
    const nextIdx = (currentIdx + 1) % mediaItems.length;
    onSelectItem(mediaItems[nextIdx]);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItem) return;
    const currentIdx = mediaItems.findIndex((m) => m.id === selectedItem.id);
    const prevIdx = (currentIdx - 1 + mediaItems.length) % mediaItems.length;
    onSelectItem(mediaItems[prevIdx]);
  };

  return (
    <div className="space-y-12 py-8 pb-20">
      {/* Banner */}
      <section className="bg-gradient-to-b from-emerald-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/40">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Camera className="w-3.5 h-3.5" />
            <span>Visual Archive of Peculiar College</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            School Photo Gallery & Campus Life
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Witness our orderly morning assemblies, vibrant volleyball tournaments, outdoor shade revision, and joyful prize celebrations.
          </p>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-60 overflow-hidden bg-slate-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded backdrop-blur-xs">
                  {item.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{item.date}</span>
                  </span>
                  <span className="text-emerald-700 font-medium">Click to expand</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          onClick={() => onSelectItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => onSelectItem(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev / Next Controls */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image display */}
            <div className="max-h-[70vh] flex items-center justify-center bg-black">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="max-h-[70vh] max-w-full object-contain mx-auto"
              />
            </div>

            {/* Caption */}
            <div className="p-6 bg-slate-900 text-white space-y-1 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded">
                  {selectedItem.category}
                </span>
                <span className="text-xs text-slate-400">{selectedItem.date}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{selectedItem.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedItem.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
