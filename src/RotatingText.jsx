import React, { useState, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RotatingText = forwardRef(({
  texts = [],
  transition = { type: "spring", damping: 25, stiffness: 300 },
  initial = { y: "100%", opacity: 0 },
  animate = { y: 0, opacity: 1 },
  exit = { y: "-120%", opacity: 0 },
  animatePresenceMode = "wait",
  mainClassName = "",
  splitLevelClassName = "",
  staggerDuration = 0.05,
  rotationInterval = 2000,
  loop = true,
}, ref) => {
  const [index, setIndex] = useState(0);

  useImperativeHandle(ref, () => ({
    next: () => setIndex((prev) => (prev + 1) % texts.length),
    prev: () => setIndex((prev) => (prev - 1 + texts.length) % texts.length),
    jumpTo: (i) => setIndex(i),
  }));

  useEffect(() => {
    if (!loop) return;
    const timeoutId = setTimeout(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval);
    return () => clearTimeout(timeoutId);
  }, [index, rotationInterval, loop, texts.length]);

  const currentText = texts[index];
  
  // Découpage du texte en caractères pour l'effet "stagger"
  const characters = useMemo(() => currentText.split(''), [currentText]);

  return (
    <div className={`flex items-center ${mainClassName}`}>
      <AnimatePresence mode={animatePresenceMode}>
        <motion.div
          key={index}
          className={`flex items-center justify-center relative ${splitLevelClassName}`}
          layout // Permet d'animer la largeur du conteneur si le mot change de taille
        >
          {characters.map((char, i) => (
            <motion.span
              key={`${index}-${i}`}
              initial={initial}
              animate={animate}
              exit={exit}
              transition={{
                ...transition,
                delay: i * staggerDuration // Effet de décalage entre les lettres
              }}
              className="inline-block whitespace-pre"
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

export default RotatingText;