import React from 'react';

export const SKILLS_DATA = {
  creation: [
    { label: "Motion", value: 70 },
    { label: "UI/UX", value: 80 },
    { label: "3D", value: 50 },
    { label: "Brand", value: 80 },
    { label: "Editing", value: 80 }
  ],
  dev: [
    { label: "HTML/CSS", value: 80 },
    { label: "React", value: 55 },
    { label: "JS", value: 75 },
    { label: "CMS", value: 85 },
    { label: "Back", value: 45 }
  ],
  com: [
    { label: "Stratégie", value: 85 },
    { label: "SEO", value: 70 },
    { label: "Rédaction", value: 70 },
    { label: "Anglais", value: 75 },
    { label: "Gestion", value: 75 }
  ]
};

export const ALL_PROJECTS = [
    { 
        id: 1, 
        title: "BROCHURE REVISITE", 
        category: "PRINT",
        context: "Projet Universitaire",
        client: "None",
        year: "2024",
        duration: "5 Jours",
        description: "Conception et mise en page d'un magazine d'art pour le musée du Louvre. L'objectif était de créer une identité visuelle élégante et moderne tout en respectant les codes classiques de l'institution. Travail sur la grille, la typographie et la hiérarchie visuelle.",
        tech: ["Affinity", "Indesign"],
        image: "/images/Brochure_1.webp",
        gallery: [
            "/images/Brochure_1.webp",
            "/images/Brochure_2.webp",
            "/images/Brochure_3.webp"
        ]
    }, 
    { 
        id: 2, 
        title: "NIKE AIR MAX CAMPAIGN", 
        category: "DESIGN GRAPHIQUE",
        context: "Projet Personnel",
        client: "Concept Art",
        year: "2024",
        duration: "1 Semaine",
        description: "Série d'affiches et visuels promotionnels pour la gamme Air Max. Exploration de différents environnements (Espace, Sunset, Water) pour mettre en valeur le produit à travers des compositions dynamiques.",
        tech: ["Photoshop", "Lightroom"],
        image: "/images/air-max-sunset.webp",
        gallery: [
            "/images/air-max-sunset.webp",
            "/images/air-max-space.webp",
            "/images/air-max-water.webp"
        ]
    },
    { 
        id: 3, 
        title: "AFFICHE NUCLÉAIRE", 
        category: "DESIGN GRAPHIQUE",
        context: "Projet Universitaire",
        client: "Campagne Sensibilisation",
        year: "2024",
        duration: "1 Semaine",
        description: "Création d'une affiche impactante sur le thème de l'énergie nucléaire. Utilisation de contrastes forts et de symbolique visuelle pour interpeller le spectateur.",
        tech: ["Illustrator", "Photoshop"],
        image: "/images/Affiche-nucléaire.webp"
    },
    { 
        id: 4, 
        title: "AFFICHE SUBARU", 
        category: "DESIGN GRAPHIQUE",
        context: "Projet Personnel",
        client: "None",
        year: "2025",
        duration: "4 Jours",
        description: "Design d'une affiche promotionnelle pour un modèle de voiture sportive. Travail sur l'éclairage, la composition et l'intégration typographique.",
        tech: ["Photoshop", "Lightroom"],
        image: "/images/affiche-subaru.webp"
    },
    { 
        id: 5, 
        title: "SITE BASKETBALL", 
        category: "Web design",
        context: "Projet Universitaire",
        client: "None",
        year: "2024",
        duration: "1 Semaine",
        description: "Série d'affiches et visuels promotionnels pour la gamme Air Max. Exploration de différents environnements (Espace, Sunset, Water) pour mettre en valeur le produit à travers des compositions dynamiques.",
        tech: ["Figma", "Indesign"],
        image: "/images/Page-ac.webp",
        gallery: [
            "/images/Page-ac.webp",
            "/images/Page-terrains.webp",
            "/images/Page-rencontre.webp",
            "/images/Page-joueur.webp",
        ]
    },
    { 
        id: 6, 
        title: "CHAUSSURE 3D", 
        category: "3D",
        context: "Projet Personnel",
        client: "None",
        year: "2024",
        duration: "2 Semaines",
        description: "Série d'affiches et visuels promotionnels pour la gamme Air Max. Exploration de différents environnements (Espace, Sunset, Water) pour mettre en valeur le produit à travers des compositions dynamiques.",
        tech: ["Blender"],
        image: "/images/Model-1.webp",
        gallery: [
            "/images/Model-1.webp",
            "/images/Model-2.webp",
            "/images/Model-3.webp",
        ]
    },
    { 
        id: 7, 
        title: "MAGAZINE DU LOUVRE", 
        category: "PRINT",
        context: "Projet Universitaire",
        client: "None",
        year: "2024",
        duration: "1 Semaine",
        description: "Conception et mise en page d'un magazine d'art pour le musée du Louvre. L'objectif était de créer une identité visuelle élégante et moderne tout en respectant les codes classiques de l'institution. Travail sur la grille, la typographie et la hiérarchie visuelle.",
        tech: ["InDesign", "Photoshop", "Figma"],
        image: "/images/Mag_page-1.webp",
        gallery: [
            "/images/Mag_page-1.webp",
            "/images/Mag_page-2.webp",
            "/images/Mag_page-3.webp",
            "/images/Mag_page-4.webp"
        ]
    },
    { 
        id: 8, 
        title: "AFFICHE ST-PAUL LES DAXES", 
        category: "DESIGN GRAPHIQUE",
        context: "Projet Universitaire",
        client: "None",
        year: "2025",
        duration: "3 Jours",
        description: "Conception et mise en page d'un magazine d'art pour le musée du Louvre. L'objectif était de créer une identité visuelle élégante et moderne tout en respectant les codes classiques de l'institution. Travail sur la grille, la typographie et la hiérarchie visuelle.",
        tech: ["Illustrator"],
        image: "/images/Affiche-saint-paul-les-daxs.webp",
    },
    { 
        id: 9, 
        title: "COMING SOON", 
        category: "MOTION DESIGN",
        context: "Projet Personnel",
        client: "None",
        year: "2026",
        duration: "???",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        tech: ["After Effects", "Cinema 4D", "Octane", "Premiere Pro"],
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
    }, 
];

export const HIGHLIGHTED_PROJECTS = ALL_PROJECTS.slice(0, 4);

export const NAV_ITEMS = [
    { name: 'Accueil', view: 'home', hash: '#home' },
    { name: 'À Propos', view: 'about', hash: '#about' },
    { name: 'Projets', view: 'projects', hash: '#projects' },
    { name: 'Contact', view: 'contact', hash: '#contact' }, 
];

export const LOGOS_DATA = [
    // Suite Adobe (On met souvent des valeurs hautes pour un designer)
    { 
        node: <img src="https://upload.wikimedia.org/wikipedia/commons/a/af/Adobe_Photoshop_CC_icon.svg" alt="Photoshop" loading="lazy" className="w-full h-full object-contain" />, 
        title: "Photoshop", 
        href: "#",
        value: 80 // -> Aichera "EXPERT" (Rouge)
    },
    { 
        node: <img src="https://upload.wikimedia.org/wikipedia/commons/f/fb/Adobe_Illustrator_CC_icon.svg" alt="Illustrator" loading="lazy" className="w-full h-full object-contain" />, 
        title: "Illustrator", 
        href: "#",
        value: 80 // -> Aichera "CONFIRMÉ" (Cyan)
    },
    { 
        node: <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Adobe_After_Effects_CC_icon.svg" alt="After Effects" loading="lazy" className="w-full h-full object-contain" />, 
        title: "After Effects", 
        href: "#",
        value: 65 // -> Aichera "CONFIRMÉ" (Cyan)
    },
    { 
        node: <img src="https://upload.wikimedia.org/wikipedia/commons/4/48/Adobe_InDesign_CC_icon.svg" alt="InDesign" loading="lazy" className="w-full h-full object-contain" />, 
        title: "InDesign", 
        href: "#",
        value: 80 // -> Aichera "AVANCÉ" (Blanc)
    },
    
    // Vidéo & Montage
    { 
        node: <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/DaVinci_Resolve_Studio.png" alt="DaVinci Resolve" loading="lazy" className="w-full h-full object-contain" />, 
        title: "DaVinci Resolve", 
        href: "#",
        value: 70 // -> Aichera "INTERMÉDIAIRE" (Gris)
    },
    
    // UI Design
    { 
        node: <img src="https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg" alt="Figma" loading="lazy" className="w-full h-full object-contain" />, 
        title: "Figma", 
        href: "#",
        value: 95 // -> Aichera "EXPERT" (Rouge)
    },
    
    // Développement (Niveaux variés)
    { 
        node: <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg" alt="HTML5" loading="lazy" className="w-full h-full object-contain" />, 
        title: "HTML5", 
        href: "#",
        value: 80 
    },
    { 
        node: <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg" alt="CSS3" loading="lazy" className="w-full h-full object-contain" />, 
        title: "CSS3", 
        href: "#",
        value: 85 
    },
    { 
        node: <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg" alt="JavaScript" loading="lazy" className="w-full h-full object-contain" />, 
        title: "JavaScript", 
        href: "#",
        value: 60 // -> Aichera "AVANCÉ"
    },
    { 
        node: <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/WordPress_blue_logo.svg" alt="WordPress" loading="lazy" className="w-full h-full object-contain" />, 
        title: "WordPress", 
        href: "#",
        value: 70 
    },
{
        node: <img src="https://upload.wikimedia.org/wikipedia/commons/0/0c/Blender_logo_no_text.svg" alt="Blender" loading="lazy" className="w-full h-full object-contain" />,
        title: "Blender",
        href: "#",
        value: 20 // Valeur 20 = Niveau "NOTIONS" (Gris)
    },
];

export const TIMELINE_DATA = [
    { 
      year: "2026", 
      title: "BUT MMI - 2ème Année", 
      subtitle: "Spécialisation Création Numérique", 
      desc: "Approfondissement technique et artistique : Motion Design, montage vidéo, et direction artistique.",
      tech: ["Motion", "Editing", "Brand", "Art Direction"],
    },
    { 
      year: "2025", 
      title: "BUT MMI - 1ère Année", 
      subtitle: "Socle Commun", 
      desc: "Découverte des trois axes majeurs du multimédia : Développement Web, Communication Digitale et Création Graphique. Réalisation de projets transversaux.",
      tech: ["Web Dev", "Design", "Com", "Audiovisuel"],
    },
    { 
      year: "2024", 
      title: "L'École du Multimédia", 
      subtitle: "Spécialité Création digitale", 
      desc: "Formation intensive axée sur les fondamentaux du design interactif, la suite Adobe et la culture numérique. Premiers pas vers la professionnalisation.",
      tech: ["UI Design", "Adobe Suite", "Culture Web"],
    },
    { 
      year: "2023", 
      title: "Baccalauréat Technologique STI2D", 
      subtitle: "Spécialité Informatique - Bac Mention Assez Bien", 
      desc: "Formation technologique orientée vers l'innovation et l'informatique. Acquisition de bases solides en programmation et gestion de projet technique.",
      tech: ["Informatique", "Programmation", "Innovation"],
    },
    { 
      year: "2023", 
      title: "Employé Polyvalent - McDonald's", 
      subtitle: "CDD - 3 Mois", 
      desc: "Première expérience professionnelle significative. Développement de la rigueur, de la gestion du stress et du travail en équipe dans un environnement rapide.",
      tech: ["Travail d'équipe", "Rigueur", "Gestion du stress"],
    },
];

export const LEGAL_CONTENT = {
    sections: [
        {
            title: "ÉDITEUR DU SITE",
            content: [
                "Dernière mise à jour : 23 janvier 2026",
                "",
                "Nom : REHMAN Abdoul-Ahad",
                "Statut : Étudiant en BUT MMI (Métiers du Multimédia et de l'Internet)",
                "Email : abdoulrh94@gmail.com",
                "Localisation : Paris, France"
            ]
        },
        {
            title: "HÉBERGEMENT",
            content: [
                "Hébergeur : Vercel Inc.",
                "Adresse : 340 S Lemon Ave #4133, Walnut, CA 91789, USA",
                "Site web : vercel.com"
            ]
        },
        {
            title: "PROPRIÉTÉ INTELLECTUELLE",
            content: [
                "L’ensemble du contenu présent sur ce site (textes, images, vidéos, graphismes, logos, interfaces, animations et design), à l’exception d’un seul contenu tiers mentionné ci-dessous, est la propriété exclusive de Abdoul-Ahad REHMAN.",
                "Toute reproduction, distribution, modification, adaptation ou publication, même partielle, de ces éléments est strictement interdite sans l’autorisation écrite préalable de Abdoul-Ahad REHMAN."
            ]
        },
        {
            title: "PROTECTION DES DONNÉES PERSONNELLES",
            content: [
                "Collecte des données : Ce site ne collecte aucune donnée personnelle, à l’exception des informations que l’utilisateur choisit de transmettre volontairement via le formulaire de contact.",
                "Utilisation des données : Les données collectées sont utilisées uniquement pour répondre aux demandes envoyées via le formulaire de contact et ne sont jamais communiquées à des tiers.",
                "Cookies : Ce site utilise uniquement des cookies techniques strictement nécessaires à son bon fonctionnement. Aucun cookie de suivi, publicitaire ou d’analyse n’est utilisé.",
                "Vos droits : Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d’un droit d’accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, vous pouvez contacter : abdoulrh94@gmail.com"
            ]
        },
        {
            title: "CRÉDITS & TECHNOLOGIES",
            content: [
                "Design & Développement : Abdoul-Ahad REHMAN",
                "Technologies utilisées :",
                "• React.js – Bibliothèque JavaScript",
                "• Framer Motion – Animations",
                "• Tailwind CSS – Framework CSS",
                "• Vite – Outil de build",
                "• Vercel – Hébergement et déploiement"
            ]
        },
        {
            title: "LIMITATION DE RESPONSABILITÉ",
            content: [
                "Abdoul-Ahad REHMAN s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, il ne saurait être tenu responsable des erreurs, omissions ou de l’utilisation qui pourrait être faite des informations présentes.",
                "Les liens hypertextes présents sur le site peuvent renvoyer vers des sites externes. Abdoul-Ahad REHMAN décline toute responsabilité quant au contenu de ces sites tiers."
            ]
        },
        {
            title: "DROIT APPLICABLE",
            content: [
                "Le présent site est soumis au droit français.",
                "En cas de litige et à défaut de résolution amiable, les tribunaux français seront compétents."
            ]
        },
        {
            title: "CONTACT",
            content: [
                "Pour toute question concernant les présentes mentions légales ou l’utilisation du site :",
                "Email : abdoulrh94@gmail.com",
                "LinkedIn : https://www.linkedin.com/in/abdoul-ahad-rehman/"
            ]
        }
    ],

    credits: {
        title: "Contenu tiers gratuit et open source",
        intro: "Le site utilise un unique contenu tiers, mis à disposition gratuitement et sous licence open source :",
        items: [
            {
                label: "Modèle 3D",
                text: "", 
                modelName: "Asus ROG Strix Scar 17 (2023) G733 Gaming Laptop",
                modelUrl: "https://sketchfab.com/3d-models/asus-rog-strix-scar-17-2023-g733-gaming-laptop-51eca7b2e5884c4087f3499e523d5184",
                authorName: "RaflyNaHa",
                authorUrl: "https://sketchfab.com/RaflyNaHa",
                license: "Creative Commons Attribution 4.0 (CC BY 4.0)",
                licenseUrl: "https://creativecommons.org/licenses/by/4.0/"
            }
        ]
    }
};