import { useState, useEffect, useLayoutEffect } from 'react';

// OPTIMISATION: Utilisation d'une Map pour une gestion plus fiable des IDs d'animation
export const AnimationPriorityManager = {
  activeLoops: new Map(),
  maxConcurrent: 2,

  register(id, priority = 1) {
    this.activeLoops.set(id, priority);
    return this.shouldRun(id);
  },

  unregister(id) {
    this.activeLoops.delete(id);
  },

  shouldRun(id) {
    const sorted = [...this.activeLoops.entries()].sort((a, b) => b[1] - a[1]);
    const allowed = sorted.slice(0, this.maxConcurrent).map(([key]) => key);
    return allowed.includes(id);
  }
};

/* =========================================
   HOOKS UTILITAIRES OPTIMISÉS
   ========================================= */

export const useIsTouchDevice = () => {
    const [isTouch, setIsTouch] = useState(false);
    
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mediaQuery = window.matchMedia("(pointer: coarse)");
        setIsTouch(mediaQuery.matches);
        const listener = (e) => setIsTouch(e.matches);
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", listener, { passive: true });
            return () => mediaQuery.removeEventListener("change", listener);
        } else {
            mediaQuery.addListener(listener);
            return () => mediaQuery.removeListener(listener);
        }
    }, []);
    return isTouch;
};

export const useRealViewportHeight = () => {
  const [vh, setVh] = useState(() => 
    typeof window !== 'undefined' ? window.innerHeight : 0
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateVh = () => {
      // Simple Throttle via RAF pour la performance
      requestAnimationFrame(() => {
          const newVh = window.innerHeight;
          if (Math.abs(newVh - vh) > 50) {
            setVh(newVh);
            document.documentElement.style.setProperty('--vh', `${newVh * 0.01}px`);
          }
      });
    };
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    window.addEventListener('resize', updateVh, { passive: true });
    window.addEventListener('orientationchange', updateVh, { passive: true });
    return () => {
      window.removeEventListener('resize', updateVh);
      window.removeEventListener('orientationchange', updateVh);
    };
  }, [vh]);
  return vh;
};

export const useScrollLock = (isLocked) => {
  useLayoutEffect(() => {
    if (!isLocked) return;
    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;
    const originalStyles = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      height: body.style.height,
      paddingRight: body.style.paddingRight,
      touchAction: body.style.touchAction,
      overflowY: body.style.overflowY
    };
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.height = `${window.innerHeight}px`;
    body.style.paddingRight = `${scrollbarWidth}px`;
    body.style.touchAction = 'none';
    
    const preventTouch = (e) => {
      const scrollableParent = e.target.closest('.custom-scrollbar');
      if (!scrollableParent && (e.target === body || e.target === html)) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventTouch, { passive: false });
    
    const handleResize = () => {
      if (isLocked) body.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      Object.assign(body.style, originalStyles);
      window.scrollTo(0, scrollY);
      document.removeEventListener('touchmove', preventTouch);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLocked]);
};