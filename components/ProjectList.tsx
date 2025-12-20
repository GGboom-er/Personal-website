import React from 'react';
import { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  activeId: string;
  onSelect: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, activeId, onSelect }) => {
  return (
    <div className="flex-1 w-full px-6 py-6 md:px-8 overflow-y-auto no-scrollbar flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-xl font-bold text-white">
          {projects.length > 0 ? projects[0].section === 'Profile' ? 'Experience & Education' : projects[0].section === 'Skills' ? 'Core Competencies' : 'Top Projects' : 'List'}
        </h2>
        <button className="text-accent-blue text-sm font-medium hover:underline opacity-80 hover:opacity-100">See All</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 pb-8">
        {projects.map((project, index) => {
          const isActive = project.id === activeId;
          return (
            <div 
              key={project.id}
              onClick={() => onSelect(project)}
              className={`
                group relative rounded-2xl p-4 cursor-pointer transition-all duration-300 ease-out overflow-hidden
                ${isActive 
                  ? 'bg-[#2c2c2e] ring-[3px] ring-accent-blue shadow-[0_0_30px_rgba(10,132,255,0.5)] scale-[1.05] z-10' 
                  : 'bg-[#1c1c1e] hover:bg-[#252527] hover:scale-[1.03] hover:shadow-2xl hover:z-10'
                }
              `}
            >
              {/* Card Content */}
              <div className="flex flex-col h-full items-center text-center justify-center space-y-4 py-2 relative z-10">
                <div className="relative w-20 h-20 shrink-0">
                  <img 
                    src={project.icon} 
                    alt={project.title} 
                    className={`w-full h-full rounded-[1.2rem] shadow-lg object-cover transition-transform duration-300 ${isActive ? 'scale-100' : 'group-hover:scale-105'}`} 
                  />
                  {isActive && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-accent-blue rounded-full blur-[4px]"></div>
                  )}
                </div>
                
                <div className="w-full min-w-0 px-1">
                  {/* Category - Eyebrow */}
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5 truncate">
                    {project.category}
                  </div>
                  {/* Title - Main Focus */}
                  <h3 className={`text-sm md:text-base font-bold truncate leading-tight mb-1 ${isActive ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                    {project.title}
                  </h3>
                  {/* Role - Secondary */}
                  <p className="text-xs text-gray-400 font-medium truncate opacity-90">
                    {project.role}
                  </p>
                </div>
              </div>

              {/* Hover overlay for 'Get' - Matched size, reduced blur (1.5px), rounded corners to match parent */}
              {!isActive && (
                <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[1.5px] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-white/90 hover:bg-white text-black text-xs font-extrabold px-6 py-2 rounded-full shadow-lg transform transition-transform group-active:scale-95 uppercase tracking-wide cursor-pointer">
                      VIEW
                    </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectList;