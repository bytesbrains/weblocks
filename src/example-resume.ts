/**
 * Renders a sample **résumé / CV** manifest to `resume-output.html` — a live CV
 * webpage with a Download-PDF button, built entirely from typed blocks (no raw
 * HTML). Run: `npm run example:resume`, then open the file and try File → Print
 * (or the "Download PDF" button) to see the print-to-PDF styles.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderSite } from './render.js';
import { validateManifest } from './validate.js';
import type { SiteManifest } from './types.js';

const resume: SiteManifest = {
  meta: { title: 'Maya Okafor — Frontend Engineer', description: 'Frontend engineer specialising in design systems and accessible UI.', lang: 'en', favicon: '👩‍💻' },
  design: {
    mode: 'auto',
    palette: { bg: '#f6f8fb', surface: '#ffffff', text: '#111826', muted: '#5a6577', primary: '#2b50e6', accent: '#0aa5a5' },
    darkPalette: { bg: '#0b0e16', surface: '#141a26', text: '#e8edf7', muted: '#95a1b5', primary: '#6a86ff', accent: '#25c2c2' },
    typography: { fontStack: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", scale: 'default' },
    radius: 'soft', spacing: 'default', motion: 'subtle',
  },
  version: 1,
  blocks: [
    { id: 'header', type: 'profile-header', visible: true, config: {
      name: 'Maya Okafor',
      headline: 'Senior Frontend Engineer',
      location: 'Lisbon, Portugal',
      summary: 'I build fast, accessible interfaces and the design systems that keep them consistent. 8 years across startups and product teams.',
      showDownload: true, downloadLabel: 'Download PDF',
      showShare: true,
      contacts: [
        { type: 'email', value: 'maya@okafor.dev' },
        { type: 'phone', value: '+351 912 000 000' },
        { type: 'website', value: 'https://okafor.dev', label: 'okafor.dev' },
        { type: 'github', value: 'https://github.com/mayao', label: 'github.com/mayao' },
        { type: 'linkedin', value: 'https://linkedin.com/in/mayao', label: 'in/mayao' },
        { type: 'location', value: 'Lisbon, Portugal' },
      ] } },

    { id: 'experience', type: 'experience', visible: true, config: {
      title: 'Experience',
      items: [
        { role: 'Senior Frontend Engineer', org: 'Northwind', period: '2022 – Present', location: 'Remote',
          summary: 'Lead for the web platform and design system used across 6 product teams.',
          bullets: [
            'Shipped a token-driven design system adopted by every team, cutting UI bugs ~40%.',
            'Drove Core Web Vitals work: LCP 3.1s → 1.4s on the marketing site.',
            'Mentored 4 engineers; ran the accessibility guild (WCAG 2.2 AA).',
          ] },
        { role: 'Frontend Engineer', org: 'Belltower', period: '2019 – 2022', location: 'Lisbon',
          bullets: [
            'Built the customer dashboard (React, TypeScript) from zero to 50k MAU.',
            'Introduced visual regression + component testing, dropping regressions in prod.',
          ] },
        { role: 'Junior Web Developer', org: 'Studio Aster', period: '2017 – 2019', location: 'Porto',
          bullets: ['Delivered 20+ client sites; owned the move to a component-based workflow.'] },
      ] } },

    { id: 'education', type: 'experience', visible: true, config: {
      title: 'Education',
      items: [
        { role: 'B.Sc. Computer Science', org: 'University of Porto', period: '2013 – 2017', location: 'Porto',
          bullets: ['Focus on HCI and web systems. Final project: an accessible charts library.'] },
      ] } },

    { id: 'skills', type: 'skills', visible: true, config: {
      title: 'Skills',
      display: 'tags',
      groups: [
        { name: 'Languages', items: [{ label: 'TypeScript', level: 5 }, { label: 'JavaScript', level: 5 }, { label: 'HTML', level: 5 }, { label: 'CSS', level: 5 }] },
        { name: 'Frameworks', items: [{ label: 'React', level: 5 }, { label: 'Next.js', level: 4 }, { label: 'Svelte', level: 3 }] },
        { name: 'Craft', items: [{ label: 'Design systems', level: 5 }, { label: 'Accessibility', level: 5 }, { label: 'Web performance', level: 4 }, { label: 'Testing', level: 4 }] },
      ] } },

    { id: 'projects', type: 'feed', visible: true, config: {
      title: 'Selected projects', layout: 'cards',
      items: [
        { title: 'a11y-charts', subtitle: 'Open source · 3.2k ★', text: 'An accessible, dependency-free charting library. Keyboard + screen-reader first.', href: 'https://github.com/mayao/a11y-charts', badge: 'OSS' },
        { title: 'Tokens Studio plugin', subtitle: 'Design tooling', text: 'Sync design tokens between Figma and code with a round-trip diff.', href: 'https://okafor.dev/tokens' },
        { title: 'Perf budget CI', subtitle: 'Internal', text: 'A GitHub Action that fails PRs that regress Core Web Vitals.', href: 'https://okafor.dev/perf-ci' },
      ] } },

    { id: 'references', type: 'testimonials', visible: true, config: {
      title: 'References',
      items: [
        { quote: 'Maya raised the bar for the whole frontend org — and did it while lifting everyone around her.', author: 'D. Almeida', role: 'Eng Director, Northwind' },
        { quote: 'The most reliable engineer I have worked with. Ships, documents, mentors.', author: 'R. Costa', role: 'Staff Engineer, Belltower' },
      ] } },

    { id: 'contact', type: 'contact-details', visible: true, config: {
      title: 'Get in touch', email: 'maya@okafor.dev', phone: '+351 912 000 000', address: 'Lisbon, Portugal' } },

    { id: 'copyright', type: 'copyright', visible: true, config: { holder: 'Maya Okafor', text: 'Built with @bytesbrains/weblocks.' } },
  ],
};

const v = validateManifest(resume);
console.log(`validateManifest: ok=${v.ok}${v.errors.length ? ' errors=' + JSON.stringify(v.errors) : ''}`);

const html = renderSite(resume);
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'resume-output.html');
writeFileSync(out, html, 'utf8');
console.log(`Rendered ${html.length} bytes → ${out}`);
console.log('Open it in a browser; try the "Download PDF" button or File → Print to see the print styles.');
