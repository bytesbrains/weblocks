/**
 * `restaurant` starter templates — eight ways to feed people: a neighbourhood café,
 * a tasting-menu dining room, a wood-fired pizzeria, a street food truck, an artisan
 * bakehouse, a craft-beer pub, a delivery-only ghost kitchen, and a private chef.
 */
import { tpl, img, b, type Template } from './_helpers.js';

export const restaurantTemplates: Template[] = [
  // ── 1. Neighbourhood café (legacy) ─────────────────────────────────────────
  tpl({
    id: 'restaurant-modern',
    vertical: 'restaurant',
    label: 'Café — Modern',
    description: 'A neighbourhood coffee shop leading with its menu, its photos and a warm invitation to visit.',
    tags: ['cafe', 'coffee', 'menu', 'local', 'gallery'],
    layout: 'classic',
    preset: 'sand',
    meta: { title: 'Brew & Bloom — Neighbourhood Café', description: 'Specialty coffee, fresh bakes, and a warm corner to slow down.', lang: 'en', favicon: '☕' },
    blocks: [
      b('nav', 'nav', { brand: 'Brew & Bloom', sticky: true, links: [{ label: 'Menu', href: '#menu' }, { label: 'Gallery', href: '#gallery' }, { label: 'Visit', href: '#visit' }], cta: { label: 'Order online', href: '#' } }),
      b('hero', 'hero', { eyebrow: 'Open daily · 7am', headline: 'Coffee worth slowing down for', subhead: 'Small-batch roasts, all-butter pastries, and a seat by the window.', align: 'center', minHeight: 'lg', image: img('cafe-hero'), overlay: 'scrim', cta: { label: 'See the menu', href: '#menu' } }),
      b('menu', 'services-catalogue', { title: 'Menu', subtitle: 'Roasted in-house, baked this morning.', items: [
        { name: 'Flat White', description: 'Double ristretto, silky microfoam.', price: '£3.40' },
        { name: 'Filter of the day', description: 'Rotating single origin, pour-over.', price: '£3.20' },
        { name: 'Almond croissant', description: 'Twice-baked, frangipane.', price: '£3.80' },
        { name: 'Avocado toast', description: 'Sourdough, chilli, lime.', price: '£7.50' },
      ] }),
      b('gallery', 'gallery', { layout: 'grid', columns: 3, gap: 'md', lightbox: true, items: [{ src: img('cafe-1'), alt: 'Latte art' }, { src: img('cafe-2'), alt: 'Pastry case' }, { src: img('cafe-3'), alt: 'Window seat' }] }),
      b('reviews', 'testimonials', { title: 'Regulars say', items: [
        { quote: 'The best flat white on this side of town.', author: 'Priya', role: 'Local' },
        { quote: 'My default work-from-café. Fast wifi, kind staff.', author: 'Tom', role: 'Regular' },
      ] }),
      b('visit', 'contact-details', { title: 'Visit us', address: '18 Marsh Lane, Bristol BS1 2AB', phone: '+44 117 000 0000', email: 'hello@brewandbloom.cafe', hours: 'Mon–Fri 7:00–18:00 · Sat–Sun 8:00–17:00' }),
      b('cta', 'cta', { headline: 'Booking a table for a group?', subhead: 'We hold the big table for parties of six or more.', background: 'primary', button: { label: 'Reserve', href: '#' } }),
      b('footer', 'footer', { brand: 'Brew & Bloom', tagline: 'Neighbourhood café since 2019.', links: [{ label: 'Menu', href: '#menu' }, { label: 'Instagram', href: '#' }], copyright: '© Brew & Bloom' }),
    ],
  }),

  // ── 2. Fine dining ─────────────────────────────────────────────────────────
  tpl({
    id: 'restaurant-fine-dining',
    vertical: 'restaurant',
    label: 'Fine dining — Editorial',
    description: 'A tasting-menu dining room told as long-form prose, with the kitchen, the cellar and a reservation form.',
    tags: ['fine-dining', 'menu', 'booking', 'luxury', 'long-form', 'dark'],
    layout: 'editorial',
    preset: 'midnight',
    meta: { title: 'Vellum — Tasting Menu, Amsterdam', description: 'A seventeen-seat dining room serving one menu a night, built around the Noordzee day boats and the market gardens of Noord-Holland.', lang: 'en', favicon: '🍷' },
    blocks: [
      b('nav', 'nav', { brand: 'Vellum', sticky: false, links: [{ label: 'The menu', href: '#menu' }, { label: 'The kitchen', href: '#craft' }, { label: 'Finding us', href: '#find' }], cta: { label: 'Reserve', href: '#book' } }),
      b('hero', 'hero', { eyebrow: 'Seventeen seats · One sitting a night', headline: 'One menu. Written each Tuesday.', subhead: 'Whatever the boats and the market gardens give us that week, cooked over embers and served at seven.', align: 'left', minHeight: 'lg', image: img('vellum-dining-room'), overlay: 'dark', cta: { label: 'Read this week’s menu', href: '#menu' } }),
      b('story', 'rich-text', { blocks: [
        { kind: 'heading', text: 'We only cook what came in that morning' },
        { kind: 'paragraph', text: 'Vellum opened in a former paper warehouse on the Bickersgracht in 2021. There is one table for seventeen people, one seating, and one menu. Nobody chooses anything except the wine, and even that we are happy to do for you.' },
        { kind: 'paragraph', text: 'Chef Marijke ten Broeke writes the menu on Tuesday, after the day boats land at IJmuiden and the growers at Beemster tell us what is ready. It is printed Thursday and it changes again the following week. If you came in April and come back in June, you will not recognise a single course.' },
        { kind: 'quote', text: 'The shortest menu we could write is the one we are proudest of.' },
        { kind: 'subheading', text: 'What an evening looks like' },
        { kind: 'bullet', text: 'Doors at 18:45 for a glass in the cellar room; we sit at 19:15 sharp.' },
        { kind: 'bullet', text: 'Nine courses, roughly three hours, one pause between the fish and the game.' },
        { kind: 'bullet', text: 'Dietary requirements are cooked around, not cooked out — tell us when you book.' },
      ] }),
      b('menu', 'menu', { title: 'Week of 14 October', subtitle: 'Nine courses · €145 per guest · wine pairing €85', sections: [
        { name: 'To begin', note: 'Served standing, in the cellar room.', items: [
          { name: 'Oyster, green apple, dill oil', description: 'Zeeland Creuse no. 3, cut with unripe apple.', tags: ['GF'] },
          { name: 'Smoked eel, buttermilk, rye', description: 'IJsselmeer eel smoked over old wine barrels.' },
        ] },
        { name: 'At the table', items: [
          { name: 'Turbot, brown butter, sea aster', description: 'Day-boat turbot, aged four days on the bone.', tags: ['GF'] },
          { name: 'Beemster carrot, honey, sheep’s curd', description: 'Roasted whole in salt for five hours.', tags: ['V'] },
          { name: 'Hare royale, beetroot, juniper', description: 'Shot on the Veluwe, hung twelve days.', spice: 1 },
          { name: 'Cabbage, koji butter, hazelnut', description: 'Hispi cabbage charred over embers.', tags: ['V', 'GF'] },
        ] },
        { name: 'To end', items: [
          { name: 'Pear, brown sugar, bay leaf', description: 'Poached in last year’s cider.', tags: ['V'] },
          { name: 'Stroopwafel, made to order', description: 'Pressed at the table, with coffee.', tags: ['V'] },
        ] },
      ] }),
      b('craft', 'split', { rows: [
        { title: 'The fire', text: 'There is no gas in the kitchen. Everything is cooked over a bed of Dutch oak and old wine barrels, which means the menu is written around what fire is good at: whole fish, brassicas, aged birds, and butter.', image: img('vellum-hearth'), imageAlt: 'Open hearth stacked with glowing oak embers' },
        { title: 'The cellar', text: 'Six hundred bins, weighted heavily towards Loire and Mosel growers who farm without herbicide. Our sommelier, Joost, pours a pairing at €85 and a non-alcoholic pairing of ferments and infusions at €55.', image: img('vellum-cellar'), imageAlt: 'Wine cellar lined with wooden bins' },
        { title: 'The room', text: 'Seventeen seats around one oak table, milled from a single tree felled in the Amsterdamse Bos. You will be sitting next to strangers. Most people leave having swapped numbers.', image: img('vellum-table'), imageAlt: 'Long oak communal table set for dinner' },
      ] }),
      b('team', 'team', { title: 'Behind the pass', columns: 3, members: [
        { name: 'Marijke ten Broeke', role: 'Chef-owner', photo: img('vellum-chef'), bio: 'Twelve years in Copenhagen and San Sebastián before coming home to open Vellum.' },
        { name: 'Joost Aalders', role: 'Sommelier', photo: img('vellum-somm'), bio: 'Buys almost entirely from growers they have visited in person.' },
        { name: 'Feyza Kaya', role: 'Head of pastry', photo: img('vellum-pastry'), bio: 'Ferments, preserves, and the stroopwafel iron that runs all night.' },
      ] }),
      b('reviews', 'reviews', { title: 'What guests wrote afterwards', average: '4.9', count: '318', source: 'Google', items: [
        { rating: 5, quote: 'Nine courses and not one of them was showing off. The hare was the best thing I have eaten in Amsterdam.', author: 'Ilse V.', date: 'September 2025', source: 'google' },
        { rating: 5, quote: 'We were sat next to two strangers and ended up sharing a taxi home. That is the whole point of the room, I think.', author: 'Daniel R.', date: 'August 2025', source: 'tripadvisor' },
        { rating: 4, quote: 'Extraordinary cooking. The single sitting means you cannot linger past eleven, which is worth knowing before you book.', author: 'Margot L.', date: 'July 2025', source: 'google' },
      ] }),
      b('book', 'booking', { title: 'Reserve a seat', intro: 'Seats open on the first of each month for the month after. Tell us about allergies here — we cook around them rather than removing courses.', submitLabel: 'Request a seat', successMessage: 'Thank you — we confirm by email within 24 hours, and take a €40 per person deposit on confirmation.', serviceLabel: 'Which evening', services: [
        { name: 'Dinner, Wednesday–Saturday', duration: '3 hours', price: '€145 per guest' },
        { name: 'Dinner with wine pairing', duration: '3 hours', price: '€230 per guest' },
        { name: 'Dinner with non-alcoholic pairing', duration: '3 hours', price: '€200 per guest' },
        { name: 'Whole-table buyout', duration: '4 hours', price: 'from €2,800' },
      ], askDate: true, askTime: false, askParty: true, askPhone: true, askNotes: true, notesLabel: 'Allergies, celebrations, anything we should know' }),
      b('find', 'directions', { title: 'Finding us', place: 'Vellum', address: 'Bickersgracht 41-H, 1013 LE Amsterdam, Netherlands', lat: '52.3866', lng: '4.8890', directionsLabel: 'Open directions', appleMaps: true }),
      b('footer', 'footer', { brand: 'Vellum', tagline: 'Seventeen seats on the Bickersgracht.', links: [{ label: 'This week’s menu', href: '#menu' }, { label: 'Reserve', href: '#book' }, { label: 'Instagram', href: '#' }], copyright: '© Vellum · KvK 82910034' }),
    ],
  }),

  // ── 3. Wood-fired pizzeria ─────────────────────────────────────────────────
  tpl({
    id: 'restaurant-pizzeria',
    vertical: 'restaurant',
    label: 'Pizzeria — Menu first',
    description: 'A wood-fired pizzeria where the menu is the whole page, with live opening hours, a map and the questions people always ask.',
    tags: ['pizza', 'menu', 'local', 'family', 'faq'],
    layout: 'catalogue',
    preset: 'forest',
    meta: { title: 'Ember & Ash — Wood-Fired Pizza, Brunswick', description: 'Sixty-hour dough, a two-tonne Naples oven, and a menu of nine pizzas that changes twice a year.', lang: 'en', favicon: '🍕' },
    blocks: [
      b('announce', 'announcement-bar', { text: 'Takeaway slots for tonight go live at 3pm — walk-ins always welcome at the bar.', linkLabel: 'See tonight’s menu', href: '#menu', tone: 'promo', dismissible: true }),
      b('nav', 'nav', { brand: 'Ember & Ash', sticky: true, links: [{ label: 'Menu', href: '#menu' }, { label: 'Hours', href: '#hours' }, { label: 'Find us', href: '#find' }, { label: 'FAQ', href: '#faq' }], cta: { label: 'Order takeaway', href: '#' } }),
      b('menu', 'menu', { title: 'Nine pizzas, two salads, one dessert', subtitle: 'Dough proved sixty hours. Cooked ninety seconds at 450°C. Prices include GST.', sections: [
        { name: 'Rossa', note: 'San Marzano base, fior di latte unless noted.', items: [
          { name: 'Margherita', description: 'Tomato, fior di latte, basil, Pugliese olive oil.', price: 'A$21', tags: ['V'] },
          { name: 'Diavola', description: 'Spicy soppressata, chilli honey, oregano.', price: 'A$26', spice: 2 },
          { name: 'Marinara', description: 'Tomato, garlic, oregano, no cheese at all.', price: 'A$18', tags: ['VG'] },
          { name: 'Nduja & fennel', description: 'Calabrian nduja, wild fennel, ricotta salata.', price: 'A$27', spice: 3 },
          { name: 'Capricciosa', description: 'Leg ham, artichoke, olive, field mushroom.', price: 'A$27' },
        ] },
        { name: 'Bianca', note: 'No tomato. Ask for the chilli oil.', items: [
          { name: 'Patate', description: 'Potato, rosemary, taleggio, black pepper.', price: 'A$25', tags: ['V'] },
          { name: 'Zucca', description: 'Roast pumpkin, sage brown butter, walnut, goat curd.', price: 'A$26', tags: ['V'] },
          { name: 'Funghi', description: 'Three mushrooms, thyme, garlic cream, truffle salt.', price: 'A$28', tags: ['V'] },
          { name: 'Quattro formaggi', description: 'Fior di latte, gorgonzola, pecorino, taleggio.', price: 'A$28', tags: ['V'] },
        ] },
        { name: 'Everything else', items: [
          { name: 'Radicchio, pear, hazelnut', description: 'Sharp, sweet, bitter. Meant for two.', price: 'A$16', tags: ['V', 'GF'] },
          { name: 'Rocket & parmesan', description: 'Lemon, olive oil, a lot of pepper.', price: 'A$14', tags: ['V', 'GF'] },
          { name: 'Soft-serve, olive oil, salt', description: 'The only dessert we will ever serve.', price: 'A$9', tags: ['V'] },
        ] },
      ] }),
      b('numbers', 'stats', { title: 'How the kitchen runs', columns: 4, items: [
        { value: '60', label: 'Hours the dough proves', suffix: 'h' },
        { value: '450', label: 'Oven floor temperature', suffix: '°C' },
        { value: '90', label: 'Seconds per pizza', suffix: 's' },
        { value: '11', label: 'Kilometres to our flour mill', suffix: 'km' },
      ] }),
      b('reviews', 'reviews', { title: 'Brunswick has opinions', average: '4.7', count: '1,204', source: 'Google', items: [
        { rating: 5, quote: 'The nduja one nearly took the roof of my mouth off and I have thought about it every day since.', author: 'Tara M.', date: 'March 2026', source: 'google' },
        { rating: 5, quote: 'We bring the kids at 5.30 before it gets loud. They do half-size margheritas without being asked.', author: 'Sam O.', date: 'February 2026', source: 'facebook' },
        { rating: 4, quote: 'No bookings is the only frustrating thing, but the bar queue moves fast and they text you.', author: 'Hugh P.', date: 'January 2026', source: 'google' },
      ] }),
      b('hours', 'hours', { title: 'When the oven is lit', timezone: 'Australia/Melbourne', note: 'The kitchen stops thirty minutes before close. Closed Mondays and every public holiday.', days: [
        { day: 'mon', closed: true },
        { day: 'tue', open: '17:00', close: '22:00' },
        { day: 'wed', open: '17:00', close: '22:00' },
        { day: 'thu', open: '17:00', close: '22:30' },
        { day: 'fri', open: '12:00', close: '23:00' },
        { day: 'sat', open: '12:00', close: '23:00' },
        { day: 'sun', open: '12:00', close: '21:00' },
      ] }),
      b('find', 'map', { query: '204 Sydney Road, Brunswick VIC 3056, Australia', zoom: 16, height: 380, label: 'Ember & Ash, 204 Sydney Road, Brunswick' }),
      b('faq', 'faq', { title: 'The questions we get every night', items: [
        { question: 'Do you take bookings?', answer: 'Only for groups of eight or more, Tuesday to Thursday. Everything else is walk-in: give your name at the bar and we will text you when a table is free. The average wait on a Friday is about twenty-five minutes.' },
        { question: 'Is there a gluten-free base?', answer: 'No, and we would rather be honest about why. One oven, one floor, flour in the air all night — we cannot promise a safe pizza for coeliac guests. Both salads and the soft-serve are gluten free.' },
        { question: 'Can I take a pizza home?', answer: 'Yes. Takeaway slots open at 3pm each day on the order link and usually sell out by 6pm. Pizza in a box is a worse pizza — we say so, and people order it anyway.' },
        { question: 'Do you split bills?', answer: 'Up to four cards per table, happily. Tap at the bar on your way out.' },
        { question: 'Is it loud?', answer: 'After 7pm on a weekend, yes. Before 6pm it is calm, which is when most families come.' },
      ] }),
      b('footer', 'footer', { brand: 'Ember & Ash', tagline: 'Wood-fired on Sydney Road since 2018.', links: [{ label: 'Menu', href: '#menu' }, { label: 'Hours', href: '#hours' }, { label: 'Instagram', href: '#' }], copyright: '© Ember & Ash Pty Ltd · ABN 44 128 903 771' }),
    ],
  }),

  // ── 4. Street food truck ───────────────────────────────────────────────────
  tpl({
    id: 'restaurant-food-truck',
    vertical: 'restaurant',
    label: 'Food truck — App style',
    description: 'A street food truck built like a phone app: a tab bar, this week’s pitches, the menu and an add-to-home-screen prompt.',
    tags: ['food-truck', 'street-food', 'mobile-first', 'menu', 'social'],
    layout: 'app',
    preset: 'candy',
    meta: { title: 'Chili Bird — Austin Street Chicken', description: 'Nashville-hot fried chicken out of a 1987 Grumman, parked somewhere different every day of the week.', lang: 'en', favicon: '🐔' },
    blocks: [
      b('shell', 'app-shell', { brand: 'Chili Bird', tabs: [
        { label: 'Where', href: '#where', icon: '📍' },
        { label: 'Menu', href: '#menu', icon: '🍗' },
        { label: 'Order', href: '#', icon: '🛵' },
        { label: 'Follow', href: '#social', icon: '💬' },
      ] }),
      b('hero', 'hero-app', { headline: 'Find the bird.', subhead: 'Hot chicken out of a 1987 Grumman. Five pitches a week, one sold-out sign, no reservations and no indoor seating.', installLabel: 'Add to home screen', installHref: '#install', screenshots: [
        { src: img('chilibird-truck'), alt: 'The Chili Bird truck at dusk with the hatch open' },
        { src: img('chilibird-sandwich'), alt: 'Hot chicken sandwich wrapped in wax paper' },
        { src: img('chilibird-queue'), alt: 'Lunchtime queue along the kerb' },
      ] }),
      b('where', 'feed', { title: 'This week’s pitches', layout: 'list', items: [
        { title: 'Tuesday · Rainey Street', subtitle: '11:30am – 2:30pm', text: 'Corner of Rainey & Davis, in the lot behind the container bar. Shade until about 1pm.', badge: 'Lunch', image: img('chilibird-rainey') },
        { title: 'Wednesday · Mueller Lake Park', subtitle: '5:00pm – 9:00pm', text: 'Alongside the truck row on Simond Ave. Picnic tables, dogs welcome, live band most weeks.', badge: 'Dinner', image: img('chilibird-mueller') },
        { title: 'Thursday · St. Elmo Brewing', subtitle: '4:30pm – 9:30pm', text: 'In the beer garden. You buy beer from them and chicken from us, and nobody minds.', badge: 'Dinner', image: img('chilibird-stelmo') },
        { title: 'Friday · East 6th & Chicon', subtitle: '11:00am – 3:00pm', text: 'Our biggest day. We usually sell out of tenders by 1:30pm — sandwiches last longer.', badge: 'Sells out', image: img('chilibird-east6th') },
        { title: 'Saturday · Barton Springs Rd', subtitle: '11:00am – 8:00pm', text: 'All day at the Zilker end. Cash and card, and the only day we run the pickle-brine slushie.', badge: 'All day', image: img('chilibird-zilker') },
      ] }),
      b('menu', 'menu', { title: 'The whole menu', subtitle: 'Heat runs 0 to 3. Level 3 is called Cluck Off and we will ask if you are sure.', sections: [
        { name: 'Sandwiches', note: 'Potato roll, comeback sauce, bread-and-butter pickles.', items: [
          { name: 'The Classic', description: 'Thigh fillet, brined 24 hours, fried to order.', price: '$11', spice: 1 },
          { name: 'The Hot One', description: 'Cayenne-lard mop, extra pickles to cut it.', price: '$12', spice: 2 },
          { name: 'Cluck Off', description: 'Ghost pepper in the mop. You sign nothing, but you should.', price: '$13', spice: 3 },
          { name: 'The Nice One', description: 'No heat at all, honey butter instead. Kids order this.', price: '$11' },
        ] },
        { name: 'Tenders & sides', items: [
          { name: 'Three tenders', description: 'Choose your heat. Comes with white bread, always.', price: '$12', spice: 2 },
          { name: 'Loaded fries', description: 'Comeback sauce, scallion, pickled jalapeño.', price: '$8', spice: 1 },
          { name: 'Slaw', description: 'Vinegar, not mayo. Sharp on purpose.', price: '$4', tags: ['VG', 'GF'] },
          { name: 'Mac & cheese', description: 'Three cheeses, cracker crumb on top.', price: '$6', tags: ['V'] },
        ] },
        { name: 'Drinks', items: [
          { name: 'Pickle-brine slushie', description: 'Saturdays only. Trust us once.', price: '$5', tags: ['VG', 'GF'] },
          { name: 'Sweet tea', description: 'Brewed every morning, dangerously sweet.', price: '$3', tags: ['VG', 'GF'] },
          { name: 'Topo Chico', description: 'Cold enough to hurt.', price: '$3', tags: ['VG', 'GF'] },
        ] },
      ] }),
      b('social', 'social-links', { title: 'We post the pitch every morning at 8', layout: 'row', variant: 'labeled', align: 'center', links: [
        { platform: 'instagram', href: 'https://instagram.com/chilibirdatx', label: '@chilibirdatx' },
        { platform: 'tiktok', href: 'https://tiktok.com/@chilibirdatx', label: 'Sold-out updates' },
        { platform: 'whatsapp', href: 'https://wa.me/15125550147', label: 'Catering enquiries' },
        { platform: 'email', href: 'mailto:hey@chilibird.com', label: 'hey@chilibird.com' },
      ] }),
      b('install', 'install-prompt', { title: 'Put Chili Bird on your home screen', body: 'One tap to today’s pitch, the live sold-out flag, and the order link. No app store, no account.', actionLabel: 'Show me how', position: 'bottom', tone: 'promo', delayMs: 6000, dismissible: true, rememberDismiss: true, platforms: ['ios-safari', 'android', 'desktop-chrome'] }),
      b('footer', 'footer', { brand: 'Chili Bird', tagline: 'Austin, TX · Hot chicken since 2020.', links: [{ label: 'Where we are', href: '#where' }, { label: 'Menu', href: '#menu' }, { label: 'Catering', href: '#' }], copyright: '© Chili Bird LLC' }),
    ],
  }),

  // ── 5. Artisan bakery ──────────────────────────────────────────────────────
  tpl({
    id: 'restaurant-bakery',
    vertical: 'restaurant',
    label: 'Bakery — Showcase',
    description: 'An artisan bakehouse that sells with photography first: a carousel, a loaf shop, a gallery and a weekly bake list.',
    tags: ['bakery', 'gallery', 'newsletter', 'local', 'light'],
    layout: 'showcase',
    preset: 'mono',
    meta: { title: 'Rasa Bakehouse — Bengaluru', description: 'Stone-milled sourdough, cardamom buns and a wood-fired deck oven in Cooke Town.', lang: 'en', favicon: '🥐' },
    blocks: [
      b('nav', 'nav', { brand: 'Rasa Bakehouse', sticky: true, links: [{ label: 'The bake', href: '#reel' }, { label: 'Loaves', href: '#shop' }, { label: 'Gallery', href: '#gallery' }, { label: 'Visit', href: '#hours' }], cta: { label: 'Pre-order', href: '#shop' } }),
      b('hero', 'hero', { eyebrow: 'Cooke Town · Bakes at 04:00', headline: 'Flour, water, salt, time', subhead: 'Four ingredients, thirty-six hours, and a deck oven we light with casuarina wood at four in the morning.', align: 'center', minHeight: 'full', image: img('rasa-crumb'), overlay: 'scrim', cta: { label: 'See this week’s bake', href: '#reel' } }),
      b('reel', 'carousel', { title: 'One morning, start to finish', autoplay: true, items: [
        { src: img('rasa-mill'), alt: 'Stone mill grinding khapli wheat', caption: '04:10 — khapli wheat from Belgaum, milled here that hour.' },
        { src: img('rasa-shaping'), alt: 'Hands shaping a boule on a wooden bench', caption: '05:30 — shaping. Everything is folded by hand, nothing is machine-mixed.' },
        { src: img('rasa-oven'), alt: 'Loaves being loaded into a wood-fired deck oven', caption: '06:45 — loading the deck. It holds forty loaves at a time.' },
        { src: img('rasa-cooling'), alt: 'Racks of cooling sourdough loaves', caption: '08:00 — cooling racks. Doors open at nine and Fridays go fast.' },
      ] }),
      b('story', 'about', { eyebrow: 'Since 2019', title: 'A bakery built around Indian grain', body: 'Rasa started as a Sunday bread stall on Wheeler Road, run by Aparna and Zubin, who were both tired of loaves made from imported white flour. Everything we bake now uses grain grown within Karnataka and Maharashtra — khapli emmer, ponni rice flour, little millet — milled on a stone mill in the back room. It behaves nothing like European flour and it took us two years to stop fighting it. Now the sourness is gentler, the crumb is custardy, and a loaf keeps four days in a Bengaluru monsoon without going to rubber.', image: img('rasa-bakers'), imageAlt: 'Two bakers working at a floured wooden bench', imageSide: 'left' }),
      b('shop', 'product', { title: 'What comes out of the oven', subtitle: 'Pre-order by 8pm the night before. Whatever is left goes on the shelf at nine.', columns: 3, items: [
        { name: 'Khapli sourdough', description: '1kg stone-milled emmer boule, 36-hour ferment.', price: '₹340', image: img('rasa-khapli'), badge: 'Daily', ctaLabel: 'Pre-order', ctaHref: '#' },
        { name: 'Country white', description: '800g, milder, the one children will actually eat.', price: '₹280', image: img('rasa-white'), ctaLabel: 'Pre-order', ctaHref: '#' },
        { name: 'Cardamom bun', description: 'Laminated, hand-knotted, pearl sugar.', price: '₹160', image: img('rasa-cardamom'), badge: 'Sells out', ctaLabel: 'Pre-order', ctaHref: '#' },
        { name: 'Millet & seed tin', description: 'Little millet, flax, sunflower. Dense, sliceable, keeps a week.', price: '₹310', image: img('rasa-millet'), ctaLabel: 'Pre-order', ctaHref: '#' },
        { name: 'Ghee kouign-amann', description: 'Caramelised in ghee instead of butter. Our best idea.', price: '₹190', was: '₹220', image: img('rasa-kouign'), badge: 'Fri & Sat', ctaLabel: 'Pre-order', ctaHref: '#' },
        { name: 'Baker’s dozen box', description: 'Thirteen assorted pastries, for an office or a birthday.', price: '₹1,850', image: img('rasa-box'), ctaLabel: 'Enquire', ctaHref: '#' },
      ] }),
      b('gallery', 'gallery', { layout: 'masonry', columns: 3, gap: 'lg', lightbox: true, items: [
        { src: img('rasa-gallery-1'), alt: 'Open crumb of a cut sourdough loaf', caption: 'Khapli crumb, 82% hydration' },
        { src: img('rasa-gallery-2'), alt: 'Tray of glazed cardamom buns', caption: 'Friday cardamom buns' },
        { src: img('rasa-gallery-3'), alt: 'Glowing mouth of a wood-fired deck oven', caption: 'The deck at 260°C' },
        { src: img('rasa-gallery-4'), alt: 'Shelf of wrapped loaves ready for collection', caption: 'Pre-orders, named and wrapped' },
        { src: img('rasa-gallery-5'), alt: 'Counter with a wooden bread shelf behind it', caption: 'The nine o’clock queue' },
        { src: img('rasa-gallery-6'), alt: 'Sacks of Karnataka-grown wheat', caption: 'Emmer from Belgaum' },
      ] }),
      b('rule', 'divider', { style: 'gradient' }),
      b('subscribe', 'newsletter', { title: 'The Thursday bake list', intro: 'Every Thursday evening we send what is going in the oven on Friday and Saturday, and what has already sold out. One email a week, no offers, unsubscribe in a tap.', placeholder: 'you@example.com', submitLabel: 'Send me the list', successMessage: 'You’re on the list — the first one lands this Thursday around 7pm IST.' }),
      b('hours', 'hours', { title: 'Doors open', timezone: 'Asia/Kolkata', note: 'We bake Wednesday to Sunday. When the shelf is empty we close, which on a Saturday can be by half past eleven.', days: [
        { day: 'mon', closed: true },
        { day: 'tue', closed: true },
        { day: 'wed', open: '09:00', close: '17:00' },
        { day: 'thu', open: '09:00', close: '17:00' },
        { day: 'fri', open: '08:30', close: '18:00' },
        { day: 'sat', open: '08:30', close: '18:00' },
        { day: 'sun', open: '09:00', close: '14:00' },
      ] }),
      b('footer', 'footer', { brand: 'Rasa Bakehouse', tagline: '12 Wheeler Road Extension, Cooke Town, Bengaluru 560084 · +91 80 4123 8890', links: [{ label: 'Loaves', href: '#shop' }, { label: 'Bake list', href: '#subscribe' }, { label: 'Instagram', href: '#' }], copyright: '© Rasa Bakehouse LLP' }),
    ],
  }),

  // ── 6. Craft-beer pub ──────────────────────────────────────────────────────
  tpl({
    id: 'restaurant-craft-pub',
    vertical: 'restaurant',
    label: 'Craft pub — Bold',
    description: 'A craft-beer pub with a full-bleed hero, the tap list in tabs, a brewery film and everything a first-timer needs to know.',
    tags: ['pub', 'beer', 'dark', 'video', 'reviews'],
    layout: 'bold',
    preset: 'ocean',
    meta: { title: 'The Copper Vault — Craft Beer, Manchester', description: 'Twenty-two lines, a five-barrel brewery in the cellar, and a kitchen that only does one thing properly.', lang: 'en', favicon: '🍺' },
    blocks: [
      b('nav', 'nav', { brand: 'The Copper Vault', sticky: true, links: [{ label: 'On tap', href: '#taproom' }, { label: 'What’s on', href: '#events' }, { label: 'Find us', href: '#visit' }], cta: { label: 'Book a table', href: '#book' } }),
      b('hero', 'hero', { eyebrow: 'Ancoats · Est. 2016', headline: 'Twenty-two lines. Brewed downstairs.', subhead: 'A five-barrel kit in the cellar, a rotating guest wall, and no televisions anywhere in the building.', align: 'center', minHeight: 'full', image: img('vault-taps'), overlay: 'dark', cta: { label: 'See what’s pouring', href: '#taproom' } }),
      b('stats', 'stats', { columns: 4, items: [
        { value: '22', label: 'Lines on the wall' },
        { value: '5', label: 'Barrel brew kit in the cellar', suffix: 'bbl' },
        { value: '0', label: 'Televisions' },
        { value: '2016', label: 'Pouring since' },
      ] }),
      b('taproom', 'tabs', { items: [
        { label: 'Our beer', text: 'Everything with COPPER on the badge was brewed nine metres below where you are standing. The core four are always on: Vault Pale (4.2%, Citra and Mosaic, the one most people start with), Ancoats Mild (3.6%, dark, criminally underrated), Cellar Lager (4.6%, five weeks cold-conditioned) and Nightwatch Stout (5.1%, oats and cold-brew coffee from a roastery two streets away). Beyond those, six rotating taps that change most weeks — a hazy IPA, something sour, and in winter a barrel-aged barley wine that lands in November and is gone by New Year.' },
        { label: 'Guest taps', text: 'Twelve guest lines, refreshed every Tuesday and Friday. We buy from breweries we have actually visited: Cloudwater and Track down the road, Verdant out of Cornwall, Duration in Norfolk, and a standing slot for whoever is doing the most interesting thing in Yorkshire that month. Two lines are always cask, gravity-poured, and one is always under 3.5%, because not everyone wants to write off the evening. The full list is chalked up behind the bar and on the screen by the door.' },
        { label: 'Kitchen', text: 'We do one thing: a toastie, and we do it very well. Sourdough from the bakery on Blossom Street, Ogleshield and Montgomery cheddar, onion jam, pressed until the edges go lacy. £9. Add nduja for £2 or a fried egg for £1.50. There is a vegan version with a cashew béchamel that sells better than we expected. Scotch eggs, pork pies and a salt-and-vinegar crisp sandwich round it out. That is the entire menu and it is not changing.' },
        { label: 'Private hire', text: 'The vault room downstairs seats thirty-two, holds fifty standing, and has its own four-tap bar. No hire fee Sunday to Wednesday with a £400 minimum spend; £250 on Thursdays; not available Friday or Saturday. It comes with the toastie press, a speaker you control, and a brewery tour from whoever is on shift. Email the address at the bottom of the page and ask for Row.' },
      ] }),
      b('film', 'video', { provider: 'youtube', src: 'aqz-KE-bpKQ', title: 'Brew day in the Copper Vault cellar', poster: img('vault-cellar'), caption: 'A brew day, start to finish, in about four minutes — filmed by a regular who does this for a living.' }),
      b('events', 'blog-list', { title: 'What’s on this month', columns: 3, posts: [
        { title: 'Meet the Brewer: Duration', excerpt: 'Bailey from Duration brings four beers up from Norfolk and talks about farming barley on the brewery’s own land. Free, but the vault room fills up.', href: '#', image: img('vault-event-brewer'), date: 'Thu 6 Nov · 7:30pm', tag: 'Tasting' },
        { title: 'Cask Sunday', excerpt: 'Every Sunday, three gravity-poured casks on the stillage until they run out. Roast dinners from the kitchen next door from 1pm.', href: '#', image: img('vault-event-cask'), date: 'Every Sunday · from 12pm', tag: 'Weekly' },
        { title: 'Barley Wine Release', excerpt: 'Old Ancoats 2025 comes out of the barrels. 11.4%, served in a third, and yes there is a limit of two per person.', href: '#', image: img('vault-event-barleywine'), date: 'Fri 28 Nov · 5pm', tag: 'Release' },
      ] }),
      b('good-to-know', 'accordion', { title: 'Before you come', items: [
        { heading: 'Do you take bookings?', body: 'Tables of six or more, yes, up to 7pm. After that the whole ground floor is first come, first served — including the booths, which we will not hold for anyone.' },
        { heading: 'Are children and dogs welcome?', body: 'Dogs everywhere, always, and there is a water bowl and a biscuit jar by the door. Children until 8pm in the front room, accompanied by an adult.' },
        { heading: 'Is the building accessible?', body: 'The ground-floor bar and the accessible toilet are step-free from Redhill Street. The vault room downstairs is reached by fourteen stairs with a handrail and there is no lift — if that is a problem for your group, tell us and we will run your private hire upstairs instead.' },
        { heading: 'What if I am not drinking?', body: 'Two alcohol-free taps, a proper alcohol-free stout, Manchester-made kombucha, and a coffee machine we actually know how to use. Nobody gets handed a lemonade and a shrug.' },
      ] }),
      b('book', 'cta', { headline: 'Six or more? Let us hold a table.', subhead: 'Groups up to 7pm, seven days a week. Say if you want the brewery tour and we will time it for you.', background: 'accent', button: { label: 'Request a table', href: '#' } }),
      b('visit', 'contact-details', { title: 'Find the Vault', address: '14 Redhill Street, Ancoats, Manchester M4 5BA', phone: '+44 161 000 2244', email: 'bar@coppervault.beer', hours: 'Mon–Thu 16:00–23:00 · Fri–Sat 12:00–00:30 · Sun 12:00–22:30' }),
      b('footer', 'footer', { brand: 'The Copper Vault', tagline: 'Brewed in the cellar, poured upstairs.', links: [{ label: 'On tap', href: '#taproom' }, { label: 'What’s on', href: '#events' }, { label: 'Before you come', href: '#good-to-know' }], copyright: '© The Copper Vault Brewing Co Ltd' }),
    ],
  }),

  // ── 7. Delivery-only ghost kitchen ─────────────────────────────────────────
  tpl({
    id: 'restaurant-ghost-kitchen',
    vertical: 'restaurant',
    label: 'Ghost kitchen — Landing',
    description: 'A delivery-only kitchen selling weekly meal plans: how it works, the tiers, the proof and one call to action repeated.',
    tags: ['delivery', 'ghost-kitchen', 'pricing', 'one-pager', 'b2c'],
    layout: 'landing',
    preset: 'midnight',
    meta: { title: 'Nightwork Kitchens — Chicago Delivery', description: 'A delivery-only kitchen in Pilsen cooking five dinners a week and dropping them at your door on Sunday.', lang: 'en', favicon: '🛵' },
    blocks: [
      b('announce', 'announcement-bar', { text: 'New members get their first week half price with code FIRSTFIVE.', linkLabel: 'See the plans', href: '#plans', tone: 'promo', dismissible: true }),
      b('hero', 'hero', { eyebrow: 'Delivery only · Chicago', headline: 'Five real dinners. Sunday, at your door.', subhead: 'No storefront, no delivery apps, no gig drivers. We cook Saturday night in Pilsen and our own van drops your week on Sunday morning.', align: 'center', minHeight: 'lg', image: img('nightwork-line'), overlay: 'dark', cta: { label: 'Pick a plan', href: '#plans' } }),
      b('how', 'steps', { title: 'How the week works', subtitle: 'You choose once. After that it just arrives, until you tell it not to.', items: [
        { title: 'Choose your five by Thursday', text: 'The menu opens Monday morning with twelve dishes. Pick five, swap any of them until 8pm Thursday, or let us choose and you get the rotation.' },
        { title: 'We shop Friday', text: 'Produce from the Green City Market, fish from a Fulton Market wholesaler, and nothing ordered before we know how many meals we are actually cooking.' },
        { title: 'We cook Saturday night', text: 'Everything is cooked from raw between 6pm and 3am, chilled hard in a blast chiller, and sealed. Nothing is frozen, and nothing is more than sixteen hours old when it reaches you.' },
        { title: 'Our van comes Sunday', text: 'A two-hour window you choose, anywhere inside the city limits. An insulated tote at the door — leave last week’s tote out and we take it back.' },
        { title: 'You reheat in eight minutes', text: 'Oven or pan, never microwave-only. Every box has a card with the two-line method and what to add if you want it fancier.' },
      ] }),
      b('plans', 'pricing', { title: 'Plans', subtitle: 'Pause any week, cancel any time, no notice period. Prices include delivery and tax.', plans: [
        { name: 'Solo', price: '$58', period: '/week', features: ['5 dinners for 1 person', 'Choose from 12 dishes weekly', 'Sunday delivery, 2-hour window', 'Pause or cancel any week'], ctaLabel: 'Start with Solo', ctaHref: '#enquire' },
        { name: 'Two', price: '$96', period: '/week', features: ['5 dinners for 2 people', 'Choose from 12 dishes weekly', 'Sunday delivery, 2-hour window', 'Pause or cancel any week'], ctaLabel: 'Start with Two', ctaHref: '#enquire' },
        { name: 'Family', price: '$168', period: '/week', features: ['5 dinners for 4 people', 'Choose from 12 dishes weekly', 'Two kid-portion swaps included', 'Sunday delivery, 2-hour window', 'Pause or cancel any week'], ctaLabel: 'Start with Family', ctaHref: '#enquire', featured: true },
        { name: 'Office', price: 'from $420', period: '/week', features: ['Lunch for 10–60 people', 'Weekday delivery, invoiced monthly', 'Allergen sheet for every dish', 'A named account manager'], ctaLabel: 'Talk to us', ctaHref: '#enquire' },
      ] }),
      b('partners', 'logos', { title: 'Where the food comes from', items: [
        { src: img('nightwork-supplier-market'), alt: 'Green City Market', href: '#' },
        { src: img('nightwork-supplier-fish'), alt: 'Fulton Market Fish Co.', href: '#' },
        { src: img('nightwork-supplier-farm'), alt: 'Nichols Farm & Orchard', href: '#' },
        { src: img('nightwork-supplier-mill'), alt: 'Janie’s Mill', href: '#' },
        { src: img('nightwork-supplier-dairy'), alt: 'Kilgus Farmstead Dairy', href: '#' },
      ] }),
      b('reviews', 'reviews', { title: 'Members, eleven months in', subtitle: 'Collected in our own post-delivery survey and published unedited.', average: '4.8', count: '2,140', source: 'Member survey', items: [
        { rating: 5, quote: 'I stopped ordering delivery entirely. The braised short rib is better than things I have paid $34 for in a dining room.', author: 'Renée A.', date: 'Logan Square', source: 'other' },
        { rating: 5, quote: 'Two kids under five. Sunday used to be four hours of meal prep and now it is a van and a tote. Worth every dollar.', author: 'Marcus & Devon T.', date: 'Beverly', source: 'other' },
        { rating: 4, quote: 'Only complaint is that the good dishes sell out by Wednesday. I have learned to pick on Monday morning with coffee.', author: 'Ji-woo P.', date: 'Uptown', source: 'other' },
      ] }),
      b('faq', 'faq', { title: 'Fair questions', items: [
        { question: 'Which neighborhoods do you deliver to?', answer: 'Everywhere inside the Chicago city limits, plus Oak Park and Evanston. Any further and the food spends longer in a van than we are comfortable with.' },
        { question: 'What about allergies?', answer: 'Every dish lists its full ingredients and the major allergens on the menu page and on the box. We cook nut-free across the whole kitchen. We cannot promise a gluten-free environment — there is flour in the air on bread days.' },
        { question: 'How long does it keep?', answer: 'Five days sealed in the fridge, and the box prints the date. Three of the five dishes each week are freezer-safe and marked as such.' },
        { question: 'Is there a contract?', answer: 'No. You can pause a week or cancel outright from the account page up to 8pm Thursday, and nothing is charged for a week you paused.' },
        { question: 'Why is there no storefront?', answer: 'Because a dining room in this city costs about $180,000 a year before anyone eats anything, and we would rather spend it on the short rib.' },
      ] }),
      b('enquire', 'contact-form', { title: 'Start a plan', intro: 'Tell us where you are and which plan looks right. We confirm coverage and your first Sunday window within one business day.', submitLabel: 'Request my first week', successMessage: 'Got it — expect an email within one business day with your delivery window and your menu link.', fields: [
        { name: 'name', label: 'Your name', type: 'text', placeholder: 'Alex Rivera', required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true },
        { name: 'zip', label: 'ZIP code', type: 'text', placeholder: '60608', required: true },
        { name: 'plan', label: 'Which plan', type: 'select', required: true, options: ['Solo — $58/week', 'Two — $96/week', 'Family — $168/week', 'Office lunch — from $420/week'] },
        { name: 'diet', label: 'Allergies or things you won’t eat', type: 'textarea', placeholder: 'No shellfish, and one vegetarian in the house.' },
        { name: 'promo', label: 'Apply FIRSTFIVE — 50% off week one', type: 'checkbox' },
      ] }),
      b('cta', 'cta', { headline: 'Your first Sunday is half price.', subhead: 'Five dinners, cooked Saturday, at your door before noon. Cancel before week two if it is not for you.', background: 'primary', button: { label: 'Pick a plan', href: '#plans' } }),
      b('footer', 'footer', { brand: 'Nightwork Kitchens', tagline: '1908 S Halsted St, Chicago, IL 60608 · (312) 555-0184 · Licensed shared kitchen, no walk-ins.', links: [{ label: 'Plans', href: '#plans' }, { label: 'How it works', href: '#how' }, { label: 'FAQ', href: '#faq' }], copyright: '© Nightwork Kitchens LLC' }),
    ],
  }),

  // ── 8. Private chef / supper club ──────────────────────────────────────────
  tpl({
    id: 'restaurant-supper-club',
    vertical: 'restaurant',
    label: 'Private chef — Profile',
    description: 'A private chef and supper club presented as a person: kitchens worked, what they cook, upcoming dates and how booking goes.',
    tags: ['private-chef', 'supper-club', 'portfolio', 'booking', 'local'],
    layout: 'profile',
    preset: 'sand',
    meta: { title: 'Inês Duarte — Private Chef & Supper Club, Lisbon', description: 'Twelve seats in a Graça apartment once a month, and private cooking in your own kitchen the rest of the time.', lang: 'en', favicon: '🍽️' },
    blocks: [
      b('profile', 'profile-header', { name: 'Inês Duarte', headline: 'Private chef · Casa Duarte supper club', location: 'Graça, Lisbon', avatar: img('ines-portrait'), summary: 'Fourteen years in restaurant kitchens, now cooking for twelve people at a time in my own dining room — and in yours. Portuguese food that leans on the market up the road, not on nostalgia.', contacts: [
        { type: 'email', value: 'ines@casaduarte.pt' },
        { type: 'phone', value: '+351 912 000 118' },
        { type: 'location', value: 'Graça, Lisbon' },
        { type: 'custom', value: 'https://instagram.com/casaduarte.supper', label: '@casaduarte.supper' },
      ], showDownload: true, downloadLabel: 'Print this page', showShare: true, shareLabel: 'Share this page' }),
      b('story', 'rich-text', { blocks: [
        { kind: 'paragraph', text: 'I cook two things. Once a month my dining room in Graça becomes Casa Duarte: twelve seats, one long table, six courses and a lot of wine from the Douro. The rest of the month I cook privately — dinner parties, small weddings, a birthday where somebody wants the food their grandmother made, but better.' },
        { kind: 'paragraph', text: 'The cooking is Portuguese but it is not a museum. Whatever the fish counter at Mercado de Santa Clara has that morning decides most of the menu. I buy whole animals, I use the whole animal, and I would rather serve you a perfect grilled carapau than something with tweezer marks on it.' },
        { kind: 'quote', text: 'If you have a grandmother’s recipe you want cooked properly, bring it. Those are my favourite jobs.' },
      ] }),
      b('kitchens', 'experience', { title: 'Kitchens', items: [
        { role: 'Chef-owner', org: 'Casa Duarte Supper Club', period: '2021 — now', location: 'Graça, Lisbon', summary: 'A twelve-seat supper club in my own apartment, one Saturday a month, plus private cooking across Lisbon and the Setúbal peninsula.', bullets: ['Cooked 340+ services for around 4,000 guests', 'Sold out every date since March 2022', 'Listed in Time Out Lisboa’s “where locals actually eat”, 2024'] },
        { role: 'Sous chef', org: 'Taberna do Cais', period: '2017 — 2021', location: 'Cais do Sodré, Lisbon', summary: 'Ran the fish section, then the pass, in a 45-cover taberna cooking modern Portuguese food over charcoal.', bullets: ['Wrote the daily catch menu with the Cascais boats', 'Trained nine commis chefs, six of whom now run their own sections'] },
        { role: 'Chef de partie', org: 'Restaurante Verde Minho', period: '2014 — 2017', location: 'Porto', summary: 'Northern Portuguese cooking — the broths, the bread, the slow-braised things.' },
        { role: 'Commis', org: 'Casa da Ribeira', period: '2012 — 2014', location: 'Viana do Castelo', summary: 'First kitchen. Where I learned to fillet properly and to clean as I go.' },
      ] }),
      b('craft', 'skills', { title: 'What I actually cook', display: 'bars', groups: [
        { name: 'Cuisines', items: [
          { label: 'Portuguese — coastal', level: 5 },
          { label: 'Portuguese — northern & braises', level: 5 },
          { label: 'Spanish & Basque', level: 4 },
          { label: 'North African', level: 3 },
        ] },
        { name: 'In the kitchen', items: [
          { label: 'Whole fish & shellfish', level: 5 },
          { label: 'Charcoal grilling', level: 5 },
          { label: 'Whole-animal butchery', level: 4 },
          { label: 'Bread & pastry', level: 3 },
          { label: 'Wine pairing (Douro, Alentejo)', level: 4 },
        ] },
        { name: 'Cooked around', items: [
          { label: 'Vegetarian menus', level: 5 },
          { label: 'Vegan menus', level: 4 },
          { label: 'Gluten free', level: 5 },
          { label: 'Shellfish allergy', level: 5 },
        ] },
      ] }),
      b('dates', 'timeline', { title: 'Casa Duarte — upcoming dates', items: [
        { date: 'Sat 8 November', title: 'Porco & Vinho', text: 'A whole Bísaro pig from Trás-os-Montes, cooked six ways across six courses, with Douro reds throughout. €75. Two seats left.' },
        { date: 'Sat 6 December', title: 'Consoada, early', text: 'The Christmas Eve table a fortnight early — bacalhau cozido, couve, rabanadas, and far too much of it. €70. Sold out, waiting list open.' },
        { date: 'Sat 17 January', title: 'Sopas', text: 'Six soups, six courses, one very long winter table. Caldo verde, açorda, sopa da pedra, and three you will not have had. €60. Booking opens 15 December.' },
        { date: 'Sat 14 February', title: 'Mariscada', text: 'Everything the Santa Clara counter has that morning, grilled over charcoal on the balcony. €85. Booking opens 12 January.' },
        { date: 'Sat 14 March', title: 'Primavera', text: 'The first favas, the first grelos, lamb from the Alentejo. €75. Booking opens 9 February.' },
      ] }),
      b('table', 'gallery', { layout: 'grid', columns: 2, gap: 'lg', lightbox: true, items: [
        { src: img('casa-duarte-table'), alt: 'Long table set for twelve in a Lisbon apartment', caption: 'The table, an hour before doors' },
        { src: img('casa-duarte-carapau'), alt: 'Grilled carapau on a charcoal grill', caption: 'Carapau, charcoal, coarse salt' },
        { src: img('casa-duarte-balcony'), alt: 'Charcoal grill on a small apartment balcony', caption: 'The balcony grill, in use most Saturdays' },
        { src: img('casa-duarte-guests'), alt: 'Twelve guests eating at a communal table', caption: 'Strangers, at course four' },
      ] }),
      b('chat', 'chat-thread', { title: 'How booking a private dinner usually goes', subtitle: 'A real enquiry, lightly shortened, shared with permission.', participants: [
        { id: 'guest', name: 'Sofia', role: 'user' },
        { id: 'ines', name: 'Inês', role: 'agent', avatar: img('ines-avatar') },
      ], messages: [
        { from: 'guest', time: '18:42', body: [{ kind: 'text', text: 'Hi! My partner’s 40th, 14 people, our flat in Estrela, Saturday 21 March. Is that something you do?' }] },
        { from: 'ines', time: '19:05', body: [
          { kind: 'text', text: 'Yes — 21 March is free, and fourteen is a good number for a home kitchen. Three things I need before I can quote you properly:' },
          { kind: 'list', ordered: true, items: [{ label: 'How many burners, and how big is the oven?' }, { label: 'Any allergies, and is anyone vegetarian or vegan?' }, { label: 'Seated at one table, or standing with plates?' }] },
        ] },
        { from: 'guest', time: '19:20', body: [{ kind: 'text', text: 'Four burners, a normal oven. One coeliac, two vegetarians. Seated — we can just about fit fourteen if we borrow a table.' }] },
        { from: 'ines', time: '19:48', body: [
          { kind: 'text', text: 'Then I would suggest five courses rather than six, so nothing is waiting on the oven. Coeliac and vegetarian menus are cooked as their own dishes, not a plate with things taken off it — that is included, never an extra charge.' },
          { kind: 'text', text: 'For fourteen seated, five courses, I would be €68 per person including all the shopping, plus €120 for a second pair of hands on the night. You buy the wine and I will send a list. I arrive at 15:00, we eat at 20:00, and your kitchen is cleaner than I found it by midnight.' },
          { kind: 'buttons', items: [{ label: 'See a sample five-course menu', href: '#story' }, { label: 'Ask about another date', href: '#enquire' }] },
        ] },
        { from: 'guest', time: '20:02', body: [{ kind: 'text', text: 'That is exactly what we wanted. Where do I send the deposit?' }] },
      ] }),
      b('enquire', 'contact-form', { title: 'Enquire about a dinner', intro: 'Private dinners across Lisbon, Sintra and Setúbal. I usually reply the same evening, and I book about two months out.', submitLabel: 'Send enquiry', successMessage: 'Obrigada — I reply to everything within 24 hours, usually the same night after service.', fields: [
        { name: 'name', label: 'Your name', type: 'text', placeholder: 'Sofia Almeida', required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true },
        { name: 'phone', label: 'Phone or WhatsApp', type: 'tel', placeholder: '+351 …' },
        { name: 'kind', label: 'What are you after', type: 'select', required: true, options: ['A seat at the next Casa Duarte supper', 'Private dinner in my home', 'Small wedding or celebration', 'Cooking lesson for 2–6 people'] },
        { name: 'when', label: 'Date and number of guests', type: 'text', placeholder: '21 March, 14 people' },
        { name: 'details', label: 'Allergies, your kitchen, anything else', type: 'textarea', placeholder: 'One coeliac, two vegetarians, four burners and a normal oven.' },
      ] }),
      b('social', 'social-links', { title: 'Elsewhere', layout: 'row', variant: 'icon', align: 'start', links: [
        { platform: 'instagram', href: 'https://instagram.com/casaduarte.supper', label: '@casaduarte.supper' },
        { platform: 'whatsapp', href: 'https://wa.me/351912000118', label: 'WhatsApp' },
        { platform: 'email', href: 'mailto:ines@casaduarte.pt', label: 'ines@casaduarte.pt' },
      ] }),
      b('copyright', 'copyright', { holder: 'Inês Duarte · Casa Duarte', text: 'NIF 249 118 003. Supper club seats are non-refundable within 14 days, but always transferable.', showSymbol: true, align: 'center' }),
    ],
  }),
];
