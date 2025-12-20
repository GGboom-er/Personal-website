import React from 'react';
import { Project } from '../types';

interface ShowcaseProps {
  project: Project;
}

const Showcase: React.FC<ShowcaseProps> = ({ project }) => {
  return (
    <div className="relative w-full h-full rounded-b-xl overflow-hidden group">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[#1c1c1e]">
        {/* The actual image */}
        <img 
          key={project.id} // Key change forces animation
          src={project.heroImage} 
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out animate-[fadeIn_0.5s_ease-out]"
        />
        {/* Gradient Overlays for text readability and aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/90 via-[#000000]/30 to-transparent" />
        <div className="absolute top-0 right-0 p-20 opacity-30 blur-3xl bg-accent-blue rounded-full w-64 h-64 mix-blend-screen pointer-events-none"></div>
      </div>

      {/* Content Content - Scaled to 80% (0.8) */}
      <div className="absolute bottom-0 md:bottom-[8%] left-0 right-0 w-full px-8 md:px-16 flex flex-col md:flex-row items-end justify-between gap-10 z-10 md:origin-bottom md:scale-[0.85]">
        
        {/* LEFT COLUMN: Icon & Main Info (Title/Desc) */}
        <div className="flex-1 flex gap-8 items-end min-w-0 max-w-4xl">
          {/* Icon */}
          <img 
            src={project.icon} 
            alt={project.title} 
            className="w-24 h-24 md:w-56 md:h-56 rounded-[2rem] shadow-2xl border border-white/10 shrink-0 object-cover"
          />
          <div className="mb-2 flex-1">
            <div className="flex items-center gap-3 text-accent-blue font-bold text-sm md:text-lg tracking-widest uppercase mb-4">
              <span>{project.category}</span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
              <span>{project.role}</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-none shadow-black drop-shadow-lg">
              {project.title}
            </h1>
            <p className="text-gray-300 text-base md:text-2xl leading-relaxed opacity-90 line-clamp-3 font-light drop-shadow-md">
              {project.description}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Action & Stats - Moved to the far right */}
        <div className="flex flex-col items-end gap-8 shrink-0 pb-2 pl-10">
          {/* Main Action Button */}
          <button className="bg-white text-black font-extrabold text-xl md:text-3xl py-6 px-20 rounded-full hover:bg-gray-200 transition-colors transform active:scale-95 shadow-[0_0_35px_rgba(255,255,255,0.3)]">
            VIEW
          </button>
          
          {/* Glassmorphism Stats Box */}
          <div className="flex gap-10 bg-black/40 backdrop-blur-xl px-12 py-8 rounded-3xl border border-white/10 shadow-2xl">
            {project.stats.map((stat, idx) => (
              <div key={idx} className="text-center px-2 border-r border-white/10 last:border-0 min-w-[80px]">
                <div className="text-gray-400 text-xs md:text-sm uppercase font-bold mb-3 tracking-wider">{stat.label}</div>
                <div className="text-white font-bold text-xl md:text-4xl font-sans">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex gap-4 justify-end flex-wrap max-w-[500px] justify-items-end">
             {project.tags.map(tag => (
               <span key={tag} className="text-xs md:text-base font-medium bg-black/60 backdrop-blur-md text-gray-300 px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                 {tag}
               </span>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Showcase;