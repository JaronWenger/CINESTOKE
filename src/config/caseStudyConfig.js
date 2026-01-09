// Case Study Configuration
// Maps each client to their available slides and content

import SlideOne from '../components/SlideOne';
import SlideMain from '../components/SlideMain';
import SlideGeo from '../components/SlideGeo';
import SlideLogo from '../components/SlideLogo';
import SlideSplits from '../components/SlideSplits';
import SlideSocial from '../components/SlideSocial';
// Future slides can be imported here
// import SlideCustom from '../components/SlideCustom';

// Import SVG logos for carousel
import { ReactComponent as Seadoo } from '../assets/Seadoo.svg';
import { ReactComponent as TCO } from '../assets/TCO.svg';
import { ReactComponent as GFF } from '../assets/GFF.svg';
import { ReactComponent as IR } from '../assets/IR.svg';
import { ReactComponent as Slate } from '../assets/Slate.svg';
import { ReactComponent as SWA } from '../assets/SWA.svg';
import { ReactComponent as BG } from '../assets/BG.svg';

// Import case study assets
import swaLogo from '../assets/CASESTUDIES/Brands/SWApp.webp';
import smallWorldVideo from '../assets/CASESTUDIES/SmallWorldMain.mp4';
import smallWorldVideoMobile from '../assets/CASESTUDIES/SmallWorldMainPhone.mp4';
import smallWorldGeoVideo from '../assets/CASESTUDIES/SmallWorldGeo.mp4';
import smallWorldGeoVideoMobile from '../assets/CASESTUDIES/SmallWorldGeoPhone.mp4';
import smallWorldSocialVideo from '../assets/CASESTUDIES/Social/SWArecording.mov';
import smallWorldSplits from '../assets/CASESTUDIES/Splits/SWAsplits.webp';
import smallWorldSplits2 from '../assets/CASESTUDIES/Splits/SWAsplits2.webp';
import seadooLogo from '../assets/CASESTUDIES/Brands/Seadoopp.webp';
import seadooVideo from '../assets/CASESTUDIES/SeadooMain.mp4';
import seadooVideoMobile from '../assets/CASESTUDIES/SeadooMainPhone.mp4';
import SeadooSocialVideo from '../assets/CASESTUDIES/Social/SEADOOrecording.mov';
import slateLogo from '../assets/CASESTUDIES/Brands/Slatepp.webp';
import slateVideo from '../assets/CASESTUDIES/SlateMain.mp4';
import slateVideoMobile from '../assets/CASESTUDIES/SlateMainPhone.mp4';
import irLogo from '../assets/CASESTUDIES/Brands/IRpp.webp';
import gffLogo from '../assets/CASESTUDIES/Brands/GFFpp.webp';
import tcoLogo from '../assets/CASESTUDIES/Brands/TCOpp.webp';
import BGLogo from '../assets/CASESTUDIES/Brands/BGpp.webp';
import BGVideo from '../assets/CASESTUDIES/BGMain.mp4';
import BGVideoMobile from '../assets/CASESTUDIES/BGMainPhone.mp4';
import BGGeoVideo from '../assets/CASESTUDIES/BGGeo.mp4';
import BGGeoVideoMobile from '../assets/CASESTUDIES/BGGeoPhone.mp4';
import BGSplits from '../assets/CASESTUDIES/Splits/BGsplits.webp';
import BGSplits2 from '../assets/CASESTUDIES/Splits/BGsplits2.webp';
import TCOVideo from '../assets/CASESTUDIES/TCOMain.mp4';
import TCOVideoMobile from '../assets/CASESTUDIES/TCOMainPhone.mp4';
import GFFVideo from '../assets/CASESTUDIES/GFFMain.mp4';
import GFFVideoMobile from '../assets/CASESTUDIES/GFFMainPhone.mp4';
import IRVideo from '../assets/CASESTUDIES/IRMain.mp4';
import IRVideoMobile from '../assets/CASESTUDIES/IRMainPhone.mp4';
import IRLogoVideo from '../assets/CASESTUDIES/IRLogo.mp4';
import IRLogoVideoMobile from '../assets/CASESTUDIES/IRLogoPhone.mp4';
import IRSocialVideo from '../assets/CASESTUDIES/Social/IRrecording.mov';
import IRSplits from '../assets/CASESTUDIES/Splits/IRsplits.webp';
import SlateLogoVideo from '../assets/CASESTUDIES/SlateLogo.mp4';
import SlateLogoVideoMobile from '../assets/CASESTUDIES/SlateLogoPhone.mp4';
import SlateSocialVideo from '../assets/CASESTUDIES/Social/SLATErecording.mov';
import GFFSplits from '../assets/CASESTUDIES/Splits/GFFsplits.webp';
import SeadooSplits from '../assets/CASESTUDIES/Splits/Seadoosplits.webp';
import SeadooSplits2 from '../assets/CASESTUDIES/Splits/Seadoosplits2.webp';
import TCOSplits from '../assets/CASESTUDIES/Splits/TCOsplits.webp';
import TCOSocialVideo from '../assets/CASESTUDIES/Social/TCOrecording.mov';
/**
 * Case Study Configuration
 * 
 * Structure:
 * - clientName: Must match the component name from ClientsV2 (e.g., "SWA", "Seadoo")
 * - slides: Array of slide configurations
 *   - type: String identifier for the slide type
 *   - component: React component to render
 *   - props: Props to pass to the component
 *     - SlideOne: title, description, profilePic, video, logoUrl (optional)
 *     - SlideGeo: location, video
 *     - SlideSplits: image
 *     - SlideSocial: link, video
 */
export const caseStudyConfig = {
  SWA: {
    name: 'Small World Adventures',
    logoComponent: SWA,
    order: 5, // Order in carousel (1-6) - at index 4, centered position (IR is to the left at order 4)
    slides: [
      {
        type: 'main',
        component: SlideOne,
        props: {
          title: 'Small World Adventures',
          description: 'Join us for 7 days of paddling in a tropical paradise-it\'ll be the kayaking trip of a lifetime! We wrote the book on kayaking in Ecuador (literally).',
          profilePic: swaLogo,
          video: smallWorldVideo,
          videoMobile: smallWorldVideoMobile,
          logoUrl: 'https://smallworldadventures.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGngnNyxych8dOXUxRyE5LNnjom0WXlb07xOD9eNFb_sys2avnKCtiekB3Mtfw_aem_4vRTq4qC57QgWfcev-Aiow'
        }
      },
      {
        type: 'geo',
        component: SlideGeo,
        props: {
          location: '📍 Borja, Napo, Ecuador',
          video: smallWorldGeoVideo,
          videoMobile: smallWorldGeoVideoMobile
        }
      },
      {
        type: 'splits',
        component: SlideSplits,
        props: {
          image: smallWorldSplits2
        }
      },
      {
        type: 'social',
        component: SlideSocial,
        props: {
          link: 'https://www.instagram.com/p/DSxPFBKDvc8/',
          video: smallWorldSocialVideo
        }
      },
      {
        type: 'splits',
        component: SlideSplits,
        props: {
          image: smallWorldSplits
        }
      }
    ]
  },
  Seadoo: {
    name: 'Seadoo',
    logoComponent: Seadoo,
    order: 6, // Order in carousel (1-6)
    slides: [
      {
        type: 'main',
        component: SlideMain,
        props: {
          title: 'Sea-Doo',
          description: 'One of the world leaders in personal watercraft and pontoon boats. Explore new models and cutting-edge technology.',
          profilePic: seadooLogo,
          video: seadooVideo,
          videoMobile: seadooVideoMobile,
          logoUrl: 'https://sea-doo.brp.com/us/en/'
        }
      },
      {
        type: 'splits',
        component: SlideSplits,
        props: {
          image: SeadooSplits
        }
      },
      {
        type: 'social',
        component: SlideSocial,
        props: {
          link: 'https://www.instagram.com/p/DFN8bEkxHoE/',
          video: SeadooSocialVideo
        }
      },
      {
        type: 'splits',
        component: SlideSplits,
        props: {
          image: SeadooSplits2
        }
      }
    ]
  },
  Slate: {
    name: 'Slate',
    logoComponent: Slate,
    order: 3, // Order in carousel (1-6) - moved to make room for IR at 4
    slides: [
      {
        type: 'main',
        component: SlideMain,
        props: {
          title: 'Slate',
          description: 'Compete against your friends. Create and join real-money contests on your favorite real-life, skill-based games and competitions.',
          profilePic: slateLogo,
          video: slateVideo,
          videoMobile: slateVideoMobile,
          logoUrl: 'https://www.getslate.io/'
        }
      },
      {
        type: 'logo',
        component: SlideLogo,
        props: {
          title: 'Slate Logo Animation',
          video: SlateLogoVideo,
          videoMobile: SlateLogoVideoMobile
        }
      },
      {
        type: 'social',
        component: SlideSocial,
        props: {
          link: 'https://www.instagram.com/reel/DLIwyB4poCx/',
          video: SlateSocialVideo
        }
      }
    ]
  },
  TCO: {
    name: 'TCO',
    logoComponent: TCO,
    order: 1, // Order in carousel (1-6)
    slides: [
        {
          type: 'main',
          component: SlideMain,
          props: {
            title: 'TCO Fly Shop',
            description: 'Among the oldest and largest fly fishing outfitters, known for delivering the highest quality gear, fly tying materials, and expert customer service.',
            profilePic: tcoLogo,
            video: TCOVideo,
            videoMobile: TCOVideoMobile,
            logoUrl: 'https://www.tcoflyfishing.com/'
          }
        },
        {
          type: 'splits',
          component: SlideSplits,
          props: {
            image: TCOSplits
          }
        },
        {
          type: 'social',
          component: SlideSocial,
          props: {
            link: 'https://www.instagram.com/p/CqGzm_zL6ql/',
            video: TCOSocialVideo
          }
        }
      ]
  },
  GFF: {
    name: 'GFF',
    logoComponent: GFF,
    order: 2, // Order in carousel (1-6) - original order
    slides: [
        {
          type: 'main',
          component: SlideMain,
          props: {
            title: 'Great Falls Foundation',
            description: 'A non-profit charitable organization dedicated to promoting whitewater competition and an active and outdoor lifestyle.',
            profilePic: gffLogo,
            video: GFFVideo,
            videoMobile: GFFVideoMobile,
            logoUrl: 'https://www.greatfallsfoundation.org/'
          }
        },
        {
          type: 'splits',
          component: SlideSplits,
          props: {
            image: GFFSplits
          }
        }
      ]
  },
  IR: {
    name: 'IR',
    logoComponent: IR,
    order: 4, // Order in carousel (1-6) - to the left of SWA (order 5)
    slides: [
        {
          type: 'main',
          component: SlideMain,
          props: {
            title: 'Immersion Research',
            description: 'A designer and manufacturer of paddling gear for whitewater kayaking, rafting, canoeing, and other paddlesports.',
            profilePic: irLogo,
            video: IRVideo,
            videoMobile: IRVideoMobile,
            logoUrl: 'https://immersionresearch.com/'
          }
        },
        {
          type: 'social',
          component: SlideSocial,
          props: {
            link: 'https://www.instagram.com/p/CoA7bJPtdB-/',
            video: IRSocialVideo
          }
        },
        {
          type: 'splits',
          component: SlideSplits,
          props: {
            image: IRSplits
          }
        },
        {
          type: 'logo',
          component: SlideLogo,
          props: {
            title: 'IR Logo Animation',
            video: IRLogoVideo,
            videoMobile: IRLogoVideoMobile
          }
        }
      ]
  },
  BG: {
    name: 'BG',
    logoComponent: BG,
    order: 7, // Order in carousel (1-6)
    slides: [
      {
        type: 'main',
        component: SlideMain,
         props: {
           title: 'Blu Goo Anti-Fog',
           description: 'An anti fog lens cleaner giving you the best visuals. Perfect for snow goggles, scuba gear, and everyday glasses - just to name a few.',
           profilePic: BGLogo,
           video: BGVideo,
           videoMobile: BGVideoMobile,
           logoUrl: 'https://blugoo.com/'
         }
      },
      {
        type: 'splits',
        component: SlideSplits,
        props: {
          image: BGSplits
        }
      },
      {
        type: 'geo',
        component: SlideGeo,
        props: {
          location: '📍 Mount Bohemia, MI',
          video: BGGeoVideo,
          videoMobile: BGGeoVideoMobile
        }
      },
      {
        type: 'splits',
        component: SlideSplits,
        props: {
          image: BGSplits2
        }
      }
      // No geo slide for Seadoo
    ]
  }
};

/**
 * Get case study config for a specific client
 * @param {string} clientName - The client name (must match ClientsV2 component name)
 * @returns {object|null} - The client's case study config or null if not found
 */
export const getCaseStudyForClient = (clientName) => {
  console.log('getCaseStudyForClient - Looking for:', clientName);
  console.log('getCaseStudyForClient - Available keys:', Object.keys(caseStudyConfig));
  const result = caseStudyConfig[clientName] || null;
  console.log('getCaseStudyForClient - Result:', result);
  return result;
};

/**
 * Get all clients that have case studies
 * @returns {array} - Array of client names that have slides
 */
export const getClientsWithCaseStudies = () => {
  return Object.keys(caseStudyConfig).filter(
    clientName => caseStudyConfig[clientName].slides.length > 0
  );
};

/**
 * Get client logo components for carousel
 * Automatically sorted by order property in config
 * @returns {array} - Array of React components (SVG logos) in order
 */
export const getClientLogoComponents = () => {
  return Object.values(caseStudyConfig)
    .sort((a, b) => (a.order || 999) - (b.order || 999))
    .map(client => client.logoComponent)
    .filter(Boolean); // Remove any undefined
};

/**
 * Get client names in the same order as logo components
 * Uses the config key as the identifier (e.g., "SWA", "Seadoo")
 * @returns {array} - Array of client name strings (config keys)
 */
export const getClientNames = () => {
  return Object.entries(caseStudyConfig)
    .sort(([, a], [, b]) => (a.order || 999) - (b.order || 999))
    .map(([key]) => key); // Use the config key as the identifier
};

/**
 * Get ALL slides from ALL clients flattened into one array (in order)
 * Each slide includes client metadata for tracking
 * @returns {array} - Array of { clientKey, clientName, slideIndex, totalClientSlides, slide }
 */
export const getAllSlidesFlattened = () => {
  const sortedClients = Object.entries(caseStudyConfig)
    .sort(([, a], [, b]) => (a.order || 999) - (b.order || 999));

  const flattened = [];

  sortedClients.forEach(([clientKey, clientData]) => {
    clientData.slides.forEach((slide, slideIndex) => {
      flattened.push({
        clientKey,
        clientName: clientData.name,
        slideIndex,
        totalClientSlides: clientData.slides.length,
        isFirstSlideOfClient: slideIndex === 0,
        isLastSlideOfClient: slideIndex === clientData.slides.length - 1,
        slide
      });
    });
  });

  return flattened;
};

/**
 * Get the global index where a specific client's slides start
 * @param {string} clientKey - The client key (e.g., "SWA")
 * @returns {number} - The starting index in the flattened array
 */
export const getClientStartIndex = (clientKey) => {
  const allSlides = getAllSlidesFlattened();
  return allSlides.findIndex(s => s.clientKey === clientKey);
};

/**
 * Get the order value for a specific client
 * @param {string} clientKey - The client key (e.g., "SWA")
 * @returns {number} - The order value (1-7) or 999 if not found
 */
export const getClientOrder = (clientKey) => {
  const client = caseStudyConfig[clientKey];
  return client?.order || 999;
};

