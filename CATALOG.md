# @bytesbrains/weblocks — Block Catalog (v0.5.0)

The AI composes a `SiteManifest` (`{ meta, design, blocks[] }`) using **only** the block types below, then the engine validates + renders it to static HTML. This file is generated from the code (`npm run emit:catalog`) — do not edit by hand.

**Block types:** `app-shell` · `nav` · `announcement-bar` · `sidebar` · `hero` · `hero-app` · `profile-header` · `experience` · `skills` · `features` · `about` · `rich-text` · `split` · `steps` · `stats` · `services-catalogue` · `pricing` · `logos` · `team` · `gallery` · `carousel` · `video` · `video-gallery` · `map` · `timeline` · `tabs` · `accordion` · `testimonials` · `faq` · `blog-list` · `blog-post` · `feed` · `contact-form` · `newsletter` · `search` · `auth` · `cta` · `social-links` · `contact-details` · `directions` · `legal` · `divider` · `spacer` · `copyright` · `footer`

## `app-shell`

A persistent bottom tab bar for app-like navigation, each tab an optional icon plus a label linking to a view.

| field | type | required | notes |
|---|---|---|---|
| `brand` | string |  |  |
| `tabs` | array |  |  |

## `nav`

Top navigation bar: brand/logo text, a row of links, and an optional call-to-action button. Place first.

| field | type | required | notes |
|---|---|---|---|
| `brand` | string | yes |  |
| `sticky` | boolean |  |  |
| `links` | array |  |  |
| `cta` | object |  |  |

## `announcement-bar`

A dismissible full-width strip for a short promo or notice, with an optional inline link and info/promo/warning tone.

| field | type | required | notes |
|---|---|---|---|
| `text` | string | yes |  |
| `linkLabel` | string |  |  |
| `href` | string |  |  |
| `tone` | undefined (info\|promo\|warning) |  |  |
| `dismissible` | boolean |  |  |

## `sidebar`

A vertical section/drawer navigation for multi-view apps: an optional title over a list of icon-and-label links.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `links` | array |  |  |

## `hero`

Top-of-page hero: a big headline with optional eyebrow, subheading, and CTA — optionally over a full-bleed background image banner with a legibility overlay.

| field | type | required | notes |
|---|---|---|---|
| `eyebrow` | string |  |  |
| `headline` | string | yes |  |
| `subhead` | string |  |  |
| `align` | undefined (center\|left) |  |  |
| `image` | string |  |  |
| `overlay` | undefined (scrim\|dark\|light\|none) |  |  |
| `minHeight` | undefined (auto\|sm\|md\|lg\|full) |  |  |
| `cta` | object |  |  |

## `hero-app`

An app landing hero: a headline and subhead over a primary install button, with a horizontal scroll row of app screenshots.

| field | type | required | notes |
|---|---|---|---|
| `headline` | string | yes |  |
| `subhead` | string |  |  |
| `installLabel` | string |  |  |
| `installHref` | string |  |  |
| `screenshots` | array |  |  |

## `profile-header`

A résumé/CV header: avatar, name, role, location, a contact + social row, and optional Download-PDF and Share buttons.

| field | type | required | notes |
|---|---|---|---|
| `name` | string | yes |  |
| `headline` | string |  |  |
| `location` | string |  |  |
| `avatar` | string |  |  |
| `summary` | string |  |  |
| `contacts` | array |  |  |
| `showDownload` | boolean |  |  |
| `downloadLabel` | string |  |  |
| `showShare` | boolean |  |  |
| `shareLabel` | string |  |  |

## `experience`

A résumé section of dated entries (role, org, period, location, bullets). Reuse for Experience, Education, Certifications by changing the title.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `items` | array |  |  |

## `skills`

Grouped skills shown as tags (with optional proficiency dots) or labelled level bars; also for languages and tools.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `display` | undefined (tags\|bars) |  |  |
| `groups` | array |  |  |

## `features`

A grid of value propositions, each with an optional icon/emoji, a title, and a short line of text.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `subtitle` | string |  |  |
| `columns` | integer (2\|3\|4) |  |  |
| `items` | array |  |  |

## `about`

A story/mission section: eyebrow, title, prose body, and an optional side image (choose which side).

| field | type | required | notes |
|---|---|---|---|
| `eyebrow` | string |  |  |
| `title` | string |  |  |
| `body` | string |  |  |
| `image` | string |  |  |
| `imageAlt` | string |  |  |
| `imageSide` | undefined (left\|right) |  |  |

## `rich-text`

A typed prose section with ordered headings, paragraphs, quotes, and bullet/numbered lists — a safe freeform-content block, never raw HTML.

| field | type | required | notes |
|---|---|---|---|
| `blocks` | array |  |  |

## `split`

Alternating image-and-text rows; the image side flips each row, and rows without an image collapse to centered text.

| field | type | required | notes |
|---|---|---|---|
| `rows` | array |  |  |

## `steps`

A numbered how-it-works / process list: an optional title and subtitle over auto-numbered step cards, each with a title and short text.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `subtitle` | string |  |  |
| `items` | array |  |  |

## `stats`

A grid of metric counters: each stat shows an optional prefix/suffix around a big value with a muted label, with an optional count-up animation.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `columns` | integer (2\|3\|4) |  |  |
| `items` | array |  |  |

## `services-catalogue`

A grid of services or products, each with a name, optional price, description, and link. Use for "what we offer".

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `subtitle` | string |  |  |
| `items` | array |  |  |

## `pricing`

A row of pricing/tier cards, each with a name, price, feature list, and a call-to-action button; one plan can be highlighted.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `subtitle` | string |  |  |
| `plans` | array |  |  |

## `logos`

A centered strip of client or partner logos (grayscale until hover), each optionally linking out, under a short heading.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `items` | array |  |  |

## `team`

A grid of people cards with photo (or initials), name, role, a short bio, and optional social links.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `subtitle` | string |  |  |
| `columns` | integer (2\|3\|4) |  |  |
| `members` | array |  |  |

## `gallery`

A responsive image grid (grid/masonry/carousel) with an optional click-to-zoom lightbox. Each item needs a src and alt text.

| field | type | required | notes |
|---|---|---|---|
| `layout` | undefined (grid\|masonry\|carousel) |  |  |
| `columns` | integer (2\|3\|4) |  |  |
| `gap` | undefined (sm\|md\|lg) |  |  |
| `lightbox` | boolean |  |  |
| `items` | array |  |  |

## `carousel`

A horizontal, swipeable carousel of image slides with optional captions; scrolls natively and can be enhanced with arrows/autoplay.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `items` | array |  |  |
| `autoplay` | boolean |  |  |

## `video`

A responsive embedded video from YouTube or Vimeo (by id or URL) or a self-hosted file, with an optional caption.

| field | type | required | notes |
|---|---|---|---|
| `provider` | undefined (youtube\|vimeo\|file) |  |  |
| `src` | string | yes |  |
| `title` | string |  |  |
| `poster` | string |  |  |
| `caption` | string |  |  |

## `video-gallery`

A grid or carousel of click-to-play video cards (YouTube/Vimeo/file); each loads its player inline on click (a lightweight facade — no heavy iframes up front).

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `layout` | undefined (grid\|carousel) |  |  |
| `columns` | integer (2\|3\|4) |  |  |
| `items` | array |  |  |

## `map`

An embedded location map for a place or address query, with configurable zoom and height and a link to the full map.

| field | type | required | notes |
|---|---|---|---|
| `query` | string | yes |  |
| `zoom` | integer |  |  |
| `height` | integer |  |  |
| `label` | string |  |  |

## `timeline`

A vertical timeline of chronological milestones, each with an optional date, a title, and supporting text.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `items` | array |  |  |

## `tabs`

Tabbed content panels that switch with no JavaScript; each tab has a label and a text panel.

| field | type | required | notes |
|---|---|---|---|
| `items` | array |  |  |

## `accordion`

Generic collapsible disclosure panels (native details/summary, no JavaScript); each panel has a heading and body.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `items` | array |  |  |

## `testimonials`

A grid of customer quotes, each with the quote text and an optional author name and role.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `items` | array |  |  |

## `faq`

An accordion of question/answer pairs. Expands/collapses natively (no JS).

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `items` | array |  |  |

## `blog-list`

A post index as a grid of cards, each with an optional cover image, tag, date, title, and excerpt linking to the post.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `columns` | integer (2\|3) |  |  |
| `posts` | array |  |  |

## `blog-post`

A single article layout with an optional cover, title, author/date, and a typed body (headings, paragraphs, quotes, bullets).

| field | type | required | notes |
|---|---|---|---|
| `title` | string | yes |  |
| `date` | string |  |  |
| `author` | string |  |  |
| `cover` | string |  |  |
| `coverAlt` | string |  |  |
| `body` | array |  |  |

## `feed`

A generic data-driven list of items in a list or card layout, each with a title, optional subtitle/text, badge, image, and link.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `layout` | undefined (list\|cards) |  |  |
| `items` | array |  |  |

## `contact-form`

A configurable contact form with typed fields (text, email, tel, textarea, select, checkbox) that posts to a host-provided runtime. No raw HTML.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `intro` | string |  |  |
| `submitLabel` | string |  |  |
| `successMessage` | string |  |  |
| `fields` | array |  |  |

## `newsletter`

An email-capture form that posts to a host-provided runtime; renders inert until a runtime is wired.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `intro` | string |  |  |
| `placeholder` | string |  |  |
| `submitLabel` | string |  |  |
| `successMessage` | string |  |  |

## `search`

A site search rendered as a full search bar or a compact expanding icon button; queries a host-provided search runtime.

| field | type | required | notes |
|---|---|---|---|
| `layout` | undefined (bar\|icon) |  |  |
| `placeholder` | string |  |  |
| `label` | string |  |  |
| `buttonLabel` | string |  |  |
| `name` | string |  |  |
| `align` | undefined (start\|center\|end) |  |  |

## `auth`

A provider-agnostic sign in / sign up panel: social provider buttons and an optional email form that start auth via a host runtime.

| field | type | required | notes |
|---|---|---|---|
| `mode` | undefined (signin\|signup) |  |  |
| `title` | string |  |  |
| `providers` | array |  |  |
| `showEmail` | boolean |  |  |

## `cta`

A full-width call-to-action band: a headline, optional subheading, and one button. Use near the bottom.

| field | type | required | notes |
|---|---|---|---|
| `headline` | string | yes |  |
| `subhead` | string |  |  |
| `background` | undefined (primary\|accent\|surface) |  |  |
| `button` | object |  |  |

## `social-links`

A row or grid of links to social/contact profiles; each link picks a built-in brand icon by platform (or a custom emoji), shown labeled or icon-only.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `layout` | undefined (row\|grid) |  |  |
| `variant` | undefined (labeled\|icon) |  |  |
| `align` | undefined (start\|center\|end) |  |  |
| `links` | array |  |  |

## `contact-details`

A contact info block: address, phone, email, and opening hours (each optional). Read-only — no form.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `address` | string |  |  |
| `phone` | string |  |  |
| `email` | string |  |  |
| `hours` | string |  |  |

## `directions`

A location card with deep links that open the visitor’s map app (Google/Apple Maps) for directions, from an address, GPS coordinates, or a pasted map link.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `place` | string |  |  |
| `address` | string |  |  |
| `lat` | string |  |  |
| `lng` | string |  |  |
| `mapUrl` | string |  |  |
| `directionsLabel` | string |  |  |
| `appleMaps` | boolean |  |  |

## `legal`

Policy links (terms, privacy, cookies, …) that open as scrollable, dismissible dialogs; each body is safe Markdown (never raw HTML). No JavaScript.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `align` | undefined (start\|center\|end) |  |  |
| `separator` | string |  |  |
| `documents` | array |  |  |

## `divider`

A visual section break rendered as a thin line, a dotted rule, or a gradient bar.

| field | type | required | notes |
|---|---|---|---|
| `style` | undefined (line\|dots\|gradient) |  |  |

## `spacer`

Deliberate vertical whitespace between sections, in one of four sizes (sm, md, lg, xl).

| field | type | required | notes |
|---|---|---|---|
| `size` | undefined (sm\|md\|lg\|xl) |  |  |

## `copyright`

A small copyright bar (© year holder + rights text) for the bottom of a page; the year auto-fills to the current year when left blank.

| field | type | required | notes |
|---|---|---|---|
| `holder` | string |  |  |
| `year` | string |  |  |
| `text` | string |  |  |
| `showSymbol` | boolean |  |  |
| `align` | undefined (start\|center\|end) |  |  |

## `footer`

Page footer: brand, tagline, a row of links, and a copyright line. Place last.

| field | type | required | notes |
|---|---|---|---|
| `brand` | string |  |  |
| `tagline` | string |  |  |
| `links` | array |  |  |
| `copyright` | string |  |  |

