import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Showcase from './components/Showcase';
import ProjectList from './components/ProjectList';
import { PROJECTS } from './constants';
import { Project } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('Projects');
  
  // Filter projects based on the active sidebar view
  const currentProjects = useMemo(() => {
    return PROJECTS.filter(p => p.section === activeView);
  }, [activeView]);

  const [activeProject, setActiveProject] = useState<Project>(currentProjects[0] || PROJECTS[0]);

  // Automatically select the first project when the view changes
  useEffect(() => {
    if (currentProjects.length > 0) {
      setActiveProject(currentProjects[0]);
    }
  }, [activeView, currentProjects]);

  return (
    <div className="flex h-screen bg-[#000000] text-white font-sans overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar activeView={activeView} onSelectView={setActiveView} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative">
        
        {/* Top Section: Showcase (65% height) */}
        <div className="h-[65%] w-full relative z-10 bg-black">
          {activeProject ? (
            <Showcase project={activeProject} />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-500">No Content</div>
          )}
        </div>

        {/* Bottom Section: Project List (Remaining height) */}
        <div className="flex-1 bg-gradient-to-b from-black to-[#1c1c1e] relative z-20 overflow-hidden flex flex-col">
          <ProjectList 
            projects={currentProjects} 
            activeId={activeProject?.id} 
            onSelect={setActiveProject} 
          />
        </div>

      </main>
    </div>
  );
};

export default App;