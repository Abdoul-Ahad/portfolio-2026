import React, { useState, useEffect, useRef, memo, useCallback, useMemo, Suspense } from 'react';
import emailjs from '@emailjs/browser';
import { SEO } from './SEO';
import { createPortal } from 'react-dom';
import { motion, useScroll, useSpring, AnimatePresence, useMotionValue, useTransform, useInView } from 'framer-motion';
import RotatingText from "./RotatingText";
import ShinyText from './ShinyText';
import { 
  ArrowDown, ArrowUp, Send, ArrowRight, ChevronRight, User, ArrowUpRight, 
  Cpu, ChevronLeft, Instagram, Linkedin, Mail, Menu as MenuIcon, X,
  CheckCircle, AlertCircle, Briefcase, Calendar, Layers, Terminal, Activity,
  Sparkles, Bot, Code, Smartphone, Globe, Database, Maximize2, ZoomIn, 
  Minimize2, ExternalLink, Home, Clock, Target // <-- AJOUT ICI
} from 'lucide-react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF, Html, useProgress } from "@react-three/drei";
import { 
  SKILLS_DATA, 
  ALL_PROJECTS, 
  HIGHLIGHTED_PROJECTS, 
  NAV_ITEMS, 
  LOGOS_DATA, 
  TIMELINE_DATA, 
  LEGAL_CONTENT 
} from './Data';
import { AnimationPriorityManager, useIsTouchDevice, useScrollLock } from './Utils';

const CanvasLoader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs text-[#00F0FF] font-mono animate-pulse tracking-widest bg-black/50 px-2 py-1 rounded">
          CHARGEMENT {progress.toFixed(0)}%
        </span>
      </div>
    </Html>
  );
};

const Laptop = () => {
  const computer = useGLTF("/Laptop_pc/scene.glb");

  return (
    <mesh>
      <hemisphereLight intensity={0.5} groundColor='black' />
      <spotLight
        position={[-20, 50, 10]}
        angle={0.12}
        penumbra={1}
        intensity={2}
      />
      <pointLight intensity={1} position={[10, 10, 10]} />
      <primitive
        object={computer.scene}
        scale={0.9}
        position={[0, -6.1, 0]} 
        rotation={[0.2, -0.2, 0]}
      />
    </mesh>
  );
};

const LaptopCanvas = () => {
  // OPTIMISATION : Ne charger le canvas que si visible ou nécessaire
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // Petit délai pour laisser le thread principal respirer au chargement de la page
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return <div className="w-full h-[600px] lg:h-[85vh] min-h-[600px]" />;

  return (
    <div className="w-full h-[600px] lg:h-[85vh] min-h-[600px] cursor-grab active:cursor-grabbing relative z-10">
      <Canvas
        shadows={false} // OPTIMISATION : Désactiver ombres complexes pour la perf
        dpr={[1, 1.5]} // OPTIMISATION : Limiter la résolution max à 1.5 (suffisant et plus léger)
        camera={{ position: [10, 3, 5], fov: 25, near: 0.1, far: 200 }}
        gl={{ preserveDrawingBuffer: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <OrbitControls
            autoRotate
            enableRotate
            enableZoom={false}
            enablePan={false}
            target={[0, -3, 0]} 
          />
          <Laptop />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};

const OptimizedImage = memo(({ src, alt, className, style, ...props }) => {
  if (!src) return null;
  
  const isUnsplash = src.includes('unsplash');
  const srcSet = isUnsplash 
    ? `${src.split('?')[0]}?${src.split('?')[1] || ''}&w=640 640w,
       ${src.split('?')[0]}?${src.split('?')[1] || ''}&w=1280 1280w,
       ${src.split('?')[0]}?${src.split('?')[1] || ''}&w=1920 1920w`
    : undefined;
  
  return (
    <img 
      src={src} 
      alt={alt} 
      loading="lazy" 
      decoding="async"
      sizes="(max-width: 640px) 90vw, (max-width: 1280px) 80vw, 1200px"
      srcSet={srcSet} 
      className={className} 
      style={style} 
      {...props}
    />
  );
});

const FuzzyText = memo(({ 
  children, 
  fontSize = 'clamp(2rem, 10vw, 10rem)', 
  fontWeight = 900, 
  fontFamily = 'inherit', 
  color = '#fff', 
  enableHover = true, 
  baseIntensity = 0.18, 
  hoverIntensity = 0.5 
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { margin: "50px", once: false });
  const isTouch = useIsTouchDevice();
  const loopId = useRef(`fuzzy-${Math.random()}`).current;
  const isMounted = useRef(true);
  const textContent = useMemo(() => React.Children.toArray(children).join(''), [children]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!isInView || !canvasRef.current || !isMounted.current) {
      AnimationPriorityManager.unregister(loopId);
      return;
    }

    const canRun = AnimationPriorityManager.register(loopId, isInView ? 2 : 1);
    if (!canRun) return;

    let animationFrameId;
    let isCancelled = false;
    let cleanupListener = null;
    const canvas = canvasRef.current;
    
    const init = async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      if (isCancelled || !isMounted.current) return;

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const computedFontFamily = fontFamily === 'inherit' 
        ? window.getComputedStyle(canvas).fontFamily || 'sans-serif' 
        : fontFamily;
      
      let numericFontSize = typeof fontSize === 'number' ? fontSize : 100;
      
      if (typeof fontSize === 'string') {
        const temp = document.createElement('span');
        temp.style.cssText = `font-size:${fontSize};font-family:${computedFontFamily};font-weight:${fontWeight};visibility:hidden;position:absolute`;
        document.body.appendChild(temp);
        numericFontSize = parseFloat(window.getComputedStyle(temp).fontSize);
        document.body.removeChild(temp);
      }

      const isMobileSize = numericFontSize < 150;
      const safetyMarginX = isMobileSize ? 20 : 100;
      const extraWidthBuffer = isMobileSize ? 40 : 200;
      const horizontalMargin = isMobileSize ? 5 : 50;
      
      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d', { alpha: true });
      if (!offCtx) return;

      offCtx.font = `${fontWeight} ${numericFontSize}px ${computedFontFamily}`;
      offCtx.textBaseline = 'alphabetic';
      
      const metrics = offCtx.measureText(textContent);
      const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
      const actualRight = (metrics.actualBoundingBoxRight ?? metrics.width) + safetyMarginX;
      const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
      const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.2;
      
      const textBoundingWidth = Math.ceil(actualLeft + actualRight);
      const tightHeight = Math.ceil(actualAscent + actualDescent);
      const offscreenWidth = textBoundingWidth + extraWidthBuffer;
      
      offscreen.width = offscreenWidth;
      offscreen.height = tightHeight;
      
      const xOffset = extraWidthBuffer / 2;
      offCtx.font = `${fontWeight} ${numericFontSize}px ${computedFontFamily}`;
      offCtx.textBaseline = 'alphabetic';
      offCtx.fillStyle = color;
      
      if (isMobileSize) {
        const centeredX = (offscreenWidth - (actualLeft + actualRight - safetyMarginX)) / 2 + actualLeft;
        offCtx.fillText(textContent, centeredX, actualAscent);
      } else {
        offCtx.fillText(textContent, xOffset - actualLeft, actualAscent);
      }
      
      canvas.width = offscreenWidth + horizontalMargin * 2;
      canvas.height = tightHeight;
      ctx.translate(horizontalMargin, 0);

      let isHovering = false;
      const fuzzRange = 30;

      const run = () => {
        if (isCancelled || !isMounted.current) return;
        
        ctx.clearRect(-fuzzRange - horizontalMargin, -fuzzRange, canvas.width + fuzzRange, canvas.height + fuzzRange);
        const intensity = isHovering ? hoverIntensity : baseIntensity;
        
        for (let j = 0; j < tightHeight; j++) {
          const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
          ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
        }
        
        animationFrameId = requestAnimationFrame(run);
      };
      
      run();

      const handleMouseMove = (e) => {
        if (!enableHover || !canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        isHovering = x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height;
      };

      if (enableHover && !isTouch) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        cleanupListener = () => window.removeEventListener('mousemove', handleMouseMove);
      }
    };

    init();

    return () => {
      isCancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (cleanupListener) cleanupListener();
      AnimationPriorityManager.unregister(loopId);
    };
  }, [textContent, fontSize, fontWeight, fontFamily, color, enableHover, baseIntensity, hoverIntensity, isInView, isTouch, loopId]);

  return (
    <div ref={containerRef} className="w-full flex justify-center relative">
      <canvas 
        ref={canvasRef} 
        className="block max-w-full mx-auto opacity-100 transition-opacity duration-300 ease-out"
        style={{ willChange: 'opacity' }}
      />
    </div>
  );
});

export const InteractiveGridBackground = memo(() => {
  const isTouch = useIsTouchDevice();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [viewportSize, setViewportSize] = useState(() => ({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1000, 
    height: typeof window !== 'undefined' ? window.innerHeight : 1000 
  }));

  useEffect(() => {
    let timer;
    const updateViewport = () => {
      if (timer) return;
      timer = setTimeout(() => {
        setViewportSize({ width: window.innerWidth, height: window.innerHeight });
        timer = null;
      }, 100);
    };
    window.addEventListener('resize', updateViewport, { passive: true });
    return () => { window.removeEventListener('resize', updateViewport); };
  }, []);

  useEffect(() => {
    if (isTouch) return;
    let rafId = null;
    const handleMouseMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        rafId = null;
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => { window.removeEventListener('mousemove', handleMouseMove); if (rafId) cancelAnimationFrame(rafId); };
  }, [mouseX, mouseY, isTouch]);

  const rotateX = useTransform(mouseY, [0, viewportSize.height], [0.5, -0.5]);
  const rotateY = useTransform(mouseX, [0, viewportSize.width], [-0.5, 0.5]);
  const blobX = useTransform(mouseX, x => x - 300);
  const blobY = useTransform(mouseY, y => y - 300);

  const containerStyle = isTouch ? {} : { rotateX, rotateY, willChange: 'transform' };

  return (
    <motion.div 
      className="fixed inset-0 z-0 bg-[#000000] overflow-hidden perspective-1000" 
      style={containerStyle}
    >
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }} 
      />
      
      {!isTouch && (
        <>
          {/* OPTIMISATION : Image statique en base64 au lieu du filtre SVG calculé en temps réel */}
          <div 
            className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
            style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                filter: 'contrast(120%) brightness(120%)'
            }} 
          />
          <motion.div 
            className="absolute w-[600px] h-[600px] rounded-full opacity-20" 
            style={{ 
              x: blobX, 
              y: blobY, 
              backgroundImage: 'radial-gradient(circle at center, #00F0FF 0%, #FF003C 40%, transparent 70%)', 
              mixBlendMode: 'color-dodge', 
              filter: 'blur(150px)', 
              willChange: 'transform' 
            }} 
          />
        </>
      )}
      
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          background: 'linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.1) 50%)', 
          backgroundSize: '100% 4px' 
        }} 
      />
    </motion.div>
  );
});

export const CustomCursor = () => {
  // ... (Code logique inchangé : useIsTouchDevice, useEffects...)
  const isTouch = useIsTouchDevice();
  const cursorDotsRef = useRef([]);
  const mousePosition = useRef({ x: -100, y: -100, hovering: false });
  const dotsPosition = useRef([]);
  const DOT_COUNT = 15;
  const isIdle = useRef(false);
  const idleTimer = useRef(null);

  if (dotsPosition.current.length === 0 && !isTouch) {
    dotsPosition.current = Array.from({ length: DOT_COUNT }, () => ({ x: -100, y: -100 }));
  }

  useEffect(() => {
    if (isTouch) return;
    const handleMouseMove = (e) => { 
      mousePosition.current.x = e.clientX; 
      mousePosition.current.y = e.clientY; 
      isIdle.current = false;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => { isIdle.current = true; }, 2000);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => { window.removeEventListener('mousemove', handleMouseMove); if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, [isTouch]);

  useEffect(() => {
    if (isTouch) return;
    let animationFrameId = null;
    const animate = () => {
      if (!isIdle.current) {
        const { x: mouseX, y: mouseY, hovering } = mousePosition.current;
        dotsPosition.current.forEach((dot, index) => {
          const element = cursorDotsRef.current[index];
          if (!element) return;
          const speed = 0.5 - (index * (0.35 / DOT_COUNT));
          dot.x += (mouseX - dot.x) * speed;
          dot.y += (mouseY - dot.y) * speed;
          element.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0)`;
          element.style.backgroundColor = hovering ? '#FF0000' : '#00F0FF';
        });
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); };
  }, [isTouch]);

  useEffect(() => {
    if (isTouch) return;
    const handleInteraction = (e) => {
      const target = e.target;
      const isInteractive = target && (target.closest('a') || target.closest('button') || target.closest('.interactive') || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      mousePosition.current.hovering = !!isInteractive;
    };
    window.addEventListener('mouseover', handleInteraction, { passive: true });
    return () => window.removeEventListener('mouseover', handleInteraction);
  }, [isTouch]);

  if (isTouch) return null;

  return (
    // CORRECTION ICI : z-[10050] pour être SUR le ZoomModal (qui est à 10010)
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[10050]">
      {dotsPosition.current.map((_, i) => (
        <div 
          key={i} 
          ref={el => cursorDotsRef.current[i] = el} 
          className="fixed top-0 left-0 rounded-full" 
          style={{ 
            width: '14px', height: '14px', backgroundColor: '#00F0FF', marginLeft: '-7px', marginTop: '-7px', 
            opacity: (1 - (i / DOT_COUNT)) * 0.8, mixBlendMode: 'screen', willChange: 'transform', 
            transition: i === 0 ? 'width 0.2s, height 0.2s, background-color 0.2s' : 'none', 
            boxShadow: i === 0 ? '0 0 10px rgba(0, 240, 255, 0.8)' : 'none' 
          }} 
        />
      ))}
    </div>
  );
};

export const NeonButton = memo(({ children, onClick, className = "", variant = "cyan", icon: Icon }) => {
  const color = variant === "cyan" ? "#00F0FF" : "#FF003C";
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.button 
      whileHover={{ scale: 1.05 }} 
      whileTap={{ scale: 0.95 }} 
      onClick={onClick} 
      // On garde les états JS pour le PC, mais le CSS gère l'affichage
      onHoverStart={() => setIsHovered(true)} 
      onHoverEnd={() => setIsHovered(false)} 
      className={`relative px-8 py-3 bg-transparent border text-white font-mono text-sm uppercase tracking-widest group overflow-hidden interactive ${className}`} 
      style={{ 
        borderColor: color, 
        boxShadow: `0 0 10px ${color}20`, 
        willChange: isHovered ? 'transform' : 'auto' 
      }}
    >
      <span className="relative z-10 flex items-center gap-2 md:group-hover:text-black transition-colors duration-300">
        {children}
        {Icon && <Icon size={16} />}
      </span>
      {/* Ajout de 'md:' devant group-hover pour que l'animation de fond ne se lance que sur PC */}
      <div 
        className="absolute inset-0 translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0" 
        style={{ backgroundColor: color }} 
      />
      <div 
        className="absolute inset-0 opacity-0 md:group-hover:opacity-50 transition-opacity duration-300 blur-lg" 
        style={{ backgroundColor: color }} 
      />
    </motion.button>
  );
});

export const Navbar = memo(({ currentView, setView, activeSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    let rafId;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => { 
        setShowScrollTop(window.scrollY > 200); 
        rafId = null; 
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => { 
      window.removeEventListener('scroll', handleScroll); 
      if (rafId) cancelAnimationFrame(rafId); 
    };
  }, []);

  const handleClick = useCallback((item) => {
    setIsMobileMenuOpen(false);
    
    if (item.hash === '#contact') {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    } else {
      setView(item.view);
      if (item.view !== currentView) window.scrollTo(0, 0);
    }
  }, [currentView, setView]);

  const isActive = useCallback((item) => {
    if (item.hash === '#contact') return false;
    if (currentView === 'project-detail') return item.view === 'projects';
    return item.view === currentView;
  }, [currentView]);
  
  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 w-full z-50 justify-center pt-8 px-4 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-10 py-5 pointer-events-auto shadow-2xl flex items-center gap-8 md:gap-12">
          <AnimatePresence>
            {showScrollTop && (
              <motion.div 
                initial={{ width: 0, opacity: 0, marginRight: -20 }} 
                animate={{ width: 'auto', opacity: 1, marginRight: 0 }} 
                exit={{ width: 0, opacity: 0, marginRight: -20 }} 
                transition={{ duration: 0.3, ease: "easeOut" }} 
                className="flex items-center gap-8 md:gap-12 overflow-hidden"
              >
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                  className="group flex items-center justify-center p-1 text-neutral-500 hover:text-[#00F0FF] transition-colors interactive relative shrink-0" 
                  title="Retour en haut"
                >
                  <ArrowUp size={24} />
                  <span className="absolute -bottom-8 scale-0 group-hover:scale-100 transition-transform bg-black border border-white/10 text-[10px] font-mono text-white px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 duration-300">
                    TOP
                  </span>
                </button>
                <div className="w-[1px] h-5 bg-white/10 shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>

          {NAV_ITEMS.map((item) => {
            const linkIsActive = isActive(item);
            return (
              <a 
                key={item.name} 
                href={item.hash} 
                className={`relative px-2 py-1 font-mono text-base tracking-widest uppercase transition-all duration-300 group interactive ${linkIsActive ? 'text-white' : 'text-neutral-400 hover:text-white'}`} 
                onClick={(e) => { e.preventDefault(); handleClick(item); }}
              >
                <span className={`relative z-10 transition-all duration-300 ${linkIsActive ? 'text-shadow-neon' : 'group-hover:text-shadow-neon'}`}>
                  {item.name}
                </span>
                <span className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00F0FF] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-top-1 group-hover:-left-2 ${linkIsActive ? 'opacity-100 -top-1 -left-2' : ''}`} />
                <span className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#FF003C] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-bottom-1 group-hover:-right-2 ${linkIsActive ? 'opacity-100 -bottom-1 -right-2' : ''}`} />
              </a>
            );
          })}
        </div>
      </nav>

      {/* Mobile Home Button */}
      <div className="md:hidden fixed top-6 left-6 z-[60]">
        <button 
          aria-label="Retour à l'accueil" // <-- AJOUT ICI
          onClick={() => { setIsMobileMenuOpen(false); setView('home'); window.scrollTo(0, 0); }} 
          className={`p-3 border rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 ${currentView === 'home' ? 'bg-black border-[#00F0FF] text-[#00F0FF]' : 'bg-black/80 border-white/10 text-neutral-400'}`}
        >
          <Home size={24} />
        </button>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-6 right-6 z-[60]">
        <button 
          aria-label="Ouvrir le menu" // <-- AJOUT ICI
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className={`p-3 border rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 ${isMobileMenuOpen ? 'bg-black border-[#FF003C] text-[#FF003C]' : 'bg-black/80 border-white/10 text-[#00F0FF]'}`}
        >
          {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.2 }} 
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center md:hidden" 
            style={{ overscrollBehavior: 'contain' }}
          >
            <div className="flex flex-col gap-10 text-center">
              {NAV_ITEMS.map((item, i) => {
                const linkIsActive = isActive(item);
                return (
                  <motion.a 
                    key={item.name} 
                    href={item.hash} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 + (i * 0.05) }} 
                    onClick={(e) => { e.preventDefault(); handleClick(item); }} 
                    className={`text-4xl font-black uppercase tracking-tighter ${linkIsActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#FF003C]' : 'text-white'}`}
                  >
                    {item.name}
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

const TechGrid = memo(({ items }) => {
  return (
    <div className="w-full relative py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-10"> 
        {items.map((item, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true, amount: 0.1 }} 
            whileHover={{ scale: 1.05 }} 
            transition={{ duration: 0.3 }} 
            className="flex flex-col items-center justify-center gap-4 group cursor-default md:cursor-pointer"
          >
            <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#00F0FF]/0 md:group-hover:bg-[#00F0FF]/20 rounded-full blur-2xl transition-all duration-300 transform scale-50 md:group-hover:scale-125" />
              <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 transition-transform duration-300 md:group-hover:scale-110 md:group-hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]">
                {item.node}
              </div>
            </div>
            <div className="relative h-6 flex items-center justify-center overflow-visible">
              <div className="absolute top-0 flex flex-col items-center gap-1 opacity-100 translate-y-0 md:opacity-0 md:translate-y-[-10px] md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300">
                <span className="font-mono text-[10px] md:text-xs text-[#00F0FF] text-shadow-neon uppercase tracking-[0.2em] font-bold whitespace-nowrap">
                  {item.title}
                </span>
                <div className="w-1 h-1 bg-[#00F0FF] rounded-full shadow-[0_0_8px_#00F0FF] hidden md:block" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

const ProjectCard = memo(({ title, category, context, index, isCarousel, onClick, image }) => (
  <motion.div 
    initial={!isCarousel ? { opacity: 0, y: 50 } : {}} 
    whileInView={!isCarousel ? { opacity: 1, y: 0 } : {}} 
    viewport={{ once: true, margin: "-50px" }} 
    transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
    whileHover={{ scale: 1.02 }}
    className={`group relative bg-neutral-900 overflow-hidden cursor-pointer interactive rounded-xl border border-white/10 transform-gpu ${
      isCarousel 
        ? 'w-[300px] md:w-[450px] lg:w-[600px] h-[200px] md:h-[280px] lg:h-[350px] flex-shrink-0' 
        : 'w-full aspect-[16/9]'
    }`} 
    onClick={() => onClick && onClick({ title, category, context, image })}
  >
    {/* Image de fond */}
    <div className="absolute inset-0 w-full h-full">
      <OptimizedImage 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 scale-100 group-hover:scale-105 transition-transform duration-700 ease-out will-change-transform" 
      />
    </div>

    {/* Overlay couleur au survol - Desktop uniquement */}
    <div className="absolute inset-0 bg-[#00F0FF]/10 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay pointer-events-none" />
    
    {/* BADGE CONTEXTE */}
    {context && (
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-lg backdrop-blur-sm ${
          context.includes('Universitaire') 
            ? 'bg-purple-900/80 border-purple-500/50 text-purple-200' 
            : 'bg-green-900/80 border-green-500/50 text-green-200'
        }`}>
          {context}
        </span>
      </div>
    )}

    {/* Contenu Texte */}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-100 md:opacity-60 md:group-hover:opacity-90 transition-opacity duration-500 flex flex-col justify-end p-8 pointer-events-none">
      <span className="text-[#00F0FF] font-mono text-xs mb-2 tracking-widest uppercase opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 delay-100">
        {category}
      </span>
      <div className="flex justify-between items-end">
        <h3 className="text-2xl md:text-3xl font-bold text-white translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1]">
          {title}
        </h3>
        <div className="bg-white/10 p-3 rounded-full opacity-0 md:group-hover:opacity-100 transition-all duration-500 md:group-hover:translate-x-1 md:group-hover:-translate-y-1 border border-white/10">
          <ArrowUpRight size={20} className="text-white" />
        </div>
      </div>
    </div>
  </motion.div>
));

const ProjectsCarousel = memo(({ projects, onProjectClick }) => {
  const containerRef = useRef(null); 
  const contentRef = useRef(null);   
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;
    
    const container = containerRef.current;
    const content = contentRef.current;
    let timeoutId;

    const updateWidth = () => {
      if (container && content) {
        const scrollableWidth = content.scrollWidth - container.offsetWidth;
        const paddingOffset = 100;
        const finalWidth = scrollableWidth > 0 ? scrollableWidth + paddingOffset : 0;
        setWidth(finalWidth);
        setProgressBarWidth(finalWidth);
      }
    };

    const resizeObserver = new ResizeObserver(() => { 
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => requestAnimationFrame(updateWidth), 100);
    });
    
    resizeObserver.observe(container);
    updateWidth();
    
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [projects]);

  const progressScale = useTransform(x, [0, -progressBarWidth], [0, 1]);
  const smoothProgress = useSpring(progressScale, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div ref={containerRef} className="w-full relative py-10 group overflow-hidden">
      <div className="absolute top-0 bottom-0 left-0 w-12 md:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-12 md:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
      
      <motion.div 
        ref={contentRef} 
        className="flex gap-8 px-6 md:px-12 w-max cursor-grab active:cursor-grabbing" 
        drag="x" 
        dragConstraints={{ right: 0, left: -width }} 
        dragElastic={0.2} 
        dragTransition={{ power: 0.4, timeConstant: 300, bounceStiffness: 300, bounceDamping: 20 }} 
        style={{ x, willChange: 'transform', touchAction: 'pan-y pinch-zoom' }}
      >
        {projects.map((p, i) => (
          <ProjectCard 
            key={i} 
            {...p} 
            index={i} 
            isCarousel={true} 
            onClick={onProjectClick} 
          />
        ))}
      </motion.div>
      
      <div className="flex flex-col items-center justify-center mt-16 gap-3 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
        <div className="w-40 md:w-64 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 bottom-0 left-0 bg-[#00F0FF] shadow-[0_0_10px_#00F0FF] w-full origin-left" 
            style={{ scaleX: smoothProgress }} 
          />
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
          <span>Drag & Drop</span>
        </div>
      </div>
    </div>
  );
});

const SchoolTimeline = memo(() => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="w-full relative">
      <div className="relative py-20 w-full max-w-5xl mx-auto px-4 md:px-0">
        {/* Guide Arrière-plan */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 transform md:-translate-x-1/2 h-full" />

        {/* Ligne Active */}
        <motion.div 
          style={{ scaleY, originY: 0 }}
          className="absolute left-6 md:left-1/2 top-0 w-[2px] bg-gradient-to-b from-[#00F0FF] via-[#FF003C] to-[#00F0FF] transform md:-translate-x-1/2 h-full z-10"
        />

        <div className="space-y-24 relative z-10">
          {TIMELINE_DATA.map((event, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-10% 0px" }} 
                transition={{ duration: 0.5 }}
                className={`relative flex flex-col md:flex-row items-start md:items-center w-full gap-8 md:gap-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* 1. DATE - Desktop uniquement */}
                <div className={`hidden md:flex w-1/2 px-16 py-4 ${isEven ? 'justify-start text-left' : 'justify-end text-right'}`}>
                  <div className="relative">
                    <span className="block text-7xl font-black text-white/5 absolute -top-4 -z-10 select-none scale-150 transform origin-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {event.year.split(' - ')[0]}
                    </span>
                    <span className="block text-4xl font-bold text-white tracking-tight">
                      {event.year.split(' - ')[0]}
                    </span>
                    <span className="block font-mono text-xs text-[#00F0FF] tracking-[0.2em] mt-1 uppercase opacity-60">
                      /// {event.year.includes('-') ? 'PÉRIODE' : 'ANNÉE'}
                    </span>
                  </div>
                </div>

                {/* 2. POINT CENTRAL */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-0 md:top-1/2 md:-translate-y-1/2 flex items-center justify-center z-20">
                  <div className="w-4 h-4 bg-[#050505] border-[2px] border-neutral-600 rounded-full group-hover:border-[#00F0FF] transition-colors duration-300" />
                  <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-12 h-[1px] bg-white/10 ${isEven ? 'left-full' : 'right-full'}`} />
                </div>

                {/* 3. CARTE CONTENU */}
                <div className="w-full md:w-1/2 pl-16 md:px-16 mt-2 md:mt-0">
                  <div className="relative group">
                    <div className="relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/10 rounded-tl-lg group-hover:border-[#00F0FF] transition-colors duration-300" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/10 rounded-br-lg group-hover:border-[#FF003C] transition-colors duration-300" />

                      {/* Date Mobile */}
                      <div className="md:hidden mb-4">
                        <span className="text-[#00F0FF] font-mono text-xs font-bold border border-[#00F0FF]/30 px-2 py-1 rounded bg-[#00F0FF]/5">
                          {event.year}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 mb-5">
                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                          {event.title}
                        </h3>
                        <p className="font-mono text-xs md:text-sm text-[#FF003C] uppercase tracking-wide font-medium">
                          {event.subtitle}
                        </p>
                      </div>

                      <p className="text-neutral-300 text-base leading-relaxed mb-6 font-light">
                        {event.desc}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                        {event.tech.map((t, i) => (
                          <span 
                            key={i} 
                            className="px-3 py-1.5 text-[11px] font-mono font-medium text-neutral-400 bg-black/40 border border-white/10 rounded-md group-hover:text-white group-hover:border-[#00F0FF]/30 transition-colors cursor-default"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="absolute bottom-0 left-6 md:left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#FF003C] rounded-full" />
      </div>
    </div>
  );
});

const RecruitmentBanner = memo(({ setView }) => {
  const handleCVClick = useCallback(() => { 
    window.open('/mon-cv.pdf', '_blank'); 
  }, []);
  
  const handleAboutClick = useCallback(() => { 
    if (setView) {
      setView('about'); 
      window.scrollTo(0, 0);
    }
  }, [setView]);

  const handleContactClick = useCallback(() => {
    const contactSection = document.getElementById('contact');
    if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  return (
    <section className="w-full max-w-7xl mx-auto px-4 mt-40 md:mt-96 mb-40 md:mb-64 relative z-10"> 
      {/* MODIF 1 : 'bg-black' opaque (au lieu de bg-black/40) */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-black backdrop-blur-md">
        
        {/* DÉCORS DE FOND (Lueurs colorées) - On garde ça */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00F0FF]/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FF003C]/10 rounded-full blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/2" />
        
        {/* SUPPRESSION : La grille a été enlevée ici */}
        
        {/* CONTENU GLOBAL */}
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-between p-8 md:p-16 gap-12 lg:gap-20 relative z-10">
          
          {/* PARTIE GAUCHE */}
          <div className="flex-1 text-center lg:text-left flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F0FF]" />
                </span>
                <span className="font-mono text-[#00F0FF] text-xs tracking-widest uppercase font-bold">Open to Work</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                Recherche <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#FF003C]">Opportunités</span>
              </h2>
              
              <p className="text-neutral-300 max-w-lg text-base md:text-lg leading-relaxed font-normal mx-auto lg:mx-0">
                Je recherche des opportunités principalement dans le domaine de la création tel que le <span className="text-white font-medium">Web Design</span>, le <span className="text-white font-medium">Motion Design</span> et le <span className="text-white font-medium">Design Graphique</span>. Prêt à apporter une vision fraîche et technique pour sublimer vos projets.
              </p>
            </div>
            
            {/* BOUTONS GAUCHE (DESKTOP SEULEMENT) */}
            <div className="hidden lg:flex flex-row items-center justify-start gap-4">
              <NeonButton variant="cyan" onClick={handleAboutClick} className="w-auto justify-center">
                À PROPOS <ArrowRight size={18} />
              </NeonButton>
              <NeonButton variant="red" onClick={handleCVClick} className="w-auto justify-center">
                VOIR MON CV <ArrowUpRight size={18} />
              </NeonButton>
            </div>
          </div>
          
          {/* PARTIE DROITE */}
          <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-6">
            
            {/* Carte alternance */}
            <div className="flex-1 bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-[#00F0FF]/50 transition-colors duration-300 group/card relative overflow-hidden w-full flex flex-col justify-between shadow-2xl min-h-[250px]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/0 via-[#00F0FF]/5 to-[#00F0FF]/0 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div className="absolute top-0 right-0 opacity-10 group-hover/card:opacity-20 transition-all duration-500 scale-100 group-hover/card:scale-110 group-hover/card:rotate-6">
                  <Briefcase size={100} />
                </div>
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-[#00F0FF]/10 rounded-xl text-[#00F0FF]">
                    <Briefcase size={28} />
                  </div>
                  <span className="text-sm font-mono font-bold text-[#00F0FF] border border-[#00F0FF]/20 px-3 py-1.5 rounded-lg bg-[#00F0FF]/5 tracking-wider">
                    12 MOIS
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-black uppercase tracking-tight text-4xl md:text-5xl">Alternance</h3>
                  <div className="flex items-center gap-3 text-sm md:text-base text-neutral-300 font-mono uppercase">
                    <Calendar size={18} className="text-[#00F0FF]" />
                    <span>DISPO : <span className="text-white font-bold">Octobre 2026</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* BOUTONS MOBILE */}
            <div className="flex flex-col gap-4 lg:hidden w-full">
              <NeonButton variant="cyan" onClick={handleAboutClick} className="w-full flex justify-center items-center">
                À PROPOS <ArrowRight size={18} />
              </NeonButton>
              <NeonButton variant="red" onClick={handleCVClick} className="w-full flex justify-center items-center">
                VOIR MON CV <ArrowUpRight size={18} />
              </NeonButton>
            </div>

            {/* Bouton Contact */}
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={handleContactClick} 
              className="relative w-full px-8 py-3 bg-transparent border text-white font-mono text-sm uppercase tracking-widest group overflow-hidden interactive flex items-center justify-center gap-2" 
              style={{ 
                borderColor: '#8B5CF6', 
                boxShadow: '0 0 10px #8B5CF620',
              }}
            >
              <span className="relative z-10 flex items-center gap-2 font-bold group-hover:text-black transition-colors duration-300">
                ME CONTACTER <Send size={16} />
              </span>
              <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0" style={{ backgroundColor: '#8B5CF6' }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-lg" style={{ backgroundColor: '#8B5CF6' }} />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
});


/* =========================================
   COMPOSANT CHAMP DE CONTACT CORRIGÉ
   ========================================= */
const ContactField = memo(({ label, name, type = "text", placeholder, value, onChange, autoComplete }) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="relative group mb-6 w-full">
      <label 
        htmlFor={name}
        // CORRECTION : text-neutral-400 (plus clair) au lieu de 500
        className={`block font-mono text-xs tracking-widest uppercase mb-2 transition-colors duration-300 ${focused ? 'text-[#00F0FF]' : 'text-neutral-400'}`}
      >
        {label}
      </label>
      {type === 'textarea' ? ( 
        <textarea 
          id={name}
          name={name} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)} 
          onBlur={() => setFocused(false)} 
          className="w-full bg-neutral-900/50 border border-white/10 p-4 text-white text-sm font-light focus:outline-none focus:border-[#00F0FF] transition-all duration-300 resize-none h-32 rounded-lg" 
        /> 
      ) : ( 
        <input 
          id={name}
          type={type} 
          name={name} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)} 
          onBlur={() => setFocused(false)} 
          className="w-full bg-neutral-900/50 border border-white/10 p-4 text-white text-sm font-light focus:outline-none focus:border-[#00F0FF] transition-all duration-300 rounded-lg" 
        /> 
      )}
    </div>
  );
});


/* =========================================
   FOOTER CONTACT CORRIGÉ
   ========================================= */
export const FooterContact = memo(({ setView }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleChange = useCallback((e) => { 
    const { name, value } = e.target; 
    setFormData(prev => ({ ...prev, [name]: value })); 
  }, []);
  
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validation des champs
    if (!formData.name || !formData.email || !formData.message) { 
      setErrorMessage("Veuillez remplir tous les champs."); 
      setStatus('error'); 
      return; 
    }
    
    if (!isValidEmail(formData.email)) {
      setErrorMessage("Adresse email invalide.");
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMessage('');
    
    // 2. Préparation des données pour EmailJS
    const templateParams = {
        name: formData.name,
        email: formData.email,
        message: formData.message,
    };

    // 3. Envoi via EmailJS
    try {
        await emailjs.send(
            'service_rh0fjyq',      // Ton Service ID
            'template_kzr9uos',     // Ton Template ID
            templateParams,
            '-52r4hC0Q3z16hUl-'     // Ta Public Key
        );

        // Succès
        setStatus('success'); 
        setFormData({ name: '', email: '', message: '' }); 
        setTimeout(() => setStatus('idle'), 5000); 

    } catch (error) {
        console.error("Erreur EmailJS:", error);
        setErrorMessage("Une erreur est survenue lors de l'envoi.");
        setStatus('error');
    }
  };

  return (
    <div id="contact" className="w-full pt-32 pb-10 bg-black border-t border-white/10 flex flex-col items-center relative z-20">
      <div className="w-full max-w-4xl px-6 text-center">
        <span className="font-mono text-xs text-[#FF003C] tracking-[0.3em] block mb-4">/// CONTACT</span>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-16 uppercase tracking-tighter">
          Travaillons <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#FF003C]">Ensemble</span>
        </h2>
        
        <form className="w-full max-w-2xl mx-auto space-y-2 mb-20" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContactField 
              label="Nom Complet" 
              name="name" 
              placeholder="Votre nom" 
              value={formData.name} 
              onChange={handleChange} 
              autoComplete="name"
            />
            <ContactField 
              label="Email" 
              name="email" 
              type="email" 
              placeholder="votre@email.com" 
              value={formData.email} 
              onChange={handleChange} 
              autoComplete="email"
            />
          </div>
          
          <ContactField 
            label="Message" 
            name="message" 
            type="textarea" 
            placeholder="Parlez-moi de votre projet..." 
            value={formData.message} 
            onChange={handleChange} 
            autoComplete="off"
          />
          
          <div className="flex flex-col items-center mt-8 gap-4">
            {status === 'idle' && (
              <NeonButton variant="red" onClick={handleSubmit}>
                ENVOYER LE MESSAGE <Send size={16} />
              </NeonButton>
            )}
            
            {status === 'sending' && (
              <div className="flex items-center gap-3 text-[#00F0FF] font-mono text-sm tracking-widest animate-pulse">
                <div className="w-2 h-2 bg-[#00F0FF] rounded-full animate-bounce" />
                <span>TRANSMISSION EN COURS...</span>
              </div>
            )}
            
            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex items-center gap-3 text-green-400 font-mono text-sm tracking-widest p-4 border border-green-500/30 bg-green-500/10 rounded-lg"
              >
                <CheckCircle size={20} />
                <span>MESSAGE REÇU 100%. JE VOUS RÉPONDS VITE.</span>
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex items-center gap-3 text-[#FF003C] font-mono text-sm tracking-widest p-4 border border-[#FF003C]/30 bg-[#FF003C]/10 rounded-lg"
              >
                <AlertCircle size={20} />
                <span>{errorMessage || "ERREUR DE TRANSMISSION."}</span>
              </motion.div>
            )}
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-12 mb-20">
          <a 
            href="mailto:abdoulrh94@gmail.com" 
            className="group flex flex-col items-center gap-3 interactive"
          >
            <div className="p-4 rounded-full border border-white/10 group-hover:border-[#00F0FF] group-hover:bg-[#00F0FF]/10 transition-all duration-300">
              <Mail size={24} className="text-white group-hover:text-[#00F0FF]" />
            </div>
            {/* CORRECTION : text-neutral-400 */}
            <span className="font-mono text-[10px] text-neutral-400 group-hover:text-white transition-colors uppercase tracking-wider">
              EMAIL
            </span>
          </a>
          
          <a 
            href="https://www.linkedin.com/in/abdoul-ahad-rehman/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex flex-col items-center gap-3 interactive"
          >
            <div className="p-4 rounded-full border border-white/10 group-hover:border-[#00F0FF] group-hover:bg-[#00F0FF]/10 transition-all duration-300">
              <Linkedin size={24} className="text-white group-hover:text-[#00F0FF]" />
            </div>
            {/* CORRECTION : text-neutral-400 */}
            <span className="font-mono text-[10px] text-neutral-400 group-hover:text-white transition-colors uppercase tracking-wider">
              LINKEDIN
            </span>
          </a>
        </div>
      </div>

      {/* COPYRIGHT & CREDITS */}
      <div className="w-full border-t border-white/5 bg-black mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <p className="text-neutral-400 text-xs font-mono uppercase tracking-wide">
              © 2026 Abdoul-Ahad REHMAN. Tous droits réservés.
            </p>
            <button 
              onClick={() => {
                if (setView) {
                  setView('legal');
                  window.scrollTo(0, 0);
                }
              }}
              className="text-neutral-500 hover:text-[#00F0FF] transition-colors text-xs font-mono uppercase tracking-wide border-b border-transparent hover:border-[#00F0FF]"
            >
              Mentions Légales
            </button>
          </div>

          <p className="text-neutral-400 text-xs font-mono leading-relaxed">
            Site conçu et développé par Abdoul-Ahad REHMAN
          </p>
        </div>
      </div>
    </div>
  );
});


export const LegalPage = memo(({ setView }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goHome = useCallback(() => {
    setView('home');
    window.scrollTo(0, 0);
  }, [setView]);

  const renderFormattedContent = useCallback((paragraph, index) => {
    if (paragraph.trim().startsWith('•')) {
      return (
        <li key={index} className="ml-6 list-disc text-neutral-200 pl-2 mb-3">
          {paragraph.replace('•', '').trim()}
        </li>
      );
    }
    
    if (paragraph.includes(':') && !paragraph.includes('http')) {
      const parts = paragraph.split(':');
      const key = parts[0];
      const value = parts.slice(1).join(':'); 
      return (
        <p key={index} className="mb-4">
          <strong className="text-white font-bold text-lg">{key} :</strong>
          <span className="text-neutral-200">{value}</span>
        </p>
      );
    }
    
    return <p key={index} className="mb-6 text-neutral-200">{paragraph}</p>;
  }, []);

  return (
    // CORRECTION ICI : Remplacement de 'bg-black' par 'bg-transparent'
    <div className="min-h-screen bg-transparent text-neutral-200 font-sans p-6 md:p-20 z-50 relative">
      <div className="fixed inset-0 bg-tech-grid pointer-events-none opacity-10 z-0" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Bouton Retour Haut */}
        <button 
          onClick={goHome} 
          className="group mb-16 flex items-center gap-3 text-white hover:text-[#00F0FF] transition-colors font-mono text-base uppercase tracking-widest px-6 py-3 border border-white/20 rounded-full hover:border-[#00F0FF] bg-black"
        >
          <ChevronLeft size={20} /> 
          Retour à l'accueil
        </button>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-20 tracking-tight uppercase border-b border-white/10 pb-10">
          Mentions <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#FF003C]">Légales</span>
        </h1>

        <div className="space-y-16">
          {LEGAL_CONTENT.sections.map((section, index) => {
            const hasListItems = section.content.some(line => line.trim().startsWith('•'));
            const ContentWrapper = hasListItems ? 'ul' : 'div';

            return (
              <section 
                key={index}
                className="bg-neutral-900/30 p-8 md:p-10 rounded-3xl border border-white/10"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-[#00F0FF] mb-8 uppercase tracking-wide flex items-center gap-4">
                  <span className="w-3 h-3 rounded-full bg-[#00F0FF]" />
                  {section.title}
                </h2>
                <ContentWrapper className="text-lg md:text-xl leading-loose font-normal text-neutral-200">
                  {section.content.map((paragraph, pIndex) => (
                    renderFormattedContent(paragraph, pIndex)
                  ))}
                </ContentWrapper>
              </section>
            );
          })}

          {/* SECTION CRÉDITS */}
          <section className="bg-[#0a0a0a] p-8 md:p-10 rounded-3xl border border-[#00F0FF]/20 relative overflow-hidden">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 uppercase tracking-wide flex items-center gap-4 relative z-10">
              <Sparkles size={28} className="text-[#FF003C]" />
              {LEGAL_CONTENT.credits.title}
            </h2>
            <p className="text-neutral-200 mb-8 text-lg md:text-xl relative z-10">
              {LEGAL_CONTENT.credits.intro}
            </p>
            <div className="grid gap-6 relative z-10">
              {LEGAL_CONTENT.credits.items.map((item, index) => (
                <div key={index} className="bg-black p-6 rounded-2xl border border-white/20 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="p-4 bg-[#00F0FF]/10 rounded-xl text-[#00F0FF] shrink-0 w-fit">
                    <Maximize2 size={32} />
                  </div>
                  <div>
                    <p className="mb-2 font-mono text-[#00F0FF] text-sm uppercase tracking-widest font-bold">
                      {item.label}
                    </p>
                    <div className="text-lg leading-relaxed text-neutral-200">
                      <a 
                        href={item.modelUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white font-bold hover:text-[#00F0FF] hover:underline decoration-2 underline-offset-4 transition-colors"
                      >
                        "{item.modelName}"
                      </a>
                      <span className="mx-2 text-neutral-400">par</span>
                      <a 
                        href={item.authorUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white font-bold hover:text-[#00F0FF] transition-colors"
                      >
                        {item.authorName}
                      </a>
                      <br className="md:hidden" />
                      <span className="md:ml-2 text-neutral-400">sous licence</span>
                      <a 
                        href={item.licenseUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="ml-2 text-white border-b border-white/30 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors"
                      >
                        {item.license}
                      </a>.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer avec bouton retour */}
        <div className="mt-32 pt-12 border-t border-white/10 text-center flex flex-col items-center gap-8">
          <div className="w-16 h-1.5 bg-gradient-to-r from-[#FF003C] to-[#00F0FF] rounded-full" />
          <p className="text-sm text-neutral-400 font-mono uppercase tracking-widest">
            Fin des mentions légales
          </p>
          
          <button 
            onClick={goHome} 
            className="group flex items-center gap-3 text-white hover:text-[#00F0FF] transition-colors font-mono text-base uppercase tracking-widest px-8 py-4 border border-white/20 rounded-full hover:border-[#00F0FF] bg-black hover:bg-white/5"
          >
            <ChevronLeft size={20} /> 
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
});

const ZoomModal = memo(({ gallery, initialIndex = 0, onClose }) => {
  useScrollLock(true);
  // On gère l'index localement dans le zoom
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!gallery || gallery.length === 0) return null;

  const currentMedia = gallery[currentIndex];
  const hasMultiple = gallery.length > 1;

  // Détection Vidéo
  const isVideo = (src) => typeof src === 'string' && (src.endsWith('.mp4') || src.endsWith('.webm'));

  // Navigation
  const nextImage = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      // Z-INDEX 10010 (Sous le curseur qui est à 10050)
      className="fixed inset-0 z-[10010] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-default" 
      onClick={onClose} 
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Bouton Fermer */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-[#FF003C] rounded-full text-white transition-colors border border-white/10 z-50 group interactive"
      >
        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* BOUTONS NAVIGATION (Si plusieurs images) */}
      {hasMultiple && (
        <>
          <button 
            onClick={prevImage}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/50 border border-white/10 text-white hover:bg-[#00F0FF] hover:text-black transition-all z-50 interactive group"
          >
            <ChevronLeft size={32} className="group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/50 border border-white/10 text-white hover:bg-[#00F0FF] hover:text-black transition-all z-50 interactive group"
          >
            <ChevronRight size={32} className="group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {/* Contenu */}
      <motion.div 
        key={currentIndex} // Clé pour animer le changement
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.95, opacity: 0 }} 
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full h-full flex items-center justify-center pointer-events-none" 
      >
        <div 
          className="relative max-w-full max-h-full pointer-events-auto shadow-2xl shadow-[#00F0FF]/10"
          onClick={(e) => e.stopPropagation()} 
        >
          {isVideo(currentMedia) ? (
            <video 
              src={currentMedia} 
              className="max-w-full max-h-[90vh] rounded object-contain border border-white/10" 
              controls 
              autoPlay 
              loop 
              muted
            />
          ) : (
            <OptimizedImage 
              src={currentMedia} 
              alt={`Gallery view ${currentIndex + 1}`} 
              className="max-w-full max-h-[90vh] object-contain rounded border border-white/10" 
            />
          )}
          
          {/* Indicateur de position (ex: 1 / 4) */}
          {hasMultiple && (
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/50 font-mono text-xs tracking-widest bg-black/50 px-3 py-1 rounded-full border border-white/10">
              {currentIndex + 1} / {gallery.length}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});

export const ProjectOverlay = memo(({ project, onClose }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isTouch = useIsTouchDevice();
  useScrollLock(true);
  
  if (!project) return null;

  const images = project.gallery && project.gallery.length > 0 ? project.gallery : [project.image];
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentImageIndex];

  useEffect(() => {
    if (!hasMultipleImages || isZoomed) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [hasMultipleImages, images.length, isZoomed]);

  const nextImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <SEO 
        title={project.title} 
        description={project.description ? project.description.substring(0, 150) + "..." : "Détails du projet."} 
      />

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center pointer-events-auto" 
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
        
        <motion.div 
          initial={{ y: "100%", opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          exit={{ y: "100%", opacity: 0 }} 
          transition={{ type: "spring", damping: 25, stiffness: 300 }} 
          className="relative w-full md:max-w-7xl h-[95vh] md:h-[90vh] bg-[#050505] border-t md:border border-[#00F0FF]/30 rounded-t-3xl md:rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.1)] z-10"
        >
          {/* Header Overlay */}
          <div className="h-14 border-b border-white/10 bg-neutral-900/50 flex items-center justify-between px-6 shrink-0 z-20 relative">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF003C] hover:scale-110 transition-transform cursor-pointer" onClick={onClose} />
                <div className="w-3 h-3 rounded-full bg-yellow-500 hover:scale-110 transition-transform cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-[#00F0FF] hover:scale-110 transition-transform cursor-pointer" onClick={() => setIsZoomed(true)} />
              </div>
              <div className="h-4 w-[1px] bg-white/10 mx-2" />
              <span className="font-mono text-[10px] md:text-xs text-[#00F0FF] uppercase tracking-widest flex items-center gap-2">
                <Terminal size={12} /> {project.category.toUpperCase()}
              </span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#FF003C]/20 rounded-full transition-colors group">
              <X size={20} className="text-neutral-500 group-hover:text-[#FF003C] transition-colors" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
            
            {/* ZONE IMAGE / SLIDER */}
            <div className="w-full relative group cursor-zoom-in overflow-hidden shrink-0 select-none bg-neutral-900" onClick={() => setIsZoomed(true)}>
              <div className="aspect-video md:aspect-[21/9] w-full flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentImageIndex} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <OptimizedImage 
                            src={currentImage} 
                            alt={project.title} 
                            className="w-full h-full object-cover" 
                        />
                    </motion.div>
                </AnimatePresence>

                {hasMultipleImages && (
                    <>
                        <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 border border-white/10 text-white hover:bg-[#00F0FF] hover:text-black transition-all z-30 opacity-0 group-hover:opacity-100 duration-300">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 border border-white/10 text-white hover:bg-[#00F0FF] hover:text-black transition-all z-30 opacity-0 group-hover:opacity-100 duration-300">
                            <ChevronRight size={24} />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30 px-3 py-1.5 bg-black/40 backdrop-blur rounded-full border border-white/5">
                            {images.map((_, idx) => (
                                <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-[#00F0FF] scale-125' : 'bg-white/30'}`} />
                            ))}
                        </div>
                    </>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80 pointer-events-none" />
                {!isTouch && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-50 group-hover:scale-100 transform bg-black/60 backdrop-blur-md p-4 rounded-full border border-white/20 pointer-events-none z-20">
                    <ZoomIn size={32} className="text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Détails du projet */}
            <div className="p-6 md:p-12 max-w-7xl mx-auto w-full">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                
                {/* COLONNE GAUCHE : Description & Objectifs */}
                <div className="lg:flex-1 space-y-10">
                  <h1 className="text-4xl md:text-6xl font-black text-white uppercase leading-[0.9] tracking-tight">
                    {project.title}
                  </h1>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-1 bg-gradient-to-r from-[#FF003C] to-[#00F0FF]" />
                    {project.context && (
                        <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest border border-white/10 px-2 py-1 rounded">
                            {project.context}
                        </span>
                    )}
                  </div>

                  <div className="prose prose-invert prose-lg max-w-none">
                    <h3 className="text-[#00F0FF] font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Activity size={16} /> Brief & Contexte
                    </h3>
                    {/* MODIF : md:text-lg pour grossir le texte sur PC */}
                    <p className="text-neutral-300 font-light text-justify leading-relaxed text-sm md:text-lg">
                      {project.description}
                    </p>

                    {/* SECTION OBJECTIFS */}
                    {project.goals && project.goals.length > 0 && (
                      <div className="mt-10 pt-8 border-t border-white/5">
                        <h3 className="text-[#FF003C] font-mono text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                          <div className="relative">
                            <span className="absolute inset-0 animate-ping opacity-75 rounded-full bg-[#FF003C]" />
                            <Target size={16} className="relative z-10" />
                          </div>
                          Objectifs du projet
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {project.goals.map((goal, i) => (
                            <li key={i} className="flex items-start gap-3 bg-white/5 border border-white/5 p-3 rounded-lg hover:border-[#FF003C]/30 transition-colors duration-300">
                              <div className="mt-1.5 w-1.5 h-1.5 bg-[#FF003C] rounded-sm shrink-0 shadow-[0_0_5px_#FF003C]" />
                              {/* MODIF : md:text-base pour grossir les objectifs sur PC */}
                              <span className="text-neutral-200 text-sm md:text-base font-light leading-relaxed">
                                {goal}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLONNE DROITE : Fiche Technique (Agrandie & Alignée) */}
                <div className="w-full lg:w-96 shrink-0">
                  {/* MODIF : min-h pour combler le vide verticalement */}
                  <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-6 md:p-8 sticky top-6 backdrop-blur-sm shadow-2xl min-h-[500px] flex flex-col">
                    <h3 className="font-mono text-xs text-neutral-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2 border-b border-white/10 pb-4">
                      <Database size={14} /> Fiche Technique
                    </h3>
                    
                    {/* MODIF : space-y-8 pour aérer et allonger la fiche */}
                    <div className="space-y-8 flex-1">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                            {/* MODIF : md:text-base */}
                            <h4 className="text-white text-sm md:text-base font-bold mb-2">ANNÉE</h4>
                            {/* MODIF : text-left, pl-4, md:text-base */}
                            <p className="text-neutral-300 text-sm md:text-base font-mono bg-black/30 p-3 rounded border border-white/5 w-full text-left pl-4">
                                {project.year}
                            </p>
                        </div>
                        {project.duration && (
                            <div>
                                <h4 className="text-white text-sm md:text-base font-bold mb-2">DURÉE</h4>
                                <p className="text-neutral-300 text-sm md:text-base font-mono bg-black/30 p-3 rounded border border-white/5 w-full text-left pl-4">
                                    {project.duration}
                                </p>
                            </div>
                        )}
                      </div>
                      
                      {project.client && (
                        <div>
                           <h4 className="text-white text-sm md:text-base font-bold mb-2">CLIENT / TYPE</h4>
                           <p className="text-neutral-300 text-sm md:text-base font-mono">{project.client}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-white text-sm md:text-base font-bold mb-3">STACK TECHNIQUE</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.tech && project.tech.map((t, i) => (
                            <span key={i} className="px-3 py-1.5 bg-[#00F0FF]/5 border border-[#00F0FF]/20 rounded text-xs md:text-sm text-[#00F0FF] font-mono cursor-default hover:bg-[#00F0FF]/10 transition-colors">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 mt-auto">
                        <NeonButton 
                          variant="cyan" 
                          className="w-full justify-center text-xs md:text-sm" 
                          onClick={() => setIsZoomed(true)} 
                        >
                          VOIR LE PROJET <ExternalLink size={14} />
                        </NeonButton>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-20" />
            </div>

            <div className="md:hidden sticky bottom-0 w-full py-4 text-center border-t border-white/10 bg-[#050505]/90 backdrop-blur-xl z-30" onClick={onClose}>
              <p className="font-mono text-[10px] text-neutral-500 flex items-center justify-center gap-2">
                <ChevronLeft size={12} className="-rotate-90" /> FERMER
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isZoomed && (
          <ZoomModal 
            gallery={images} 
            initialIndex={currentImageIndex} 
            onClose={() => setIsZoomed(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
});

const PlusIconDecor = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const SkillTags = memo(({ title, data, color }) => {
  return (
    <div className="w-full h-full bg-neutral-900/40 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors duration-500">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div 
            className="w-1 h-5 rounded-full shadow-[0_0_10px_currentColor]" 
            style={{ backgroundColor: color, color: color }} 
          />
          {/* CORRECTION : H4 -> H3 pour la hiérarchie SEO */}
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">
            {title}
          </h3>
        </div>
        <span className="hidden md:block font-mono text-[9px] text-neutral-600 border border-white/5 px-2 py-1 rounded bg-black/40">
          SYS_ONLINE
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3 relative z-10">
        {data.map((item, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 10 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ delay: index * 0.05 }} 
            className="relative cursor-default"
          >
            <div 
              className="relative px-4 py-2.5 bg-[#050505] border rounded overflow-hidden transition-all duration-300 group/tag hover:translate-y-[-2px]" 
              style={{ 
                borderColor: `${color}40`, 
                boxShadow: `0 0 15px -5px ${color}20`,
                '--tag-color': color 
              }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--tag-color)]/10 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear", 
                  delay: index * 0.2,
                  repeatDelay: 2
                }}
              />
              
              <div className="flex items-center gap-3 relative z-10">
                <div 
                    className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_var(--tag-color)]" 
                    style={{ backgroundColor: color }} 
                />
                <span className="font-mono text-xs font-bold text-white tracking-wider uppercase text-shadow-sm">
                  {item.label}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});


const TechArsenal = memo(({ items }) => {
  // AJOUT : On récupère l'info si on est sur mobile
  const isTouch = useIsTouchDevice();

  const getLevelLabel = useCallback((val) => {
    if (val >= 90) return { label: "EXPERT", color: "#FF003C" };
    if (val >= 75) return { label: "CONFIRMÉ", color: "#00F0FF" };
    if (val >= 50) return { label: "AVANCÉ", color: "#ffffff" };
    if (val >= 30) return { label: "INTERMÉDIAIRE", color: "#a3a3a3" };
    return { label: "NOTIONS", color: "#525252" };
  }, []);

  // Définition des niveaux pour la légende
  const legendItems = [
    { label: "Expert", color: "#FF003C" },
    { label: "Confirmé", color: "#00F0FF" },
    { label: "Avancé", color: "#ffffff" },
    { label: "Interm.", color: "#a3a3a3" },
    { label: "Notions", color: "#525252" }
  ];

  return (
    <div className="w-full">
      {/* LÉGENDE (Visible uniquement sur mobile) */}
      <div className="md:hidden flex flex-wrap justify-center gap-x-4 gap-y-2 mb-8 px-4">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: item.color, boxShadow: `0 0 5px ${item.color}80` }} 
            />
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* GRILLE */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {items.map((item, index) => {
          const value = item.value || 70;
          const levelInfo = getLevelLabel(value);
          
          return (
            <motion.div 
              key={index} 
              // MODIFICATION ICI : Condition sur l'animation initiale
              // Sur mobile (isTouch) : opacity 1 et scale 1 dès le début (pas d'anim)
              // Sur PC (!isTouch) : opacity 0 et scale 0.9 (anim normale)
              initial={isTouch ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }} 
              // MODIFICATION ICI : Pas de délai sur mobile
              transition={{ delay: isTouch ? 0 : index * 0.05 }} 
              className="group relative bg-neutral-900/40 border border-white/5 md:hover:border-[#00F0FF]/50 rounded-xl p-4 flex flex-col items-center justify-center gap-4 transition-all duration-300 md:hover:bg-neutral-800/60 aspect-square"
            >
              <div className="w-12 h-12 text-neutral-400 md:group-hover:text-white transition-colors duration-300 md:group-hover:scale-110 transform flex items-center justify-center">
                {item.node}
              </div>
              <span className="font-mono text-[10px] text-neutral-500 md:group-hover:text-[#00F0FF] tracking-widest uppercase text-center">
                {item.title}
              </span>
              
              {/* Overlay hover (PC uniquement) */}
              <div className="hidden md:flex absolute inset-0 bg-black/95 backdrop-blur-xl rounded-xl flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 border border-[#00F0FF]/30">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1">
                  MAÎTRISE
                </span>
                <span 
                  className="font-black text-sm uppercase tracking-tight mb-3" 
                  style={{ color: levelInfo.color, textShadow: `0 0 10px ${levelInfo.color}50` }}
                >
                  {levelInfo.label}
                </span>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full" 
                    style={{ width: `${value}%`, backgroundColor: levelInfo.color }} 
                    initial={{ x: '-100%' }} 
                    whileInView={{ x: 0 }} 
                  />
                </div>
              </div>
              
              {/* Indicateur Mobile (Barre sous l'icône) */}
              <div className="md:hidden w-8 h-1 rounded-full mt-1" style={{ backgroundColor: levelInfo.color }} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});


const CyberAccordion = memo(({ projects, onProjectClick }) => {
  const [activeId, setActiveId] = useState(projects[0]?.id);
  const isTouch = useIsTouchDevice();

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 py-10">
      {/* Version Mobile */}
      <div className="lg:hidden flex flex-col gap-6">
        {projects.map((project, index) => (
          <motion.div 
            key={project.id} 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ delay: index * 0.1 }} 
            onClick={() => onProjectClick && onProjectClick(project)} 
            className="group relative w-full aspect-[4/3] bg-neutral-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <OptimizedImage 
              src={project.image} 
              alt={project.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-6">
              <span className="font-mono text-[#00F0FF] text-xs tracking-widest uppercase mb-2 block">
                /// {project.category}
              </span>
              <h3 className="text-3xl font-black text-white uppercase leading-none mb-4">
                {project.title}
              </h3>
            </div>
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur border border-white/20 px-3 py-1 rounded-full text-xs font-mono text-white">
              0{index + 1}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Version Desktop */}
      <div className="hidden lg:flex w-full h-[600px] gap-2">
        {projects.map((project, index) => {
          const isActive = activeId === project.id;
          
          return (
            <motion.div 
              key={project.id} 
              onHoverStart={() => setActiveId(project.id)} 
              onClick={() => onProjectClick && onProjectClick(project)} 
              layout 
              className={`relative h-full rounded-2xl overflow-hidden cursor-pointer border transition-colors duration-500 ease-out ${
                isActive 
                  ? 'border-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.15)]' 
                  : 'border-white/10 hover:border-white/30'
              }`} 
              animate={{ flex: isActive ? 3.5 : 1 }} 
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            >
              <div className="absolute inset-0 w-full h-full">
                <OptimizedImage 
                  src={project.image} 
                  alt={project.title} 
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isActive 
                      ? 'scale-105 opacity-100' 
                      : 'scale-100 opacity-40 grayscale-[80%]'
                  }`} 
                />
                <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black transition-opacity duration-500 ${
                  isActive ? 'opacity-90' : 'opacity-60'
                }`} />
                {isActive && (
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none" />
                )}
              </div>

              <div className="absolute inset-0 p-8 flex flex-col justify-end overflow-hidden">
                {!isActive && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <h3 
                      className="text-4xl font-black text-transparent rotate-[-90deg] whitespace-nowrap tracking-widest opacity-30 origin-center uppercase" 
                      style={{ WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}
                    >
                      {project.title}
                    </h3>
                    <span className="absolute bottom-8 font-mono text-xl text-neutral-500 font-bold">
                      0{index + 1}
                    </span>
                  </motion.div>
                )}

                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: 0.2, duration: 0.3 }} 
                      className="relative z-10 w-full"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[#00F0FF] font-mono text-xs tracking-[0.2em] uppercase bg-[#00F0FF]/10 px-2 py-1 rounded border border-[#00F0FF]/30">
                          {project.category}
                        </span>
                        <div className="h-[1px] flex-1 bg-white/20" />
                        <span className="text-neutral-500 font-mono text-xs">
                          0{index + 1}
                        </span>
                      </div>
                      <h2 className="text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-[0.9]">
                        {project.title}
                      </h2>
                      <div className="flex justify-between items-end">
                        <p className="text-neutral-400 max-w-md text-sm line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                        <div className="w-12 h-12 bg-[#FF003C] rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform">
                          <ArrowUpRight size={20} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});


export const AboutPage = memo(({ setView }) => {
  const [titleFontSize, setTitleFontSize] = useState(100);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setTitleFontSize(window.innerWidth < 768 ? 100 : 250);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleContactClick = useCallback(() => {
    const contactSection = document.getElementById('contact');
    if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleProjectsClick = useCallback(() => {
    if (setView) {
      setView('projects');
      window.scrollTo(0, 0);
    }
  }, [setView]);

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-transparent relative z-20">
      
      <SEO 
        title="À Propos" 
        description="Découvrez mon parcours et ma vision. Étudiant en BUT MMI spécialisé en création numérique, je transforme vos concepts en expériences visuelles." 
      />

      {/* HEADER CENTRÉ */}
      <section className="h-screen w-full flex flex-col items-center justify-center relative px-4 overflow-hidden">
        
         <div className="flex flex-col items-center justify-center w-full max-w-7xl gap-12 md:gap-24 relative z-10">
          
          {/* Titre */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="w-full text-center flex justify-center"
          >
            {/* AJOUT H1 INVISIBLE POUR SEO */}
            <h1 className="sr-only">À PROPOS DE MOI</h1>
            <FuzzyText fontSize={titleFontSize} fontWeight={900} color="#ffffff">
              À PROPOS
            </FuzzyText>
          </motion.div>
          
          {/* Sous-titre */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.3 }} 
            className="w-full flex justify-center px-6 md:px-4"
          >
            <style>
              {`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap');`}
            </style>

            <h2 className="max-w-4xl text-center leading-relaxed mx-auto">
              <ShinyText 
                text="Passionné par le design et la créativité, je transforme vos concepts en expériences visuelles et interactives." 
                speed={8} 
                delay={1}
                color="#6d7785" 
                shineColor="#FFFFFF"
                className="text-sm sm:text-xl md:text-2xl font-bold tracking-normal block text-center"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }} 
              />
            </h2>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 mix-blend-difference z-10 pointer-events-none" 
          animate={{ y: [0, 10, 0] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 text-center">Scroll</span>
          <ArrowDown size={20} className="text-white" />
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 relative z-20">
        
        {/* SECTION 1 : MA VISION (Centrée, sans photo) */}
        <div className="mb-32 border-b border-white/5 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="max-w-4xl mx-auto flex flex-col items-center text-center"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase leading-tight tracking-tight mb-12">
              MA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#FF003C]">VISION</span>
            </h2>

            <div className="space-y-8 text-neutral-300 font-normal text-lg md:text-xl leading-relaxed text-justify md:text-center">
                <p>
                    Pour moi, le design est bien plus qu'une affaire d'esthétique, c'est un <strong className="text-white font-medium">langage universel</strong>. Je pense qu'un écran n'est pas qu'une simple surface à remplir, mais plutôt comme un espace d'expression où chaque détail doit capter l'attention et susciter une émotion immédiate.
                </p>
                <p>
                    Mon approche est guidée par l'instinct et une recherche constante d'harmonie. J'aime associer typographie, image et couleur pour créer des compositions justes. Mon idée n'est pas de complexifier, mais de trouver l'<strong className="text-white font-medium">équilibre visuel</strong> qui donnera une identité forte et singulière à votre projet.
                </p>
                <p>
                    Le mouvement est ce qui apporte le souffle. Je transforme des concepts statiques en <strong className="text-white font-medium">expériences vivantes</strong>. Qu'il s'agisse d'une interaction subtile ou d'une animation globale, je veille à ce que le résultat soit fluide, naturelle et porteur de sens.
                </p>
            </div>
            
            <div className="flex flex-wrap gap-6 pt-12 justify-center">
              <NeonButton variant="red" onClick={handleContactClick}>
                ME CONTACTER <Send size={18} />
              </NeonButton>
              
              <NeonButton variant="cyan" onClick={handleProjectsClick}>
                PROJETS <ArrowRight size={18} />
              </NeonButton>
            </div>
          </motion.div>
        </div>

        {/* SECTION 2 : PARCOURS PROFESSIONNEL */}
        <div className="mb-40 max-w-6xl mx-auto relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="text-center mb-20"
          >
            <span className="font-mono text-xs text-[#00F0FF] tracking-[0.3em] uppercase block mb-4">
              /// EXPÉRIENCES
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase">
              Parcours <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#FF003C]">Professionnel</span>
            </h2>
          </motion.div>
          
          <SchoolTimeline />
        </div>

        {/* SECTION 3 : SOFTWARE STACK */}
        <section className="w-full pb-40 relative z-20">
          <div className="mb-16 text-center">
            <span className="font-mono text-xs text-[#00F0FF] tracking-[0.3em] uppercase block mb-4">
              /// ARSENAL
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase">
              Software <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#FF003C]">Stack</span>
            </h2>
            <p className="font-mono text-neutral-500 text-sm mt-6 max-w-2xl mx-auto">
              Maîtrise des outils de conception et de développement pour transformer les idées en réalité numérique.
            </p>
          </div>

          <TechArsenal items={LOGOS_DATA} />
        </section>
      </div>
    </div>
  );
});


export const ProjectsPage = memo(({ onProjectClick }) => {
    const [titleFontSize, setTitleFontSize] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 250);
    
    useEffect(() => {
        let timer;
        const updateFontSize = () => { if(timer) clearTimeout(timer); timer = setTimeout(() => { setTitleFontSize(window.innerWidth < 768 ? 100 : 250); }, 100); };
        window.addEventListener('resize', updateFontSize, { passive: true });
        return () => window.removeEventListener('resize', updateFontSize);
    }, []);

    const [activeCategory, setActiveCategory] = useState('TOUT');
    
    // Création des catégories uniques
    const uniqueCategories = useMemo(() => ['TOUT', ...new Set(ALL_PROJECTS.map(p => p.category))], []);
    
    // Filtrage
    const filteredProjects = useMemo(() => activeCategory === 'TOUT' ? ALL_PROJECTS : ALL_PROJECTS.filter(p => p.category === activeCategory), [activeCategory]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen" style={{ opacity: 0 }}> 
            
            <SEO 
                title="Mes Projets" 
                description="Explorez le portfolio de Abdoul-Ahad REHMAN. Une sélection de projets en Web Design, Motion Design, Branding et Développement." 
            />

            {/* --- HEADER --- */}
            <section className="h-screen w-full flex flex-col items-center justify-center relative px-4 overflow-hidden pt-32 pb-32">
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="w-full max-w-[90vw] md:max-w-7xl relative z-10 text-center">
                    {/* AJOUT H1 INVISIBLE POUR SEO */}
                    <h1 className="sr-only">MES PROJETS</h1>
                    <FuzzyText fontSize={titleFontSize} fontWeight={900} color="#ffffff">PROJETS</FuzzyText>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-8 flex flex-col items-center gap-4 text-center w-full z-10">
                    <div className="flex items-center gap-6"><span className="h-[1px] w-12 bg-[#FF003C]" /><h2 className="font-mono text-xs md:text-lg text-neutral-400 tracking-[0.5em] uppercase">Abdoul-Ahad REHMAN</h2><span className="h-[1px] w-12 bg-[#00F0FF]" /></div>
                </motion.div>
                <motion.div className="absolute bottom-20 flex flex-col items-center gap-3 mix-blend-difference" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Scroll</span><ArrowDown size={24} className="text-white" />
                </motion.div>
            </section>

            {/* --- GRILLE --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pb-40 pt-20">
                
                {/* Filtres */}
                <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mb-24">
                    {uniqueCategories.map((cat, idx) => {
                        const isActive = activeCategory === cat;
                        const count = cat === 'TOUT' ? ALL_PROJECTS.length : ALL_PROJECTS.filter(p => p.category === cat).length;
                        return (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`relative group px-2 py-2 transition-all duration-300 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
                                {isActive && ( <div className="absolute inset-0 bg-[#00F0FF]/10 blur-lg rounded-full opacity-50" /> )}
                                <div className="relative z-10 flex items-baseline gap-1 font-mono text-xs md:text-sm tracking-[0.15em] uppercase">
                                    <span className={`transition-colors duration-300 ${isActive ? 'text-white text-shadow-neon font-bold' : 'text-neutral-500 group-hover:text-white'}`}>{cat}</span>
                                    {isActive && ( <span className="absolute -top-1 -right-3 text-[9px] text-[#FF003C] font-bold animate-pulse">{count}</span> )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-y-24 relative"> 
                    <AnimatePresence mode='popLayout'>
                        {filteredProjects.map((p) => (
                            <motion.div 
                                layout 
                                key={p.id} 
                                initial={{ opacity: 0, scale: 0.9 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                exit={{ opacity: 0, scale: 0.9 }} 
                                transition={{ duration: 0.4 }}
                            >
                                <ProjectCard 
                                    {...p} 
                                    index={0} 
                                    isCarousel={false} 
                                    onClick={() => onProjectClick(p)} 
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
});


export const HomePage = memo(({ setView, onProjectClick }) => {
  const handleCVClick = useCallback(() => window.open('/mon-cv.pdf', '_blank'), []);
  const handleProjectsClick = useCallback(() => setView('projects'), [setView]);

  // Détection Desktop pour la 3D
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkResolution = () => { setIsDesktop(window.innerWidth >= 1024); };
    checkResolution();
    let timeoutId;
    const handleResize = () => { clearTimeout(timeoutId); timeoutId = setTimeout(checkResolution, 200); };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); clearTimeout(timeoutId); };
  }, []);

  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.5 }} 
      className="relative z-10 flex flex-col items-center w-full min-h-screen bg-transparent"
    >
      <SEO 
        title="Accueil" 
        description="Bienvenue sur le portfolio d'Abdoul-Ahad REHMAN. Expert en Web Design, Motion Design et Développement Front-End." 
      />
      
      {/* SECTION 1 : HERO */}
      <section 
        id="home" 
        className="min-h-screen w-full flex flex-col justify-center relative px-6 md:px-12 lg:px-20 pt-20 md:pt-0 overflow-hidden"
      >
        <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16 items-center relative z-10 h-full">
            
            <div className="flex flex-col justify-center text-center lg:text-left space-y-8 md:space-y-12 w-full py-12 lg:py-0 order-2 lg:order-1">
            
            {/* TITRE PRINCIPAL (MODIFIÉ EN H1 POUR SEO) */}
            <h1 className="flex flex-col select-none leading-none relative">
              <div className="relative z-20 mt-2 flex flex-col md:flex-row flex-wrap items-center lg:items-baseline justify-center lg:justify-start gap-y-1 md:gap-x-3">
                <motion.span 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }} 
                  className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-tight uppercase neon-gradient-text"
                >
                  BONJOUR,
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 1, duration: 0.8, ease: "easeOut" }} 
                  className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-tight uppercase"
                >
                  MOI C'EST
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }} 
                  className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight uppercase neon-gradient-text mt-1 md:mt-0"
                >
                  ABDOUL REHMAN
                </motion.span>
              </div>
            </h1>

            {/* DESCRIPTION & ROLES */}
            <div className="relative space-y-6 md:space-y-10 px-0 md:px-0"> 
              
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 1.6 }} 
                className="flex flex-wrap items-center justify-center lg:justify-start gap-2 md:gap-3 text-lg md:text-2xl lg:text-3xl font-bold uppercase tracking-tight text-white"
              >
                <span className="text-white drop-shadow-lg">Je suis un :</span>
                <RotatingText 
                  texts={['Graphic', 'Web', 'Motion']} 
                  mainClassName="px-3 py-1 md:px-4 md:py-2 glass-neon-box text-[#00F0FF] rounded-lg overflow-hidden" 
                  staggerFrom="last" 
                  initial={{ y: "100%" }} 
                  animate={{ y: 0 }} 
                  exit={{ y: "-120%" }} 
                  staggerDuration={0.05} 
                  splitLevelClassName="overflow-hidden"
                  transition={{ type: "spring", damping: 20, stiffness: 300 }} 
                  rotationInterval={4000} 
                />
                <span className="text-white drop-shadow-lg">Designer</span>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 2.2 }} 
                className="space-y-8"
              >
                <p className="font-mono text-sm md:text-lg text-neutral-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 text-center md:text-left">
                  À 20 ans, je suis étudiant en BUT MMI à la Sorbonne Paris Nord. Passionné par le digital, je combine mes compétences en <strong>Graphisme</strong>, <strong>Motion Design</strong>, <strong>Montage Vidéo</strong> et en <strong>Web design</strong> avec une solide maîtrise du <strong>Développement Web</strong>.
                  <br className="block mt-4" />
                  Curieux et créatif, j'explore aujourd'hui la <strong>3D</strong> pour repousser mes limites. Mon objectif : utiliser cette polyvalence technique pour donner vie à des projets visuels uniques.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 w-full">
                  <NeonButton 
                    variant="cyan" 
                    onClick={handleProjectsClick} 
                    className="w-full sm:w-auto justify-center px-8 py-3 text-sm md:text-base"
                  >
                    PROJETS <ArrowRight size={18} />
                  </NeonButton>
                  <NeonButton 
                    variant="red" 
                    onClick={handleCVClick} 
                    className="w-full sm:w-auto justify-center px-8 py-3 text-sm md:text-base"
                  >
                    VOIR MON CV <ArrowUpRight size={18} />
                  </NeonButton>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="hidden lg:block relative h-[700px] lg:h-[85vh] min-h-[600px] order-1 lg:order-2">
            {isDesktop && (
              <motion.div 
                initial={{ opacity: 0, x: 50 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 2.6, duration: 1.2, ease: "easeOut" }} 
                className="relative w-full h-full" 
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                  <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-[#00F0FF]/20 rounded-full blur-[120px] animate-pulse mix-blend-screen" />
                  <div 
                    className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-[#FF003C]/20 rounded-full blur-[120px] animate-pulse mix-blend-screen" 
                    style={{ animationDelay: '2s' }} 
                  />
                </div>
                <LaptopCanvas />
              </motion.div>
            )}
          </div>
        </div>
            
        <motion.div 
          className="hidden md:flex absolute bottom-12 left-1/2 -translate-x-1/2 flex-col items-center gap-2 z-20 opacity-30 mix-blend-difference pointer-events-none" 
          animate={{ y: [0, 8, 0] }} 
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white">
            Scroll Down
          </span>
          <ArrowDown size={18} className="text-white" />
        </motion.div>
      </section>
      
      <RecruitmentBanner setView={setView} />
      
      {/* SECTION 3 : PROJETS */}
      <section className="w-full max-w-[100vw] overflow-hidden pt-20 pb-20 md:pt-64 md:pb-64 bg-transparent"> 
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col items-center md:flex-row md:items-end justify-between mb-12 gap-6"> 
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#FF003C] pr-2">
              PROJETS
            </h2>
            <p className="font-mono text-sm text-[#00F0FF] mt-2">KINETIC ARCHIVE ///</p>
          </div>
          <div className="w-full md:w-auto flex justify-center">
            <NeonButton variant="cyan" onClick={handleProjectsClick}>
              TOUT VOIR <ChevronRight size={18} />
            </NeonButton>
          </div>
        </div>
        <CyberAccordion projects={HIGHLIGHTED_PROJECTS} onProjectClick={onProjectClick} />
      </section>

      {/* SECTION 4 : SKILLS */}
      <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 pt-20 md:pt-64 pb-40">
        <div className="mb-16 text-center md:text-left">
          <span className="font-mono text-xs text-[#00F0FF] tracking-[0.3em] uppercase block mb-4">
            /// SPECIFICATIONS
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white">
            HARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF003C] to-[#00F0FF]">SKILLS</span>
          </h2>
          <p className="font-mono text-neutral-500 text-sm max-w-2xl leading-relaxed md:mx-0 mx-auto">
            Une vue détaillée de mon arsenal technique ainsi que des outils que je maîtrise.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 md:mb-32">
          <SkillTags title="CRÉATION VISUELLE" data={SKILLS_DATA.creation} color="#FF003C" />
          <SkillTags title="DÉVELOPPEMENT" data={SKILLS_DATA.dev} color="#00F0FF" />
          <SkillTags title="COMMUNICATION" data={SKILLS_DATA.com} color="#FFFFFF" />
        </div>
        
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-24 md:mb-32" />
        
        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-8 flex items-center gap-4 justify-center md:justify-start">
            <Cpu className="text-[#00F0FF]" /> SOFTWARE_STACK
          </h3>
          <TechArsenal items={LOGOS_DATA} />
        </div>
      </section>
    </motion.main>
  );
});

export const LoadingScreen = memo(({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  // Détection du mobile
  const isTouch = useIsTouchDevice();

  useEffect(() => {
    // --- OPTIMISATION PERFORMANCE ---
    // On réduit drastiquement le temps d'attente sur mobile pour améliorer le LCP/FCP
    // Mobile : 1500ms (1.5s) au lieu de 4000ms -> Le score va passer au vert
    // PC : 4500ms (4.5s) pour garder l'effet visuel
    const duration = isTouch ? 1500 : 4500; 
    
    const intervalTime = 50; 
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500); 
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete, isTouch]);

  // On ne génère les particules QUE si on est sur PC (!isTouch)
  const particles = useMemo(() => {
    if (isTouch) return []; 
    return Array.from({ length: 360 }, (_, i) => i + 1);
  }, [isTouch]);

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* --- VERSION BUREAU (PC) : LA SPIRALE 3D --- */}
      {!isTouch && (
        <>
          <style>
            {`
              .particle-container {
                position: relative;
                width: 300px; 
                height: 300px;
                display: flex;
                justify-content: center;
                align-items: center;
                perspective: 1000px;
              }
              .particle {
                position: absolute;
                width: 5px;
                height: 5px;
                border-radius: 50%;
                background-color: currentColor;
                color: hsl(calc(var(--i) * -1deg), 100%, 50%);
                box-shadow: 0 0 5px currentColor;
                animation: particle-anim 3s ease-in infinite alternate;
                animation-delay: calc(var(--i) * 0.005s);
              }
              @keyframes particle-anim {
                0% { transform: rotateZ(calc(var(--i) * 45deg)) perspective(40px) translate3d(calc(var(--i) * 1px), calc(var(--i) * 1px), calc(var(--i) * -0.075px)); }
                100% { color: hsl(calc(var(--i) * 1deg), 100%, 70%); transform: rotateZ(calc(var(--i) * 90deg)) rotateX(calc(var(--i) * 1deg)) perspective(15px) translate3d(calc(var(--i) * -3px), calc(var(--i) * 2px), calc(var(--i) * -0.075px)); }
              }
            `}
          </style>
          <div className="particle-container mb-12" aria-hidden="true">
            {particles.map((i) => (
              <div key={i} className="particle" style={{ '--i': i }} />
            ))}
          </div>
        </>
      )}

      {/* --- VERSION MOBILE : LOADER SIMPLE & LÉGER --- */}
      {isTouch && (
        <div className="mb-16 relative flex items-center justify-center">
            {/* Cercle rotatif simple CSS */}
            <div className="w-24 h-24 border-4 border-[#00F0FF]/20 border-t-[#00F0FF] rounded-full animate-spin" />
            {/* Logo ou icône centrale fixe */}
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <div className="w-12 h-12 bg-[#FF003C]/20 rounded-full blur-md" />
            </div>
        </div>
      )}

      {/* --- BARRE DE PROGRESSION --- */}
      <div className="flex flex-col items-center gap-2 w-64 md:w-80 relative z-50">
        <div className="w-full flex justify-between items-end text-[#00F0FF] font-mono text-xs uppercase tracking-widest font-bold">
            <span>{isTouch ? "Mobile_System" : "System_Init"}</span>
            <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
            <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF003C] to-[#00F0FF]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
            />
            <motion.div 
                className="absolute top-0 h-full w-[40px] bg-white blur-[8px]"
                style={{ left: `${progress}%` }}
            />
        </div>
      </div>
    </motion.div>
  );
});