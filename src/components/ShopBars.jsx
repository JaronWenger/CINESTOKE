import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import useScrollReveal from '../hooks/useScrollReveal';
import SlideColor from './SlideColor';
import ContactV2 from './ContactV2';
import IPhoneDisplay from './IPhoneDisplay';
import cinestokesite from '../assets/cinestokesite.webp';
import powergradePng from '../assets/SHOP/POWERGRADE.webp';
import sfxV1Cover from '../assets/SHOP/SFXv1.webp';
import sfxV2Cover from '../assets/SHOP/SFXv2.webp';
import lutsCover from '../assets/SHOP/LUTS.webp';
import overlayCover from '../assets/SHOP/OVERLAYS.webp';
import iphoneCinestokeScreenshot from '../assets/iphonecinestoke.webp';
import smallWorldColorVideo from '../assets/CASESTUDIES/SmallWorldcolor.mp4';
import smallWorldRawVideo from '../assets/CASESTUDIES/SmallWorldraw.mp4';
import seadooColorVideo from '../assets/CASESTUDIES/Seadoocolor.mp4';
import seadooRawVideo from '../assets/CASESTUDIES/Seadooraw.mp4';
import BGColorVideo from '../assets/CASESTUDIES/BGcolor.mp4';
import BGRawVideo from '../assets/CASESTUDIES/BGraw.mp4';

const SEARCH_ITEMS = [
  { title: 'Sound FX', section: 'assets' },
  { title: 'Overlays', section: 'assets' },
  { title: 'Assets', section: 'assets' },
  { title: 'De Drago Color Grade', section: 'grades' },
  { title: 'Glass Color Grade', section: 'grades' },
  { title: 'Champagne Pow Color Grade', section: 'grades' },
  { title: 'Portfolio Website Template', section: 'template' },
];

const TABS = [
  { id: 'assets', label: 'VIDEO ASSETS' },
  { id: 'grades', label: 'POWER GRADES' },
  { id: 'template', label: 'WEBSITE TEMPLATE' },
];

const ALL_REVIEWS = [
  { name: 'Tyler M.',   rating: 5, date: 'Jun 10, 2026', text: 'Exactly what I needed for my action edits. The whooshes and impacts are cinematic without being over the top. Been using them in every project since.', productId: 'sound-fx',         productTitle: 'Sound FX Pack' },
  { name: 'Kayla R.',   rating: 5, date: 'Jun 2, 2026',  text: 'Clean, organized, and actually useful. Most SFX packs are bloated — this one is curated. Every sound has a place.',                                         productId: 'sound-fx',         productTitle: 'Sound FX Pack' },
  { name: 'Marcus D.',  rating: 5, date: 'Jun 15, 2026', text: 'The film grain alone is worth it. Subtle and real — not the fake digital grain you get from plugins. My footage looks 10x more cinematic.',                  productId: 'overlays',         productTitle: 'Cinematic Overlays' },
  { name: 'Sophia L.',  rating: 5, date: 'Jun 5, 2026',  text: 'Light leaks are gorgeous. Dropped them onto a snowboard edit and it completely changed the vibe. Highly recommend.',                                         productId: 'overlays',         productTitle: 'Cinematic Overlays' },
{ name: 'Ryan S.',    rating: 5, date: 'Jun 16, 2026', text: 'These are the real deal. One click and my footage went from flat to cinematic. The Powergrades especially — I use them on every project now.',               productId: 'luts-powergrades', productTitle: 'Cinestoke LUTs + Powergrades' },
  { name: 'Mia T.',     rating: 5, date: 'Jun 8, 2026',  text: "I've tried a lot of LUT packs and most feel generic. These actually have a personality to them. Highly recommend for anyone shooting on Sony.",               productId: 'luts-powergrades', productTitle: 'Cinestoke LUTs + Powergrades' },
];

const Stars = ({ count = 5 }) => (
  <span style={{ color: '#fff', fontSize: '14px', letterSpacing: '2px' }}>
    {'★'.repeat(count)}{'☆'.repeat(5 - count)}
  </span>
);

const ReviewsSection = ({ currentProductId, onProductClick }) => {
  const [showAll, setShowAll] = React.useState(false);
  const sortReviews = (reviews) =>
    [...reviews].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.date) - new Date(a.date);
    });
  const sorted = [
    ...sortReviews(ALL_REVIEWS.filter(r => r.productId === currentProductId)),
    ...sortReviews(ALL_REVIEWS.filter(r => r.productId !== currentProductId)),
  ];
  const visible = showAll ? sorted : sorted.slice(0, 5);
  const inter = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '48px' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '40px', letterSpacing: '3px', color: '#fff', margin: 0 }}>Reviews</h3>
        <a
          href={`mailto:jarongwenger@gmail.com?subject=Review&body=Product: \nMy review:`}
          className="shop-write-review"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '14px', letterSpacing: '3px', color: '#000', backgroundColor: '#fff', padding: '12px 24px', textDecoration: 'none', transition: 'opacity 0.2s ease', whiteSpace: 'nowrap', marginTop: '6px' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >WRITE A REVIEW</a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Stars count={5} />
        <span style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.55)', letterSpacing: 0 }}>5.0 Average store rating</span>
      </div>
      <p style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.55)', letterSpacing: 0, margin: '0 0 24px' }}>{ALL_REVIEWS.length} store reviews</p>

      {visible.map((review, i) => (
        <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px 0', display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '90px 1fr' : '160px 1fr', gap: window.innerWidth <= 768 ? '16px' : '32px' }}>
          <div>
            <p style={{ fontFamily: inter, fontSize: '13px', fontWeight: 600, color: '#fff', margin: '0 0 4px', letterSpacing: 0 }}>{review.name}</p>
            <p style={{ fontFamily: inter, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: 0 }}>{review.date}</p>
          </div>
          <div>
            <Stars count={review.rating} />
            <p style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, margin: '8px 0 12px', letterSpacing: 0, fontWeight: 400 }}>{review.text}</p>
            <button
              onClick={() => onProductClick(review.productId)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <div style={{ width: '28px', aspectRatio: '3/4', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0, overflow: 'hidden' }}>
                {(() => { const p = ALL_PRODUCTS.find(p => p.id === review.productId); return p?.cover ? <img src={p.cover} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : p?.icon; })()}
              </div>
              <span style={{ fontFamily: inter, fontSize: '13px', color: 'rgba(255,255,255,0.6)', letterSpacing: 0, textDecoration: 'underline', textUnderlineOffset: '3px' }}>{review.productTitle}</span>
            </button>
          </div>
        </div>
      ))}

      {sorted.length > 5 && !showAll && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', paddingBottom: '24px', textAlign: 'center' }}>
          <button
            onClick={() => setShowAll(true)}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', cursor: 'pointer', fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '14px', letterSpacing: '3px', padding: '12px 28px', transition: 'border-color 0.2s ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
          >SHOW MORE ({sorted.length - 5} MORE)</button>
        </div>
      )}
    </div>
  );
};

const ASSETS = [
  {
    id: 'sound-fx',
    slug: 'sfxv2',
    title: 'Cinestoke SFX Vol. 2',
    price: '$25.00',
    checkoutUrl: 'https://buy.polar.sh/polar_cl_Em1ji718nKqtFulUylD5nm6SGRKHitNLKmxyE4RaT7r',
    tagline: 'Cinematic sound effects for your edits',
    paragraphs: [
      'Everything I use to make my edits hit. 200+ cinematic sound effects pulled from real productions — whooshes, impacts, atmospheres, risers, and transitions. Every single one has been used in a real client project.',
      'This pack will instantly elevate the feel of your videos. Lay these under your cuts and your edits will feel 10x more cinematic with almost no extra effort.',
    ],
    includes: [
      'ZIP (340MB)',
    ],
    icon: '🎧',
    cover: sfxV2Cover,
  },
  {
    id: 'overlays',
    slug: 'ovrly',
    title: 'Cinestoke Overlays Pack',
    price: '$20.00',
    tagline: 'Film grain, light leaks & texture overlays',
    paragraphs: [
      'Add instant cinematic texture to any footage. Film grain, lens flares, light leaks, and dust overlays — sourced from real analog equipment and film stock. These are the exact overlays I drop on top of client work.',
      'Works in any NLE on any OS. Just drag, drop, and set the blend mode to Screen or Overlay.',
    ],
    includes: [
      'ZIP (1.2GB)',
    ],
    icon: '🎞️',
    cover: overlayCover,
  },
  {
    id: 'sound-fx-1',
    slug: 'sfxv1',
    title: 'Cinestoke SFX Vol. 1',
    price: '$15.00',
    tagline: 'Cinematic sound effects for your edits',
    paragraphs: [
      'Everything I use to make my edits hit. 200+ cinematic sound effects pulled from real productions — whooshes, impacts, atmospheres, risers, and transitions. Every single one has been used in a real client project.',
      'This pack will instantly elevate the feel of your videos. Lay these under your cuts and your edits will feel 10x more cinematic with almost no extra effort.',
    ],
    includes: [
      'ZIP (340MB)',
    ],
    icon: '🎧',
    cover: sfxV1Cover,
  },
];

const GRADES = [
  { id: 'de-drago', title: 'De Drago', videoColor: smallWorldColorVideo, videoRaw: smallWorldRawVideo },
  { id: 'glass', title: 'Glass', videoColor: seadooColorVideo, videoRaw: seadooRawVideo },
  { id: 'champagne-pow', title: 'Champagne Pow', videoColor: BGColorVideo, videoRaw: BGRawVideo },
];

const GRADE_PACK = {
  id: 'luts-powergrades',
  slug: 'lutpg',
  title: 'Cinestoke LUTs + Powergrades',
  price: '$35.00',
  icon: '🎨',
  paragraphs: [
    'In this pack you will receive all my specially designed LUTs and my easy "One Click" Powergrades to enhance your videos to look straight out of a movie! Color grading can be hard for many, but these assets are simple and highly effective on your raw footage!',
    'Includes 4 Powergrades: a clean Base grade with no exposure adjustments, plus De Drago, Glass, and Champagne Pow. These LUTs and Powergrades work best in DaVinci Resolve, but can be used in other software as well.',
  ],
  includes: ['ZIP (94MB)', 'ZIP (82MB)'],
  cover: lutsCover,
};

const ALL_PRODUCTS = [
  ...ASSETS,
  { id: 'luts-powergrades', title: 'Cinestoke LUTs + Powergrades', icon: '🎨', cover: lutsCover },
];

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.7)',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.2s ease',
};

const ShopBars = ({ onToggleLightMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();

  const getInitialState = () => {
    if (productId === 'tmplt') return { tab: 'template', product: null, grade: null };
    if (productId === GRADE_PACK.slug) return { tab: 'grades', product: null, grade: GRADE_PACK };
    const asset = ASSETS.find(a => a.slug === productId);
    if (asset) return { tab: 'assets', product: asset, grade: null };
    return { tab: 'assets', product: null, grade: null };
  };

  const init = getInitialState();
  const [selected, setSelected] = useState(init.tab);
  const [selectedProduct, setSelectedProduct] = useState(init.product);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(init.grade);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const searchInputRef = useRef(null);
  const shopBarsRef = useRef(null);
  useScrollReveal(shopBarsRef);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (selected === 'assets' && ASSETS.length === 1 && !selectedProduct) {
      setSelectedProduct(ASSETS[0]);
    }
    if (selected === 'grades' && !selectedGrade) {
      setSelectedGrade(GRADE_PACK);
      window.scrollTo(0, 0);
    }
  }, [selected, selectedProduct, selectedGrade]);

  useEffect(() => {
    let slug = null;
    if (selectedProduct) slug = selectedProduct.slug;
    else if (selectedGrade) slug = selectedGrade.slug;
    else if (selected === 'template') slug = 'tmplt';
    const url = slug ? `/shop/${slug}` : '/shop';
    window.history.replaceState(null, '', url);
  }, [selected, selectedProduct, selectedGrade]);

  useEffect(() => {
    if (location.state?.openGrades) {
      setSelected('grades');
      setSelectedGrade(GRADE_PACK);
      window.scrollTo(0, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  const searchResults = searchQuery.trim().length > 0
    ? SEARCH_ITEMS.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="shop-page" style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>

      {/* Search overlay */}
      {isSearchOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '60px',
            background: 'rgba(0,0,0,0.6)',
          }}
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            style={{
              width: '90%', maxWidth: '680px',
              background: '#fff', borderRadius: '4px',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input row */}
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '0 20px', borderBottom: '1px solid #e5e5e5',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                style={{
                  flex: 1,
                  border: 'none', outline: 'none',
                  padding: '20px 14px',
                  fontSize: '16px',
                  fontFamily: 'Arial, sans-serif',
                  color: '#111',
                  background: 'transparent',
                }}
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: '#999',
                  fontSize: '22px', lineHeight: 1, padding: '4px',
                }}
              >×</button>
            </div>

            {/* Results */}
            {searchResults.length > 0 && (
              <div>
                {searchResults.map((item, i) => (
                  <div
                    key={item.title}
                    onClick={() => { setSelected(item.section); setIsSearchOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '16px 20px',
                      borderBottom: i < searchResults.length - 1 ? '1px solid #eee' : 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '48px', height: '48px', flexShrink: 0,
                      background: '#111',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#111' }}>{item.title}</p>
                      <p style={{ margin: '3px 0 0', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888' }}>Coming Soon</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searchQuery.trim().length > 0 && searchResults.length === 0 && (
              <p style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#888', margin: 0 }}>
                No products found for "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      )}

      <ContactV2 isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} subtitle="Have any questions or comments? Use this form to contact me at any time." />

      {/* Mobile slide-out drawer */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 2000,
              background: 'rgba(0,0,0,0.5)',
              opacity: isMobileMenuOpen ? 1 : 0,
              pointerEvents: isMobileMenuOpen ? 'all' : 'none',
              transition: 'opacity 0.25s ease',
            }}
          />
          {/* Drawer panel */}
          <div className="shop-mobile-drawer" style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 2100,
            width: '72vw', maxWidth: '280px',
            background: '#111',
            transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex', flexDirection: 'column',
            paddingTop: 'max(48px, calc(env(safe-area-inset-top, 0px) + 16px))',
            paddingBottom: '40px',
          }}>
            {/* Close */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: 'absolute', top: 'max(16px, calc(env(safe-area-inset-top, 0px) + 8px))', right: '16px',
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
                fontSize: '22px', cursor: 'pointer', lineHeight: 1,
              }}
            >✕</button>

            {[
              { label: 'Home', action: () => { navigate('/'); setIsMobileMenuOpen(false); } },
              { label: 'Shop', action: () => { setSelectedProduct(null); setIsMobileMenuOpen(false); window.scrollTo(0, 0); } },
              { label: 'Contact', action: () => { setIsContactOpen(true); setIsMobileMenuOpen(false); } },
              { label: 'Login', action: () => { setIsMobileMenuOpen(false); window.open('https://polar.sh/cinestoke/portal', '_blank'); } },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: '24px', letterSpacing: '3px',
                  color: '#fff', padding: '18px 32px',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
              >{item.label}</button>
            ))}
          </div>
        </>
      )}

      {/* Wrap both bars at 80% width like the homepage bars */}
      <div ref={shopBarsRef} className="shop-bars-reveal" style={{ width: '80%', margin: '0 auto' }}>

        {/* Title bar */}
        <div className="shop-title-bar" style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          paddingTop: isMobile ? 'max(16px, calc(env(safe-area-inset-top, 0px) + 8px))' : '24px',
          paddingBottom: isMobile ? '16px' : '24px',
          paddingLeft: '8px',
          paddingRight: '8px',
        }}>
          {/* Left */}
          <div>
            {isMobile ? (
              <button
                onClick={() => setIsMobileMenuOpen(o => !o)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                aria-label="Menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            ) : (
              <button onClick={() => navigate('/')} className="shop-home-btn">HOME</button>
            )}
          </div>

          {/* Center: CINESTOKE */}
          <h1
            onClick={onToggleLightMode}
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: isMobile ? '26px' : '60px',
              letterSpacing: isMobile ? '3px' : '5px',
              color: '#fff',
              margin: 0,
              textShadow: '0 0 20px rgba(255,255,255,0.15)',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            CINESTOKE
          </h1>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px', justifyContent: 'flex-end' }}>
            {!isMobile && (
              <>
                <span
                  onClick={() => { setSelectedProduct(null); window.scrollTo(0, 0); }}
                  style={{
                    fontFamily: 'Impact, sans-serif', fontSize: '16px', letterSpacing: '2px',
                    color: '#fff', paddingBottom: '2px', cursor: 'pointer',
                    borderBottom: isContactOpen ? 'none' : '1px solid #fff',
                  }}
                >Shop</span>
                <button
                  onClick={() => setIsContactOpen(true)}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    fontFamily: 'Impact, sans-serif', fontSize: '16px', letterSpacing: '2px',
                    color: isContactOpen ? '#fff' : 'rgba(255,255,255,0.55)',
                    paddingBottom: '2px',
                    borderBottom: isContactOpen ? '1px solid #fff' : 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={e => { if (!isContactOpen) e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { if (!isContactOpen) e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                >Contact</button>
                <button className="shop-nav-icon" style={iconBtnStyle} aria-label="Login" onClick={() => window.open('https://polar.sh/cinestoke/portal', '_blank')}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </button>
              </>
            )}
            <button onClick={() => setIsSearchOpen(true)} className="shop-nav-icon" style={iconBtnStyle} aria-label="Search">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
            </button>
          </div>
        </div>
        <div className="shop-hline" />

        {/* Tab bar */}
        <div className="shop-tab-bar" style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          {TABS.map((tab, i) => (
            <React.Fragment key={tab.id}>
              <div className={`shop-tab-slot shop-tab-slot-${i}`} style={{ flex: 1 }}>
                <button
                  onClick={() => { setSelected(tab.id); setSelectedProduct(null); setSelectedGrade(null); window.scrollTo(0, 0); }}
                  className="shop-tab"
                  data-active={selected === tab.id}
                  style={{
                    width: '100%',
                    height: '100px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: isMobile ? '16px' : '28px',
                    letterSpacing: '2px',
                    color: '#fff',
                    opacity: selected === tab.id ? 1 : 0.35,
                    transition: 'opacity 0.2s ease, filter 0.2s ease',
                    transform: 'translateZ(0)',
                  }}
                >
                  {isMobile
                    ? tab.label.split(' ').map((word, wi, arr) => (
                        <React.Fragment key={wi}>{word}{wi < arr.length - 1 && <br />}</React.Fragment>
                      ))
                    : tab.label}
                </button>
              </div>
              {i < TABS.length - 1 && (
                <div className="shop-tab-divider shop-tab-divider-reveal" style={{ width: '2px', height: '100px', backgroundColor: 'white', flexShrink: 0 }} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="shop-hline" />
      </div>

      {/* Content area */}
      {selected === 'assets' && !selectedProduct && (
        <div className="shop-content-reveal" style={{
          padding: '40px',
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '32px',
        }}>
          {[...ASSETS, { ...GRADE_PACK, _redirectToGrades: true }].map(item => (
            <div
              key={item.id}
              onClick={() => {
                if (item._redirectToGrades) {
                  setSelected('grades');
                  setSelectedGrade(GRADE_PACK);
                  window.scrollTo(0, 0);
                } else {
                  setSelectedProduct(item);
                  window.scrollTo(0, 0);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {/* Cover */}
              <div style={{
                aspectRatio: '3/4',
                background: 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '12px',
                fontSize: '48px',
                overflow: 'hidden',
              }}>
                {item.cover
                  ? <img src={item.cover} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : item.icon}
              </div>
              {/* Title */}
              <p style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '14px', letterSpacing: 0, fontWeight: 500,
                color: '#fff', margin: '0 0 4px', textAlign: 'center',
              }}>{item.title}</p>
              {/* Price */}
              <p style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '14px', letterSpacing: 0,
                color: 'rgba(255,255,255,0.6)', margin: 0, textAlign: 'center',
              }}>{item.price}</p>
            </div>
          ))}
        </div>
      )}

      {selected === 'assets' && selectedProduct && (
        <div className="shop-content-reveal" style={{ maxWidth: '960px', margin: '0 auto', padding: isMobile ? '32px 20px 80px' : '56px 40px 80px' }}>

          {/* 2-col on desktop, stacked on mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '32px' : '64px', alignItems: 'start', marginBottom: '80px' }}>

            {/* Cover art */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              aspectRatio: '3/4',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '16px',
              overflow: 'hidden',
            }}>
              {selectedProduct.cover ? (
                <img src={selectedProduct.cover} alt={selectedProduct.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <>
                  <div style={{ fontSize: '72px' }}>{selectedProduct.icon}</div>
                  <p style={{
                    fontFamily: 'Impact, sans-serif', fontSize: '13px',
                    letterSpacing: '3px', color: 'rgba(255,255,255,0.3)', margin: 0,
                  }}>PREVIEW COMING SOON</p>
                </>
              )}
            </div>

            {/* Info */}
            <div>
              <h2 style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: '48px', letterSpacing: '2px', lineHeight: 1.05,
                color: '#fff', margin: '0 0 16px',
              }}>{selectedProduct.title}</h2>

              <p style={{
                fontFamily: 'Impact, sans-serif', fontSize: '22px', letterSpacing: '1px',
                color: '#fff', margin: '0 0 28px',
              }}>{selectedProduct.price}</p>

              {/* Buy Now */}
              <button
                className="shop-add-to-cart"
                style={{
                  display: 'block', width: '100%', padding: '16px',
                  background: '#fff', color: '#000', border: 'none', cursor: 'pointer',
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: '17px', letterSpacing: '4px',
                  marginBottom: '20px', transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                onClick={() => selectedProduct.checkoutUrl && window.open(selectedProduct.checkoutUrl, '_blank')}
              >Buy Now</button>


              {/* Description */}
              {(selectedProduct.paragraphs || [selectedProduct.description]).map((p, i) => (
                <p key={i} style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '15px', letterSpacing: 0,
                  color: 'rgba(255,255,255,0.7)', lineHeight: 1.8,
                  margin: '0 0 16px', fontWeight: 400,
                }}>{p}</p>
              ))}

              {/* Email support */}
              <p style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '15px', letterSpacing: 0, fontWeight: 400,
                color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: '16px 0 32px',
              }}>
                Email: jarongwenger@gmail.com if you have any issues.
              </p>

              {/* Includes */}
              <p style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '15px', letterSpacing: 0, fontStyle: 'italic',
                color: 'rgba(255,255,255,0.7)', margin: '0 0 10px',
              }}>You will get the following files:</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {selectedProduct.includes.map(item => (
                  <li key={item} style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '14px', letterSpacing: 0,
                    color: 'rgba(255,255,255,0.65)', padding: '8px 0',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}>
                    {/* File icon */}
                    <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, opacity: 0.6 }}>
                      <path d="M8 1H2C1.45 1 1 1.45 1 2v13c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V6L8 1z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" fill="none"/>
                      <path d="M8 1v5h5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" fill="none"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reviews */}
          <ReviewsSection
            currentProductId={selectedProduct.id}
            onProductClick={(productId) => {
              if (productId === 'luts-powergrades') {
                setSelected('grades'); setSelectedGrade(GRADE_PACK); window.scrollTo(0, 0);
              } else {
                const p = ASSETS.find(a => a.id === productId);
                if (p) { setSelectedProduct(p); window.scrollTo(0, 0); }
              }
            }}
          />

          {/* More like this */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '48px' }}>
            <p style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: '22px', letterSpacing: '4px',
              color: '#fff', margin: '0 0 24px',
            }}>More like this</p>
            <div style={{ display: 'flex', gap: '12px', maxWidth: '280px' }}>
              {ASSETS.filter(a => a.id !== selectedProduct.id).map(a => (
                <div
                  key={a.id}
                  onClick={() => { setSelectedProduct(a); window.scrollTo(0, 0); }}
                  style={{ flex: 1, cursor: 'pointer' }}
                >
                  <div style={{
                    aspectRatio: '3/4',
                    background: 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '8px',
                    fontSize: '32px',
                    overflow: 'hidden',
                  }}>
                    {a.cover
                      ? <img src={a.cover} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : a.icon}
                  </div>
                  <p style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '12px', letterSpacing: 0, fontWeight: 500,
                    color: '#fff', margin: '0 0 2px', textAlign: 'center',
                  }}>{a.title}</p>
                  <p style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '12px', letterSpacing: 0,
                    color: 'rgba(255,255,255,0.6)', margin: 0, textAlign: 'center',
                  }}>{a.price}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Grades grid */}
      {selected === 'grades' && !selectedGrade && (
        <div className="shop-content-reveal" style={{
          padding: '40px',
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '32px',
        }}>
          <div
            onClick={() => { setSelectedGrade(GRADE_PACK); window.scrollTo(0, 0); }}
            style={{ cursor: 'pointer' }}
          >
            <div style={{
              aspectRatio: '3/4',
              background: 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '12px',
              fontSize: '48px',
            }}>
              {GRADE_PACK.icon}
            </div>
            <p style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '14px', letterSpacing: 0, fontWeight: 500,
              color: '#fff', margin: '0 0 4px', textAlign: 'center',
            }}>{GRADE_PACK.title}</p>
            <p style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '14px', letterSpacing: 0,
              color: 'rgba(255,255,255,0.6)', margin: 0, textAlign: 'center',
            }}>{GRADE_PACK.price}</p>
          </div>
        </div>
      )}

      {/* Grade drill-down */}
      {selected === 'grades' && selectedGrade && (
        <div className="shop-content-reveal" style={{ maxWidth: '960px', margin: '0 auto', padding: isMobile ? '32px 20px 80px' : '56px 40px 80px' }}>

          {/* 2-col on desktop, stacked on mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '32px' : '64px', alignItems: 'start', marginBottom: '80px' }}>

            {/* Cover */}
            <div style={{
              aspectRatio: '3/4',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '16px',
              overflow: 'hidden',
            }}>
              {selectedGrade.cover ? (
                <img src={selectedGrade.cover} alt={selectedGrade.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <>
                  <div style={{ fontSize: '72px' }}>{selectedGrade.icon}</div>
                  <p style={{ fontFamily: 'Impact, sans-serif', fontSize: '13px', letterSpacing: '3px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>PREVIEW COMING SOON</p>
                </>
              )}
            </div>

            {/* Info */}
            <div>
              <h2 style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: '48px', letterSpacing: '2px', lineHeight: 1.05,
                color: '#fff', margin: '0 0 16px',
              }}>{selectedGrade.title}</h2>

              <p style={{ fontFamily: 'Impact, sans-serif', fontSize: '22px', letterSpacing: '1px', color: '#fff', margin: '0 0 28px' }}>{selectedGrade.price}</p>

              <button
                className="shop-add-to-cart"
                style={{ display: 'block', width: '100%', padding: '16px', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '17px', letterSpacing: '4px', marginBottom: '20px', transition: 'opacity 0.2s ease' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >Buy Now</button>

              {selectedGrade.paragraphs.map((p, i) => (
                <p key={i} style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '15px', letterSpacing: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: '0 0 16px', fontWeight: 400 }}>{p}</p>
              ))}

              <p style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '15px', letterSpacing: 0, fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: '16px 0 32px' }}>
                Email: jarongwenger@gmail.com if you have any problems!
              </p>

              <p style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '15px', letterSpacing: 0, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)', margin: '0 0 10px' }}>You will get the following files:</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {selectedGrade.includes.map(item => (
                  <li key={item} style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '14px', letterSpacing: 0, color: 'rgba(255,255,255,0.65)', padding: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, opacity: 0.6 }}>
                      <path d="M8 1H2C1.45 1 1 1.45 1 2v13c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V6L8 1z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" fill="none"/>
                      <path d="M8 1v5h5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" fill="none"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sliders + info side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '48px', alignItems: 'start', marginBottom: '80px' }}>

            {/* Left: sliders */}
            <div>
              {GRADES.map((grade, i) => (
                <div key={grade.id} className="shop-grade-slider" style={{ marginBottom: i < GRADES.length - 1 ? '32px' : 0 }}>
                  <SlideColor title={grade.title} videoColor={grade.videoColor} videoRaw={grade.videoRaw} videosCanLoad />
                </div>
              ))}
            </div>

            {/* Right: powergrade info + tutorial */}
            <div>
              {/* Node tree / powergrade image */}
              <h3 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '32px', letterSpacing: '3px', color: '#fff', margin: '0 0 20px' }}>THE POWERGRADE</h3>
              <img
                src={powergradePng}
                alt="Powergrade node tree"
                style={{ width: '100%', height: 'auto', display: 'block', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <p style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '15px', letterSpacing: 0, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, margin: '0 0 48px', fontWeight: 400 }}>
                Simple. Clean. Apply the Powergrade, add contrast, turn on the effects, and maybe dial in some extra color — you're ready to go.
              </p>

              {/* Tutorial */}
              <h3 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '32px', letterSpacing: '3px', color: '#fff', margin: '0 0 20px' }}>THE TUTORIAL</h3>
              <div style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><polygon points="5,3 19,12 5,21" /></svg>
                </div>
                <p style={{ fontFamily: 'Impact, sans-serif', fontSize: '13px', letterSpacing: '3px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>COMING SOON</p>
              </div>
              <p style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '13px', letterSpacing: 0, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: '12px 0 48px' }}>
                A full walkthrough of how to install and apply the Powergrades in DaVinci Resolve — from importing the pack to applying your first grade.
              </p>

              {/* Examples */}
              <h3 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '32px', letterSpacing: '3px', color: '#fff', margin: '0 0 20px' }}>EXAMPLES</h3>
              <div style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><polygon points="5,3 19,12 5,21" /></svg>
                </div>
                <p style={{ fontFamily: 'Impact, sans-serif', fontSize: '13px', letterSpacing: '3px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>COMING SOON</p>
              </div>
              <p style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '13px', letterSpacing: 0, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: '12px 0 40px' }}>
                Real client footage graded with this pack — showing what's possible straight out of the box with no extra adjustments.
              </p>

              <button
                style={{ display: 'block', width: '100%', padding: '15px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '17px', letterSpacing: '4px', transition: 'border-color 0.2s ease' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'}
              >Buy Now</button>
            </div>
          </div>

          {/* Reviews */}
          <ReviewsSection
            currentProductId="luts-powergrades"
            onProductClick={(productId) => {
              if (productId === 'luts-powergrades') {
                window.scrollTo(0, 0);
              } else {
                const p = ASSETS.find(a => a.id === productId);
                if (p) { setSelected('assets'); setSelectedGrade(null); setSelectedProduct(p); window.scrollTo(0, 0); }
              }
            }}
          />

        </div>
      )}

      {selected === 'template' && (
        <div className="shop-content-reveal">

          {/* ── 1. HOOK ── */}
          <div style={{ textAlign: 'center', padding: '32px 40px 24px' }}>
            <p style={{
              fontFamily: 'Impact, sans-serif',
              fontSize: '12px',
              letterSpacing: '5px',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '16px',
            }}>FOR VIDEOGRAPHERS &amp; VISUAL CREATIVES</p>
            <h2 style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: 'clamp(48px, 8vw, 96px)',
              letterSpacing: '4px',
              color: '#fff',
              margin: '0 0 20px',
              lineHeight: 1,
            }}>Your Portfolio.<br />Built to Convert.</h2>
            <p style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '17px',
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: 0,
              maxWidth: '520px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              The exact site you're on — yours, with your brand, your clients, your reel.
            </p>
          </div>

          {/* ── 2. DEVICES ── */}
          {isMobile ? (
            <div style={{ maxWidth: '980px', margin: '0 auto 40px', padding: '0 24px' }}>
              <img
                src={cinestokesite}
                alt="Cinestoke website on MacBook"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          ) : (
            <div style={{
              maxWidth: '980px',
              margin: '0 auto 40px',
              padding: '0 40px',
              display: 'flex',
              alignItems: 'center',
              gap: '0px',
            }}>
              <div style={{ flex: 1 }}>
                <img
                  src={cinestokesite}
                  alt="Cinestoke website on MacBook"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
              <div style={{ flex: '0 0 420px', marginLeft: '-60px' }}>
                <IPhoneDisplay screenshot={iphoneCinestokeScreenshot} alt="Cinestoke website on iPhone" />
              </div>
            </div>
          )}

          {/* ── 3. CALLOUT ── */}
          <div style={{ maxWidth: '760px', margin: '0 auto 64px', padding: '0 40px' }}>
            <div style={{
              border: '1px solid rgba(255,255,255,0.18)',
              padding: '28px 32px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}>
              <div className="shop-callout-bar" style={{ width: '5px', minHeight: '52px', backgroundColor: '#fff', flexShrink: 0 }} />
              <p style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '16px',
                letterSpacing: 0,
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
                lineHeight: 1.75,
              }}>
                You didn't spend years learning this craft to close clients on a drag-and-drop page. Your footage deserves a site that was built with the same intention.
              </p>
            </div>
          </div>

          {/* ── 4. HOW IT WORKS + INCLUDED ── */}
          <div style={{ maxWidth: '860px', margin: '0 auto 72px', padding: '0 40px' }}>
            <p style={{
              fontFamily: 'Impact, sans-serif',
              fontSize: '12px',
              letterSpacing: '5px',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '28px',
              textAlign: 'center',
            }}>HOW IT WORKS</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', marginBottom: '40px' }}>
              {[
                ['01 — SEND YOUR ASSETS', 'Your reels, client videos, logos, and anything else that represents your work.'],
                ['02 — I BUILD YOUR SITE', 'Customized with your brand, your clients, and your case studies — on this exact stack.'],
                ['03 — YOUR SITE GOES LIVE', 'On your own domain, fully tested on mobile and desktop, ready to close clients.'],
                ['04 — I MANAGE EVERYTHING', 'New reel, new client, new copy — just send it over and it\'s handled.'],
              ].map(([step, detail]) => (
                <div key={step} style={{
                  padding: '22px 24px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <p style={{
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: '17px',
                    letterSpacing: '2px',
                    color: '#fff',
                    margin: '0 0 6px',
                  }}>{step}</p>
                  <p style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '13px',
                    letterSpacing: 0,
                    color: 'rgba(255,255,255,0.45)',
                    margin: 0,
                    lineHeight: 1.6,
                  }}>{detail}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
              {[
                ['Cinematic video carousel', 'Infinite scroll, auto-playing'],
                ['Client case study system', 'Up to 7 clients, fully configurable'],
                ['Color grade slider', 'Before/after comparison, 60fps drag'],
                ['YouTube reel integration', 'One-click modal, no embed lag'],
                ['Image gallery', 'Infinite scroll photo strip'],
                ['Mobile responsive', 'Tested on iOS & Android'],
              ].map(([feature, detail]) => (
                <div key={feature} style={{
                  padding: '18px 22px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <p style={{
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: '17px',
                    letterSpacing: '2px',
                    color: '#fff',
                    margin: '0 0 3px',
                  }}>✓  {feature}</p>
                  <p style={{
                    fontFamily: 'Impact, sans-serif',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    color: 'rgba(255,255,255,0.35)',
                    margin: 0,
                  }}>{detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 5. CTA ── */}
          <div style={{
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '64px 40px 80px',
          }}>
            <p style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: '52px',
              letterSpacing: '6px',
              color: '#fff',
              margin: '0 0 6px',
            }}>LET'S BUILD YOUR SITE</p>
            <p style={{
              fontFamily: 'Impact, sans-serif',
              fontSize: '12px',
              letterSpacing: '3px',
              color: 'rgba(255,255,255,0.3)',
              margin: '0 0 36px',
            }}>REACH OUT AND WE'LL TALK THROUGH YOUR PROJECT</p>
            <button
              onClick={() => setIsContactOpen(true)}
              className="shop-get-in-touch"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: '18px',
                letterSpacing: '4px',
                color: '#000',
                backgroundColor: '#fff',
                padding: '16px 56px',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              GET IN TOUCH
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ShopBars;
