import React, { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'; // Nouveaux imports

import { useRealViewportHeight } from './Utils';

// IMPORTS UI (On ne change rien ici)
import { 
  CustomCursor, 
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
  const [selectedProject, setSelectedProject] = useState(null);

  // --- NOUVELLE LOGIQUE DE NAVIGATION ---
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll(); 
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [activeSection, setActiveSection] = useState('home');
  
  useRealViewportHeight();

  // 1. ADAPTATEUR : On calcule la vue actuelle en fonction de l'URL
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/a-propos') return 'about';
    if (path === '/projets') return 'projects';
    if (path === '/mentions-legales') return 'legal';
    return 'home'; // Par défaut
  };

  const currentView = getCurrentView();

  // 2. ADAPTATEUR : Cette fonction remplace ton ancien setView
  // Au lieu de changer une variable, elle change l'URL
  const setView = (view) => {
    if (view === 'home') navigate('/');
    else if (view === 'about') navigate('/a-propos');
    else if (view === 'projects') navigate('/projets');
    else if (view === 'legal') navigate('/mentions-legales');
    else navigate('/');
  };
  
  useEffect(() => window.scrollTo(0, 0), [location.pathname]); // Scroll top à chaque changement d'URL
  
  const handleProjectClick = useCallback((project) => { 
      if (project) {
        setSelectedProject(project);
      } else { 
        navigate('/projets'); // Modifié pour utiliser navigate
      } 
  }, [navigate]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="custom-background min-h-screen text-white font-sans selection:bg-[#00F0FF] selection:text-black overflow-x-hidden relative" style={{ cursor: 'none' }}>
      
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen key="loader" onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <>
          <CustomCursor />

          {/* On cache la Navbar sur la page légale, comme avant */}
          {currentView !== 'legal' && (
            <Navbar 
              currentView={currentView} 
              setView={setView} // On passe notre nouvelle fonction qui contrôle l'URL
              activeSection={currentView === 'home' ? activeSection : currentView} 
            />
          )}
          
          <motion.div
              className="relative z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
          >
            <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF003C] to-[#00F0FF] origin-left z-50 mix-blend-screen" />
            
            {/* ICI : Le système de Routes remplace ton rendu conditionnel */}
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route 
                  path="/" 
                  element={
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }} 
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} 
                        exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }} 
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <HomePage setView={setView} onProjectClick={handleProjectClick} />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/a-propos" 
                  element={
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -20 }} 
                        transition={{ duration: 0.5 }}
                    >
                        <AboutPage setView={setView} />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/projets" 
                  element={
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.5 }}
                    >
                        <ProjectsPage onProjectClick={handleProjectClick} />
                    </motion.div>
                  } 
                />

                <Route 
                  path="/mentions-legales" 
                  element={
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.5 }}
                    >
                        <LegalPage setView={setView} />
                    </motion.div>
                  } 
                />
              </Routes>
            </AnimatePresence>
            
            {currentView !== 'legal' && (
                <FooterContact setView={setView} />
            )}
          </motion.div>

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