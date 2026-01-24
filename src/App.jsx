import React, { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';

import { useRealViewportHeight } from './Utils';

// IMPORTS UI
import { 
  CustomCursor, 
  InteractiveGridBackground, 
  Navbar, 
  HomePage, 
  AboutPage, 
  ProjectsPage, 
  FooterContact, 
  LegalPage,
  LoadingScreen,
  ProjectOverlay 
} from './UI';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null); // État global de l'overlay

  const [currentView, setCurrentView] = useState('home'); 
  const { scrollYProgress } = useScroll(); 
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [activeSection, setActiveSection] = useState('home');
  
  useRealViewportHeight();
  
  useEffect(() => window.scrollTo(0, 0), [currentView]);
  
  const handleProjectClick = useCallback((project) => { 
      if (project) {
        setSelectedProject(project);
      } else if(currentView === 'home') { 
        setCurrentView('projects'); 
      } 
  }, [currentView]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="custom-background min-h-screen text-white font-sans selection:bg-[#00F0FF] selection:text-black overflow-x-hidden relative" style={{ cursor: 'none' }}>
      
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen key="loader" onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <>
          <CustomCursor />

          {currentView !== 'legal' && (
            <Navbar 
              currentView={currentView} 
              setView={setCurrentView} 
              activeSection={currentView === 'home' ? activeSection : currentView} 
            />
          )}
          
          <motion.div
              initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }} 
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} 
              transition={{ duration: 1.2, ease: "easeOut" }} 
              className="relative z-0"
          >
            <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF003C] to-[#00F0FF] origin-left z-50 mix-blend-screen" />
            
            <AnimatePresence mode="wait">
                {currentView === 'home' && (
                  <HomePage key="home" setView={setCurrentView} onProjectClick={handleProjectClick} />
                )}
                
                {currentView === 'about' && (
                  <AboutPage key="about" setView={setCurrentView} />
                )}
                
                {currentView === 'projects' && (
                  <ProjectsPage key="projects" onProjectClick={handleProjectClick} />
                )}

                {currentView === 'legal' && (
                  <LegalPage key="legal" setView={setCurrentView} />
                )}
            </AnimatePresence>
            
            {currentView !== 'legal' && (
                <FooterContact setView={setCurrentView} />
            )}
          </motion.div>

          {/* OVERLAY GLOBAL - Toujours au dessus */}
          <AnimatePresence>
            {selectedProject && (
              <ProjectOverlay 
                project={selectedProject} 
                onClose={() => setSelectedProject(null)} 
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}