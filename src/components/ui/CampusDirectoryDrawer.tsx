'use client';

import React, { useState } from 'react';
import { X, Building2, MapPin, Layers, Search, ChevronRight, BookOpen, Utensils, Award, Sparkles, ExternalLink } from 'lucide-react';

interface CampusDirectoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBuilding: (buildingId: string) => void;
  onOpenIndoor: (buildingId: string) => void;
  initialCategory?: string;
}

interface DirectoryCategory {
  id: string;
  name: string;
  count: string;
  color: string;
  items: {
    id: string;
    code: string;
    name: string;
    description: string;
    details: string;
    floors: number;
    hasIndoor: boolean;
    image: string;
  }[];
}

const DIRECTORY_DATA: DirectoryCategory[] = [
  {
    id: 'academic',
    name: 'Academic Spine',
    count: 'Blocks 1 - 58',
    color: 'from-orange-500 to-amber-600',
    items: [
      {
        id: 'b-33-34',
        code: 'Blocks 33-34',
        name: 'School of Computer Science & Engineering (CSE)',
        description: 'Flagship academic body housing 8 Live AI & Cloud Labs, Cyber Security Bays, and Lecture Complexes.',
        details: '84 Lecture Halls · 16 Computing Labs · AWS & Google Cloud Centers',
        floors: 6,
        hasIndoor: true,
        image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'b-13-14',
        code: 'Blocks 13-14',
        name: 'Mittal School of Business (MSB) & DSW',
        description: 'Premier business management hub, financial analytics labs, and Division of Student Welfare offices.',
        details: 'Bloomberg Terminals · Corporate Interview Suites · Executive Boardrooms',
        floors: 5,
        hasIndoor: false,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'b-01',
        code: 'Block 1',
        name: 'School of Fashion Design & Garment Tech',
        description: 'Textile labs, high-fashion ramp runway stage, CAD stitching suites, and styling ateliers.',
        details: 'Fashion Ramp Studio · Dyeing Workshops · Pattern Drafting Bays',
        floors: 4,
        hasIndoor: false,
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'b-25-28',
        code: 'Blocks 25-28',
        name: 'Bioengineering & Agricultural Sciences',
        description: 'Hydroponic greenhouses, food tech labs, microbiology research complexes, and botanical research.',
        details: 'Plant Tissue Culture · Genetic Sequencing Lab · Experimental Farms',
        floors: 5,
        hasIndoor: false,
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'amenities',
    name: 'Amenities & Retail',
    count: 'UniMall & Unipolis',
    color: 'from-blue-500 to-cyan-600',
    items: [
      {
        id: 'b-15-unimall',
        code: 'Block 15',
        name: 'UniMall & Central Shopping Centre',
        description: '6-floor central shopping complex with food courts (Domino’s, Subway, CCD), bank branches, official apparel & supermarkets.',
        details: '42 Retail Outlets · 3rd Floor Bowling Alley · India Post Office',
        floors: 4,
        hasIndoor: true,
        image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'unipolis',
        code: 'Unipolis',
        name: 'Unipolis Grand Amphitheatre',
        description: 'World-renowned 10,000+ capacity open-air amphitheater hosting global concerts, youth festivals, and tech hackathons.',
        details: 'Massive Concert Stage · Surrounding Student Food Kiosks',
        floors: 2,
        hasIndoor: false,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'library_auditorium',
    name: 'Knowledge & Culture',
    count: 'Library & Mittal Aud',
    color: 'from-purple-500 to-violet-600',
    items: [
      {
        id: 'b-36-38',
        code: 'Blocks 36-38',
        name: 'Central Knowledge Library & Research Hub',
        description: 'Multi-level automated RFID library housing over 1.5 million physical and digital texts, private study carrels, and 24/7 exam halls.',
        details: '1.5M Books · 500-Seat Silent Reading Hall · RFID Turnstiles',
        floors: 4,
        hasIndoor: true,
        image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'b-35',
        code: 'Block 35',
        name: 'Shanti Devi Mittal Auditorium',
        description: 'Air-conditioned 3,500-seat state-of-the-art auditorium for convocations, national conferences, and celebrity talks.',
        details: '3,500 Seating · Dolby Acoustic Array · VIP Green Rooms',
        floors: 4,
        hasIndoor: false,
        image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'hostels',
    name: 'Residential Hostels',
    count: 'BH-1 to GH-21',
    color: 'from-emerald-500 to-teal-600',
    items: [
      {
        id: 'bh-1-2',
        code: 'BH-1 & BH-2',
        name: 'Boys Hostels BH-1 & BH-2 Food Square',
        description: 'Multi-story student residences featuring open dining courtyards, sports courts, and night canteens.',
        details: '2,800 Bed Capacity · 24/7 High-Speed Wi-Fi · Gym & Laundry',
        floors: 8,
        hasIndoor: false,
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'gh-cluster',
        code: 'GH Complex',
        name: 'Girls Hostel Complex (GH 9-12, 21)',
        description: 'Secured student residences with landscaped courtyards, stationery stores, beauty salons, and dedicated dining wings.',
        details: 'Biometric Access Control · Dedicated Gym & Medical Bay',
        floors: 8,
        hasIndoor: false,
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
];

export const CampusDirectoryDrawer: React.FC<CampusDirectoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectBuilding,
  onOpenIndoor,
  initialCategory,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');

  React.useEffect(() => {
    if (initialCategory && isOpen) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory, isOpen]);

  if (!isOpen) return null;

  const filteredCategories = DIRECTORY_DATA.map((cat) => {
    const items = cat.items.filter(
      (it) =>
        (selectedCategory === 'all' || cat.id === selectedCategory) &&
        (it.name.toLowerCase().includes(search.toLowerCase()) ||
          it.code.toLowerCase().includes(search.toLowerCase()) ||
          it.description.toLowerCase().includes(search.toLowerCase()))
    );
    return { ...cat, items };
  }).filter((cat) => cat.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0B1120] border-l border-slate-700/80 text-white h-full flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER BAR */}
        <div className="p-5 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white tracking-tight">Campus Spatial Directory</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  600+ Acres
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Walk through faculties, student residences, libraries, and retail hubs in 3D
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH & CATEGORY CHIPS */}
        <div className="p-4 border-b border-slate-800/80 space-y-3 bg-[#0d1424]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by building name, block number (e.g. Block 34, UniMall, MSB)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Complexes
            </button>
            {DIRECTORY_DATA.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === c.id
                    ? 'bg-orange-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* CARDS LIST */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.color}`} />
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {category.name}
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{category.count}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/50 p-3.5 shadow-lg flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Image Preview with Badges */}
                      <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 bg-slate-800">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-orange-400 border border-orange-500/30">
                          {item.code}
                        </div>
                        {item.hasIndoor && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-950/80 backdrop-blur-md text-[10px] font-mono text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5" />
                            Indoor Map
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-slate-300 font-mono">
                          {item.floors} Floors
                        </div>
                      </div>

                      <h5 className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors">
                        {item.name}
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          onSelectBuilding(item.id);
                          onClose();
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-orange-500/15 hover:bg-orange-500 text-orange-300 hover:text-slate-950 border border-orange-500/30 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MapPin className="w-3 h-3" />
                        Focus in 3D
                      </button>

                      {item.hasIndoor && (
                        <button
                          onClick={() => {
                            onOpenIndoor(item.id);
                            onClose();
                          }}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
                          title="View Indoor Blueprint"
                        >
                          <Layers className="w-3 h-3 text-cyan-400" />
                          Floors
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">No campus buildings match your search</p>
            </div>
          )}
        </div>

        {/* BOTTOM QUICK STATS */}
        <div className="p-4 border-t border-slate-800 bg-[#090d17] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>WGS84 EPSG:4326 · 600+ Acres</span>
          <span className="text-orange-400 font-bold">50+ Academic Blocks</span>
        </div>
      </div>
    </div>
  );
};

