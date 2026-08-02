import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Search, User, ChevronRight, ArrowUpRight, Instagram, Twitter } from 'lucide-react';

const BASE_URL = import.meta.env.BASE_URL;

// ============================================
// CUSTOM HOOKS
// ============================================

const useMagneticEffect = (strength = 0.3) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = (e.clientX - centerX) * strength;
    const distY = (e.clientY - centerY) * strength;
    setPosition({ x: distX, y: distY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return { ref, position, handleMouseMove, handleMouseLeave };
};

const useMediaQuery = (queryString) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(queryString);
    const update = () => setMatches(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [queryString]);

  return matches;
};

// Touch devices have no hover, so anything gated behind it has to be reachable
// another way. 77% of Origin's traffic is mobile â€?see ORIGIN_BRAND.md Â§3.
const useCoarsePointer = () => useMediaQuery('(pointer: coarse)');

// The hover-reveal quick-add only works where the card is wide enough AND
// there's a real cursor. Width alone isn't enough (touch laptops), and pointer
// alone isn't either â€?a narrow window on a desktop would still get the rail
// crushed to ~20px per size. Both have to hold.
const useHoverLayout = () => useMediaQuery('(min-width: 1024px) and (pointer: fine)');

const useScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
};

// Every asset in /images ships narrower companions so phones don't pull
// desktop pixels over SA mobile networks (ORIGIN_BRAND.md Â§11). Widths are
// keyed by filename suffix; '' is the full-size original.
//   responsive(src, { sm: 768, md: 1280, '': 1920 }, '100vw')
// `sizes` must subtract the page gutters â€?describing a gutter-padded image as
// 100vw overstates the slot enough that the browser skips the small variant.
const responsive = (src, widths, sizes) => ({
  srcSet: Object.entries(widths)
    .map(([suffix, width]) => `${suffix ? src.replace(/\.webp$/, `-${suffix}.webp`) : src} ${width}w`)
    .join(', '),
  sizes
});

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

// ============================================
// MAGNETIC BUTTON COMPONENT
// ============================================

const MagneticButton = ({ children, className = '', variant = 'primary', onClick }) => {
  const { ref, position, handleMouseMove, handleMouseLeave } = useMagneticEffect(0.4);
  const isCoarse = useCoarsePointer();
  const springConfig = { stiffness: 150, damping: 15 };
  const x = useSpring(position.x, springConfig);
  const y = useSpring(position.y, springConfig);

  useEffect(() => {
    // A magnetic pull that chases the cursor means nothing to a thumb.
    x.set(isCoarse ? 0 : position.x);
    y.set(isCoarse ? 0 : position.y);
  }, [position, x, y, isCoarse]);

  const baseStyles = "relative overflow-hidden font-medium tracking-[0.15em] uppercase text-xs transition-all duration-300 inline-flex items-center justify-center min-h-[44px]";
  const variants = {
    primary: "bg-[#1C1914] text-[#FDFBF8] hover:bg-black px-8 py-4",
    secondary: "bg-transparent border border-[#1C1914] text-[#1C1914] hover:bg-[#1C1914] hover:text-[#FDFBF8] px-8 py-4",
    ghost: "bg-transparent text-[#1C1914] hover:text-black px-4 py-2"
  };

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onMouseMove={isCoarse ? undefined : handleMouseMove}
      onMouseLeave={isCoarse ? undefined : handleMouseLeave}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ x: '-100%' }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
    </motion.button>
  );
};

// ============================================
// NAVIGATION COMPONENT
// ============================================

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useScrollLock(isMenuOpen);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && setIsMenuOpen(false);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const navItems = ['New Arrivals', 'Womens', 'Mens', 'Collections', 'About'];
  const iconTone = scrolled ? 'text-[#1C1914]' : 'text-white';

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-[#FDFBF8]/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <motion.div
              className="relative z-10"
              whileHover={{ scale: 1.02 }}
            >
              <h1 className={`text-2xl lg:text-3xl font-bold tracking-[0.3em] uppercase ${
                scrolled ? 'text-[#1C1914]' : 'text-white'
              }`}>
                Origin
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-12">
              {navItems.map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  className={`text-xs tracking-[0.15em] uppercase font-medium relative group ${
                    scrolled ? 'text-[#1C1914]' : 'text-white'
                  }`}
                  whileHover={{ y: -2 }}
                >
                  {item}
                  <span className={`absolute -bottom-1 left-0 w-0 h-px ${
                    scrolled ? 'bg-[#1C1914]' : 'bg-white'
                  } group-hover:w-full transition-all duration-300`} />
                </motion.a>
              ))}
            </div>

            {/* Icons â€?44px hit areas per ORIGIN_BRAND.md Â§5 (touch targets) */}
            <div className="flex items-center -mr-3 lg:mr-0 lg:gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                aria-label="Search"
                className={`w-[44px] h-[44px] flex items-center justify-center ${iconTone}`}
              >
                <Search size={20} strokeWidth={1.5} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                aria-label="Account"
                className={`hidden lg:flex w-[44px] h-[44px] items-center justify-center ${iconTone}`}
              >
                <User size={20} strokeWidth={1.5} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                aria-label="Bag, 2 items"
                className={`w-[44px] h-[44px] flex items-center justify-center ${iconTone}`}
              >
                <span className="relative">
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#2440FF] text-white text-[10px] rounded-full flex items-center justify-center">
                    2
                  </span>
                </span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                aria-label="Open menu"
                className={`lg:hidden w-[44px] h-[44px] flex items-center justify-center ${iconTone}`}
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu size={24} strokeWidth={1.5} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1C1914] z-[100] lg:hidden"
          >
            <div className="flex flex-col h-full p-6 overflow-y-auto">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-[0.3em] uppercase text-white">
                  Origin
                </h1>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  className="w-[44px] h-[44px] -mr-3 flex items-center justify-center text-white"
                >
                  <X size={24} />
                </motion.button>
              </div>
              <motion.nav
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-col mt-12"
              >
                {navItems.map((item) => (
                  <motion.a
                    key={item}
                    href="#"
                    variants={fadeInUp}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-3xl font-light text-white tracking-wider py-3"
                  >
                    {item}
                  </motion.a>
                ))}
              </motion.nav>

              {/* Account and support live behind the burger on mobile, so they
                  need somewhere to go once the menu is the only surface. */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="mt-auto pt-10 border-t border-white/15"
              >
                {['Account', 'Track order', 'Size guide', 'Help'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center min-h-[44px] text-sm tracking-[0.15em] uppercase text-white/70 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================
// HERO SECTION
// ============================================

const HeroSection = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  return (
    // svh rather than vh: 100vh sits under the mobile browser chrome and jumps
    // as the address bar collapses.
    <section className="relative h-[100svh] min-h-[560px] overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0"
      >
        <img
          src={`${BASE_URL}images/hero-aw26.webp`}
          {...responsive(`${BASE_URL}images/hero-aw26.webp`, { sm: 768, md: 1280, '': 1920 }, '100vw')}
          alt="Origin â€?South African contemporary fashion"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </motion.div>

      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-7 sm:p-12 lg:p-20 max-w-4xl mx-5 sm:mx-6"
        >
          <motion.div style={{ opacity }}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-white/80 text-xs tracking-[0.3em] uppercase mb-4"
            >
              Autumn / Winter 2026
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold text-white tracking-tight leading-[0.95]"
            >
              MADE IN SA
              <br />
              <span className="font-light">MADE TO LAST</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="text-white/70 mt-8 text-base lg:text-lg font-light max-w-md leading-relaxed"
            >
              Natural fibres, clean silhouettes, honest construction. Contemporary fashion designed in South Africa.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="mt-8 lg:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <MagneticButton variant="primary" className="w-full sm:w-auto">
                Shop New Arrivals <ArrowUpRight size={16} />
              </MagneticButton>
              <MagneticButton variant="secondary" className="w-full sm:w-auto border-white/30 text-white hover:bg-white hover:text-[#1C1914]">
                Our Story
              </MagneticButton>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent"
        />
      </motion.div>
    </section>
  );
};

// ============================================
// MARQUEE COMPONENT
// ============================================

const Marquee = () => {
  const text = "NATURAL FIBRES â€?HONEST CONSTRUCTION â€?DESIGNED IN SOUTH AFRICA â€?FREE SHIPPING ON ORDERS OVER R1,500 â€?NEW SEASON NOW LIVE â€?";

  return (
    <div className="bg-[#1C1914] py-3 lg:py-4 overflow-hidden">
      <motion.div
        // Two identical halves shifted by exactly -50% loop seamlessly at any
        // width. The previous fixed -1920px offset left a gap on phones.
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        className="flex w-max whitespace-nowrap"
      >
        {[...Array(2)].map((_, half) => (
          <div key={half} className="flex" aria-hidden={half === 1}>
            {[...Array(2)].map((_, i) => (
              <span key={i} className="text-[#FDFBF8]/90 text-[11px] lg:text-sm tracking-[0.2em] font-light mx-6 lg:mx-8">
                {text}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// ============================================
// PRODUCT CARD COMPONENT
// ============================================

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

// Sizing opens a sheet, never a dropdown (ORIGIN_BRAND.md Â§7). Sold-out sizes
// stay visible and struck through â€?the brand shows the truth about
// availability rather than hiding it (Â§2, Honesty).
const SizeSheet = ({ product, onClose }) => {
  const [selected, setSelected] = useState(null);

  useScrollLock(Boolean(product));

  useEffect(() => setSelected(null), [product]);

  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1C1914]/50 z-[90]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Choose a size â€?${product.name}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-0 left-0 right-0 z-[95] bg-[#FDFBF8] px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-[#9B8B7A] tracking-[0.15em] uppercase mb-1">{product.category}</p>
                <h3 className="text-lg font-medium text-[#1C1914]">{product.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-base font-medium tabular-nums ${product.originalPrice ? 'text-[#2440FF]' : 'text-[#1C1914]'}`}>
                    R{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-[#9B8B7A] line-through tabular-nums">R{product.originalPrice}</span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-[44px] h-[44px] -mr-3 -mt-2 flex items-center justify-center text-[#1C1914]"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-[#9B8B7A] tracking-[0.15em] uppercase mb-3">Size</p>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {SIZES.map((size) => {
                const soldOut = product.soldOut?.includes(size);
                const isSelected = selected === size;
                return (
                  <button
                    key={size}
                    disabled={soldOut}
                    onClick={() => setSelected(size)}
                    className={`h-12 border text-xs font-medium transition-colors ${
                      soldOut
                        ? 'border-[#E8DFD3] text-[#9B8B7A] line-through cursor-not-allowed'
                        : isSelected
                          ? 'border-[#1C1914] bg-[#1C1914] text-[#FDFBF8]'
                          : 'border-[#E8DFD3] text-[#1C1914]'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <button
              disabled={!selected}
              className="w-full bg-[#1C1914] text-[#FDFBF8] min-h-[52px] text-xs tracking-[0.15em] uppercase font-medium disabled:bg-[#E8DFD3] disabled:text-[#9B8B7A] transition-colors"
            >
              {selected ? 'Add to bag' : 'Select a size'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ProductCard = ({ product, index, onChooseSize }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const hoverLayout = useHoverLayout();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const images = [product.image, product.hoverImage];
  // Wide cursor layouts cross-fade on hover. Everything else steps through the
  // same gallery by swipe or arrow key, with dots always visible to signal it.
  const shown = hoverLayout ? (isHovered ? 1 : 0) : activeImage;

  const step = (delta) =>
    setActiveImage((i) => Math.min(images.length - 1, Math.max(0, i + delta)));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <motion.div
        tabIndex={0}
        role="group"
        aria-label={`${product.name}, image ${shown + 1} of ${images.length}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
        }}
        drag={hoverLayout ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          if (info.offset.x < -40) step(1);
          else if (info.offset.x > 40) step(-1);
        }}
        className="relative aspect-[3/4] overflow-hidden bg-[#F2ECE2] touch-pan-y"
      >
        {images.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            {...responsive(src, { sm: 480, '': 900 }, '(min-width:1024px) 25vw, (min-width:768px) 33vw, calc(50vw - 2rem)')}
            alt={product.name}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ opacity: shown === i ? 1 : 0, scale: hoverLayout && isHovered ? 1.05 : 1 }}
            transition={{ opacity: { duration: 0.4 }, scale: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }}
          />
        ))}

        {/* Quick Add Overlay â€?pointer devices only */}
        {hoverLayout && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: isHovered ? 0 : '100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute bottom-0 left-0 right-0 bg-[#FDFBF8]/95 backdrop-blur-sm p-4"
          >
            <div className="flex gap-2 mb-3">
              {SIZES.map((size) => {
                const soldOut = product.soldOut?.includes(size);
                return (
                  <button
                    key={size}
                    disabled={soldOut}
                    className={`flex-1 h-[44px] border text-xs font-medium transition-all ${
                      soldOut
                        ? 'border-[#E8DFD3] text-[#9B8B7A] line-through cursor-not-allowed'
                        : 'border-[#E8DFD3] text-[#1C1914] hover:border-[#1C1914] hover:bg-[#1C1914] hover:text-[#FDFBF8]'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            <button className="w-full bg-[#1C1914] text-[#FDFBF8] min-h-[44px] text-xs tracking-[0.15em] uppercase font-medium">
              Add to bag
            </button>
          </motion.div>
        )}

        {/* Gallery dots â€?always visible on touch, per Â§7 */}
        {!hoverLayout && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((src, i) => (
              <span
                key={src}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  shown === i ? 'w-5 bg-[#FDFBF8]' : 'w-1.5 bg-[#FDFBF8]/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 lg:top-4 lg:left-4 bg-[#1C1914] text-[#FDFBF8] px-3 py-1 text-[10px] lg:text-xs tracking-wider uppercase rounded-full">
            {product.badge}
          </div>
        )}
      </motion.div>

      {/* Product Info */}
      <div className="mt-3 lg:mt-4">
        <p className="text-[11px] lg:text-xs text-[#9B8B7A] tracking-[0.15em] uppercase mb-1">{product.category}</p>
        <h3 className="text-sm lg:text-base font-medium text-[#1C1914] mb-1.5">{product.name}</h3>
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Sale prices carry signal blue; full prices stay ink (Â§5) */}
          <span className={`text-sm lg:text-base font-medium tabular-nums ${product.originalPrice ? 'text-[#2440FF]' : 'text-[#1C1914]'}`}>
            R{product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs lg:text-sm text-[#9B8B7A] line-through tabular-nums">R{product.originalPrice}</span>
          )}
        </div>

        {!hoverLayout && (
          <button
            onClick={() => onChooseSize(product)}
            className="mt-3 w-full border border-[#1C1914] text-[#1C1914] min-h-[44px] text-[11px] tracking-[0.15em] uppercase font-medium"
          >
            Select size
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// FEATURED CATEGORIES SECTION
// ============================================

const FeaturedCategories = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const categories = [
    {
      title: "WOMENSWEAR",
      subtitle: "Dresses, skirts, structured jackets",
      image: `${BASE_URL}images/category-womenswear.webp`,
      width: 1400,
      size: "large"
    },
    {
      title: "MENSWEAR",
      subtitle: "Overshirts, linen, heavy cotton",
      image: `${BASE_URL}images/category-menswear.webp`,
      width: 1200,
      size: "medium"
    },
    {
      title: "ACCESSORIES",
      subtitle: "The finishing touch",
      image: `${BASE_URL}images/category-accessories.webp`,
      width: 1200,
      size: "medium"
    }
  ];

  return (
    <section ref={ref} className="py-24 lg:py-32 px-6 lg:px-12 max-w-[1800px] mx-auto">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Section Header */}
        <motion.div variants={fadeInUp} className="mb-16">
          <p className="text-xs tracking-[0.3em] text-[#9B8B7A] uppercase mb-4">Curated Selection</p>
          <h2 className="text-4xl lg:text-6xl font-bold text-[#1C1914] tracking-tight">
            SHOP BY
            <br />
            <span className="font-light text-[#1C1914]">CATEGORY</span>
          </h2>
        </motion.div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Large Category */}
          <motion.div
            variants={slideInLeft}
            className="lg:col-span-7 relative group cursor-pointer overflow-hidden"
          >
            <div className="aspect-[4/5] lg:aspect-[4/3]">
              <motion.img
                src={categories[0].image}
                {...responsive(categories[0].image, { sm: 768, '': categories[0].width }, '(min-width:1024px) 58vw, calc(100vw - 3rem)')}
                alt={categories[0].title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white/70 text-xs tracking-[0.2em] uppercase mb-2">{categories[0].subtitle}</p>
                <h3 className="text-3xl lg:text-5xl font-bold text-white tracking-tight">{categories[0].title}</h3>
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  className="h-px bg-white mt-4"
                />
              </div>
            </div>
          </motion.div>

          {/* Stacked Categories */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8">
            {categories.slice(1).map((category, i) => (
              <motion.div
                key={category.title}
                variants={slideInRight}
                className="relative group cursor-pointer overflow-hidden flex-1"
              >
                <div className="aspect-[4/3] lg:aspect-auto lg:h-full">
                  <motion.img
                    src={category.image}
                    {...responsive(category.image, { sm: 768, '': category.width }, '(min-width:1024px) 40vw, calc(100vw - 3rem)')}
                    alt={category.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white/70 text-xs tracking-[0.2em] uppercase mb-1">{category.subtitle}</p>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{category.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// ============================================
// CURATED COLLECTION SECTION
// ============================================

const CuratedCollection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [sizeSheetProduct, setSizeSheetProduct] = useState(null);

  const products = [
    {
      name: "Linen Camp Shirt",
      category: "Mens",
      price: "899",
      image: `${BASE_URL}images/linen-camp-shirt-1.webp`,
      hoverImage: `${BASE_URL}images/linen-camp-shirt-2.webp`,
      badge: "New"
    },
    {
      name: "Structured Blazer",
      category: "Womens",
      price: "1,399",
      originalPrice: "1,799",
      image: `${BASE_URL}images/structured-blazer-1.webp`,
      hoverImage: `${BASE_URL}images/structured-blazer-2.webp`
    },
    {
      name: "Heavy Cotton Tee",
      category: "Mens",
      price: "599",
      image: `${BASE_URL}images/heavy-cotton-tee-1.webp`,
      hoverImage: `${BASE_URL}images/heavy-cotton-tee-2.webp`,
      soldOut: ["XS"]
    },
    {
      name: "Wide-Leg Trouser",
      category: "Womens",
      price: "1,199",
      image: `${BASE_URL}images/wide-leg-trouser-1.webp`,
      hoverImage: `${BASE_URL}images/wide-leg-trouser-2.webp`,
      badge: "Best Seller"
    }
  ];

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-[#FDFBF8]">
      <div className="px-6 lg:px-12 max-w-[1800px] mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div variants={fadeInUp} className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
            <div>
              <p className="text-xs tracking-[0.3em] text-[#9B8B7A] uppercase mb-4">New This Week</p>
              <h2 className="text-4xl lg:text-6xl font-bold text-[#1C1914] tracking-tight">
                THE NEW
                <br />
                <span className="font-light text-[#1C1914]">ARRIVALS</span>
              </h2>
            </div>
            <MagneticButton variant="secondary" className="mt-8 lg:mt-0">
              View All <ChevronRight size={16} />
            </MagneticButton>
          </motion.div>

          {/* Products Grid â€?2 / 3 / 4 columns per ORIGIN_BRAND.md Â§5 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
            {products.map((product, index) => (
              <ProductCard
                key={product.name}
                product={product}
                index={index}
                onChooseSize={setSizeSheetProduct}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <SizeSheet product={sizeSheetProduct} onClose={() => setSizeSheetProduct(null)} />
    </section>
  );
};

// ============================================
// EDITORIAL SECTION
// ============================================

const EditorialSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={ref} className="py-24 lg:py-40 px-6 lg:px-12 max-w-[1800px] mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        {/* Text Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="lg:order-2"
        >
          <motion.p variants={fadeInUp} className="text-xs tracking-[0.3em] text-[#9B8B7A] uppercase mb-6">
            Where everything starts
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl lg:text-6xl font-bold text-[#1C1914] tracking-tight leading-tight mb-8">
            WHAT WE
            <br />
            <span className="font-light">INHERIT</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-[#9B8B7A] text-lg font-light leading-relaxed mb-8">
            Origin began in 2021 as Nanayhaa, after its founder, Abenathi Nanayhaa Mtshiyo. The name changed; the intention did not. Origin is design at its genesis â€?the structure, the craft and the traditions that existed long before any of it was called fashion.
          </motion.p>
          <motion.p variants={fadeInUp} className="text-[#9B8B7A] text-lg font-light leading-relaxed mb-10">
            Every piece carries something inherited: a technique, a proportion, a way of finishing an edge, passed down through generations of South African makers. French seams. Natural fibres. Pre-washed fabrics. Made properly, priced fairly, built to outlast the season.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <MagneticButton>
              Discover Our Story <ArrowUpRight size={16} />
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Image with Parallax */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="lg:order-1 relative"
        >
          <div className="aspect-[4/5] overflow-hidden">
            <motion.img
              style={{ y }}
              src={`${BASE_URL}images/editorial-atelier.webp`}
              {...responsive(`${BASE_URL}images/editorial-atelier.webp`, { sm: 720, '': 1000 }, '(min-width:1024px) 45vw, calc(100vw - 3rem)')}
              alt="Origin studio â€?South African craftsmanship"
              loading="lazy"
              decoding="async"
              className="w-full h-[120%] object-cover"
            />
          </div>
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute -bottom-6 -right-6 lg:bottom-12 lg:-right-12 bg-[#1C1914] text-[#FDFBF8] p-8 lg:p-12"
          >
            <p className="text-5xl lg:text-7xl font-bold">2021</p>
            <p className="text-xs tracking-[0.2em] uppercase mt-2">Founded in<br />South Africa</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================
// NEWSLETTER SECTION
// ============================================

const NewsletterSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState('');

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-[#1C1914]">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="px-6 lg:px-12 max-w-[1800px] mx-auto text-center"
      >
        <motion.p variants={fadeInUp} className="text-xs tracking-[0.3em] text-[#9B8B7A] uppercase mb-6">
          Stay Connected
        </motion.p>
        <motion.h2 variants={fadeInUp} className="text-4xl lg:text-6xl font-bold text-[#FDFBF8] tracking-tight mb-6">
          FROM THE
          <br />
          <span className="font-light">SOURCE</span>
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-white/70 text-lg font-light max-w-lg mx-auto mb-10">
          New collections, editorial stories, and early access. Twice a month at most.
        </motion.p>
        <motion.div variants={fadeInUp} className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-6 py-4 text-sm tracking-wide focus:outline-none focus:border-white/40 transition-colors"
            />
            <MagneticButton className="bg-[#FDFBF8] text-[#1C1914] hover:bg-gray-100">
              Subscribe
            </MagneticButton>
          </div>
          <p className="text-white/40 text-xs mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

// ============================================
// MENSWEAR EDITORIAL SECTION
// ============================================

const MensEditorial = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 lg:py-32 px-6 lg:px-12 max-w-[1800px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          <div className="aspect-[4/5] overflow-hidden bg-[#F2ECE2]">
            <img
              src={`${BASE_URL}images/editorial-menswear.webp`}
              {...responsive(`${BASE_URL}images/editorial-menswear.webp`, { sm: 720, '': 1000 }, '(min-width:1024px) 45vw, calc(100vw - 3rem)')}
              alt="Origin menswear â€?linen overshirt, Autumn / Winter 2026"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.p variants={fadeInUp} className="text-xs tracking-[0.3em] text-[#9B8B7A] uppercase mb-5">
            Menswear
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-4xl lg:text-6xl font-bold text-[#1C1914] tracking-tight leading-tight mb-6">
            THE ONES
            <br />
            <span className="font-light">YOU REACH FOR</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-[#9B8B7A] text-base lg:text-lg font-light leading-relaxed mb-8">
            Overshirts cut with room to move. Linen that softens every time you wash it. Heavy cotton that keeps its shape. The shirt that fits and the trousers that move â€?worn until they are yours.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <MagneticButton className="w-full sm:w-auto">
              Shop Menswear <ArrowUpRight size={16} />
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================
// THE ORIGIN STANDARD
// ============================================

const OriginStandard = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Drawn straight from the values table in ORIGIN_BRAND.md Â§2.
  const standards = [
    {
      title: "Natural fibres",
      body: "Linen, cotton and wool blends. Pre-washed before they reach you, so what you try on is what you keep."
    },
    {
      title: "French seams",
      body: "Finished as carefully inside as out. Turn a piece through and check the construction for yourself."
    },
    {
      title: "Honest availability",
      body: "No countdown timers and no â€œonly two leftâ€? When a size is gone it stays on the page, struck through."
    },
    {
      title: "XS to XL",
      body: "One full size range across womenswear and menswear. Neither is treated as the afterthought."
    }
  ];

  return (
    <section ref={ref} className="py-20 lg:py-28 px-6 lg:px-12 max-w-[1800px] mx-auto">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.p variants={fadeInUp} className="text-xs tracking-[0.3em] text-[#9B8B7A] uppercase mb-12 lg:mb-16">
          The Origin standard
        </motion.p>
        {/* Elevation comes from hairlines and spacing, never shadows (Â§5) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          {standards.map((item) => (
            <motion.div key={item.title} variants={fadeInUp} className="border-t border-[#E8DFD3] pt-6">
              <h3 className="text-base font-medium text-[#1C1914] mb-3">{item.title}</h3>
              <p className="text-[#9B8B7A] text-sm font-light leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

// ============================================
// COMMUNITY / INSTAGRAM
// ============================================

const Community = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const tiles = [
    { src: `${BASE_URL}images/community-1.webp`, alt: "Autumn / Winter 2026, cream linen and warm taupe" },
    { src: `${BASE_URL}images/community-2.webp`, alt: "Hands folding a length of undyed linen" },
    { src: `${BASE_URL}images/community-3.webp`, alt: "Cream linen dress in late afternoon light" },
    { src: `${BASE_URL}images/community-4.webp`, alt: "Finishing a seam in the Origin studio" }
  ];

  return (
    <section ref={ref} className="py-20 lg:py-28 px-6 lg:px-12 max-w-[1800px] mx-auto">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 lg:mb-14">
          <div>
            <p className="text-xs tracking-[0.3em] text-[#9B8B7A] uppercase mb-4">@origin_safrica</p>
            <h2 className="text-4xl lg:text-6xl font-bold text-[#1C1914] tracking-tight">
              IN THE
              <br />
              <span className="font-light">MAKING</span>
            </h2>
          </div>
          <a
            href="https://www.instagram.com/origin_safrica/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 sm:mt-0 inline-flex items-center gap-2 min-h-[44px] text-xs tracking-[0.15em] uppercase font-medium text-[#1C1914] border-b border-[#1C1914] self-start"
          >
            Follow on Instagram <ArrowUpRight size={16} />
          </a>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          {tiles.map((tile) => (
            <motion.a
              key={tile.src}
              href="https://www.instagram.com/origin_safrica/"
              target="_blank"
              rel="noopener noreferrer"
              variants={scaleIn}
              className="relative aspect-square overflow-hidden bg-[#F2ECE2] group"
            >
              <motion.img
                src={tile.src}
                {...responsive(tile.src, { sm: 400, '': 800 }, '(min-width:1024px) 23vw, calc(50vw - 2rem)')}
                alt={tile.alt}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.6 }}
              />
            </motion.a>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

// ============================================
// SIZE GUIDE
// ============================================

// TODO: these are conventional SA apparel measurements standing in until Origin
// supplies its own graded spec â€?confirm every figure before launch.
const SIZE_CHARTS = {
  Womens: {
    columns: ["Bust", "Waist", "Hip"],
    rows: [
      ["XS", 82, 64, 90],
      ["S", 86, 68, 94],
      ["M", 90, 72, 98],
      ["L", 96, 78, 104],
      ["XL", 102, 84, 110]
    ]
  },
  Mens: {
    columns: ["Chest", "Waist", "Sleeve"],
    rows: [
      ["XS", 88, 74, 61],
      ["S", 94, 80, 62],
      ["M", 100, 86, 64],
      ["L", 106, 92, 65],
      ["XL", 112, 98, 67]
    ]
  }
};

const SizeGuide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [range, setRange] = useState("Womens");
  const chart = SIZE_CHARTS[range];

  return (
    <section ref={ref} className="py-20 lg:py-28 px-6 lg:px-12 max-w-[1800px] mx-auto">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="max-w-3xl"
      >
        <motion.p variants={fadeInUp} className="text-xs tracking-[0.3em] text-[#9B8B7A] uppercase mb-4">
          Before you order
        </motion.p>
        <motion.h2 variants={fadeInUp} className="text-4xl lg:text-6xl font-bold text-[#1C1914] tracking-tight mb-6">
          SIZE
          <br />
          <span className="font-light">GUIDE</span>
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-[#9B8B7A] text-base lg:text-lg font-light leading-relaxed mb-10">
          Body measurements in centimetres. Our cuts are relaxed rather than fitted, so measure a piece you already wear and compare.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex gap-2 mb-8">
          {Object.keys(SIZE_CHARTS).map((option) => (
            <button
              key={option}
              onClick={() => setRange(option)}
              aria-pressed={range === option}
              className={`min-h-[44px] px-6 text-xs tracking-[0.15em] uppercase font-medium border transition-colors rounded-full ${
                range === option
                  ? 'bg-[#1C1914] text-[#FDFBF8] border-[#1C1914]'
                  : 'bg-transparent text-[#1C1914] border-[#E8DFD3]'
              }`}
            >
              {option}
            </button>
          ))}
        </motion.div>

        {/* Tables scroll inside their own container so the page never does */}
        <motion.div variants={fadeInUp} className="overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0">
          <table className="w-full min-w-[420px] border-collapse tabular-nums">
            <thead>
              <tr className="border-b border-[#1C1914]">
                <th className="text-left py-3 pr-4 text-[11px] tracking-[0.15em] uppercase font-medium text-[#1C1914]">Size</th>
                {chart.columns.map((column) => (
                  <th key={column} className="text-left py-3 pr-4 text-[11px] tracking-[0.15em] uppercase font-medium text-[#1C1914]">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.rows.map(([size, ...measurements]) => (
                <tr key={size} className="border-b border-[#E8DFD3]">
                  <td className="py-4 pr-4 text-sm font-medium text-[#1C1914]">{size}</td>
                  {measurements.map((value, i) => (
                    <td key={chart.columns[i]} className="py-4 pr-4 text-sm text-[#9B8B7A]">{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </section>
  );
};

// ============================================
// DELIVERY & SUPPORT
// ============================================

const DeliverySupport = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const panels = [
    {
      title: "Delivery",
      body: "Free nationwide delivery on orders over R1,500. Anything below that is calculated at checkout before you pay, with the arrival date shown on your order.",
      action: "Delivery details"
    },
    {
      title: "Returns",
      body: "Unworn pieces can come back to us in their original condition. Start a return from your account and we will send you the collection details.",
      action: "Start a return"
    },
    {
      title: "Help",
      body: "Questions about fit, fabric or an order already on its way? Talk to the people who made the clothes, not a script.",
      action: "Get in touch"
    }
  ];

  return (
    <section ref={ref} className="py-20 lg:py-28 px-6 lg:px-12 max-w-[1800px] mx-auto">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10"
      >
        {panels.map((panel) => (
          <motion.div key={panel.title} variants={fadeInUp} className="border-t border-[#E8DFD3] pt-6">
            <h3 className="text-xl font-medium text-[#1C1914] mb-3">{panel.title}</h3>
            <p className="text-[#9B8B7A] text-sm font-light leading-relaxed mb-5">{panel.body}</p>
            <a
              href="#"
              className="inline-flex items-center gap-2 min-h-[44px] text-xs tracking-[0.15em] uppercase font-medium text-[#1C1914]"
            >
              {panel.action} <ChevronRight size={14} />
            </a>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

// ============================================
// FOOTER COMPONENT
// ============================================

const Footer = () => {
  const footerLinks = {
    Shop: ['New Arrivals', 'Womens', 'Mens', 'Tops', 'Bottoms', 'Accessories'],
    Help: ['Contact Us', 'Shipping Info', 'Returns', 'Size Guide', 'Track Order', 'FAQ'],
    Company: ['About Us', 'Careers', 'Sustainability', 'Press', 'Affiliates', 'Stores']
  };

  return (
    <footer className="bg-[#0d0d0d] text-white py-14 lg:py-24">
      <div className="px-6 lg:px-12 max-w-[1800px] mx-auto">
        {/* Two columns on phones so three link groups don't become one long scroll */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-10 lg:gap-8">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-4">
            <h2 className="text-3xl font-bold tracking-[0.3em] uppercase mb-6">
              Origin
            </h2>
            <p className="text-gray-400 font-light leading-relaxed mb-8 max-w-sm">
              South African contemporary fashion. Natural fibres, clean silhouettes, honest construction. Made in SA. Made to last.
            </p>
            <div className="flex gap-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-12 h-12 border border-gray-700 flex items-center justify-center hover:border-white transition-colors"
              >
                <Instagram size={18} />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-12 h-12 border border-gray-700 flex items-center justify-center hover:border-white transition-colors"
              >
                <Twitter size={18} />
              </motion.a>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="lg:col-span-2">
              <h3 className="text-xs tracking-[0.2em] uppercase mb-3 lg:mb-5 font-medium">{title}</h3>
              <ul>
                {links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 4 }}
                      className="flex items-center min-h-[44px] text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Payment Column */}
          <div className="col-span-2 lg:col-span-2">
            <h3 className="text-xs tracking-[0.2em] uppercase mb-6 font-medium">We Accept</h3>
            <div className="flex flex-wrap gap-2">
              {['Visa', 'MC', 'Amex', 'PayPal'].map((payment) => (
                <div key={payment} className="px-3 py-2 border border-gray-700 text-xs text-gray-400">
                  {payment}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col lg:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            Â© 2026 Origin. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="inline-flex items-center min-h-[44px] text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="inline-flex items-center min-h-[44px] text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="inline-flex items-center min-h-[44px] text-gray-500 hover:text-white text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================

function App() {
  return (
    <div className="min-h-screen bg-[#FDFBF8] font-sans antialiased">
      <Navigation />
      <main>
        <HeroSection />
        <Marquee />
        <FeaturedCategories />
        <CuratedCollection />
        <MensEditorial />
        <EditorialSection />
        <OriginStandard />
        <Community />
        <SizeGuide />
        <DeliverySupport />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
