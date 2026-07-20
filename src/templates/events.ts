/**
 * `events` starter templates — seven ways to run an event business: a wedding
 * planner, a club-and-wedding DJ, a catering kitchen, a country estate venue, a
 * two-day climate summit, a kids party entertainer, and a photo-and-film duo.
 */
import { tpl, img, b, type Template } from './_helpers.js';

export const eventsTemplates: Template[] = [
  // ── 1. Wedding planner (legacy) ────────────────────────────────────────────
  tpl({
    id: 'events-weddings',
    vertical: 'events',
    label: 'Events — Weddings',
    description: 'A full-service wedding and celebration planner, led by the story of how the day comes together.',
    tags: ['wedding', 'planning', 'gallery', 'faq', 'booking', 'local'],
    layout: 'classic',
    preset: 'candy',
    meta: { title: 'Evergreen Events — Weddings & Celebrations', description: 'Full-service planning for weddings and celebrations that feel like you.', lang: 'en', favicon: '🎉' },
    blocks: [
      b('nav', 'nav', { brand: 'Evergreen', sticky: true, links: [{ label: 'Story', href: '#story' }, { label: 'Gallery', href: '#gallery' }, { label: 'Enquire', href: '#contact' }], cta: { label: 'Check your date', href: '#book' } }),
      b('hero', 'hero', { eyebrow: 'Weddings & celebrations', headline: 'A day that feels completely like you', subhead: 'Thoughtful planning and styling, from first idea to last dance.', align: 'center', minHeight: 'full', image: img('wedding-hero'), overlay: 'scrim', cta: { label: 'Check your date', href: '#book' } }),
      b('story', 'timeline', { title: 'How we work together', items: [
        { date: '12+ months', title: 'Dream & plan', text: 'Vision, budget, and the venue search.' },
        { date: '6 months', title: 'Design & book', text: 'Styling, suppliers, and the run of day.' },
        { date: 'The week', title: 'Relax', text: 'We manage every detail so you don’t.' },
      ] }),
      b('gallery', 'gallery', { layout: 'masonry', columns: 3, gap: 'md', lightbox: true, items: [{ src: img('wed-1'), alt: 'Ceremony arch' }, { src: img('wed-2'), alt: 'Table setting' }, { src: img('wed-3'), alt: 'First dance' }, { src: img('wed-4'), alt: 'Flowers' }] }),
      b('faq', 'faq', { title: 'Good to know', items: [
        { question: 'Do you travel?', answer: 'Yes — across the UK and destination weddings on request.' },
        { question: 'How far ahead should we book?', answer: '12–18 months is ideal, but we love a challenge.' },
      ] }),
      b('contact', 'contact-details', { title: 'Say hello', address: 'Based in the Cotswolds', phone: '+44 1451 000 000', email: 'hello@evergreenevents.co', hours: 'By appointment' }),
      b('book', 'cta', { headline: 'Is your date free?', subhead: 'Send us your date and we’ll be in touch within 48 hours.', background: 'primary', button: { label: 'Check availability', href: '#' } }),
      b('footer', 'footer', { brand: 'Evergreen Events', tagline: 'Weddings & celebrations.', links: [{ label: 'Gallery', href: '#gallery' }, { label: 'Enquire', href: '#contact' }], copyright: '© Evergreen Events' }),
    ],
  }),

  // ── 2. Event DJ ────────────────────────────────────────────────────────────
  tpl({
    id: 'events-dj',
    vertical: 'events',
    label: 'Event DJ — Bold',
    description: 'A working wedding and corporate DJ, sold on recorded sets, hard numbers and a date-check form.',
    tags: ['dj', 'music', 'booking', 'reviews', 'dark', 'video'],
    layout: 'bold',
    preset: 'midnight',
    meta: { title: 'Nightshift Sound — Event DJ, Chicago', description: 'Weddings, corporate parties and club nights across Chicagoland. Recorded sets, two rigs, no cheesy mic work.', lang: 'en', favicon: '🎧' },
    blocks: [
      b('nav', 'nav', { brand: 'Nightshift', sticky: true, links: [{ label: 'Sets', href: '#sets' }, { label: 'Packages', href: '#packages' }, { label: 'Reviews', href: '#reviews' }], cta: { label: 'Check my date', href: '#book' } }),
      b('hero', 'hero', {
        eyebrow: 'Chicago · weddings, corporate, club',
        headline: 'The floor stays full until the lights come up',
        subhead: 'I’m Rio Vasquez — 410 nights since 2016, open-format, beat-matched, and read off the room rather than off a printed list.',
        align: 'left', minHeight: 'full', image: img('ev-dj-hero-booth'), overlay: 'dark',
        cta: { label: 'Hear a full set', href: '#sets' },
      }),
      b('numbers', 'stats', { title: 'The short version', columns: 4, items: [
        { value: '410', label: 'Nights played since 2016' },
        { value: '4.9', label: 'Average across 138 reviews' },
        { value: '90', suffix: 'min', label: 'On site before doors, every time' },
        { value: '2', label: 'Full backup rigs in the van' },
      ] }),
      b('sets', 'video-gallery', { title: 'Recorded live, nothing re-cut', layout: 'grid', columns: 3, items: [
        { provider: 'vimeo', src: '904118220', title: 'Salvage One wedding — last 40 minutes', poster: img('ev-dj-set-salvage') },
        { provider: 'vimeo', src: '904118266', title: 'Corporate holiday party, Fulton Market', poster: img('ev-dj-set-fulton') },
        { provider: 'vimeo', src: '904118301', title: 'Quinceañera open-format, Pilsen', poster: img('ev-dj-set-pilsen') },
      ] }),
      b('packages', 'pricing', { title: 'What a booking costs', subtitle: 'Chicagoland. Anything past 45 miles adds a travel line, quoted up front.', plans: [
        { name: 'Ceremony + reception', price: '$1,850', period: '6 hours', features: ['Ceremony PA and lapel mic', 'Cocktail hour on a separate zone', 'Two speakers, sub, warm uplighting', 'Planning call and a shared do-not-play list'], ctaLabel: 'Check this date', ctaHref: '#book', featured: true },
        { name: 'Party only', price: '$1,200', period: '4 hours', features: ['Single-room setup', 'Wireless mic for toasts', 'Dance-floor wash lighting'], ctaLabel: 'Check this date', ctaHref: '#book' },
        { name: 'Corporate / brand', price: '$2,400', period: 'Half day', features: ['Load-in with your AV team', 'Background sets plus a headline hour', 'Certificate of insurance to $2M', 'Invoiced on NET 30'], ctaLabel: 'Request a quote', ctaHref: '#book' },
      ] }),
      b('rig', 'features', { title: 'What turns up in the van', columns: 3, items: [
        { icon: '🔊', title: 'RCF two-way + 18" sub', text: 'Enough for 250 people indoors without ever hitting the limiter.' },
        { icon: '🎚️', title: 'Redundant everything', text: 'Two controllers, two laptops, a UPS on the booth. A dead cable has never stopped a set.' },
        { icon: '💡', title: 'Warm, not laser-show', text: 'Uplighting matched to your palette, plus four moving heads kept subtle until the last hour.' },
      ] }),
      b('reviews', 'reviews', { title: 'What couples and planners said', average: '4.9', count: '138 reviews', source: 'Google', items: [
        { rating: 5, quote: 'We gave Rio a five-song list and a warning that our families do not dance. Both families danced. My uncle asked for a business card.', author: 'Danielle T.', date: 'October 2025', source: 'google' },
        { rating: 5, quote: 'Booked for a 400-person launch. Showed up two hours early, sorted out our venue’s awful house system, and never once talked over the music.', author: 'Marcus O.', date: 'August 2025', source: 'google' },
        { rating: 4, quote: 'Genuinely great night. Only note: the ceremony mic was a touch hot for the first reading. Fixed inside a minute.', author: 'Priya R.', date: 'June 2025', source: 'facebook' },
      ] }),
      b('faq', 'faq', { title: 'Before you ask', items: [
        { question: 'Do you take requests on the night?', answer: 'Yes, if they fit. You get a shared list before the day for must-plays and never-plays, and I’ll hold the line on the never-plays even when someone’s brother-in-law insists.' },
        { question: 'How much talking do you do?', answer: 'Introductions, the first dance, the cake, last call. That’s it unless you ask for more.' },
        { question: 'Can you cover the ceremony too?', answer: 'Included on the six-hour package — separate speaker at the front, lapel mic on the officiant, handheld for readings.' },
        { question: 'What if you get sick?', answer: 'I’m in a five-DJ network across Chicago. You’d get a named replacement with your full planning notes, or your deposit back, your call.' },
      ] }),
      b('book', 'booking', {
        title: 'Check your date', intro: 'Dates are held for 72 hours while you decide. Deposit is 30%, the rest is due the week of.',
        serviceLabel: 'Package', submitLabel: 'Check availability', successMessage: 'Got it — you’ll hear back within one working day.',
        services: [{ name: 'Ceremony + reception', duration: '6 hours', price: '$1,850' }, { name: 'Party only', duration: '4 hours', price: '$1,200' }, { name: 'Corporate / brand', duration: 'Half day', price: '$2,400' }],
        askDate: true, askTime: true, askParty: true, askPhone: true, askNotes: true, notesLabel: 'Venue, guest count, anything I should never play',
      }),
      b('social', 'social-links', { title: 'Sets and behind the booth', layout: 'row', variant: 'labeled', align: 'center', links: [
        { platform: 'instagram', href: '#', label: '@nightshiftsound' },
        { platform: 'youtube', href: '#', label: 'Full sets' },
        { platform: 'tiktok', href: '#', label: 'Clips' },
      ] }),
      b('footer', 'footer', { brand: 'Nightshift Sound', tagline: 'Rio Vasquez · Chicago, IL · (312) 555 0148', links: [{ label: 'Sets', href: '#sets' }, { label: 'Packages', href: '#packages' }, { label: 'Check a date', href: '#book' }], copyright: '© Nightshift Sound LLC' }),
    ],
  }),

  // ── 3. Catering company ────────────────────────────────────────────────────
  tpl({
    id: 'events-catering',
    vertical: 'events',
    label: 'Catering — Menu-led',
    description: 'An event caterer whose menus and per-head pricing are the whole page, ending in a quote request.',
    tags: ['catering', 'menu', 'pricing', 'b2b', 'faq'],
    layout: 'catalogue',
    preset: 'sand',
    meta: { title: 'Saffron & Sage — Event Catering, Bengaluru', description: 'Live counters, plated dinners and office lunches for 40 to 900 guests across Bengaluru.', lang: 'en', favicon: '🍛' },
    blocks: [
      b('nav', 'nav', { brand: 'Saffron & Sage', sticky: true, links: [{ label: 'Menus', href: '#menus' }, { label: 'Per head', href: '#packages' }, { label: 'How it works', href: '#process' }], cta: { label: 'Request a quote', href: '#quote' } }),
      b('hero', 'hero', {
        eyebrow: 'Bengaluru · 40 to 900 guests',
        headline: 'Menus first. Everything else follows.',
        subhead: 'A production kitchen in Peenya, twelve chefs, and a tasting you sit down to before you sign anything.',
        align: 'left', minHeight: 'sm', image: img('ev-cater-hero-counter'), overlay: 'scrim',
        cta: { label: 'Read the menus', href: '#menus' },
      }),
      b('menus', 'menu', { title: 'Standing menus', subtitle: 'Prices are per guest, minimum 40. Every menu can go fully vegetarian or Jain at no extra cost.', sections: [
        { name: 'South Indian feast', note: 'Served on banana leaf, or as a live counter.', items: [
          { name: 'Bisi bele bath', description: 'Toor dal, tamarind, our own masala, roasted cashew.', price: '₹180', tags: ['veg'], spice: 2 },
          { name: 'Kori gassi', description: 'Mangalorean chicken curry, coconut and red chilli, with neer dosa.', price: '₹340', spice: 3 },
          { name: 'Meen pollichathu', description: 'Pearl spot wrapped and grilled in banana leaf.', price: '₹420', spice: 2 },
          { name: 'Filter coffee counter', description: 'Brewed to order in brass tumblers.', price: '₹90', tags: ['veg'] },
        ] },
        { name: 'North Indian grill', note: 'Live tandoor, two chefs on station.', items: [
          { name: 'Paneer tikka lababdar', description: 'Charred, folded through a slow tomato-butter gravy.', price: '₹260', tags: ['veg'], spice: 1 },
          { name: 'Galouti kebab', description: 'Lamb, raw papaya, twelve spices, on warm ulte tawa parotta.', price: '₹390', spice: 2 },
          { name: 'Dal makhani', description: 'On the flame overnight, finished with white butter.', price: '₹210', tags: ['veg'] },
        ] },
        { name: 'Continental & grazing', note: 'For offices, launches and long afternoons.', items: [
          { name: 'Grazing table', description: 'Cheese, cured and vegetarian boards, fruit, house lavash. Priced per 25 guests.', price: '₹7,500' },
          { name: 'Roast pumpkin & farro', description: 'Curry leaf oil, pomegranate, whipped feta.', price: '₹230', tags: ['veg'] },
          { name: 'Herb-crusted sea bass', description: 'Plated, with saffron beurre blanc.', price: '₹480' },
        ] },
      ] }),
      b('packages', 'pricing', { title: 'Per-head packages', subtitle: 'Staff, crockery, transport and GST included. No hidden service charge.', plans: [
        { name: 'Office lunch', price: '₹550', period: 'per guest', features: ['Two mains, one dal, rice, breads', 'Dessert of the day', 'Delivered hot, 45-minute window', 'Minimum 40 guests'], ctaLabel: 'Quote this', ctaHref: '#quote' },
        { name: 'Wedding buffet', price: '₹1,450', period: 'per guest', features: ['Two live counters', 'Eight mains across two cuisines', 'Chaat and dessert stations', 'Uniformed service, 1 staff per 18 guests'], ctaLabel: 'Quote this', ctaHref: '#quote', featured: true },
        { name: 'Plated dinner', price: '₹2,200', period: 'per guest', features: ['Four courses, seated service', 'Wine and mocktail pairing notes', 'Menu tasting for six', 'Maximum 180 guests'], ctaLabel: 'Quote this', ctaHref: '#quote' },
      ] }),
      b('process', 'steps', { title: 'How a booking runs', subtitle: 'Six weeks is comfortable. Two weeks is possible. Four days has happened twice.', items: [
        { title: 'Brief', text: 'Guest count, date, venue, budget per head, and every dietary line you know about.' },
        { title: 'Tasting', text: 'You and up to five others sit down at the Peenya kitchen. ₹2,000, waived when you book.' },
        { title: 'Lock the menu', text: 'Final count 72 hours out. 40% advance holds the date.' },
        { title: 'Service day', text: 'Kitchen team on site four hours before, captain reports to your planner, not to you.' },
      ] }),
      b('kitchen', 'accordion', { title: 'Dietary and kitchen notes', items: [
        { heading: 'Vegetarian, vegan and Jain', body: 'Our Peenya kitchen has a permanently separate pure-veg line with its own equipment and staff — not a cleaned-down shared one. Jain menus skip onion, garlic and root vegetables entirely, and we will tell you honestly which dishes lose too much to be worth serving that way.' },
        { heading: 'Allergens', body: 'Nuts, sesame and dairy are used heavily across the South Indian menus. We can build a nut-free event, but it needs to be decided at menu lock, not on the day. Every dish is labelled at the counter in English and Kannada.' },
        { heading: 'Halal', body: 'All chicken and lamb is halal-certified as standard. Certificates travel with the order and can go to your venue in advance.' },
        { heading: 'Licences and hygiene', body: 'FSSAI 11223344556677. Last audit October 2025, no non-conformities. Public liability cover to ₹2 crore, certificate sent with every contract.' },
      ] }),
      b('words', 'testimonials', { title: 'From the people who signed the invoice', items: [
        { quote: 'Nine hundred guests, two cuisines, and the queue at the chaat counter never went past six people. Their captain ran it better than our own event team.', author: 'Rekha Nair', role: 'Bride’s mother, Whitefield' },
        { quote: 'We do a Friday lunch for 120 every week. Two years in, they have been late once, and they called ahead about it.', author: 'Arjun Menon', role: 'Office manager, Kadubeesanahalli' },
      ] }),
      b('quote', 'contact-form', {
        title: 'Request a quote', intro: 'Fill this in and you’ll get a costed menu — not a brochure — within two working days.',
        submitLabel: 'Send brief', successMessage: 'Thanks. You’ll have a costed menu within two working days.',
        fields: [
          { name: 'name', label: 'Your name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+91', required: true },
          { name: 'date', label: 'Event date', type: 'text', placeholder: 'DD/MM/YYYY', required: true },
          { name: 'guests', label: 'Guest count', type: 'text', placeholder: 'Approximate is fine', required: true },
          { name: 'style', label: 'Service style', type: 'select', options: ['Office lunch', 'Wedding buffet', 'Plated dinner', 'Grazing / cocktail', 'Not sure yet'] },
          { name: 'notes', label: 'Venue, cuisine and dietary notes', type: 'textarea' },
        ],
      }),
      b('contact', 'contact-details', { title: 'The kitchen', address: 'Unit 14, 8th Cross, Peenya Industrial Area, Bengaluru 560058', phone: '+91 80 4000 1122', email: 'orders@saffronandsage.in', hours: 'Office Mon–Sat 9:30–18:00 · Kitchen from 04:00 on service days' }),
      b('footer', 'footer', { brand: 'Saffron & Sage', tagline: 'Event catering across Bengaluru since 2014.', links: [{ label: 'Menus', href: '#menus' }, { label: 'Per head', href: '#packages' }, { label: 'Quote', href: '#quote' }], copyright: '© Saffron & Sage Foods Pvt Ltd' }),
    ],
  }),

  // ── 4. Wedding & events venue ──────────────────────────────────────────────
  tpl({
    id: 'events-venue',
    vertical: 'events',
    label: 'Venue — Showcase',
    description: 'A country estate that hires out for weddings and events, sold almost entirely on photography.',
    tags: ['venue', 'wedding', 'gallery', 'booking', 'luxury'],
    layout: 'showcase',
    preset: 'forest',
    meta: { title: 'Wrenhill Estate — Weddings & Events, Hunter Valley', description: 'A restored 1890s barn, a chapel lawn under two river gums, and beds for 34 — an hour from Newcastle.', lang: 'en', favicon: '🌿' },
    blocks: [
      b('notice', 'announcement-bar', { text: '2027 dates released — Saturdays are going in pairs, so bring a second option.', linkLabel: 'Book a site tour', href: '#tours', tone: 'promo', dismissible: true }),
      b('nav', 'nav', { brand: 'Wrenhill', sticky: true, links: [{ label: 'The spaces', href: '#spaces' }, { label: 'Gallery', href: '#gallery' }, { label: 'Getting here', href: '#find' }], cta: { label: 'Book a tour', href: '#tours' } }),
      b('hero', 'hero', {
        eyebrow: 'Pokolbin, Hunter Valley NSW',
        headline: 'Forty hectares, two river gums, and one very good barn',
        subhead: 'Exclusive use from Friday noon to Sunday noon. You get the whole estate, not a time slot.',
        align: 'center', minHeight: 'full', image: img('ev-venue-hero-barn-dusk'), overlay: 'scrim',
        cta: { label: 'See the spaces', href: '#spaces' },
      }),
      b('reel', 'carousel', { title: 'A weekend at Wrenhill', autoplay: true, items: [
        { src: img('ev-venue-chapel-lawn'), alt: 'Ceremony under the river gums', caption: 'The chapel lawn, 4pm in March' },
        { src: img('ev-venue-barn-long-table'), alt: 'Long tables set inside the barn', caption: 'The barn seats 140 on long tables' },
        { src: img('ev-venue-cellar-room'), alt: 'Stone cellar room set for a dinner', caption: 'The cellar room, for 40 or fewer' },
        { src: img('ev-venue-verandah-morning'), alt: 'Guests on the homestead verandah', caption: 'Sunday morning on the verandah' },
        { src: img('ev-venue-vines-golden'), alt: 'Vines behind the estate at golden hour', caption: 'Golden hour lasts about 25 minutes here' },
      ] }),
      b('spaces', 'tabs', { items: [
        { label: 'The barn', text: 'Built 1893, re-shingled and re-floored in 2021. Seats 140 on long tables or 180 theatre-style, with a 6m ceiling, black steel chandeliers on dimmers, and doors on both long walls that open right through. Heated in winter, cross-ventilated in summer, and quiet enough that a speech works without a PA if you keep it under four minutes.' },
        { label: 'Chapel lawn', text: 'A flat half-hectare between two 120-year-old river gums, seating 200 with a wet-weather call made at 9am on the day — no fee, no argument. Power and a discreet speaker pit are already in the ground, so nobody is running cable across your aisle.' },
        { label: 'Cellar room', text: 'Stone-walled, low-ceilinged, and cold in the right way. Forty guests at one table, or a standing tasting for sixty. This is where most couples put the rehearsal dinner, and where the good bottles live.' },
        { label: 'Where you sleep', text: 'The homestead sleeps 12, the shearers’ quarters 16, and two cottages take three each — 34 beds on site, included in exclusive hire. Everyone else stays in Pokolbin, eight minutes away, and we keep a list of who has beds free on which weekends.' },
      ] }),
      b('gallery', 'gallery', { layout: 'masonry', columns: 3, gap: 'lg', lightbox: true, items: [
        { src: img('ev-venue-g-aisle'), alt: 'Aisle strewn with native flowers' },
        { src: img('ev-venue-g-firepit'), alt: 'Fire pit lit after dinner' },
        { src: img('ev-venue-g-detail-table'), alt: 'Table detail with eucalyptus' },
        { src: img('ev-venue-g-dance'), alt: 'Dancing in the barn' },
        { src: img('ev-venue-g-homestead'), alt: 'The homestead at first light' },
        { src: img('ev-venue-g-portraits'), alt: 'Portraits in the vines' },
      ] }),
      b('numbers', 'stats', { title: 'The numbers people ask for first', columns: 4, items: [
        { value: '180', label: 'Maximum seated in the barn' },
        { value: '34', label: 'Beds on the estate' },
        { value: '1am', label: 'Music curfew, licensed' },
        { value: '40', suffix: 'ha', label: 'Exclusive use, Fri to Sun' },
      ] }),
      b('included', 'split', { rows: [
        { title: 'What hire actually includes', text: 'Exclusive use of the estate from Friday noon to Sunday noon. Tables, cross-back chairs, and ceremony seating for 200. Two staff on site the whole weekend. Wet-weather plan with no surcharge. On-site parking for 90 cars and a locked overnight compound so nobody drives home who shouldn’t.', image: img('ev-venue-inc-chairs'), imageAlt: 'Stacked cross-back chairs in the barn store' },
        { title: 'What you bring', text: 'Your caterer — from our list of nine, or yours if they hold the right licences and want a kitchen walkthrough. Your celebrant, florist, photographer and music. We are not a package venue and we will never tell you which cake to buy.', image: img('ev-venue-inc-kitchen'), imageAlt: 'The commercial prep kitchen behind the barn' },
      ] }),
      b('tours', 'booking', {
        title: 'Book a site tour', intro: 'Tours run Thursdays and Sundays, 45 minutes, and we walk the whole estate whatever the weather. Wear something you don’t mind getting muddy.',
        serviceLabel: 'Tour type', submitLabel: 'Request a tour', successMessage: 'Thanks — we’ll confirm your tour time by email within a day.',
        services: [{ name: 'Standard site tour', duration: '45 min', price: 'Free' }, { name: 'Tour + tasting with a caterer', duration: '2 hr', price: 'A$120' }, { name: 'Video walkthrough (interstate)', duration: '30 min', price: 'Free' }],
        askDate: true, askTime: true, askParty: true, askPhone: true, askNotes: true, notesLabel: 'Your date, guest count, and anything you’re unsure about',
      }),
      b('find', 'directions', { title: 'Getting here', place: 'Wrenhill Estate', address: '740 Hermitage Road, Pokolbin NSW 2320, Australia', lat: '-32.7794', lng: '151.2896', mapUrl: '#', directionsLabel: 'Open in maps', appleMaps: true }),
      b('footer', 'footer', { brand: 'Wrenhill Estate', tagline: 'Weddings and events in the Hunter Valley · +61 2 4998 0000', links: [{ label: 'The spaces', href: '#spaces' }, { label: 'Gallery', href: '#gallery' }, { label: 'Book a tour', href: '#tours' }], copyright: '© Wrenhill Estate Pty Ltd' }),
    ],
  }),

  // ── 5. Conference / summit ─────────────────────────────────────────────────
  tpl({
    id: 'events-conference',
    vertical: 'events',
    label: 'Conference — Ticket landing page',
    description: 'A two-day industry summit built as a conversion page: proof, speakers, agenda, tickets, one CTA.',
    tags: ['conference', 'b2b', 'pricing', 'newsletter', 'one-pager'],
    layout: 'landing',
    preset: 'ocean',
    meta: { title: 'Northbound 2026 — Climate Tech Summit, Lisbon', description: 'Two days, 600 people, no keynote theatre. 14–15 October 2026 at Beato Innovation District.', lang: 'en', favicon: '🌍' },
    blocks: [
      b('early', 'announcement-bar', { text: 'Early-bird tickets end 30 June — €390 becomes €560 at midnight WEST.', linkLabel: 'Get tickets', href: '#tickets', tone: 'promo', dismissible: false }),
      b('nav', 'nav', { brand: 'Northbound', sticky: true, links: [{ label: 'Speakers', href: '#speakers' }, { label: 'Agenda', href: '#agenda' }, { label: 'FAQ', href: '#faq' }], cta: { label: 'Get tickets', href: '#tickets' } }),
      b('hero', 'hero', {
        eyebrow: '14–15 October 2026 · Beato, Lisbon',
        headline: 'Two days with the people actually shipping climate hardware',
        subhead: 'Six hundred founders, engineers, buyers and funders. Forty-minute sessions, no keynote theatre, and a hallway track we deliberately over-schedule.',
        align: 'center', minHeight: 'lg', image: img('ev-conf-hero-hall'), overlay: 'dark',
        cta: { label: 'Get early-bird tickets', href: '#tickets' },
      }),
      b('numbers', 'stats', { title: 'Northbound 2025, for reference', columns: 4, items: [
        { value: '580', label: 'Attendees from 31 countries' },
        { value: '44', suffix: '%', label: 'Non-founder — buyers, funders, policy' },
        { value: '€41', suffix: 'm', label: 'Raised by alumni within 12 months' },
        { value: '91', suffix: '%', label: 'Said they’d come back' },
      ] }),
      b('partners', 'logos', { title: 'Backed by', items: [
        { src: img('ev-conf-logo-terrafund'), alt: 'Terrafund', href: '#' },
        { src: img('ev-conf-logo-kilowatt'), alt: 'Kilowatt Ventures', href: '#' },
        { src: img('ev-conf-logo-camara'), alt: 'Câmara Municipal de Lisboa', href: '#' },
        { src: img('ev-conf-logo-basalt'), alt: 'Basalt Materials', href: '#' },
        { src: img('ev-conf-logo-northsea'), alt: 'North Sea Grid', href: '#' },
      ] }),
      b('speakers', 'team', { title: 'Confirmed speakers', subtitle: 'Twenty-eight in total. These four give you the flavour.', columns: 4, members: [
        { name: 'Ingrid Sørhaug', role: 'CTO, Havstrøm (offshore wind O&M)', photo: img('ev-conf-sp-sorhaug'), bio: 'On why the maintenance vessel, not the turbine, is the cost problem nobody funds.', socials: [{ label: 'LinkedIn', href: '#' }] },
        { name: 'Dr Femi Adeyemi', role: 'Lead engineer, Sahel Grid Trust', photo: img('ev-conf-sp-adeyemi'), bio: 'Twelve years of mini-grid deployments, and the three assumptions that broke every time.', socials: [{ label: 'LinkedIn', href: '#' }] },
        { name: 'Mariana Costa', role: 'Head of procurement, Ibéria Cimentos', photo: img('ev-conf-sp-costa'), bio: 'What a heavy-industry buyer needs before they will sign for green clinker.', socials: [{ label: 'LinkedIn', href: '#' }] },
        { name: 'Jonas Weber', role: 'Partner, Kilowatt Ventures', photo: img('ev-conf-sp-weber'), bio: 'A blunt session on hardware valuations after a flat two years.', socials: [{ label: 'LinkedIn', href: '#' }] },
      ] }),
      b('agenda', 'timeline', { title: 'How the two days run', items: [
        { date: 'Tue 13, 19:00', title: 'Arrivals drink, Cais do Sodré', text: 'Optional, informal, and where about a third of next year’s deals start.' },
        { date: 'Wed 14, 09:00', title: 'Opening + two tracks', text: 'Deployment track and materials track run in parallel until lunch. Sessions are 40 minutes, hard stop.' },
        { date: 'Wed 14, 14:00', title: 'Buyer roundtables', text: 'Twelve tables of eight, each hosted by someone with a procurement budget. Sign-up opens two weeks before.' },
        { date: 'Thu 15, 09:30', title: 'Workshops', text: 'Six hands-on sessions, capped at 30: grid interconnection, LCA that survives audit, first-of-a-kind project finance.' },
        { date: 'Thu 15, 16:00', title: 'Closing panel + dinner', text: 'One panel, then long tables at the Beato canteen. Dinner is included in every ticket.' },
      ] }),
      b('tickets', 'pricing', { title: 'Tickets', subtitle: 'All prices exclude 23% IVA. Both days, lunch and the Thursday dinner are included in every tier.', plans: [
        { name: 'Early bird', price: '€390', period: 'until 30 June', features: ['Both days, all tracks', 'Lunch and closing dinner', 'Roundtable sign-up', 'Session recordings'], ctaLabel: 'Buy now', ctaHref: '#', featured: true },
        { name: 'Standard', price: '€560', period: 'from 1 July', features: ['Both days, all tracks', 'Lunch and closing dinner', 'Roundtable sign-up (subject to space)', 'Session recordings'], ctaLabel: 'Buy now', ctaHref: '#' },
        { name: 'Early-stage / academic', price: '€140', period: 'limited to 90', features: ['Both days, all tracks', 'Lunch and closing dinner', 'Requires a company under 3 years old, or a student ID'], ctaLabel: 'Apply', ctaHref: '#' },
      ] }),
      b('faq', 'faq', { title: 'Practical questions', items: [
        { question: 'Is there a call for speakers?', answer: 'Yes, open until 15 March. We read every submission and reply to all of them, including the noes. We do not sell speaking slots — sponsors get a stand and a roundtable, not the stage.' },
        { question: 'What language is it in?', answer: 'English throughout. Portuguese live captions on the main stage.' },
        { question: 'Can I transfer my ticket?', answer: 'Free name changes until 7 October, then €25 to cover reprinting. Full refunds until 1 September.' },
        { question: 'Accessibility?', answer: 'Beato is step-free throughout with accessible toilets on every floor. Tell us on the booking form what you need — quiet room, reserved seating, dietary, BSL/LGP interpretation — and we’ll confirm in writing before you travel.' },
        { question: 'Where should I stay?', answer: 'Nothing is on-site. We hold room blocks in three hotels in Marvila and Beato, 10–20 minutes’ walk, and send the codes with your ticket.' },
      ] }),
      b('list', 'newsletter', { title: 'Not ready to buy?', intro: 'One email a month until October: speakers as they’re confirmed, the agenda when it lands, and a warning before prices move.', placeholder: 'you@company.com', submitLabel: 'Keep me posted', successMessage: 'You’re on the list. Nothing else, ever.' }),
      b('close', 'cta', { headline: 'Six hundred seats. Last year they went in nine weeks.', subhead: 'Early-bird pricing holds until 30 June, then it doesn’t.', background: 'accent', button: { label: 'Get tickets', href: '#tickets' } }),
      b('footer', 'footer', { brand: 'Northbound', tagline: 'Climate Tech Summit · Lisbon · hello@northbound.eu', links: [{ label: 'Speakers', href: '#speakers' }, { label: 'Agenda', href: '#agenda' }, { label: 'Tickets', href: '#tickets' }], copyright: '© Northbound Events Unipessoal Lda' }),
    ],
  }),

  // ── 6. Kids party entertainer ──────────────────────────────────────────────
  tpl({
    id: 'events-kids-party',
    vertical: 'events',
    label: 'Kids parties — Chat-led',
    description: 'A children’s party entertainer who answers the real questions in a booking chat instead of a brochure.',
    tags: ['kids', 'family', 'booking', 'faq', 'mobile-first'],
    layout: 'conversational',
    preset: 'candy',
    meta: { title: 'Bubble & Boom — Kids Party Entertainers, Dublin', description: 'Magic, bubbles and a parachute game, for 3 to 9 year olds across Dublin and Wicklow.', lang: 'en', favicon: '🎈' },
    blocks: [
      b('nav', 'nav', { brand: 'Bubble & Boom', sticky: true, links: [{ label: 'The shows', href: '#shows' }, { label: 'Real questions', href: '#chat' }], cta: { label: 'Book a party', href: '#book' } }),
      b('hero', 'hero', {
        eyebrow: 'Dublin & Wicklow · ages 3–9',
        headline: 'Forty-five minutes where nobody cries',
        subhead: 'Well — one might. But you’ll be sitting down with a cup of tea, and that’s the actual promise.',
        align: 'center', minHeight: 'md', image: img('ev-kids-hero-parachute'), overlay: 'light',
        cta: { label: 'Ask us anything', href: '#chat' },
      }),
      b('chat', 'chat-thread', {
        title: 'The questions parents actually ask',
        subtitle: 'A real booking chat, lightly tidied, shared with Aoife’s permission.',
        participants: [
          { id: 'parent', name: 'Aoife', role: 'user', avatar: img('ev-kids-avatar-parent') },
          { id: 'bb', name: 'Sam at Bubble & Boom', role: 'agent', avatar: img('ev-kids-avatar-sam') },
        ],
        messages: [
          { from: 'parent', time: '19:42', body: [{ kind: 'text', text: 'Hi! Turning 5 in March, about 14 kids, our sitting room is not big. Is that a problem?' }] },
          { from: 'bb', time: '19:47', body: [{ kind: 'text', text: 'Not at all — most of our parties are in sitting rooms. We need a space about 2m by 2m to stand in and everyone sits on the floor facing us. Fourteen is a lovely number for that age.' }] },
          { from: 'parent', time: '19:48', body: [{ kind: 'text', text: 'What actually happens for the 45 minutes? I’ve been to ones where it fell apart after ten.' }] },
          { from: 'bb', time: '19:52', body: [
            { kind: 'text', text: 'Fair. Here’s the running order we use for fives — it’s built so the loud bits come before the sitting-still bits, never after:' },
            { kind: 'list', ordered: true, items: [{ label: 'Ten minutes of parachute and running-about games' }, { label: 'Fifteen minutes of magic, with four kids up helping' }, { label: 'Balloon animals while they catch their breath' }, { label: 'Giant bubbles, and the birthday child stands inside one' }, { label: 'Everyone sits for the photo, then it’s your cake moment' }] },
          ] },
          { from: 'parent', time: '19:54', body: [{ kind: 'text', text: 'The bubble thing — is that indoors?' }] },
          { from: 'bb', time: '19:56', body: [
            { kind: 'text', text: 'Indoors is fine, we bring a mat. This is Ciarán’s party in Rathmines last month.' },
            { kind: 'image', src: img('ev-kids-bubble-moment'), alt: 'A child standing inside a giant soap bubble in a sitting room' },
          ] },
          { from: 'parent', time: '19:58', body: [{ kind: 'text', text: 'Sold. One of the kids is autistic and finds loud noises hard — is that ok?' }] },
          { from: 'bb', time: '20:03', body: [
            { kind: 'text', text: 'Completely, and thank you for saying so in advance. We drop the party popper and the loud music cue, keep the lights up, and there’s always a spot at the side where a child can watch without being pulled in. Tell us their name and we’ll never single them out.' },
            { kind: 'buttons', items: [{ label: 'Check our date', href: '#book' }, { label: 'See the three shows', href: '#shows' }] },
          ] },
          { from: 'parent', time: '20:04', body: [{ kind: 'text', text: 'You have no idea how much that answer means. Booking now.' }] },
        ],
      }),
      b('shows', 'services-catalogue', { title: 'Three shows, that’s it', subtitle: 'Prices cover Dublin and north Wicklow. Anywhere further adds €20 for the drive.', items: [
        { name: 'The Small Show', description: 'Ages 3–5. Bubbles, parachute games, gentle magic and a balloon each. 45 minutes.', price: '€180', ctaLabel: 'Book this', ctaHref: '#book' },
        { name: 'The Big Show', description: 'Ages 6–9. Proper magic with volunteers, a rope trick that always gets a gasp, and a balloon-sword finale. 60 minutes.', price: '€230', ctaLabel: 'Book this', ctaHref: '#book' },
        { name: 'Two of us', description: 'For 25+ children or two age groups at once. Two entertainers, split into stations. 75 minutes.', price: '€390', ctaLabel: 'Book this', ctaHref: '#book' },
      ] }),
      b('faq', 'faq', { title: 'The boring but important bits', items: [
        { question: 'Are you Garda vetted?', answer: 'Both of us, renewed 2025, and we’ll send the vetting reference with your confirmation email without being asked. We also carry €6.5m public liability — most community halls want to see that certificate, so it comes as standard.' },
        { question: 'Do you need us to do anything?', answer: 'Clear a 2m square, keep the telly off, and let us know if any child has an allergy to latex — we’ll swap to non-latex balloons for the whole party, not just for them.' },
        { question: 'What if it clashes with food?', answer: 'Let us go first. Sugar, then sitting still, is a losing combination. Show, then cake, every time.' },
        { question: 'Deposit and cancellation?', answer: '€50 holds the date. Cancel more than a week out and it’s refunded in full. Inside a week we’ll move you to another date instead if we possibly can.' },
      ] }),
      b('book', 'booking', {
        title: 'Book a party', intro: 'We do two parties a day at weekends, so Saturday afternoons go about six weeks ahead.',
        serviceLabel: 'Which show', submitLabel: 'Request this date', successMessage: 'Lovely — Sam will text you this evening to confirm.',
        services: [{ name: 'The Small Show', duration: '45 min', price: '€180' }, { name: 'The Big Show', duration: '60 min', price: '€230' }, { name: 'Two of us', duration: '75 min', price: '€390' }],
        askDate: true, askTime: true, askParty: true, askPhone: true, askNotes: true, notesLabel: 'Ages, how many kids, and anything we should know about any of them',
      }),
      b('footer', 'footer', { brand: 'Bubble & Boom', tagline: 'Sam & Niamh · Dublin 6 · 085 555 0192', links: [{ label: 'The shows', href: '#shows' }, { label: 'Book', href: '#book' }], copyright: '© Bubble & Boom' }),
    ],
  }),

  // ── 7. Wedding photographer & videographer ─────────────────────────────────
  tpl({
    id: 'events-photo-film',
    vertical: 'events',
    label: 'Photo & film — Editorial',
    description: 'A wedding photography and film duo writing at length about how they work, with the work between the words.',
    tags: ['photography', 'video', 'portfolio', 'long-form', 'wedding', 'pricing'],
    layout: 'editorial',
    preset: 'mono',
    meta: { title: 'Halloran & West — Wedding Photography & Film', description: 'Documentary wedding photography and film from Portland, Oregon. Two people, one wedding a weekend.', lang: 'en', favicon: '🎞️' },
    blocks: [
      b('nav', 'nav', { brand: 'Halloran & West', sticky: false, links: [{ label: 'Work', href: '#work' }, { label: 'Film', href: '#film' }, { label: 'Collections', href: '#collections' }], cta: { label: 'Enquire', href: '#enquire' } }),
      b('hero', 'hero', {
        eyebrow: 'Portland, Oregon · travelling constantly',
        headline: 'We photograph what happened, not what should have',
        subhead: 'Maya Halloran on stills, Devon West on film. One wedding a weekend, together, since 2017.',
        align: 'left', minHeight: 'lg', image: img('ev-photo-hero-aisle-backlit'), overlay: 'light',
        cta: { label: 'See a full wedding', href: '#work' },
      }),
      b('approach', 'rich-text', { blocks: [
        { kind: 'heading', text: 'How we actually work' },
        { kind: 'paragraph', text: 'We do not pose you. There is a fifteen-minute window somewhere after the ceremony where we take you somewhere with good light and mostly get out of the way, and that is the entire extent of the direction you will get from us all day.' },
        { kind: 'paragraph', text: 'The rest is documentary. That means we are watching your grandmother’s face during the vows rather than arranging the ring shot, and it means some years you get a photograph you would never have thought to ask for and could not have staged.' },
        { kind: 'quote', text: 'You gave us the photo of my dad in the kitchen doorway at 11pm. He died in April. It is on our wall.' },
        { kind: 'subheading', text: 'What that costs you' },
        { kind: 'paragraph', text: 'Honestly: a few pictures. If you want forty formal group shots with named lists, we are the wrong people and we will say so on the call rather than take your deposit. We shoot family groups, but eight or ten of them, done in twenty minutes.' },
        { kind: 'subheading', text: 'What you get back' },
        { kind: 'bullet', text: 'A gallery of 600–900 edited frames, delivered in six weeks, downloadable forever.' },
        { kind: 'bullet', text: 'A six-to-eight minute film with real audio from the day — vows, speeches, the room.' },
        { kind: 'bullet', text: 'Every raw speech and both full ceremony angles, uncut, because people ask for these years later.' },
        { kind: 'bullet', text: 'No watermarks, no print release nonsense, no upsell on the files you already paid for.' },
      ] }),
      b('work', 'gallery', { layout: 'masonry', columns: 3, gap: 'lg', lightbox: true, items: [
        { src: img('ev-photo-w-vows-rain'), alt: 'Vows under an umbrella', caption: 'Cannon Beach, October' },
        { src: img('ev-photo-w-kitchen-door'), alt: 'A father in a kitchen doorway at night', caption: 'Sellwood, 11pm' },
        { src: img('ev-photo-w-first-look'), alt: 'A first look on a fire escape', caption: 'Central Eastside' },
        { src: img('ev-photo-w-grandmother'), alt: 'A grandmother crying during the ceremony', caption: 'Hood River' },
        { src: img('ev-photo-w-dancefloor'), alt: 'Dance floor from above', caption: 'Alberta Arts' },
        { src: img('ev-photo-w-getaway'), alt: 'Couple running to a car in the dark', caption: 'The last frame of the night' },
      ] }),
      b('film', 'video', { provider: 'vimeo', src: '862044188', title: 'Rosa & Tam — a full wedding film', poster: img('ev-photo-film-poster'), caption: 'Seven minutes. Real audio, no music bed under the vows.' }),
      b('story', 'blog-post', {
        title: 'The two hours nobody plans for',
        date: '2 March 2026', author: 'Maya Halloran',
        cover: img('ev-photo-post-getting-ready'), coverAlt: 'Getting-ready room, late morning light',
        body: [
          { kind: 'paragraph', text: 'Every timeline we are sent accounts for the ceremony to the minute and gives getting-ready a vague ninety minutes. Then the day arrives and getting-ready is where half the good photographs live, because it is the only stretch where nobody is performing.' },
          { kind: 'heading', text: 'Ask for a room with a window' },
          { kind: 'paragraph', text: 'Not a big room. A window. We would rather shoot a small bedroom with north light than a hotel suite lit by four ceiling cans and a ring light, and we will spend the first ten minutes moving your bags out of frame either way.' },
          { kind: 'heading', text: 'Get dressed early' },
          { kind: 'paragraph', text: 'Not for us — for you. Every couple who has finished getting ready thirty minutes ahead has spent those thirty minutes sitting with the people they love, and every one of them has told us afterwards it was their favourite part of the day.' },
          { kind: 'quote', text: 'We built in a spare half hour on your advice and ended up drinking a beer with my brother. That is the photo I look at.' },
          { kind: 'bullet', text: 'One window, curtains open, overhead lights off.' },
          { kind: 'bullet', text: 'Hangers, tags and dry-cleaning bags gone before we arrive.' },
          { kind: 'bullet', text: 'Thirty minutes of slack you do not intend to use.' },
        ],
      }),
      b('collections', 'pricing', { title: 'Collections', subtitle: 'Both of us, both crafts, always. We do not sell photography without film — the whole point is that they were made by two people in the same room.', plans: [
        { name: 'The day', price: '$6,800', period: '10 hours', features: ['Both of us, getting-ready through to the send-off', 'Full edited gallery, 600–900 frames', '6–8 minute film', 'Uncut ceremony and speeches audio'], ctaLabel: 'Check our date', ctaHref: '#enquire', featured: true },
        { name: 'The weekend', price: '$9,400', period: '2 days', features: ['Everything in The day', 'Welcome dinner or rehearsal covered', 'Sunday morning session', 'A 12×12 archival album, 40 spreads'], ctaLabel: 'Check our date', ctaHref: '#enquire' },
        { name: 'Elopement', price: '$3,200', period: '4 hours', features: ['Both of us, up to 12 guests', '300+ edited frames', '3 minute film', 'Travel included within Oregon and Washington'], ctaLabel: 'Check our date', ctaHref: '#enquire' },
      ] }),
      b('about', 'about', {
        eyebrow: 'The two of us',
        title: 'Maya and Devon',
        body: 'We met on a newspaper picture desk in 2014 and left it in the same month. Maya still shoots the way she was trained to — available light, no interference, forty rolls’ worth of patience for one frame. Devon came out of documentary sound and cares more about what your ceremony sounded like than what it looked like from a drone. We live in Sellwood with a bad-tempered greyhound called Editor, we take one wedding a weekend so we are never tired at yours, and we have photographed 214 of them together.',
        image: img('ev-photo-about-duo'), imageAlt: 'Maya and Devon on a porch with their greyhound', imageSide: 'right',
      }),
      b('enquire', 'contact-form', {
        title: 'Check our date', intro: 'We take roughly 22 weddings a year and we answer every enquiry ourselves, usually within two days.',
        submitLabel: 'Send enquiry', successMessage: 'Thank you — one of us will write back within two days.',
        fields: [
          { name: 'names', label: 'Your names', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'date', label: 'Wedding date', type: 'text', placeholder: 'Or roughly when', required: true },
          { name: 'venue', label: 'Venue or city', type: 'text' },
          { name: 'collection', label: 'Collection you have in mind', type: 'select', options: ['The day', 'The weekend', 'Elopement', 'Not sure yet'] },
          { name: 'story', label: 'Tell us something about the two of you', type: 'textarea', placeholder: 'Anything. It genuinely helps.' },
        ],
      }),
      b('footer', 'footer', { brand: 'Halloran & West', tagline: 'Wedding photography & film · Portland, OR · (503) 555 0114', links: [{ label: 'Work', href: '#work' }, { label: 'Collections', href: '#collections' }, { label: 'Enquire', href: '#enquire' }], copyright: '© Halloran & West' }),
    ],
  }),
];
