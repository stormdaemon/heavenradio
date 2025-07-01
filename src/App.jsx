import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, ValidationError } from '@formspree/react';
import './App.css';
import hrLogo from './assets/HR_LOGO.png';
import storesImage from './assets/stores.png';
import baptemecathoImage from './assets/baptemecatho.png';
import missioncathoImage from './assets/missioncatho.png';

// Lazy loading du composant GrilleProgrammes
const GrilleProgrammes = lazy(() => import('./components/GrilleProgrammes'));

function LiveListenersCounter({ children }) {
  const [listenersCount, setListenersCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Générer un nombre aléatoire d'auditeurs entre 30 et 40
    const generateRandomListeners = () => {
      const randomCount = Math.floor(Math.random() * 11) + 30; // 30 à 40
      setListenersCount(randomCount);
      setError(null);
      setLoading(false);
    };

    // Générer le nombre initial
    generateRandomListeners();

    // Actualiser le compteur toutes les 30 secondes avec une nouvelle valeur aléatoire
    const interval = setInterval(generateRandomListeners, 30000);

    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = async () => {
    try {
      if (!audioRef.current) {
        // Récupérer l'URL du stream depuis le fichier M3U
        const m3uResponse = await fetch('https://api.radioking.io/radio/666997/listen.m3u');
        const m3uContent = await m3uResponse.text();
        // Extraire l'URL du stream du contenu M3U
        const streamUrl = m3uContent.split('\n').find(line => line.startsWith('http'));
        
        if (streamUrl) {
          audioRef.current = new Audio(streamUrl.trim());
          audioRef.current.crossOrigin = 'anonymous';
          audioRef.current.preload = 'none';
        } else {
          // Fallback vers l'URL directe
          audioRef.current = new Audio('https://listen.radioking.com/radio/666997/stream/1');
        }
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
      // Essayer avec une URL alternative
      try {
        audioRef.current = new Audio('https://listen.radioking.com/radio/666997/stream/1');
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (fallbackError) {
        console.error('Erreur fallback:', fallbackError);
        setError('Impossible de lire le flux audio');
      }
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="live-listeners-counter"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="listeners-content">
          <div className="listeners-icon">
            <i className="fas fa-circle live-dot"></i>
            <i className="fas fa-users"></i>
          </div>
          <div className="listeners-info">
            <span className="listeners-label">EN LIGNE</span>
            <span className="listeners-count">...</span>
          </div>
          <motion.button 
            className="play-button"
            onClick={handlePlayPause}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={loading}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </motion.button>
        </div>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="live-listeners-counter"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="listeners-content">
          <div className="listeners-icon">
            <motion.i 
              className="fas fa-circle live-dot"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.i>
            <i className="fas fa-users"></i>
          </div>
          <div className="listeners-info">
            <span className="listeners-label">EN LIGNE</span>
            <motion.span 
              className="listeners-count"
              key={listenersCount}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error ? '0' : listenersCount}
            </motion.span>
          </div>
          <motion.button 
            className="play-button"
            onClick={handlePlayPause}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </motion.button>
        </div>
      {children}
    </motion.div>
  );
}

function NextTrack() {
  const [trackData, setTrackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.radioking.io/widget/radio/heavenradio/track/ckoi?limit=2');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        const data = await response.json();
        setTrackData(data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setTrackData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackData();
    const interval = setInterval(fetchTrackData, 30000); // Actualise toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="next-track-widget">
        <div className="track-loading">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="next-track-widget">
        <div className="track-error">
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  if (!trackData || trackData.length === 0) {
    return (
      <div className="next-track-widget">
        <div className="track-info">
          <p>Aucune information disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="next-track-widget">
      <div className="track-info">
        <div className="track-header">
          <h4>Prochains titres</h4>
        </div>
        <div className="tracks-grid">
          {trackData.map((track, index) => (
            <div key={index} className="track-details">
              <div className="track-title">{track.title}</div>
              {track.artist && <div className="track-artist">{track.artist}</div>}
              {track.album && <div className="track-album">{track.album}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactForm() {
  const [state, handleSubmit] = useForm("mqabdbpj");
  if (state.succeeded) {
      return <p className="form-success">Merci pour votre message !</p>;
  }
  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="prenom">Prénom</label>
          <input id="prenom" type="text" name="prenom" required />
        </div>
        <div className="form-field">
          <label htmlFor="nom">Nom</label>
          <input id="nom" type="text" name="nom" required />
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" name="email" required />
        <ValidationError prefix="Email" field="email" errors={state.errors} className="form-error" />
      </div>
      <div className="form-field">
        <label htmlFor="message">Commentaires ou message</label>
        <textarea id="message" name="message" rows="5" required></textarea>
        <ValidationError prefix="Message" field="message" errors={state.errors} className="form-error" />
      </div>
      <button type="submit" disabled={state.submitting} className="btn-primary">
        Envoyer
      </button>
    </form>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('accueil');
  const [showDonationPopup, setShowDonationPopup] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const playerRef = useRef(null);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Heaven Radio - Radio Catholique',
      text: 'Découvrez Heaven Radio, la radio catholique qui vous accompagne dans votre foi !',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
        await navigator.clipboard.writeText(window.location.href);
        alert('Lien copié dans le presse-papiers !');
      }
    } catch (error) {
      console.log('Erreur lors du partage:', error);
      // Fallback: copier dans le presse-papiers
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Lien copié dans le presse-papiers !');
      } catch (clipboardError) {
        console.log('Erreur lors de la copie:', clipboardError);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleInteraction);
    window.addEventListener('scroll', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [hasInteracted]);

  // Load RadioKing widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.radioking.io/next-track/build/script.min.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Détecter l'acceptation des cookies Twitch et ajuster la taille du chat
  useEffect(() => {
    const checkTwitchCookies = () => {
      const twitchContent = document.querySelector('.twitch-content');
      const chatIframe = document.querySelector('.chat-container iframe');
      
      if (chatIframe && twitchContent) {
        // Observer les changements dans l'iframe du chat
        const observer = new MutationObserver(() => {
          try {
            // Vérifier si les cookies ont été acceptés en regardant la hauteur de l'iframe
            const iframeHeight = chatIframe.offsetHeight;
            if (iframeHeight > 100) {
              twitchContent.classList.add('cookies-accepted');
            }
          } catch (error) {
            // Ignorer les erreurs de cross-origin
          }
        });
        
        observer.observe(chatIframe, {
          attributes: true,
          attributeFilter: ['style', 'height']
        });
        
        return () => observer.disconnect();
      }
    };
    
    // Attendre que les éléments soient chargés
    const timer = setTimeout(checkTwitchCookies, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Show donation popup after 12 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDonationPopup(true);
    }, 12000);

    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { name: 'ACCUEIL', href: '#accueil', id: 'accueil' },
    { name: 'ÉCOUTER', href: '#ecouter', id: 'ecouter' },
    { name: 'GRILLE', href: '#grille', id: 'grille' },
    { name: 'COMMUNAUTÉ', href: '#communaute', id: 'communaute' },
    { name: 'TWITCH', href: '#twitch', id: 'twitch' },
    { name: 'PARTENAIRES', href: '#partenaires', id: 'partenaires' },
    { name: 'CONTACT', href: '#contact', id: 'contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      const sections = navItems.map(item => item.id);
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href, id) => {
    setActiveSection(id);
    setIsMenuOpen(false);
    
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const menuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  return (
    <div className="app">
      {/* Navigation */}
      <motion.nav 
        className={`navbar ${scrollY > 50 ? 'navbar-scrolled' : ''}`}
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="nav-container">
          <motion.div 
            className="nav-logo"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={() => handleNavClick('#accueil', 'accueil')}
            style={{ cursor: 'pointer' }}
          >
            <motion.img 
              src={hrLogo} 
              alt="Heaven Radio"
              whileHover={{ filter: "drop-shadow(0 0 20px #d4af37)" }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          
          <div className="nav-right">
            <div className="nav-links">
              {navItems.map((item, index) => (
                <motion.a 
                  key={item.id}
                  href={item.href}
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href, item.id);
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -2,
                    textShadow: "0 0 15px #d4af37"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  {item.name}
                  {activeSection === item.id && (
                    <motion.div
                      className="nav-active-indicator"
                      layoutId="activeIndicator"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.a>
              ))}
            </div>
            
            <LiveListenersCounter>
              <motion.button 
                className="mobile-menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.span
                  animate={{ 
                    rotate: isMenuOpen ? 45 : 0, 
                    y: isMenuOpen ? 8 : 0,
                    backgroundColor: isMenuOpen ? '#d4af37' : '#fff'
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  animate={{ 
                    opacity: isMenuOpen ? 0 : 1,
                    backgroundColor: isMenuOpen ? '#d4af37' : '#fff'
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  animate={{ 
                    rotate: isMenuOpen ? -45 : 0, 
                    y: isMenuOpen ? -8 : 0,
                    backgroundColor: isMenuOpen ? '#d4af37' : '#fff'
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </LiveListenersCounter>
          </div>
          

        </div>
        
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="mobile-menu"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {navItems.map((item, index) => (
                <motion.a 
                  key={item.id}
                  href={item.href}
                  className={`mobile-nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href, item.id);
                  }}
                  initial={{ opacity: 0, x: -30, rotateY: -90 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: -30, rotateY: -90 }}
                  transition={{ 
                    delay: index * 0.1, 
                    duration: 0.4,
                    type: "spring",
                    stiffness: 300
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    x: 10,
                    color: "#d4af37",
                    textShadow: "0 0 15px #d4af37"
                  }}
                >
                  {item.name}
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section id="accueil" className="hero-section">
        <div className="hero-background">
          <motion.div 
            className="hero-particles"
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          ></motion.div>
        </div>
        
        <div className="hero-content">
          <div className="hero-columns">
            {/* Colonne gauche - Contenu */}
            <motion.div 
              className="hero-left-column"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <motion.div 
                className="hero-text"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              >
                <h1>
                  <span className="hero-title-full">La radio Catholique et<br />100% LOUANGE ET ADORATION</span>
                  <span className="hero-title-compact">Radio Catholique</span>
                  <span className="hero-title-mobile">100% LOUANGE<br />ET ADORATION</span>
                  <span className="hero-title-compact">100% LOUANGE ET ADORATION</span>
                </h1>
                
                <motion.div 
                  className="coming-soon-banner"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <span className="coming-soon-text">Bientôt dispo sur</span>
                  <img src={storesImage} alt="App Stores" className="stores-image" />
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="hero-actions"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="hero-buttons">
                  <motion.button 
                    className="btn-primary"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 20px 40px rgba(255, 215, 0, 0.4)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => handleNavClick('#ecouter', 'ecouter')}
                  >
                    <span>ÉCOUTER</span>
                    <div className="btn-glow"></div>
                  </motion.button>

                  <motion.a 
                    href="https://www.paypal.com/paypalme/revelationradio?country.x=FR&locale.x=fr_FR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="donation-cta-button"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(220, 53, 69, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="fas fa-heart"></i>
                    SOUTENIR
                  </motion.a>
                </div>
                
                <motion.div 
                  className="logo-showcase"
                  initial={{ opacity: 0, rotate: -10 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  onClick={() => handleNavClick('#twitch', 'twitch')}
                  style={{ cursor: 'pointer' }}
                  title="Cliquez sur le bouton HR pour rejoindre le tchat"
                >
                  <img src={hrLogo} alt="Heaven Radio" className="hero-logo" />
                  <div className="logo-ring"></div>
                  <div className="tooltip-text">Cliquez sur le bouton HR<br />pour rejoindre le tchat</div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Colonne droite - Mockup iPhone */}
            <motion.div 
              className="hero-right-column"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            >
              <div className="iphone-mockup">
                <div className="iphone-frame">
                  <div className="iphone-notch"></div>
                  <div className="iphone-screen">
                    <video 
                      className="iphone-video"
                      autoPlay 
                      muted 
                      loop 
                      playsInline
                    >
                      <source src="/heaven_video.mp4" type="video/mp4" />
                    </video>
                  </div>
                  <div className="iphone-home-indicator"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div 
            className="scroll-arrow"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* Live Section */}
       <section id="ecouter" className="live-section">
         <div className="live-container">
           <motion.div 
             className="live-header"
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
           >
             <h2>En direct</h2>
             <p>Écoutez Heaven Radio en direct et rejoignez notre communauté</p>
           </motion.div>
           
           <div className="live-content">
             <motion.div 
               className="radio-section"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               viewport={{ once: true }}
             >
               <div className="radio-player-container">
                   <iframe
                     ref={playerRef}
                     src="https://player.radioking.io/heavenradio/?c=%23E2BA21&c2=%232F3542&f=h&i=0&p=0&s=0&li=0&popup=0&plc=0&h=undefined&l=470&v=2"
                     style={{borderRadius: '20px', width: '100%', height: '100%'}}
                     frameBorder="0"
                     allow="autoplay; encrypted-media"
                     title="Heaven Radio Player"
                   ></iframe>
                   <script type="text/javascript" src="https://player.radioking.io/scripts/iframe.bundle.js"></script>
                 
                 <NextTrack />
               </div>
             </motion.div>
           </div>
         </div>
       </section>

      {/* Grille Section */}
      <section id="grille" className="grille-section">
        <div className="grille-container">
          <motion.div 
            className="grille-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Grille des programmes</h2>
          </motion.div>
          <Suspense fallback={
            <motion.div 
              className="grille-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '200px',
                color: '#d4af37'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '3px solid #d4af37', 
                    borderTop: '3px solid transparent', 
                    borderRadius: '50%',
                    margin: '0 auto 10px'
                  }}
                />
                <p>Chargement de la grille des programmes...</p>
              </div>
            </motion.div>
          }>
            <GrilleProgrammes />
          </Suspense>
        </div>
      </section>
       
       {/* Community Section */}
       <section id="communaute" className="community-section">
         <div className="community-container">
           <motion.div 
             className="community-header"
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
           >
             <h2>Rejoignez notre communauté</h2>
             <p>Échangez avec d'autres passionnés de louange et d'adoration dans un environnement respectueux et bienveillant</p>
           </motion.div>
           
           <div className="community-content">
             <motion.div 
               className="discord-section"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.3 }}
               viewport={{ once: true }}
             >
               <div className="discord-widget">
                 <iframe
                   src="https://discord.com/widget?id=1261798845235593409&theme=dark"
                   width="100%"
                   height="400"
                   allowTransparency="true"
                   frameBorder="0"
                   sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                 ></iframe>
               </div>
             </motion.div>
           </div>
         </div>
       </section>

      {/* Twitch Section */}
      <section id="twitch" className="twitch-section">
        <div className="twitch-container">
          <motion.div 
            className="twitch-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Stream en direct</h2>
            <p>Regardez nos émissions en direct sur Twitch et participez au chat</p>
          </motion.div>
          
          <div className="twitch-content">
            <motion.div 
              className="twitch-stream"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="stream-player">
                <iframe
                  src="https://player.twitch.tv/?channel=heavenradiocatholique&parent=heavenradio.fr&muted=false"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  scrolling="no"
                  title="Heaven Radio Twitch Stream"
                ></iframe>
              </div>
            </motion.div>
            
            <motion.div 
              className="twitch-chat"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="chat-container">
                <iframe
                  src="https://www.twitch.tv/embed/heavenradiocatholique/chat?parent=heavenradio.fr"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  title="Heaven Radio Twitch Chat"
                ></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partenaires" className="partners-section">
        <div className="partners-container">
          <motion.div 
            className="partners-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Nos Partenaires</h2>
            <p>Découvrez nos partenaires qui partagent notre mission d'évangélisation</p>
          </motion.div>
          
          <div className="partners-content">
            <motion.div 
              className="partners-grid"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.a 
                href="https://lebaptemecatholique.fr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="partner-card"
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="partner-image">
                  <img src={baptemecathoImage} alt="Le Baptême Catholique" />
                </div>
                <div className="partner-info">
                  <h3>Le Baptême Catholique</h3>
                  <p>Préparation et accompagnement spirituel pour le sacrement du baptême</p>
                  <span className="partner-link">Visiter le site <i className="fas fa-external-link-alt"></i></span>
                </div>
              </motion.a>
              
              <motion.a 
                href="https://www.lamissioncatholique.fr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="partner-card"
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="partner-image">
                  <img src={missioncathoImage} alt="La Mission Catholique" />
                </div>
                <div className="partner-info">
                  <h3>La Mission Catholique</h3>
                  <p>Dépliants missionnaires et outils pour l'évangélisation en paroisse</p>
                  <span className="partner-link">Visiter le site <i className="fas fa-external-link-alt"></i></span>
                </div>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="contact-container">
          <motion.div 
            className="contact-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Contactez-nous</h2>
            <p>Une idée de titre, une intention de prière, un témoignage, envoie nous un mail</p>
          </motion.div>
          <motion.div
            className="contact-form-wrapper"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </section>

       {/* Footer */}
       <footer className="footer">
         <div className="footer-content">
           <motion.div 
             className="footer-main"
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
           >
             <div className="footer-brand">
               <img src={hrLogo} alt="Heaven Radio" className="footer-logo" />
               <h3>Heaven Radio</h3>
               <p>La radio Catholique<br />100% louange et adoration</p>
               <p className="partnership">En partenariat avec <a href="https://www.lamissioncatholique.fr" target="_blank" rel="noopener noreferrer">www.lamissioncatholique.fr</a></p>
             </div>
             
             <div className="footer-links">
               <div className="footer-column">
                 <h4>Navigation</h4>
                 <ul>
                   <li><a href="#accueil">Accueil</a></li>
                   <li><a href="#ecouter">Écouter</a></li>
                   <li><a href="#communaute">Communauté</a></li>
                   <li><a href="#apropos">À propos</a></li>
                 </ul>
               </div>
               
               <div className="footer-column">
                 <h4>Suivez-nous</h4>
                 <ul>
                   <li><a href="https://discord.com/invite/NNTR3NzPXk" target="_blank" rel="noopener noreferrer"><i className="fab fa-discord"></i> Discord</a></li>
                   <li><a href="https://www.twitch.tv/heavenradiocatholique" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitch"></i> Twitch</a></li>
                   <li><a href="https://www.youtube.com/@heavenradiocatholique" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i> YouTube</a></li>
                   <li><a href="https://www.facebook.com/heavenradiocatholique" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i> Facebook</a></li>
                   <li><a href="https://www.instagram.com/heavenradio.fr/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i> Instagram</a></li>
                   <li><a href="https://www.tiktok.com/@heavenradiocatholique" target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i> TikTok</a></li>
                 </ul>
               </div>
               
               <div className="footer-column">
                 <h4>Contact</h4>
                 <ul>
                   <li><a href="mailto:catholicloungemusic@gmail.com"><i className="fas fa-envelope"></i> catholicloungemusic@gmail.com</a></li>
                   <li><a href="#">Partenariats</a></li>
                   <li><a href="#">Mentions légales</a></li>
                 </ul>
               </div>
             </div>
           </motion.div>
         </div>
         
         <div className="footer-bottom">
           <div className="footer-bottom-content">
             <div className="footer-bottom-left">
               <p>&copy; 2024 Heaven Radio. Tous droits réservés.</p>
               <p className="developer-credit">Développé avec <i className="fas fa-heart" style={{color: '#d4af37'}}></i> par Théo Lafont</p>
             </div>
             <div className="footer-social">
               <motion.a 
                 href="https://discord.com/invite/NNTR3NzPXk" 
                 target="_blank"
                 rel="noopener noreferrer"
                 whileHover={{ scale: 1.2, rotate: 5 }}
                 transition={{ type: "spring", stiffness: 300 }}
               >
                 <i className="fab fa-discord"></i>
               </motion.a>
               <motion.a 
                 href="https://www.facebook.com/heavenradiocatholique" 
                 target="_blank"
                 rel="noopener noreferrer"
                 whileHover={{ scale: 1.2, rotate: -5 }}
                 transition={{ type: "spring", stiffness: 300 }}
               >
                 <i className="fab fa-facebook"></i>
               </motion.a>
               <motion.a 
                 href="https://www.instagram.com/heavenradio.fr/" 
                 target="_blank"
                 rel="noopener noreferrer"
                 whileHover={{ scale: 1.2, rotate: 5 }}
                 transition={{ type: "spring", stiffness: 300 }}
               >
                 <i className="fab fa-instagram"></i>
               </motion.a>
               <motion.a 
                 href="https://www.tiktok.com/@heavenradiocatholique" 
                 target="_blank"
                 rel="noopener noreferrer"
                 whileHover={{ scale: 1.2, rotate: -5 }}
                 transition={{ type: "spring", stiffness: 300 }}
               >
                 <i className="fab fa-tiktok"></i>
               </motion.a>
               <motion.a 
                 href="https://www.youtube.com/@heavenradiocatholique" 
                 target="_blank"
                 rel="noopener noreferrer"
                 whileHover={{ scale: 1.2, rotate: 5 }}
                 transition={{ type: "spring", stiffness: 300 }}
               >
                 <i className="fab fa-youtube"></i>
               </motion.a>
               <motion.a 
                 href="https://www.twitch.tv/heavenradiocatholique" 
                 target="_blank"
                 rel="noopener noreferrer"
                 whileHover={{ scale: 1.2, rotate: -5 }}
                 transition={{ type: "spring", stiffness: 300 }}
               >
                 <i className="fab fa-twitch"></i>
               </motion.a>
             </div>
           </div>
         </div>
       </footer>

       {/* Menu flottant des réseaux sociaux */}
       <div className="floating-social-menu">
         <motion.div 
           className="social-menu-items"
           initial={{ opacity: 0, x: 50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ type: "spring", stiffness: 300, damping: 20 }}
         >
           <motion.a 
             href="https://discord.com/invite/NNTR3NzPXk" 
             target="_blank"
             rel="noopener noreferrer"
             className="social-item discord"
             whileHover={{ scale: 1.1, x: -5 }}
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
           >
             <i className="fab fa-discord"></i>
           </motion.a>
           
           <motion.a 
             href="https://www.facebook.com/heavenradiocatholique" 
             target="_blank"
             rel="noopener noreferrer"
             className="social-item facebook"
             whileHover={{ scale: 1.1, x: -5 }}
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
           >
             <i className="fab fa-facebook"></i>
           </motion.a>
           
           <motion.a 
             href="https://www.instagram.com/heavenradio.fr/" 
             target="_blank"
             rel="noopener noreferrer"
             className="social-item instagram"
             whileHover={{ scale: 1.1, x: -5 }}
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
           >
             <i className="fab fa-instagram"></i>
           </motion.a>
           
           <motion.a 
             href="https://www.tiktok.com/@heavenradiocatholique" 
             target="_blank"
             rel="noopener noreferrer"
             className="social-item tiktok"
             whileHover={{ scale: 1.1, x: -5 }}
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.4 }}
           >
             <i className="fab fa-tiktok"></i>
           </motion.a>
           
           <motion.a 
             href="https://www.youtube.com/@heavenradiocatholique" 
             target="_blank"
             rel="noopener noreferrer"
             className="social-item youtube"
             whileHover={{ scale: 1.1, x: -5 }}
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.5 }}
           >
             <i className="fab fa-youtube"></i>
           </motion.a>
           
           <motion.a 
             href="https://www.twitch.tv/heavenradiocatholique" 
             target="_blank"
             rel="noopener noreferrer"
             className="social-item twitch"
             whileHover={{ scale: 1.1, x: -5 }}
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.6 }}
           >
             <i className="fab fa-twitch"></i>
           </motion.a>
           
           <motion.button 
             onClick={handleShare}
             className="social-item share"
             whileHover={{ scale: 1.1, x: -5 }}
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.7 }}
             title="Partager Heaven Radio"
           >
             <i className="fas fa-share-alt"></i>
           </motion.button>
         </motion.div>
       </div>

       {/* Popup de don */}
       <AnimatePresence>
         {showDonationPopup && (
           <motion.div 
             className="donation-popup-overlay"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.3 }}
           >
             <motion.div 
               className="donation-popup"
               initial={{ opacity: 0, scale: 0.8, y: 50 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.8, y: 50 }}
               transition={{ type: "spring", stiffness: 300, damping: 20 }}
             >
               <button 
                 className="popup-close"
                 onClick={() => setShowDonationPopup(false)}
               >
                 <i className="fas fa-times"></i>
               </button>
               
               <div className="popup-content">
                 <div className="popup-icon">
                   <i className="fas fa-heart"></i>
                 </div>
                 <h3>Soutenez Heaven Radio</h3>
                 <p>Votre générosité nous aide à continuer notre mission de diffuser la parole divine et d'accompagner les âmes dans leur cheminement spirituel.</p>
                 
                 <motion.a 
                   href="https://www.paypal.com/paypalme/revelationradio?country.x=FR&locale.x=fr_FR"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="donation-btn"
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   <i className="fab fa-paypal"></i>
                   Faire un don
                 </motion.a>
                 
                 <p className="popup-subtitle">Merci pour votre soutien 🙏</p>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
       

    </div>
   );
 }

export default App;
