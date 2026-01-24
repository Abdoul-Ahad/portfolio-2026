import React from 'react';

export const SEO = ({ title, description }) => {
  const baseTitle = "Abdoul-Ahad REHMAN";
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
  
  return (
    <>
      {/* React 19 détecte ces balises et les place automatiquement dans le <head> */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph (Facebook/LinkedIn) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </>
  );
};