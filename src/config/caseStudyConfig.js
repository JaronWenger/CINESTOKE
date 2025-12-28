// Case Study Configuration
// Maps each client to their available slides and content

import SlideOne from '../components/SlideOne';
import SlideMain from '../components/SlideMain';
import SlideGeo from '../components/SlideGeo';
// Future slides can be imported here
// import SlideCustom from '../components/SlideCustom';

// Import SVG logos for carousel
import { ReactComponent as Seadoo } from '../assets/Seadoo.svg';
import { ReactComponent as TCO } from '../assets/TCO.svg';
import { ReactComponent as GFF } from '../assets/GFF.svg';
import { ReactComponent as IR } from '../assets/IR.svg';
import { ReactComponent as Slate } from '../assets/Slate.svg';
import { ReactComponent as SWA } from '../assets/SWA.svg';

// Import case study assets
import swaLogo from '../assets/CASESTUDIES/Brands/SWApp.webp';
import smallWorldVideo from '../assets/CASESTUDIES/SmallWorldMain.mp4';
import smallWorldGeoVideo from '../assets/CASESTUDIES/SmallWorldGeo.mp4';
import seadooLogo from '../assets/CASESTUDIES/Brands/Seadoopp.webp';
import seadooVideo from '../assets/CASESTUDIES/SeadooMain.mp4';
import slateLogo from '../assets/CASESTUDIES/Brands/Slatepp.webp';
import slateVideo from '../assets/CASESTUDIES/SlateMain.mp4';
import irLogo from '../assets/CASESTUDIES/Brands/IRpp.webp';
import gffLogo from '../assets/CASESTUDIES/Brands/GFFpp.webp';
import tcoLogo from '../assets/CASESTUDIES/Brands/TCOpp.webp';

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
 */
export const caseStudyConfig = {
  SWA: {
    name: 'Small World Adventures',
    logoComponent: SWA,
    order: 6, // Order in carousel (1-6)
    slides: [
      {
        type: 'main',
        component: SlideOne,
        props: {
          title: 'Small World Adventures',
          description: 'Join us for 7 days of paddling in a tropical paradise-it\'ll be the kayaking trip of a lifetime! We wrote the book on kayaking in Ecuador (literally).',
          profilePic: swaLogo,
          video: smallWorldVideo,
          logoUrl: 'https://smallworldadventures.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGngnNyxych8dOXUxRyE5LNnjom0WXlb07xOD9eNFb_sys2avnKCtiekB3Mtfw_aem_4vRTq4qC57QgWfcev-Aiow'
        }
      },
      {
        type: 'geo',
        component: SlideGeo,
        props: {
          location: '📍 Borja, Napo, Ecuador',
          video: smallWorldGeoVideo
        }
      }
    ]
  },
  Seadoo: {
    name: 'Seadoo',
    logoComponent: Seadoo,
    order: 1, // Order in carousel (1-6)
    slides: [
      {
        type: 'main',
        component: SlideMain,
        props: {
          title: 'Seadoo',
          description: 'One of the world leaders in personal watercraft and pontoon boats. Explore new models and cutting-edge technology.',
          profilePic: seadooLogo,
          video: seadooVideo
          // No logoUrl - logo won't be clickable
        }
      }
      // No geo slide for Seadoo
    ]
  },
  Slate: {
    name: 'Slate',
    logoComponent: Slate,
    order: 5, // Order in carousel (1-6)
    slides: [
      {
        type: 'main',
        component: SlideMain,
        props: {
          title: 'Slate',
          description: 'Compete against your friends. Create and join real-money contests on your favorite real-life, skill-based games and competitions.',
          profilePic: slateLogo,
          video: slateVideo
          // logoUrl is optional - not provided for Slate
        }
      }
    ]
  },
  TCO: {
    name: 'TCO',
    logoComponent: TCO,
    order: 2, // Order in carousel (1-6)
    slides: [
        {
          type: 'main',
          component: SlideMain,
          props: {
            title: 'TCO Fly Shop',
            description: 'Among the oldest and largest fly fishing outfitters, known for delivering the highest quality gear, fly tying materials, and expert customer service.',
            profilePic: tcoLogo,
            video: slateVideo
            // logoUrl is optional - not provided for TCO
          }
        }
      ]
  },
  GFF: {
    name: 'GFF',
    logoComponent: GFF,
    order: 3, // Order in carousel (1-6)
    slides: [
        {
          type: 'main',
          component: SlideMain,
          props: {
            title: 'Great Falls Foundation',
            description: 'A non-profit charitable organization dedicated to promoting whitewater competition and an active and outdoor lifestyle.',
            profilePic: gffLogo,
            video: slateVideo
            // logoUrl is optional - not provided for TCO
          }
        }
      ]
  },
  IR: {
    name: 'IR',
    logoComponent: IR,
    order: 4, // Order in carousel (1-6)
    slides: [
        {
          type: 'main',
          component: SlideMain,
          props: {
            title: 'Immersion Research',
            description: 'Immersion Research is a designer and manufacturer of paddling gear for whitewater kayaking, rafting, canoeing, and other paddlesports.',
            profilePic: irLogo,
            video: slateVideo
            // logoUrl is optional - not provided for IR
          }
        }
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

