import React, { memo } from 'react';

const ShinyText = ({ 
  text, 
  disabled = false, 
  speed = 5, 
  className = '', 
  shineColor = '#FFFFFF', // Couleur de brillance
  color = '#6d7785',      // Couleur de base
  delay = 0 
}) => {
  
  if (disabled) {
    return <span className={className} style={{ color }}>{text}</span>;
  }

  return (
    <span
      className={className}
      style={{
        backgroundImage: `linear-gradient(
          120deg,
          ${color} 40%,
          ${shineColor} 50%,
          ${color} 60%
        )`,
        backgroundSize: '200% auto',
        
        // Propriétés de masquage du texte
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        
        display: 'inline-block',
        
        // Configuration de l'animation
        animation: `shine ${speed}s linear infinite`,
        animationDelay: `${delay}s`,
        
        // Optimisation Performance (GPU)
        willChange: 'background-position',
      }}
    >
      {text}
      
      {/* ANIMATION CORRIGÉE : 
          Va de -100% (Gauche) à 200% (Droite) pour un sens de lecture naturel.
      */}
      <style>{`
        @keyframes shine {
          0% { background-position: 200% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </span>
  );
};

// Ajout de memo pour éviter les re-rendus inutiles si les props ne changent pas
export default memo(ShinyText);