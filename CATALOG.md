# @bytesbrains/weblocks — Block Catalog (v0.1.0)

The AI composes a `SiteManifest` (`{ meta, design, blocks[] }`) using **only** the block types below, then the engine validates + renders it to static HTML. This file is generated from the code (`npm run emit:catalog`) — do not edit by hand.

**Block types:** `nav` · `hero` · `features` · `services-catalogue` · `gallery` · `testimonials` · `faq` · `cta` · `contact-details` · `footer`

## `nav`

Top navigation bar: brand/logo text, a row of links, and an optional call-to-action button. Place first.

| field | type | required | notes |
|---|---|---|---|
| `brand` | string | yes |  |
| `sticky` | boolean |  |  |
| `links` | array |  |  |
| `cta` | object |  |  |

## `hero`

Top-of-page banner: a big headline with an optional eyebrow, subheading, and one call-to-action button.

| field | type | required | notes |
|---|---|---|---|
| `eyebrow` | string |  |  |
| `headline` | string | yes |  |
| `subhead` | string |  |  |
| `align` | undefined (center\|left) |  |  |
| `cta` | object |  |  |

## `features`

A grid of value propositions, each with an optional icon/emoji, a title, and a short line of text.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `subtitle` | string |  |  |
| `columns` | integer (2\|3\|4) |  |  |
| `items` | array |  |  |

## `services-catalogue`

A grid of services or products, each with a name, optional price, description, and link. Use for "what we offer".

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `subtitle` | string |  |  |
| `items` | array |  |  |

## `gallery`

A responsive image grid (grid/masonry/carousel) with an optional click-to-zoom lightbox. Each item needs a src and alt text.

| field | type | required | notes |
|---|---|---|---|
| `layout` | undefined (grid\|masonry\|carousel) |  |  |
| `columns` | integer (2\|3\|4) |  |  |
| `gap` | undefined (sm\|md\|lg) |  |  |
| `lightbox` | boolean |  |  |
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

## `cta`

A full-width call-to-action band: a headline, optional subheading, and one button. Use near the bottom.

| field | type | required | notes |
|---|---|---|---|
| `headline` | string | yes |  |
| `subhead` | string |  |  |
| `background` | undefined (primary\|accent\|surface) |  |  |
| `button` | object |  |  |

## `contact-details`

A contact info block: address, phone, email, and opening hours (each optional). Read-only — no form.

| field | type | required | notes |
|---|---|---|---|
| `title` | string |  |  |
| `address` | string |  |  |
| `phone` | string |  |  |
| `email` | string |  |  |
| `hours` | string |  |  |

## `footer`

Page footer: brand, tagline, a row of links, and a copyright line. Place last.

| field | type | required | notes |
|---|---|---|---|
| `brand` | string |  |  |
| `tagline` | string |  |  |
| `links` | array |  |  |
| `copyright` | string |  |  |

