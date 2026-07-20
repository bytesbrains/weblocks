/**
 * `franchise` starter templates — recruiting franchisees, from a classic
 * opportunity page to a catalogue of coffee formats, a territory investment
 * pitch, and a chat-led home-services recruitment funnel.
 */
import { tpl, img, b, type Template } from './_helpers.js';

export const franchiseTemplates: Template[] = [
  tpl({
    id: 'franchise-network',
    vertical: 'franchise',
    label: 'Franchise Network — Classic',
    description: 'A national fast-casual brand recruiting new franchisees with proof, process and an info pack.',
    tags: ['b2b', 'one-pager', 'local', 'reviews'],
    layout: 'classic',
    preset: 'ocean',
    meta: { title: 'SunBowl — Franchise Opportunities', description: 'Own a SunBowl: a proven healthy fast-casual brand.', lang: 'en', favicon: '🥗' },
    blocks: [
      b('nav', 'nav', { brand: 'SunBowl', sticky: true, links: [{ label: 'The opportunity', href: '#opportunity' }, { label: 'How it works', href: '#how' }, { label: 'Enquire', href: '#contact' }], cta: { label: 'Request info pack', href: '#contact' } }),
      b('hero', 'hero', { eyebrow: 'Franchising since 2016', headline: 'Own a brand people already love', subhead: 'Join 120+ SunBowl franchisees serving fresh bowls in high streets nationwide.', align: 'center', minHeight: 'lg', image: img('franchise-hero'), overlay: 'scrim', cta: { label: 'Request an info pack', href: '#contact' } }),
      b('stats', 'stats', { title: 'A proven model', columns: 4, items: [
        { value: '120', label: 'Locations', suffix: '+' },
        { value: '18', label: 'Avg. months to break even' },
        { value: '92', label: 'Franchisee retention', suffix: '%' },
        { value: '4.6', label: 'Customer rating', suffix: '★' },
      ] }),
      b('opportunity', 'features', { title: 'Why SunBowl', columns: 3, items: [
        { icon: '📊', title: 'Unit economics that work', text: 'Transparent P&L shared upfront.' },
        { icon: '🧑‍🍳', title: 'Full training', text: '4 weeks of onboarding and support.' },
        { icon: '📣', title: 'National marketing', text: 'Brand campaigns that drive footfall.' },
      ] }),
      b('how', 'steps', { title: 'From enquiry to opening', items: [
        { title: 'Discovery call', text: 'We learn your goals and territory.' },
        { title: 'Approval & site', text: 'We help you secure the right location.' },
        { title: 'Launch', text: 'Fit-out, training, and a supported opening.' },
      ] }),
      b('reviews', 'testimonials', { title: 'From our franchisees', items: [
        { quote: 'Opened my second site within two years. The support is real.', author: 'Ravi', role: 'Franchisee, Bristol' },
        { quote: 'The playbook took the guesswork out of running a food business.', author: 'Elena', role: 'Franchisee, Leeds' },
      ] }),
      b('cta', 'cta', { headline: 'Could this be your next move?', subhead: 'Request the info pack — territories are going fast.', background: 'primary', button: { label: 'Request info pack', href: '#contact' } }),
      b('contact', 'contact-details', { title: 'Talk to the franchise team', address: 'SunBowl HQ, London EC1V 9BW', phone: '+44 20 7000 0000', email: 'franchise@sunbowl.co', hours: 'Mon–Fri 9:00–18:00' }),
      b('footer', 'footer', { brand: 'SunBowl', tagline: 'Franchise opportunities.', links: [{ label: 'Opportunity', href: '#opportunity' }, { label: 'Enquire', href: '#contact' }], copyright: '© SunBowl Ltd' }),
    ],
  }),

  tpl({
    id: 'franchise-coffee-multisite',
    vertical: 'franchise',
    label: 'Coffee Franchise — Multi-site Catalogue',
    description: 'A specialty coffee group selling kiosk, café and drive-through formats to multi-site operators.',
    tags: ['coffee', 'menu', 'pricing', 'b2b', 'faq'],
    layout: 'catalogue',
    preset: 'sand',
    meta: { title: 'Morrow & Co. — Coffee Franchise Formats', description: 'Kiosk, café and drive-through coffee formats for multi-site operators across Australia.', lang: 'en', favicon: '☕' },
    blocks: [
      b('notice', 'announcement-bar', { text: 'Applications for the 2027 Victoria and Queensland intake close 30 September.', linkLabel: 'See formats', href: '#formats', tone: 'promo', dismissible: true }),
      b('nav', 'nav', { brand: 'Morrow & Co.', sticky: true, links: [{ label: 'Formats', href: '#formats' }, { label: 'Menu', href: '#menu' }, { label: 'Investment', href: '#investment' }, { label: 'Questions', href: '#faq' }], cta: { label: 'Apply', href: '#apply' } }),
      b('hero', 'hero', { eyebrow: 'Melbourne roasted since 2011', headline: 'Three formats. One roast. Built for operators who want more than one door.', subhead: '64 sites across Victoria, New South Wales and Queensland — most of them owned by someone already running two or more.', align: 'left', minHeight: 'md', image: img('coffee-franchise-hero'), overlay: 'light', cta: { label: 'Compare the formats', href: '#formats' } }),
      b('formats', 'services-catalogue', { title: 'Pick the format that fits the site', subtitle: 'Every format ships with the same roast, the same POS and the same six-week opening plan. Figures are ex-GST fit-out estimates.', items: [
        { name: 'Kiosk — 8 to 14 m²', description: 'Shopping-centre and transport-hub trolleys. Two staff, no kitchen, opens in nine weeks. Our fastest payback format.', price: 'from A$145,000', ctaLabel: 'Kiosk pack', ctaHref: '#apply' },
        { name: 'Café — 60 to 110 m²', description: 'Full sit-down with an all-day food menu and a licensed evening option. The format most second-site operators choose.', price: 'from A$385,000', ctaLabel: 'Café pack', ctaHref: '#apply' },
        { name: 'Drive-through — 220 m² pad', description: 'Dual-lane pad site on arterial roads. Highest weekly turnover, longest lead time on planning approval.', price: 'from A$640,000', ctaLabel: 'Drive-through pack', ctaHref: '#apply' },
        { name: 'Conversion — your existing café', description: 'Already running an independent? We rebrand, retrain and re-plumb over a ten-day close, and waive half the initial fee.', price: 'from A$78,000', ctaLabel: 'Talk to us', ctaHref: '#apply' },
      ] }),
      b('menu', 'menu', { title: 'The core menu you will be pouring', subtitle: 'Fixed nationally, with two regional specials per site each season. Retail prices shown; margins are in the info pack.', sections: [
        { name: 'Espresso', note: 'Morrow House Blend — a chocolate-forward 70/30 Brazil–Ethiopia, roasted in Brunswick every Tuesday.', items: [
          { name: 'Flat white', description: 'The one that pays the rent. 42% of cup volume across the network.', price: 'A$4.80' },
          { name: 'Batch filter', description: 'Single-origin rotating weekly, brewed to a 20-minute hold.', price: 'A$4.20' },
          { name: 'Cold brew on tap', description: '18-hour steep, nitro line optional in café and drive-through formats.', price: 'A$6.50' },
        ] },
        { name: 'Food', note: 'Baked off-site by our Dandenong partner bakery and delivered six mornings a week.', items: [
          { name: 'Ham, gruyère & mustard toastie', description: 'Pressed to order. Highest-margin food line on the board.', price: 'A$12.50' },
          { name: 'Smashed avocado on rye', description: 'Feta, dukkah, lemon. Café format only.', price: 'A$18.00', tags: ['veg'] },
          { name: 'Morning bun', description: 'Cardamom and orange. Sells out by 10am at eleven of our sites.', price: 'A$6.80', tags: ['veg'] },
        ] },
      ] }),
      b('numbers', 'stats', { title: 'What the network actually does', columns: 4, items: [
        { value: '64', label: 'Trading sites' },
        { value: '2.4', label: 'Avg. sites per franchisee' },
        { value: '19', label: 'Avg. months to payback' },
        { value: '11', label: 'Weekly turnover growth', prefix: '+', suffix: '%' },
      ] }),
      b('investment', 'pricing', { title: 'Fees, plainly', subtitle: 'No hidden marketing surcharge and no supply mark-up on beans — we make our money on the royalty, not on you.', plans: [
        { name: 'Single site', price: 'A$55k', period: 'initial fee', features: ['6% royalty on net sales', '2% national marketing levy', '7-year term, 7-year renewal', 'Six-week opening support'], ctaLabel: 'Start an application', ctaHref: '#apply' },
        { name: 'Multi-site (3+)', price: 'A$42k', period: 'per site', features: ['5% royalty on net sales', 'Territory locked for 24 months', 'Area manager funded 50/50 at site four', 'Priority on new pad sites'], ctaLabel: 'Book a portfolio call', ctaHref: '#apply', featured: true },
        { name: 'Conversion', price: 'A$27.5k', period: 'initial fee', features: ['Half fee for existing operators', 'Ten-day changeover', 'Stock buy-back on your old lines', 'Royalty holiday for month one'], ctaLabel: 'Send your P&L', ctaHref: '#apply' },
      ] }),
      b('sites', 'gallery', { layout: 'masonry', columns: 3, gap: 'md', lightbox: true, items: [
        { src: img('morrow-kiosk-southbank'), alt: 'Kiosk trading in a shopping centre atrium', caption: 'Southbank kiosk — 240 cups a day from 11 m²' },
        { src: img('morrow-cafe-fitzroy'), alt: 'Corner café with a timber counter', caption: 'Fitzroy café — our original site, still trading' },
        { src: img('morrow-drivethru-geelong'), alt: 'Dual-lane drive-through coffee pad site', caption: 'Geelong drive-through — dual lane, opened 2025' },
        { src: img('morrow-roastery-brunswick'), alt: 'Roastery floor with a drum roaster', caption: 'Brunswick roastery — where every bag starts' },
      ] }),
      b('faq', 'faq', { title: 'What operators ask us first', items: [
        { question: 'Do I need hospitality experience?', answer: 'For a kiosk, no — nine of our kiosk owners came from retail or logistics. For a café or drive-through we want either prior food-service management or a nominated manager who has it, because the food menu and the licensed trade both carry compliance you cannot delegate to a manual.' },
        { question: 'How much of my own capital do I need?', answer: 'Banks generally lend 50–60% against a Morrow & Co. format, so plan on A$70k unencumbered for a kiosk and A$180k for a café, plus three months of working capital. We will introduce you to two lenders who already know the model.' },
        { question: 'Can I pick my own site?', answer: 'You can propose one, and we assess it on catchment, morning traffic direction and lease terms. About a third of proposed sites pass. We also bring pre-approved sites to franchisees already in the network first.' },
        { question: 'Am I forced to buy everything through you?', answer: 'Beans, syrups and packaging come from us at cost plus freight. Milk, food and consumables you buy locally against our spec — most franchisees beat our national dairy rate anyway.' },
      ] }),
      b('apply', 'contact-form', { title: 'Apply for a format', intro: 'Tell us where you want to trade and what you already run. Applications are read by our development lead, not a call centre.', submitLabel: 'Send application', successMessage: 'Received — we reply to every application within three business days.', fields: [
        { name: 'name', label: 'Your name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Mobile', type: 'tel', placeholder: '04XX XXX XXX', required: true },
        { name: 'format', label: 'Format you are after', type: 'select', options: ['Kiosk', 'Café', 'Drive-through', 'Conversion of my existing café', 'Not sure yet'], required: true },
        { name: 'state', label: 'State or territory', type: 'select', options: ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'], required: true },
        { name: 'capital', label: 'Capital available', type: 'select', options: ['Under A$100k', 'A$100k – 200k', 'A$200k – 400k', 'A$400k+'] },
        { name: 'experience', label: 'What do you run today?', type: 'textarea', placeholder: 'Sites, staff, turnover' },
      ] }),
      b('footer', 'footer', { brand: 'Morrow & Co.', tagline: 'Coffee franchise formats, Melbourne to Cairns.', links: [{ label: 'Formats', href: '#formats' }, { label: 'Investment', href: '#investment' }, { label: 'Apply', href: '#apply' }], copyright: '© Morrow & Co. Roasters Pty Ltd — ABN 41 622 118 903' }),
    ],
  }),

  tpl({
    id: 'franchise-fitness-territory',
    vertical: 'franchise',
    label: 'Fitness Franchise — Territory Pitch',
    description: 'A high-contrast pitch page selling protected gym territories to investors, built around numbers and a timeline.',
    tags: ['fitness', 'b2b', 'pricing', 'dark', 'video'],
    layout: 'bold',
    preset: 'midnight',
    meta: { title: 'IRONLINE 24 — Territory Ownership', description: 'Own a protected IRONLINE 24 territory. Staffed hours optional, revenue is not.', lang: 'en', favicon: '🏋️' },
    blocks: [
      b('nav', 'nav', { brand: 'IRONLINE 24', sticky: true, links: [{ label: 'Territories', href: '#territories' }, { label: 'The model', href: '#model' }, { label: 'Buy-in', href: '#buyin' }, { label: 'Timeline', href: '#timeline' }], cta: { label: 'Claim a territory', href: '#apply' } }),
      b('hero', 'hero', { eyebrow: 'Now releasing Texas and Arizona', headline: 'A gym that runs at 3am without you in it', subhead: 'IRONLINE 24 territories average $612,000 in year-two revenue on a three-person payroll. We protect a five-mile radius and we do not oversell it.', align: 'center', minHeight: 'full', image: img('ironline-gym-night'), overlay: 'dark', cta: { label: 'See open territories', href: '#territories' } }),
      b('numbers', 'stats', { title: 'Network performance, trailing twelve months', columns: 4, items: [
        { value: '612k', label: 'Avg. year-two revenue', prefix: '$' },
        { value: '31', label: 'Avg. EBITDA margin', suffix: '%' },
        { value: '1,940', label: 'Avg. members per club' },
        { value: '3.1', label: 'Avg. staff FTE per club' },
      ] }),
      b('territories', 'feed', { title: 'Open territories, updated weekly', layout: 'cards', items: [
        { title: 'Austin — Southeast (78744, 78747)', subtitle: '52,100 households · median age 34', text: 'Two competing 24-hour clubs, neither with a recovery suite. Pad site identified on East Slaughter Lane.', badge: 'Open', image: img('territory-austin-se') },
        { title: 'Phoenix — Deer Valley (85027, 85085)', subtitle: '38,600 households · median age 39', text: 'Fastest household growth in our pipeline. Landlord has already approved a 12,000 sq ft box.', badge: 'Open', image: img('territory-phoenix-dv') },
        { title: 'San Antonio — Stone Oak', subtitle: '44,900 households · median age 37', text: 'Under letter of intent with a two-club operator. Backup applications accepted.', badge: 'Reserved', image: img('territory-sanantonio-so') },
        { title: 'Tucson — Northwest', subtitle: '29,400 households · median age 41', text: 'Releases Q1 2027, once our Oro Valley club clears its first full year.', badge: 'Waitlist', image: img('territory-tucson-nw') },
      ] }),
      b('model', 'tabs', { items: [
        { label: 'Revenue', text: 'Three lines carry a club. Memberships at $39/month on an annual agreement are 71% of revenue and the only line you can forecast. Personal training, run by contractors who rent floor time rather than sit on your payroll, is 19%. Recovery — sauna, cold plunge, compression — is 10% and climbing fastest; clubs that added a recovery suite in 2025 lifted membership price by $6 with no measurable churn.' },
        { label: 'Costs', text: 'Rent is your one irreversible decision: keep it under 14% of forecast revenue or the model stops working. Payroll runs 18–22% because staffed hours are 6am–2pm only; the rest of the day is keyfob access, camera monitoring and a remote support desk we operate for the whole network. Equipment is leased over 60 months and refreshed at month 54.' },
        { label: 'Ramp', text: 'Presale opens ten weeks before the doors do and typically lands 480 founding members at a discounted rate. Break-even sits around 830 members, which clubs reach in month 9 on average — month 6 at the fastest, month 15 at the slowest. Budget nine months of debt service in working capital, not six.' },
        { label: 'Exit', text: 'Territories are transferable after year three with our approval and a 2% transfer fee. Eleven clubs have changed hands since 2021 at a median of 3.4x trailing EBITDA. Multi-territory holders have sold as packages at a premium to that.' },
      ] }),
      b('walkthrough', 'video', { provider: 'youtube', src: 'https://www.youtube.com/watch?v=Kd9pW4mQ2Ls', title: 'Inside the Round Rock club at 4am', poster: img('ironline-video-poster'), caption: 'Eleven minutes, unedited, with the owner talking through their first-year P&L.' }),
      b('buyin', 'pricing', { title: 'What it costs to be in', subtitle: 'Total project cost includes the fee, build-out, equipment lease deposit and working capital.', plans: [
        { name: 'Single territory', price: '$49,500', period: 'franchise fee', features: ['Total project cost $1.1M – $1.4M', '7% royalty, 2% brand fund', 'Five-mile protected radius', '10-year term'], ctaLabel: 'Apply', ctaHref: '#apply' },
        { name: 'Three-pack', price: '$118,000', period: 'all three', features: ['Total project cost $3.2M – $3.9M', '6% royalty from club two', 'Development schedule over 36 months', 'First look at adjacent territories'], ctaLabel: 'Talk to development', ctaHref: '#apply', featured: true },
        { name: 'Conversion', price: '$29,500', period: 'franchise fee', features: ['For independent 24-hour clubs', 'Equipment audit, not a full rip-out', 'Member migration handled by us', 'Royalty steps up over 18 months'], ctaLabel: 'Send your numbers', ctaHref: '#apply' },
      ] }),
      b('timeline', 'timeline', { title: 'Signature to first swipe', items: [
        { date: 'Week 0', title: 'Agreement signed, territory locked', text: 'Your radius comes off the map the day the agreement is countersigned. Nobody else gets shown it.' },
        { date: 'Weeks 1–10', title: 'Site selection', text: 'Our real-estate team shortlists boxes, models drive-time catchments, and negotiates the letter of intent alongside your broker.' },
        { date: 'Weeks 11–18', title: 'Permits and build', text: 'We hand your general contractor a permit-ready set. Plumbing for the recovery suite is the usual critical path.' },
        { date: 'Weeks 19–28', title: 'Presale', text: 'A brand-fund-funded presale trailer parks on the pad. Target is 480 founding members before opening day.' },
        { date: 'Week 29', title: 'Open', text: 'Two of our launch staff live in your club for the first fourteen days.' },
      ] }),
      b('owners', 'testimonials', { title: 'From territory owners', items: [
        { quote: 'I signed the Round Rock territory expecting to babysit it. Now I check the camera feed on a Sunday and that is the job. The remote desk handles the 2am lockouts, which was the part I dreaded.', author: 'Dana Whitfield', role: 'Owner, Round Rock TX' },
        { quote: 'The five-mile protection is not marketing. I asked them to let me put my own second club two miles away and they said no, because it would have cannibalised the first one. That answer is why I bought the three-pack.', author: 'Marcus Oyelaran', role: 'Owner, three territories, DFW' },
      ] }),
      b('claim', 'cta', { headline: 'Twelve territories open. We release four a quarter.', subhead: 'Applications go to our development team, who send the FDD before you ever speak to anyone in sales.', background: 'accent', button: { label: 'Claim a territory', href: '#apply' } }),
      b('apply', 'contact-form', { title: 'Start a territory application', intro: 'Four questions and a name. Our development lead replies with the FDD and a catchment map for the territory you picked — no discovery call required first.', submitLabel: 'Send application', successMessage: 'Sent. Expect the FDD and a catchment map within two business days.', fields: [
        { name: 'name', label: 'Your name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'tel', placeholder: '(512) 555-0142', required: true },
        { name: 'territory', label: 'Territory of interest', type: 'select', options: ['Austin — Southeast', 'Phoenix — Deer Valley', 'San Antonio — Stone Oak', 'Tucson — Northwest', 'Three-pack across Texas', 'Converting a club I already own'], required: true },
        { name: 'liquid', label: 'Liquid capital available', type: 'select', options: ['Under $250k', '$250k – $500k', '$500k – $1M', 'Over $1M'], required: true },
        { name: 'background', label: 'What do you own or operate today?', type: 'textarea', placeholder: 'Other franchises, real estate, operating businesses' },
        { name: 'fdd', label: 'Send me the FDD before we speak', type: 'checkbox' },
      ] }),
      b('footer', 'footer', { brand: 'IRONLINE 24', tagline: '24-hour clubs, protected territories.', links: [{ label: 'Territories', href: '#territories' }, { label: 'Buy-in', href: '#buyin' }, { label: 'Apply', href: '#apply' }], copyright: '© IRONLINE 24 Franchising LLC · 1400 Congress Ave, Austin TX 78701' }),
    ],
  }),

  tpl({
    id: 'franchise-homeservices-recruit',
    vertical: 'franchise',
    label: 'Home Services — Recruitment Chat',
    description: 'A van-based home-services brand recruiting owner-operators, led by a real recruitment conversation.',
    tags: ['home-services', 'b2b', 'booking', 'faq', 'mobile-first'],
    layout: 'conversational',
    preset: 'forest',
    meta: { title: 'Ghar Setu — Become an Owner-Operator', description: 'Run a Ghar Setu home-services van in your own pin-code cluster across Bengaluru, Pune or Hyderabad.', lang: 'en', favicon: '🧰' },
    blocks: [
      b('nav', 'nav', { brand: 'Ghar Setu', sticky: true, links: [{ label: 'How it starts', href: '#conversation' }, { label: 'The work', href: '#work' }, { label: 'Questions', href: '#questions' }], cta: { label: 'Book a call', href: '#call' } }),
      b('hero', 'hero', { eyebrow: 'Owner-operator programme · third intake', headline: 'One van, one pin-code cluster, forty jobs a week', subhead: 'Ghar Setu routes plumbing, electrical and appliance work to 340 owner-operators. You bring the trade licence and the driving; we bring the jobs, the parts and the collections.', align: 'left', minHeight: 'md', image: img('gharsetu-van-morning'), overlay: 'scrim', cta: { label: 'See how it starts', href: '#conversation' } }),
      b('conversation', 'chat-thread', { title: 'How the first conversation usually goes', subtitle: 'A real exchange from our operator line, shared with permission. Names changed.', participants: [
        { id: 'kavya', name: 'Kavya', role: 'user', avatar: img('gharsetu-applicant') },
        { id: 'setu', name: 'Ghar Setu team', role: 'agent', avatar: img('gharsetu-recruiter') },
      ], messages: [
        { from: 'kavya', time: '09:14', body: [{ kind: 'text', text: 'Hi — I run a two-person electrical outfit in Whitefield. Six years now. Work is fine, but I spend half my day chasing payments. What does joining actually change?' }] },
        { from: 'setu', time: '09:22', body: [
          { kind: 'text', text: 'The chasing stops — customers pay us in the app before a job closes, and we settle to you every Friday. Beyond that, three things change:' },
          { kind: 'list', ordered: true, items: [{ label: 'Jobs arrive on your phone, routed by pin code — no more quoting cold leads.' }, { label: 'Parts come from our Peenya depot on next-morning delivery, at our rates.' }, { label: 'Complaints, refunds and reviews are handled by our support desk, not by you.' }] },
        ] },
        { from: 'kavya', time: '09:26', body: [{ kind: 'text', text: 'And what does it cost me? I have heard some of these franchise things take 30%.' }] },
        { from: 'setu', time: '09:31', body: [
          { kind: 'text', text: 'A one-time joining fee of ₹1,85,000, which covers the van wrap, the tool top-up kit, the tablet and four weeks of training. After that we take 18% of job value. No monthly minimum, no advertising levy.' },
          { kind: 'text', text: 'For an electrician working five and a half days, that has meant ₹92,000–₹1,25,000 a month take-home in Whitefield over the last year. I can send you the actual job logs from the two operators nearest you.' },
        ] },
        { from: 'kavya', time: '09:34', body: [{ kind: 'text', text: 'Please send them. And can I keep my own two staff?' }] },
        { from: 'setu', time: '09:38', body: [
          { kind: 'text', text: 'Yes — most operators run one or two technicians under them. They stay your employees, on your books; we only require they clear our safety module before they touch a Ghar Setu job.' },
          { kind: 'buttons', items: [{ label: 'Book a 30-minute call', href: '#call' }, { label: 'Read the common questions', href: '#questions' }] },
        ] },
      ] }),
      b('work', 'features', { title: 'The work we route', subtitle: 'Volume mix across the Bengaluru clusters, last quarter.', columns: 4, items: [
        { icon: '🚰', title: 'Plumbing — 38%', text: 'Leaks, geysers, bathroom fittings. The highest repeat rate of anything we send.' },
        { icon: '⚡', title: 'Electrical — 27%', text: 'Wiring faults, fan and light installs, inverter and UPS work.' },
        { icon: '❄️', title: 'Appliance — 24%', text: 'AC service contracts, washing machines, refrigeration. Peaks March to June.' },
        { icon: '🔧', title: 'Odd jobs — 11%', text: 'Carpentry, mounting, door and lock work. Good filler for a thin afternoon.' },
      ] }),
      b('economics', 'split', { rows: [
        { title: 'What a full week looks like', text: 'Forty to forty-six jobs, averaging ₹1,840 in job value. After our 18% and your parts cost, operators clear roughly ₹26,000–₹31,000 in a good week. Diesel and the van EMI come out of that — budget ₹4,500 a week for both if you finance the vehicle through our lending tie-up.', image: img('gharsetu-jobsheet'), imageAlt: 'A technician checking the day’s job list on a tablet' },
        { title: 'What we will not promise you', text: 'Your first six weeks will be thin — around twenty-five jobs a week — because the routing engine gives new operators smaller loads until completion and rating data settles. Nine operators in ten cross forty jobs by week ten. One in ten does not, and we buy the van wrap back at half price if you leave inside six months.', image: img('gharsetu-depot'), imageAlt: 'Parts depot shelving with labelled bins' },
      ] }),
      b('questions', 'accordion', { title: 'The questions that decide it', items: [
        { heading: 'Do I need my own van?', body: 'You need a van, but not on day one. Around sixty percent of our operators finance a small commercial vehicle through our lending tie-up at 11.4% over four years; the rest bring something they already own. We wrap whichever you turn up with, provided it passes the load and safety check.' },
        { heading: 'Which pin codes can I get?', body: 'We cluster four to seven adjacent pin codes per operator and cap density at one operator per 18,000 households. Whitefield, Sarjapur Road and North Bengaluru have open clusters right now. HSR Layout and Indiranagar have waiting lists running about five months.' },
        { heading: 'What licences do you require?', body: 'A valid trade licence for your primary skill, a commercial driving licence, GST registration, and police verification for you and anyone working under you. We will help with the GST registration if you do not have one — about half of applicants do not.' },
        { heading: 'Can I still take my own private customers?', body: 'Yes, outside Ghar Setu jobs and not in a Ghar Setu-wrapped van. What we ask is that a customer we sent you does not quietly become a private customer on the next visit — that is the one thing that ends an agreement.' },
        { heading: 'What happens when a job goes wrong?', body: 'Our support desk owns the complaint. If it is a workmanship issue you return and fix it unpaid; if it is a parts failure we cover it; if the customer is simply unhappy we refund from our side and you keep your fee. Every operator carries ₹10 lakh public liability through our group policy, included in the 18%.' },
      ] }),
      b('voices', 'reviews', { title: 'Rated by the operators themselves', subtitle: 'Anonymous quarterly survey, 340 operators, 81% responded.', average: '4.4', count: '276 responses', source: 'Operator survey', items: [
        { rating: 5, quote: 'The Friday settlement is the whole reason I joined and it has never once been late. Eleven months in, I have not chased a single payment.', author: 'Operator, Sarjapur Road', date: 'Apr 2026', source: 'other' },
        { rating: 4, quote: 'Job flow is good and the depot is genuinely fast. My only gripe is that the app pushes AC work at me in April when I would rather stay on plumbing.', author: 'Operator, Peenya', date: 'Mar 2026', source: 'other' },
        { rating: 5, quote: 'I was sceptical about the 18%. Then I worked out what my old ad spend plus unpaid invoices came to. It was more than 18%.', author: 'Operator, Hebbal', date: 'Feb 2026', source: 'other' },
      ] }),
      b('call', 'booking', { title: 'Book a 30-minute call', intro: 'You will speak to someone from the operator team who has run a cluster themselves. Bring your questions about money — they can answer them.', submitLabel: 'Request this slot', successMessage: 'Got it — we will confirm on WhatsApp within a day.', serviceLabel: 'What would you like to talk about?', services: [
        { name: 'Joining as an electrician', duration: '30 min' },
        { name: 'Joining as a plumber', duration: '30 min' },
        { name: 'Joining as an appliance technician', duration: '30 min' },
        { name: 'Bringing my existing team across', duration: '45 min' },
      ], askDate: true, askTime: true, askPhone: true, askNotes: true, notesLabel: 'Which pin codes do you work in today?' }),
      b('office', 'contact-details', { title: 'Operator team', address: 'Ghar Setu, 4th Floor, Jyoti Nivas Road, Koramangala, Bengaluru 560095', phone: '+91 80 4718 2200', email: 'operators@gharsetu.in', hours: 'Mon–Sat 9:30–19:00 IST' }),
      b('footer', 'footer', { brand: 'Ghar Setu', tagline: 'Home services, run by owner-operators.', links: [{ label: 'The work', href: '#work' }, { label: 'Questions', href: '#questions' }, { label: 'Book a call', href: '#call' }], copyright: '© Ghar Setu Services Pvt Ltd · CIN U74999KA2019PTC128441' }),
    ],
  }),
];
