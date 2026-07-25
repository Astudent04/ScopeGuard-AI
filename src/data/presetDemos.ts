import { SowTemplate } from '../types';

export const DEMO_PRESET_WEB_DESIGN = {
  sow: `AGREED SCOPE OF WORK (SOW) - Modern Corporate Website:
- 5 Page responsive layout (Home, About, Services, Case Studies, Contact).
- Custom Figma design mockups with max 2 feedback revision rounds.
- Frontend coding in React + Tailwind CSS with standard contact form handler.
- Basic SEO meta tags & Google Analytics setup.
- 1-hour CMS walkthrough video tutorial.

EXCLUSIONS & BOUNDARIES:
- E-commerce functionality, custom database portals, third-party backend payment processors, or custom web animations beyond standard CSS transitions are explicitly outside this phase.
- Maximum 2 revision rounds per page design mockup.`,
  message: `Hi! The mockup previews look super sleek! We loved the home page layout. 

While reviewing with our leadership team, we decided we really need a full online store added right away so clients can purchase our consulting packages directly with Stripe. We'll also need a custom customer portal with user login/password reset, dynamic shopping cart drawer, and 3 custom Lottie animation sequences for the hero section. 

Could we get these integrated before next Tuesday's review call? Thanks!`
};

export const DEMO_PRESET_LOGO_CREEP = {
  sow: `AGREED SCOPE OF WORK (SOW) - Brand Identity & Logo Package:
- Initial concept exploration: 2 distinct logo design directions (Vector/PNG/SVG).
- Revision Limit: Up to 2 rounds of minor color, typography, and layout tweaks on the selected direction.
- Final Deliverables: Brand guidelines 1-pager (Color hex codes, primary/secondary font pairing, logo usage rules).
- Export Formats: SVG, PNG, EPS, and transparent PDF logo files.

EXCLUSIONS & BOUNDARIES:
- 3D modeling, video animation, mascot/character illustrations, and social media ad campaign kits are excluded from this agreement and require a separate change order.`,
  message: `Hey! Thanks for sending over the 2 logo concepts. Concept B is getting close, but our board wants to try a completely different direction with a mythical dragon mascot instead of the abstract geometric shape. 

Also, we need a 15-second 3D animated video intro of the logo exploding in fire for our YouTube channel, plus 5 custom character illustrations for our pitch deck slides. Since we're still in the initial revision stage, can you send those over by Friday?`
};

export const DEFAULT_SOW_TEMPLATES: SowTemplate[] = [
  {
    id: 'tpl-1',
    name: '5-Page Website Design & Dev',
    category: 'Web Design',
    deliverables: `1. 5 Responsive Website Pages (Home, About, Services, Blog, Contact).
2. Modern Figma UI design with up to 2 rounds of design revisions.
3. React + Tailwind CSS implementation with clean mobile optimization.
4. Standard contact form with email notification setup.
5. Basic technical SEO setup (Sitemap, OpenGraph tags, PageSpeed optimization).
6. 14 days of post-launch bug fix warranty.`,
    createdAt: '2026-07-01',
    isDefault: true
  },
  {
    id: 'tpl-2',
    name: 'Brand Identity Package',
    category: 'Branding',
    deliverables: `1. 2 Distinct Logo Concepts (Vector format).
2. Max 2 rounds of revision on chosen concept direction.
3. Typography pairing & Color Palette definition.
4. Mini Brand Style Guide (PDF).
5. Vector export package (SVG, EPS, PNG, PDF).`,
    createdAt: '2026-07-05',
    isDefault: true
  },
  {
    id: 'tpl-3',
    name: 'REST API & Mobile Backend MVP',
    category: 'Software Dev',
    deliverables: `1. Express Node.js REST API with authentication (JWT).
2. Database schema setup (PostgreSQL / Firestore) for up to 4 core entities.
3. 8 API endpoints (CRUD operations, pagination).
4. Automated unit tests for critical auth routes.
5. Postman Collection documentation & Docker container setup.`,
    createdAt: '2026-07-10',
    isDefault: true
  },
  {
    id: 'tpl-4',
    name: 'Monthly Technical SEO & Content Polish',
    category: 'Marketing & SEO',
    deliverables: `1. Monthly Site Health Audit (Broken links, meta descriptions, site speed).
2. Optimization of up to 4 existing blog posts per month.
3. Keyword tracking report for up to 15 focus terms.
4. Monthly 30-minute strategy call with performance breakdown.`,
    createdAt: '2026-07-15',
    isDefault: true
  }
];
