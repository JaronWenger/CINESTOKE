import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import useScrollReveal from '../hooks/useScrollReveal';
import SlideColor from './SlideColor';
import ContactV2 from './ContactV2';
import cinestokesite from '../assets/cinestokesite.webp';
import powergradePng from '../assets/SHOP/POWERGRADE.webp';
import sfxV1Cover from '../assets/SHOP/SFXv1.webp';
import sfxV2Cover from '../assets/SHOP/SFXv2.webp';
import lutsCover from '../assets/SHOP/LUTS.webp';
import overlayCover from '../assets/SHOP/OVERLAYS.webp';
import iphoneFrameImg from '../assets/iPhone.png';
import iPhoneScreenPng from '../assets/iPhoneScreen.png';
import macbookPng from '../assets/Macbook.png';
import macbookScreenPng from '../assets/MacbookScreen.png';
import cinestokeWebp from '../assets/cinestoke.webp';
import smallWorldColorVideo from '../assets/CASESTUDIES/SmallWorldcolor.mp4';
import smallWorldRawVideo from '../assets/CASESTUDIES/SmallWorldraw.mp4';
import seadooColorVideo from '../assets/CASESTUDIES/Seadoocolor.mp4';
import seadooRawVideo from '../assets/CASESTUDIES/Seadooraw.mp4';
import BGColorVideo from '../assets/CASESTUDIES/BGcolor.mp4';
import BGRawVideo from '../assets/CASESTUDIES/BGraw.mp4';

const SEARCH_ITEMS = [
  { title: 'Cinestoke SFX Vol. 2',          section: 'assets',   productId: 'sound-fx',         subtitle: '$25.00',          keywords: ['sound effects', 'sfx', 'audio'] },
  { title: 'Cinestoke SFX Vol. 1',          section: 'assets',   productId: 'sound-fx-1',       subtitle: '$15.00',          keywords: ['sound effects', 'sfx', 'audio'] },
  { title: 'Cinestoke Overlays Pack',        section: 'assets',   productId: 'overlays',         subtitle: '$20.00',          keywords: ['transitions'] },
  { title: 'Cinestoke LUTs + Powergrades',  section: 'grades',   productId: 'luts-powergrades', subtitle: '$35.00',          keywords: ['color grades', 'luts', 'color grading', 'davinci'] },
  { title: 'Portfolio Website Template',     section: 'template', productId: null,               subtitle: 'Website Template', keywords: [] },
];

const TABS = [
  { id: 'assets', label: 'VIDEO ASSETS' },
  { id: 'grades', label: 'POWER GRADES' },
  { id: 'template', label: 'WEBSITE TEMPLATE' },
];

const ALL_REVIEWS = [
  { name: 'Jaron Wenger', rating: 5, productId: 'luts-powergrades', productTitle: 'Cinestoke LUTs + Powergrades', text: 'Using this Powergrade has defined my color grading workflow. Wouldn\'t change a thing 🔥', date: 'Jun 28, 2026' },
];

const Stars = ({ count = 5 }) => (
  <span style={{ color: '#fff', fontSize: '14px', letterSpacing: '2px' }}>
    {'★'.repeat(count)}{'☆'.repeat(5 - count)}
  </span>
);

const REVIEW_PRODUCTS = [
  { id: 'sound-fx',         title: 'Cinestoke SFX Vol. 2' },
  { id: 'sound-fx-1',       title: 'Cinestoke SFX Vol. 1' },
  { id: 'overlays',         title: 'Cinestoke Overlays Pack' },
  { id: 'luts-powergrades', title: 'Cinestoke LUTs + Powergrades' },
];

const ReviewModal = ({ isOpen, onClose, onSubmitReview, productId, productTitle }) => {
  const [name, setName] = React.useState('');
  const [rating, setRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [text, setText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');
  const inter = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  const reset = () => { setName(''); setRating(5); setHoverRating(0); setText(''); setError(''); setSubmitted(false); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: '8ee0cebe-0dfe-41b5-b2db-389d7443b13f',
        subject: 'CINESTOKE REVIEW',
        name, rating, product: productTitle, review: text,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          onSubmitReview({ name, rating, productId, productTitle, text, date: today });
          setSubmitted(true);
        } else {
          setError('Something went wrong. Please try again.');
        }
      })
      .catch(() => setError('Something went wrong. Please try again.'))
      .finally(() => setIsSubmitting(false));
  };

  if (!isOpen) return null;
  return (
    <div className="review-modal-overlay" onClick={handleClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', animation: 'shopOverlayIn 0.25s ease' }}>
      <div className="review-modal-content" onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', padding: '40px', width: '100%', maxWidth: '480px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', animation: 'shopFadeUp 0.3s ease forwards' }}>
        <button onClick={handleClose} style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}>×</button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
            <div style={{ fontSize: '28px', margin: '0 0 16px' }}><Stars count={rating} /></div>
            <h2 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '36px', letterSpacing: '3px', color: '#fff', margin: '0 0 12px' }}>Thanks for the review!</h2>
            <p style={{ fontFamily: inter, fontSize: '15px', color: 'rgba(255,255,255,0.55)', margin: '0 0 32px', lineHeight: 1.7 }}>Your review has been submitted.</p>
            <button onClick={handleClose} style={{ display: 'block', width: '100%', padding: '16px', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '17px', letterSpacing: '4px' }}>Close</button>
          </div>
        ) : (
          <>
        <h2 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '36px', letterSpacing: '3px', color: '#fff', margin: '0 0 4px' }}>Write a Review</h2>
        <p style={{ fontFamily: inter, fontSize: '13px', color: 'rgba(255,255,255,0.4)', letterSpacing: 0, margin: '0 0 28px' }}>{productTitle}</p>

        <form onSubmit={handleSubmit}>
          {/* Star rating */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontFamily: inter, fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 10px' }}>Rating</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '28px', color: s <= (hoverRating || rating) ? '#fff' : 'rgba(255,255,255,0.2)', lineHeight: 1, transition: 'color 0.15s ease' }}
                >★</button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontFamily: inter, fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 10px' }}>Name</p>
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: inter, fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          {/* Review */}
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontFamily: inter, fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 10px' }}>Review</p>
            <textarea required value={text} onChange={e => setText(e.target.value)} placeholder="Share your experience…" rows={4}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: inter, fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          {error && <p style={{ fontFamily: inter, fontSize: '13px', color: '#f87171', margin: '0 0 16px' }}>{error}</p>}

          <button type="submit" disabled={isSubmitting}
            style={{ display: 'block', width: '100%', padding: '16px', background: '#fff', color: '#000', border: 'none', cursor: isSubmitting ? 'default' : 'pointer', fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '17px', letterSpacing: '4px', opacity: isSubmitting ? 0.6 : 1, transition: 'opacity 0.2s ease' }}
            onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.opacity = '1'; }}
          >{isSubmitting ? 'Submitting…' : 'Submit Review'}</button>
        </form>
          </>
        )}
      </div>
    </div>
  );
};

const renderReviewText = (text) =>
  text.split(/([\p{Emoji_Presentation}\p{Extended_Pictographic}]+)/gu).map((part, i) =>
    /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(part)
      ? <span key={i} style={{ color: 'initial' }}>{part}</span>
      : part
  );

const ReviewsSection = ({ currentProductId, onProductClick, localReviews = [], onWriteReview }) => {
  const [showAll, setShowAll] = React.useState(false);
  const currentProduct = REVIEW_PRODUCTS.find(p => p.id === currentProductId);
  const sortReviews = (reviews) =>
    [...reviews].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.date) - new Date(a.date);
    });
  const staticSorted = [
    ...sortReviews(ALL_REVIEWS.filter(r => r.productId === currentProductId)),
    ...sortReviews(ALL_REVIEWS.filter(r => r.productId !== currentProductId)),
  ];
  const sorted = [...localReviews, ...staticSorted];
  const totalCount = ALL_REVIEWS.length + localReviews.length;
  const visible = showAll ? sorted : sorted.slice(0, 5);
  const inter = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '48px' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '40px', letterSpacing: '3px', color: '#fff', margin: 0 }}>Reviews</h3>
        <button
          onClick={() => onWriteReview(currentProductId, currentProduct?.title)}
          className="shop-write-review"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '14px', letterSpacing: '3px', color: '#000', backgroundColor: '#fff', padding: '12px 24px', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s ease', whiteSpace: 'nowrap', marginTop: '6px' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >WRITE A REVIEW</button>
      </div>

      {totalCount > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Stars count={5} />
            <span style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.55)', letterSpacing: 0 }}>5.0 Average store rating</span>
          </div>
          <p style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.55)', letterSpacing: 0, margin: '0 0 24px' }}>{totalCount} store {totalCount === 1 ? 'review' : 'reviews'}</p>
        </>
      )}

      {visible.map((review, i) => (
        <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px 0', display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '90px 1fr' : '160px 1fr', gap: window.innerWidth <= 768 ? '16px' : '32px' }}>
          <div>
            <p style={{ fontFamily: inter, fontSize: '13px', fontWeight: 600, color: '#fff', margin: '0 0 4px', letterSpacing: 0 }}>{review.name}</p>
            <p style={{ fontFamily: inter, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: 0 }}>{review.date}</p>
          </div>
          <div>
            <Stars count={review.rating} />
            <p style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, margin: '8px 0 12px', letterSpacing: 0, fontWeight: 400 }}>{renderReviewText(review.text)}</p>
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
      'The ultimate SFX Pack behind all Cinestoke videos. Everything you\'ll ever need for your edits/videos. 600+ sounds shaped to push the story forward.',
      'Everything from Vol. 1 is included, plus more. Inside you\'ll find everything from aggressive impacts, bass hits, whooshes, and car sounds to organic textures, nature sounds, and experimental ambiances that glue your edits together.',
    ],
    includes: [
      'ZIP (1.2GB), 691 WAV files, 19 categories',
    ],
    perks: [
      'Compatible with any editing software',
      'Download right after your purchase',
      'Use in any project, for any client',
    ],
    icon: '🎧',
    cover: sfxV2Cover,
  },
  {
    id: 'overlays',
    slug: 'ovrly',
    title: 'Cinestoke Overlays Pack',
    price: '$20.00',
    checkoutUrl: 'https://buy.polar.sh/polar_cl_XxUBo1FdsIkNGW1yxyiqyk3azHGZUT2e8d1MZ30ra3L',
    tagline: 'Film grain, light leaks & cinematic texture overlays',
    paragraphs: [
      'The exact overlays baked into every Cinestoke production. 185+ assets across 9 categories. Everything you need to add instant cinematic texture to any footage.',
      "Inside you'll find film grain, dust and noise, film burns, lens flares, fire elements, vintage VHS and Super 8 textures, whip transitions, and a full library of texture stills. Drag, drop, set the blend mode to Screen or Overlay, and you're done.",
    ],
    includes: [
      'ZIP (1.83GB), Main pack',
      'ZIP (1.2GB), Vintage pack',
    ],
    perks: [
      'Compatible with any editing software',
      'Download right after your purchase',
      'Use in any project, for any client',
    ],
    icon: '🎞️',
    cover: overlayCover,
  },
  {
    id: 'sound-fx-1',
    slug: 'sfxv1',
    title: 'Cinestoke SFX Vol. 1',
    price: '$15.00',
    checkoutUrl: 'https://buy.polar.sh/polar_cl_xF7gE8CslFeGKkPSnn6Vtubh1ixHGp9QEzBaE13UwT4',
    tagline: 'Cinematic sound effects for your edits',
    paragraphs: [
      'The essential SFX pack. These are the sounds I reach for in every single edit, pulled straight from real client productions. If your videos feel flat, this is what\'s missing.',
      'Inside you\'ll find car sounds, impacts, bass hits, whooshes, braams, risers, nature sounds, punch sounds, and filmic textures that make every cut land harder.',
    ],
    includes: [
      'ZIP (872.4MB), 517 WAV files, 12 categories',
    ],
    perks: [
      'Compatible with any editing software',
      'Download right after your purchase',
      'Use in any project, for any client',
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
  checkoutUrl: 'https://buy.polar.sh/polar_cl_jh480rUCVqaieESyP9kCnhcGnZEe9ffImmwRh2UA9wc',
  icon: '🎨',
  paragraphs: [
    'The exact LUTs and Powergrades behind every Cinestoke color grade. 4 Powergrades built for DaVinci Resolve and 3 matching .cube LUTs compatible with any software that accepts .cube files.',
    'This is not a filter. It\'s the professional way to treat footage without 10,000 hours of learning time. Each Powergrade is a full node tree: exposure, white balance, saturation, skin, halation, grain, sharpen, and more. The CINESTOKE base grade ships with every node at neutral so you can build your own look from scratch. De Drago, Glass, and Champagne Pow are finished looks built on top of that same structure.',
  ],
  includes: ['ZIP (6.5MB), 4 Powergrades (.drx) + 3 LUTs (.cube)'],
  perks: [
    'Powergrades built for DaVinci Resolve',
    'Download right after your purchase',
    'Use in any project, for any client',
  ],
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
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState({ id: '', title: '' });
  const [localReviews, setLocalReviews] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(init.grade);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [templateView, setTemplateView] = useState('desktop');
  const [templateTab, setTemplateTab] = useState('Overview');
  const [visibleTab, setVisibleTab] = useState('Overview');
  const [tabFading, setTabFading] = useState(false);
  const [openFeatures, setOpenFeatures] = useState({});
  const [openFaqs, setOpenFaqs] = useState({});
  const [iframesReady, setIframesReady] = useState(false);
  const [deviceVisible, setDeviceVisible] = useState(false);
  const [deviceSectionVisible, setDeviceSectionVisible] = useState(init.tab === 'template');
  const [screenPopup, setScreenPopup] = useState({ visible: false, x: 0, y: 0 });
  const [screenPopupIn, setScreenPopupIn] = useState(false);
  const screenPopupRef = useRef(null);
  const popupDismissTimer = useRef(null);
  const iframesEverShown = useRef(init.tab === 'template');
  const [iframeScale, setIframeScale] = useState(0.42);
  const macbookContainerRef = useRef(null);
  const macbookMaskRef = useRef(null);
  const iframeRef = useRef(null);
  const macbookScreenRef = useRef(null);
  const [iphoneScale, setIphoneScale] = useState(0.52);
  const iphoneContainerRef = useRef(null);
  const iphoneMaskRef = useRef(null);
  const iphoneIframeRef = useRef(null);
  const iphoneScreenRef = useRef(null);
  const searchInputRef = useRef(null);
  const shopBarsRef = useRef(null);
  useScrollReveal(shopBarsRef);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selected === 'template') {
      const raf = requestAnimationFrame(() => setDeviceSectionVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setDeviceSectionVisible(false);
    }
  }, [selected]);

  useEffect(() => {
    if (document.readyState === 'complete') {
      setIframesReady(true);
    } else {
      const onLoad = () => setIframesReady(true);
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  useEffect(() => {
    if (deviceSectionVisible) {
      iframesEverShown.current = true;
      const t = setTimeout(() => setDeviceVisible(true), 250);
      return () => clearTimeout(t);
    } else {
      setDeviceVisible(false);
    }
  }, [deviceSectionVisible]);

  useEffect(() => {
    const el = macbookContainerRef.current;
    if (!el) return;
    const update = () => setIframeScale((el.offsetWidth * 0.74) / 1440);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = iphoneContainerRef.current;
    if (!el) return;
    // 24.87% = screen width as % of the 3840×2160 canvas
    const update = () => setIphoneScale((el.offsetWidth * 0.2487) / 390);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = macbookScreenRef.current;
    if (!el) return;
    const onWheel = (e) => {
      try {
        const cw = iframeRef.current?.contentWindow;
        if (!cw) return;
        e.preventDefault();
        const { scrollY, innerHeight } = cw;
        const scrollHeight = cw.document.documentElement.scrollHeight;
        const maxScroll = scrollHeight - innerHeight - 1;
        const atTop = scrollY <= 0 && e.deltaY < 0;
        const atBottom = scrollY >= maxScroll && e.deltaY > 0;
        if (atTop || atBottom) return;
        cw.scrollTo(0, Math.min(scrollY + e.deltaY, maxScroll));
      } catch (_) {}
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const el = iphoneScreenRef.current;
    if (!el) return;
    const onWheel = (e) => {
      try {
        const cw = iphoneIframeRef.current?.contentWindow;
        if (!cw) return;
        e.preventDefault();
        const { scrollY, innerHeight } = cw;
        const scrollHeight = cw.document.documentElement.scrollHeight;
        const maxScroll = scrollHeight - innerHeight - 1;
        const atTop = scrollY <= 0 && e.deltaY < 0;
        const atBottom = scrollY >= maxScroll && e.deltaY > 0;
        if (atTop || atBottom) return;
        cw.scrollTo(0, Math.min(scrollY + e.deltaY, maxScroll));
      } catch (_) {}
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleTabChange = (tab) => {
    if (tab === templateTab) return;
    setTemplateTab(tab);
    setTabFading(true);
    setTimeout(() => {
      setVisibleTab(tab);
      setTabFading(false);
    }, 110);
  };

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

  const openScreenPopup = (x, y) => {
    clearTimeout(popupDismissTimer.current);
    setScreenPopup({ visible: true, x, y });
    requestAnimationFrame(() => setScreenPopupIn(true));
  };

  const closeScreenPopup = () => {
    setScreenPopupIn(false);
    popupDismissTimer.current = setTimeout(() => setScreenPopup({ visible: false, x: 0, y: 0 }), 180);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!screenPopup.visible) return;
    const dismiss = (e) => {
      if (screenPopupRef.current && screenPopupRef.current.contains(e.target)) return;
      closeScreenPopup();
    };
    document.addEventListener('mousedown', dismiss);
    document.addEventListener('scroll', dismiss, true);
    document.addEventListener('wheel', dismiss, true);
    return () => {
      document.removeEventListener('mousedown', dismiss);
      document.removeEventListener('scroll', dismiss, true);
      document.removeEventListener('wheel', dismiss, true);
    };
  }, [screenPopup.visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const searchResults = searchQuery.trim().length > 0
    ? SEARCH_ITEMS.filter(item => {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) ||
          item.keywords.some(kw => kw.includes(q));
      })
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
                {searchResults.map((item, i) => {
                  const coverImg = (() => {
                    if (item.section === 'template') return cinestokesite;
                    if (item.section === 'grades') return GRADE_PACK.cover;
                    const asset = ASSETS.find(a => a.id === item.productId);
                    return asset?.cover || null;
                  })();
                  return (
                  <div
                    key={item.title}
                    onClick={() => {
                      if (item.section === 'template') {
                        setSelected('template');
                      } else if (item.section === 'grades') {
                        setSelected('grades');
                        setSelectedGrade(GRADE_PACK);
                      } else {
                        const product = ASSETS.find(a => a.id === item.productId);
                        if (product) setSelectedProduct(product);
                        setSelected('assets');
                      }
                      setIsSearchOpen(false);
                      window.scrollTo(0, 0);
                    }}
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
                      overflow: 'hidden',
                    }}>
                      {coverImg
                        ? <img src={coverImg} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M3 9h18M9 21V9" />
                          </svg>
                      }
                    </div>
                    <div>
                      <p style={{ margin: 0, fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#111' }}>{item.title}</p>
                      <p style={{ margin: '3px 0 0', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#888' }}>{item.subtitle}</p>
                    </div>
                  </div>
                  );
                })}
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

      <ContactV2 isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} subtitle="Have any questions or comments? Use this form to contact me at any time." formKey="ba5f1fec-0276-4fe9-b2f5-2c0a060201a1" subject="CINESTOKE SHOP QUERY" />
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSubmitReview={(review) => setLocalReviews(prev => [review, ...prev])}
        productId={reviewProduct.id}
        productTitle={reviewProduct.title}
      />

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
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
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
                className="shop-add-to-cart buy_now_click"
                style={{
                  display: 'block', width: '100%', padding: '16px',
                  background: selectedProduct.checkoutUrl ? '#fff' : 'rgba(255,255,255,0.08)',
                  color: selectedProduct.checkoutUrl ? '#000' : 'rgba(255,255,255,0.35)',
                  border: 'none', cursor: selectedProduct.checkoutUrl ? 'pointer' : 'default',
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: '17px', letterSpacing: '4px',
                  marginBottom: '20px', transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={e => { if (selectedProduct.checkoutUrl) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { if (selectedProduct.checkoutUrl) e.currentTarget.style.opacity = '1'; }}
                onClick={() => selectedProduct.checkoutUrl && window.open(selectedProduct.checkoutUrl, '_blank')}
              >{selectedProduct.checkoutUrl ? 'Buy Now' : 'Coming Soon'}</button>


              {/* Description */}
              {(selectedProduct.paragraphs || [selectedProduct.description]).map((p, i) => (
                <p key={i} style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '15px', letterSpacing: 0,
                  color: 'rgba(255,255,255,0.7)', lineHeight: 1.8,
                  margin: '0 0 16px', fontWeight: 400,
                }}>{p}</p>
              ))}

              {/* Perks */}
              {selectedProduct.perks && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 28px' }}>
                  {selectedProduct.perks.map(perk => (
                    <li key={perk} style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '14px', letterSpacing: 0, fontWeight: 400,
                      color: 'rgba(255,255,255,0.65)', padding: '5px 0',
                      display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                      <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              )}

              {/* Email support */}
              <p style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize: '15px', letterSpacing: 0, fontWeight: 400,
                color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: '16px 0 32px',
              }}>
                Have any issues?{' '}
                <button
                  onClick={() => setIsContactOpen(true)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#fff', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', textDecoration: 'underline' }}
                >Contact us</button>
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
            localReviews={localReviews}
            onWriteReview={(id, title) => { setReviewProduct({ id, title }); setIsReviewOpen(true); }}
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
            <div style={{ display: 'flex', gap: '12px', maxWidth: '426px' }}>
              {[...ASSETS, GRADE_PACK].filter(a => a.id !== selectedProduct.id).map(a => (
                <div
                  key={a.id}
                  onClick={() => {
                    if (a.id === GRADE_PACK.id) {
                      setSelected('grades');
                      setSelectedGrade(GRADE_PACK);
                    } else {
                      setSelectedProduct(a);
                    }
                    window.scrollTo(0, 0);
                  }}
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
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
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
                className="shop-add-to-cart buy_now_click"
                style={{
                  display: 'block', width: '100%', padding: '16px',
                  background: selectedGrade.checkoutUrl ? '#fff' : 'rgba(255,255,255,0.08)',
                  color: selectedGrade.checkoutUrl ? '#000' : 'rgba(255,255,255,0.35)',
                  border: 'none', cursor: selectedGrade.checkoutUrl ? 'pointer' : 'default',
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: '17px', letterSpacing: '4px',
                  marginBottom: '20px', transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={e => { if (selectedGrade.checkoutUrl) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { if (selectedGrade.checkoutUrl) e.currentTarget.style.opacity = '1'; }}
                onClick={() => selectedGrade.checkoutUrl && window.open(selectedGrade.checkoutUrl, '_blank')}
              >{selectedGrade.checkoutUrl ? 'Buy Now' : 'Coming Soon'}</button>

              {selectedGrade.paragraphs.map((p, i) => (
                <p key={i} style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '15px', letterSpacing: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: '0 0 16px', fontWeight: 400 }}>{p}</p>
              ))}

              {selectedGrade.perks && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 28px' }}>
                  {selectedGrade.perks.map(perk => (
                    <li key={perk} style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '14px', letterSpacing: 0, fontWeight: 400,
                      color: 'rgba(255,255,255,0.65)', padding: '5px 0',
                      display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                      <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              )}

              <p style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '15px', letterSpacing: 0, fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: '16px 0 32px' }}>
                Have any issues?{' '}
                <button
                  onClick={() => setIsContactOpen(true)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#fff', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', textDecoration: 'underline' }}
                >Contact us</button>
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
                Apply the grade, set your exposure, add color, toggle on the effects. Same workflow every time. It's faster, and it keeps your work consistent.
              </p>

              {/* Tutorial */}
              <h3 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '32px', letterSpacing: '3px', color: '#fff', margin: '0 0 20px' }}>THE TUTORIAL</h3>
              <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                <iframe
                  src="https://www.youtube.com/embed/tRQBeyuJCr0?cc_load_policy=0"
                  title="Cinestoke LUTs + Powergrades Tutorial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
              <p style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '13px', letterSpacing: 0, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: '12px 0 48px' }}>
                A full walkthrough of how to install and apply the Powergrades in DaVinci Resolve. From importing the pack to applying your first grade.
              </p>

              {/* Examples */}
              <h3 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '32px', letterSpacing: '3px', color: '#fff', margin: '0 0 20px' }}>EXAMPLES</h3>
              <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                <iframe
                  src="https://www.youtube.com/embed/enRR0Z80GCA"
                  title="Cinestoke LUTs + Powergrades Examples"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
              <p style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '13px', letterSpacing: 0, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: '12px 0 40px' }}>
                One workflow for every shot. See the before and after with the Cinestoke Powergrades.
              </p>

              <button
                className="shop-add-to-cart buy_now_click"
                style={{ display: 'block', width: '100%', padding: '15px', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '17px', letterSpacing: '4px', transition: 'opacity 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                onClick={() => window.open(GRADE_PACK.checkoutUrl, '_blank')}
              >Buy Now $35</button>
            </div>
          </div>

          {/* Reviews */}
          <ReviewsSection
            currentProductId="luts-powergrades"
            localReviews={localReviews}
            onWriteReview={(id, title) => { setReviewProduct({ id, title }); setIsReviewOpen(true); }}
            onProductClick={(productId) => {
              if (productId === 'luts-powergrades') {
                window.scrollTo(0, 0);
              } else {
                const p = ASSETS.find(a => a.id === productId);
                if (p) { setSelected('assets'); setSelectedGrade(null); setSelectedProduct(p); window.scrollTo(0, 0); }
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
            <div style={{ display: 'flex', gap: '12px', maxWidth: '426px' }}>
              {ASSETS.map(a => (
                <div
                  key={a.id}
                  onClick={() => { setSelected('assets'); setSelectedGrade(null); setSelectedProduct(a); window.scrollTo(0, 0); }}
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

      {(() => {
        const inter = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        const body = { fontFamily: inter, fontSize: '15px', color: 'rgba(255,255,255,0.55)', letterSpacing: 0, lineHeight: 1.8, margin: 0 };
        const bold = { color: '#fff', fontWeight: 600, fontFamily: 'inherit' };
        const sectionLabel = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '19px', letterSpacing: '2px', color: '#fff', margin: '0 0 10px' };

        const FEATURES = [
          { name: 'Background video hero', desc: 'Your reel plays full-screen the moment someone lands on your site. First impression locked.' },
          { name: 'Client case study carousel', desc: 'A dedicated slide carousel for each client. Add as many clients as you want.' },
          { name: 'Before/after color grade slider', desc: 'Show the difference your grade makes. Drag to reveal the before and after side by side.' },
          { name: 'Infinite image gallery', desc: 'A smooth, auto-scrolling strip of your photos that loops endlessly.' },
          { name: 'Digital shop', desc: 'Polar-powered checkout with instant download delivery. No backend required.' },
          { name: 'Contact form', desc: 'Clients fill out a form and it lands straight in your inbox. Ready to go from day one.' },
          { name: 'Light & dark mode', desc: 'Persisted to localStorage across sessions. One-click toggle via the logo.' },
          { name: 'Hosting included', desc: 'Fully managed hosting. Fast load times worldwide. Nothing for you to set up or maintain.' },
          { name: 'Mobile responsive', desc: 'Dedicated mobile layouts, videos, and interactions. Tested on iOS & Android.' },
          { name: 'Video embeds', desc: 'Embed your YouTube or Vimeo links to display videos anywhere on the site.' },
          { name: 'Link landing page', desc: 'A clean page built for your social media bio link. Everything in one place: your reel, work, shop, and contact.', link: 'https://www.cinestoke.com/links' },
          { name: 'Ongoing updates included', desc: 'New client, new reel, new copy. Send it over and it\'s handled.' },
        ];

        const FAQS = [
          { q: 'What do I need to provide?', a: 'Your reels, client videos, logos, brand colors, and any copy you want on the site. If you don\'t have files ready, just send me your social handles and I can pull content directly from there.' },
          { q: 'How long does the build take?', a: 'The build can be done in a day. Send your assets and I\'ll get it live fast.' },
          { q: 'Do you host it for me?', a: 'Yes. I handle all the hosting for a small monthly fee. You own your domain and it points to your site, but the infrastructure is fully managed on my end.' },
          { q: 'What about my domain?', a: 'You buy and own your domain through any registrar (like Namecheap or Google Domains). I handle the rest: pointing it to your site, SSL, all of it. You keep full ownership of it no matter what.' },
          { q: 'How do updates work?', a: 'Just send me what you need changed and I handle it. New client, new reel, copy update. Whatever it is, I\'ll get it live.' },
          { q: 'Is the site optimized for SEO?', a: 'Yes. Try typing "cinestoke" into Google right now. This site is #1. Yours will be built the same way.' },
          { q: 'Can I add more clients later?', a: 'Absolutely. Adding clients is one of the most common requests. Send your footage and I\'ll get it in.' },
          { q: 'Do I need to know how to code?', a: 'Not at all. Everything is handled for you: setup, deployment, and ongoing changes.' },
          { q: 'Are there any monthly fees?', a: 'There is a small monthly hosting fee. Reach out and I\'ll walk you through exactly what\'s included.' },
        ];

        return (
          <>

            {/* ── HOOK + mobile fallback — only when on template page ── */}
            {selected === 'template' && (
              <div className="shop-content-reveal">
                <div style={{ textAlign: 'center', padding: '32px 40px 40px' }}>
                  <p style={{ fontFamily: 'Impact, sans-serif', fontSize: '12px', letterSpacing: '5px', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' }}>CINESTOKE TEMPLATE</p>
                  <h2 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(48px, 8vw, 96px)', letterSpacing: '4px', color: '#fff', margin: '0 0 20px', lineHeight: 1 }}>Your Portfolio.<br />Built to Close.</h2>
                  <p style={{ fontFamily: inter, fontSize: '17px', color: 'rgba(255,255,255,0.6)', letterSpacing: 0, maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
                    The exact site you're on right now. Custom-built for you, on your domain, ready to close clients from day one.
                  </p>
                </div>
                {isMobile && (
                  <div style={{ maxWidth: '980px', margin: '0 auto 40px', padding: '0 24px' }}>
                    <img src={cinestokesite} alt="Cinestoke website on MacBook" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                )}
              </div>
            )}

            {/* ── DEVICES — always mounted so iframes never reload; CSS hides when not on template ── */}
            {!isMobile && (
              <div style={{ display: deviceSectionVisible ? 'block' : 'none' }}>
                {/* Toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                  <div style={{ position: 'relative', display: 'inline-flex', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '999px', padding: '4px', gap: '2px' }}>
                    {/* Sliding pill */}
                    <div style={{
                      position: 'absolute',
                      top: '4px', left: '4px',
                      width: 'calc(50% - 5px)',
                      height: 'calc(100% - 8px)',
                      background: '#fff',
                      borderRadius: '999px',
                      transform: templateView === 'mobile' ? 'translateX(calc(100% + 2px))' : 'translateX(0)',
                      transition: 'transform 0.22s ease',
                      pointerEvents: 'none',
                    }} />
                    {[['desktop', 'Desktop'], ['mobile', 'Mobile']].map(([val, lbl]) => (
                      <button key={val} onClick={() => setTemplateView(val)} style={{ position: 'relative', zIndex: 1, padding: '8px 24px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontFamily: inter, fontSize: '14px', fontWeight: 500, letterSpacing: '0.5px', background: 'transparent', color: templateView === val ? '#000' : 'rgba(255,255,255,0.45)', transition: 'color 0.22s ease' }}>{lbl}</button>
                    ))}
                  </div>
                </div>

                {/* Device mockup — padding-bottom gives definite height so phone percentage heights resolve */}
                <div style={{ maxWidth: '900px', margin: '0 auto 56px', padding: '0 40px' }}>
                  <div style={{ position: 'relative', paddingBottom: '56.25%' }}>

                    {/* Desktop */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      opacity: templateView === 'desktop' ? 1 : 0,
                      pointerEvents: templateView === 'desktop' ? 'auto' : 'none',
                      transition: 'opacity 0.28s ease',
                      willChange: 'opacity',
                    }}>
                      <div ref={macbookContainerRef} style={{ position: 'relative', width: '100%' }}>
                        <img src={macbookPng} alt="" style={{ width: '100%', display: 'block', opacity: deviceVisible ? 1 : 0, transition: 'opacity 0.5s ease' }} />
                        <div ref={macbookMaskRef} style={{
                          position: 'absolute', top: 0, left: 0,
                          width: '100%', height: '100%',
                          overflow: 'hidden',
                          WebkitMaskImage: `url(${macbookScreenPng})`,
                          maskImage: `url(${macbookScreenPng})`,
                          WebkitMaskSize: '100% 100%',
                          maskSize: '100% 100%',
                          zIndex: 1,
                          pointerEvents: 'none',
                        }}>
                          <iframe
                            ref={iframeRef}
                            src={iframesReady && iframesEverShown.current ? '/' : 'about:blank'}
                            title="Cinestoke live preview"
                            allow="autoplay"
                            style={{
                              position: 'absolute',
                              top: '2.3%',
                              left: '13.5%',
                              width: '1440px',
                              height: '900px',
                              border: 'none',
                              transform: `scale(${iframeScale})`,
                              transformOrigin: 'top left',
                              pointerEvents: 'none',
                            }}
                          />
                        </div>
                        {/* Transparent overlay exactly over screen — captures wheel events only here */}
                        <div ref={macbookScreenRef} onClick={(e) => openScreenPopup(e.clientX, e.clientY)} style={{
                          position: 'absolute',
                          top: '7.73%', left: '16.74%',
                          width: '66.59%', height: '77.18%',
                          zIndex: 2,
                          cursor: 'pointer',
                        }} />
                      </div>
                    </div>

                    {/* Mobile */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: templateView === 'mobile' ? 1 : 0,
                      pointerEvents: templateView === 'mobile' ? 'auto' : 'none',
                      transition: 'opacity 0.28s ease',
                      willChange: 'opacity',
                    }}>
                      <div ref={iphoneContainerRef} style={{ height: '100%', position: 'relative' }}>
                        {/* Live site masked to iPhone screen shape */}
                        <div ref={iphoneMaskRef} style={{
                          position: 'absolute', top: 0, left: 0,
                          width: '100%', height: '100%',
                          overflow: 'hidden',
                          WebkitMaskImage: `url(${iPhoneScreenPng})`,
                          maskImage: `url(${iPhoneScreenPng})`,
                          WebkitMaskSize: '100% 100%',
                          maskSize: '100% 100%',
                          zIndex: 1,
                          pointerEvents: 'none',
                        }}>
                          <iframe
                            ref={iphoneIframeRef}
                            src={iframesReady && iframesEverShown.current ? '/' : 'about:blank'}
                            title="Cinestoke mobile preview"
                            allow="autoplay"
                            style={{
                              position: 'absolute',
                              top: '3.19%',
                              left: '37.5%',
                              width: '390px',
                              height: '900px',
                              border: 'none',
                              transform: `scale(${iphoneScale})`,
                              transformOrigin: 'top left',
                              pointerEvents: 'none',
                            }}
                          />
                        </div>
                        {/* iPhone frame sits on top of the masked content */}
                        <img src={iphoneFrameImg} alt="Cinestoke website on iPhone" style={{ height: '100%', width: 'auto', display: 'block', position: 'relative', zIndex: 2, opacity: deviceVisible ? 1 : 0, transition: 'opacity 0.5s ease' }} />
                        {/* Transparent overlay exactly over screen — captures wheel events only here */}
                        <div ref={iphoneScreenRef} onClick={(e) => openScreenPopup(e.clientX, e.clientY)} style={{
                          position: 'absolute',
                          top: '3.19%', left: '37.5%',
                          width: '24.87%', height: '93.89%',
                          zIndex: 3,
                          cursor: 'pointer',
                        }} />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ── SCREEN CLICK POPUP ── */}
            {screenPopup.visible && (
              <div
                ref={screenPopupRef}
                onClick={() => { window.open('/', '_blank'); closeScreenPopup(); }}
                style={{
                  position: 'fixed',
                  top: screenPopup.y + 12,
                  left: screenPopup.x + 12,
                  zIndex: 9999,
                  opacity: screenPopupIn ? 1 : 0,
                  transition: 'opacity 0.15s ease',
                  background: 'rgba(20,20,20,0.96)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: '13px', fontWeight: 500, color: '#fff', letterSpacing: '0.2px' }}>View in Browser</span>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 11L11 2M11 2H5.5M11 2V7.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}

            {/* ── TWO-COLUMN + CTA — only when on template page ── */}
            {selected === 'template' && (
            <div className="shop-content-reveal">
            {/* ── TWO-COLUMN LAYOUT ── */}
            <div style={{ display: 'flex', gap: isMobile ? 0 : '64px', maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '0 24px' : '0 40px', flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-start' }}>

              {/* LEFT COLUMN */}
              <div style={{ flex: '1 1 0', minWidth: 0, paddingBottom: '0', minHeight: isMobile ? 'auto' : '520px' }}>

                {/* About — above tabs */}
                <p style={{ ...body, marginBottom: '32px' }}>
                  <span style={{ fontStyle: 'italic', fontFamily: 'inherit' }}>The Cinestoke Template</span> is a <strong style={bold}>done-for-you</strong> portfolio crafted for creative filmmakers. Built on years of industry experience, it addresses all needs of filmmakers, photographers, production studios, and video creators. Showcase your work and close leads with a site that moves as fast as your footage, sell digital products to generate passive income, and tell client stories with a full case study system.
                </p>

                {/* TABS */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.12)', marginBottom: '40px' }}>
                  {['Overview', 'License', 'Support', 'FAQ'].map(tab => (
                    <button key={tab} onClick={() => handleTabChange(tab)} style={{ background: 'none', border: 'none', borderBottom: templateTab === tab ? '2px solid #fff' : '2px solid transparent', marginBottom: '-1px', color: templateTab === tab ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: inter, fontSize: '14px', fontWeight: templateTab === tab ? 500 : 400, padding: '0 20px 14px', transition: 'color 0.2s ease, border-color 0.2s ease' }}>{tab}</button>
                  ))}
                </div>

                {/* TAB CONTENT — fades between tabs */}
                <div style={{ opacity: tabFading ? 0 : 1, transition: 'opacity 0.12s ease' }}>

                {/* OVERVIEW */}
                {visibleTab === 'Overview' && (
                  <>
                    {/* Sub-sections */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '56px', textAlign: 'left' }}>
                      <div><p style={sectionLabel}>For Photographers &amp; Filmmakers</p><p style={body}>Videographers and production studios use this site as their <strong style={bold}>go-to portfolio</strong>. Display their work, attract better clients, and build a presence that matches the quality of their craft.</p></div>
                      <div><p style={sectionLabel}>Built-In Shop Included</p><p style={body}>The template includes the full shop you're browsing right now. Sell presets, LUTs, overlays, or any digital product directly from your site. <strong style={bold}>Instant delivery. No platform cut.</strong> Powered by Polar with instant delivery.</p></div>
                      <div><p style={sectionLabel}>Customizable in 5 Minutes</p><p style={body}>Send your assets (reels, client videos, logos) and your site ships within a day. Every detail is handled. Change your look, update a client, swap your reel. <strong style={bold}>Just send it over and it's live.</strong></p></div>
                      <div><p style={sectionLabel}>Ongoing Support Included</p><p style={body}>This isn't a handoff-and-goodbye. New client won? Add them. Shot a new reel? It's up. Update colors and appearance? Done. <strong style={bold}>Your site stays current</strong> as your business grows.</p></div>
                    </div>

                  </>
                )}

                {/* LICENSE */}
                {visibleTab === 'License' && (
                  <div>
                    <p style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '24px', letterSpacing: '2px', color: '#fff', margin: '0 0 20px' }}>Single Use License</p>
                    <p style={{ ...body, marginBottom: '24px', fontSize: '16px', color: 'rgba(255,255,255,0.65)' }}>Can only be used by you or one client for one end product. You cannot resell or redistribute this site in its original or modified state.</p>
                    <p style={{ ...body, fontSize: '15px' }}>This license covers the custom build of the Cinestoke portfolio for a single brand or individual. Each new client requires a separate engagement.</p>
                  </div>
                )}

                {/* SUPPORT */}
                {visibleTab === 'Support' && (
                  <div>
                    <p style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '24px', letterSpacing: '2px', color: '#fff', margin: '0 0 8px' }}>24/7 Support</p>
                    <p style={{ ...body, marginBottom: '32px', fontSize: '16px', color: 'rgba(255,255,255,0.65)' }}>Questions about your build, updates, or anything on the site? Reach out and I'll get back to you right away. Typically within a few hours.</p>
                    <button onClick={() => setIsContactOpen(true)} className="shop-get-in-touch" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '16px', letterSpacing: '4px', color: '#000', backgroundColor: '#fff', padding: '14px 40px', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>GET IN TOUCH</button>
                  </div>
                )}

                {/* FAQ */}
                {visibleTab === 'FAQ' && (
                  <div>
                    {FAQS.map((faq, i) => (
                      <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '0' }}>
                        <button onClick={() => setOpenFaqs(s => ({ ...s, [i]: !s[i] }))} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', gap: '16px', textAlign: 'left' }}>
                          <span style={{ fontFamily: inter, fontSize: '15px', color: '#fff', fontWeight: 500, letterSpacing: 0 }}>{faq.q}</span>
                          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px', lineHeight: 1, flexShrink: 0, fontWeight: 300 }}>{openFaqs[i] ? '−' : '+'}</span>
                        </button>
                        <div style={{ display: 'grid', gridTemplateRows: openFaqs[i] ? '1fr' : '0fr', transition: 'grid-template-rows 0.35s ease' }}>
                          <div style={{ overflow: 'hidden' }}>
                            <p style={{ ...body, paddingBottom: '20px' }}>{faq.a}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                )}

                </div> {/* end fade wrapper */}
              </div>

              {/* RIGHT COLUMN — features accordion */}
              <div style={{ flex: isMobile ? '1 1 auto' : '0 0 260px', paddingTop: isMobile ? '0' : '58px', width: isMobile ? '100%' : undefined }}>
                <p style={{ fontFamily: 'Impact, sans-serif', fontSize: '12px', letterSpacing: '5px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>FEATURES</p>
                {FEATURES.map((f, i) => (
                  <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button onClick={() => setOpenFeatures(s => ({ ...s, [i]: !s[i] }))} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 0', textAlign: 'left' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', flexShrink: 0 }}>✓</span>
                      <span style={{ flex: 1, fontFamily: inter, fontSize: '13px', color: '#fff', letterSpacing: 0, fontWeight: 500 }}>{f.name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '16px', lineHeight: 1, flexShrink: 0, fontWeight: 300 }}>{openFeatures[i] ? '×' : '+'}</span>
                    </button>
                    <div style={{ display: 'grid', gridTemplateRows: openFeatures[i] ? '1fr' : '0fr', transition: 'grid-template-rows 0.35s ease' }}>
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontFamily: inter, fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: 0, lineHeight: 1.7, margin: f.link ? '0 0 8px' : '0 0 14px', paddingLeft: '22px' }}>{f.desc}</p>
                        {f.link && <a href={f.link} target="_blank" rel="noreferrer" style={{ display: 'block', fontFamily: inter, fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: 0, paddingLeft: '22px', marginBottom: '14px', textDecoration: 'underline' }}>See example</a>}
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              </div>

            </div>

            {/* ── CTA (full width, below two-column) ── */}
            <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '48px 40px 80px', marginTop: '0' }}>
              <p style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(36px, 6vw, 56px)', letterSpacing: '6px', color: '#fff', margin: '0 0 8px' }}>LET'S BUILD YOUR SITE</p>
              <p style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: '15px', letterSpacing: 0, color: 'rgba(255,255,255,0.5)', margin: '0 0 36px' }}>Send your assets and you'll have a site worth sending to clients.</p>
              <button onClick={() => setIsContactOpen(true)} className="shop-get-in-touch" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '18px', letterSpacing: '4px', color: '#000', backgroundColor: '#fff', padding: '16px 56px', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>GET IN TOUCH</button>
            </div>

            </div>
            )}
          </>
        );
      })()}
    <p style={{ textAlign: 'center', padding: '20px', fontFamily: "'Inter', -apple-system, sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3px', margin: 0 }}>
      Powered by the <span onClick={() => window.location.href = '/shop/tmplt'} style={{ color: 'inherit', textDecoration: 'underline', cursor: 'default', fontFamily: 'inherit', fontSize: 'inherit', transition: 'color 0.2s ease, text-shadow 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.textShadow = '0 0 12px rgba(255,255,255,0.6)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; e.currentTarget.style.textShadow = 'none'; }}>Cinestoke Template</span>.
    </p>
    </div>
  );
};

export default ShopBars;
