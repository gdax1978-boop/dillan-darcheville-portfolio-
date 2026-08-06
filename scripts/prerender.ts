/**
 * Build-time prerenderer.
 *
 * Runs after `vite build`. Vite emits a single dist/index.html whose <head> is
 * the homepage's, so every route used to serve homepage metadata plus a
 * canonical pointing at "/" until React hydrated and rewrote it. Crawlers that
 * do not execute JS (most AI crawlers, and Google on its first pass) never saw
 * the corrected values.
 *
 * This script writes one real HTML file per route, each with its own title,
 * description, canonical, Open Graph/Twitter tags, JSON-LD, and a crawlable
 * text block. The React bundle still boots and takes over exactly as before;
 * this only changes what is in the file before JS runs.
 *
 * Run: npx tsx scripts/prerender.ts   (wired into `pnpm build`)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { POSTS } from '../src/data/posts';
import { projectsData } from '../src/data/caseStudies';
import { STATIC_PAGES } from '../src/data/staticPages';
import { blogPostSchemas, caseStudySchemas, homeSchemas, SITE } from '../src/data/schemas';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

interface Route {
  path: string;
  title: string;
  description: string;
  ogType: string;
  image?: string;
  jsonLd?: object[];
  heading: string;
  body: string[];
  priority: number;
  changefreq: string;
  lastmod: string;
  /** Optional <image:image> entry for sitemap.xml. */
  imageTitle?: string;
}

/**
 * Case studies carry no per-project date, so they share one. Bump this when a
 * case study's copy is revised so Google sees the page as genuinely updated.
 */
const CASE_STUDY_LASTMOD = '2026-07-31';

/** Escape for use inside an HTML attribute value or text node. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Turn a post's markdown-ish `content` field into flat paragraphs. Headings
 * keep their text but drop the "##" markers; list markers and bold markers are
 * stripped. The result is read by crawlers, not styled, so plain text is right.
 */
function contentToParagraphs(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line
        .replace(/^#{1,6}\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/\*\*/g, '')
    );
}

function buildRoutes(): Route[] {
  const routes: Route[] = STATIC_PAGES.map((p) => ({
    path: p.path,
    title: p.title,
    description: p.description,
    ogType: p.ogType,
    // ContactPage, service ItemList, and FAQPage belong to the homepage only.
    // They used to be hardcoded in index.html, which put them on every route.
    jsonLd: p.path === '/' ? homeSchemas : undefined,
    heading: p.heading,
    body: p.body,
    priority: p.priority,
    changefreq: p.changefreq,
    lastmod: p.lastmod,
    ...(p.path === '/'
      ? {
          image: `${SITE}/dillan-profile.webp`,
          imageTitle:
            'Dillan Darcheville, Web Designer & Developer, Canvex Studio, New York',
        }
      : {}),
  }));

  for (const post of Object.values(POSTS)) {
    routes.push({
      path: `/blog/${post.slug}`,
      title: post.seoTitle,
      description: post.description,
      ogType: 'article',
      image: post.image,
      jsonLd: blogPostSchemas(post),
      heading: post.title,
      body: [
        `${post.category}. ${post.date}. ${post.readTime}.`,
        ...contentToParagraphs(post.content),
      ],
      priority: 0.8,
      changefreq: 'monthly',
      lastmod: post.isoDate,
      imageTitle: `${post.title}, Canvex Studio`,
    });
  }

  for (const cs of Object.values(projectsData)) {
    routes.push({
      path: `/case-study/${cs.slug}`,
      title: `${cs.title} Case Study | Canvex Studio`,
      description: cs.metaDescription,
      ogType: 'article',
      image: cs.image,
      jsonLd: caseStudySchemas(cs),
      heading: `${cs.title} Case Study`,
      body: [
        `Client: ${cs.client}. Role: ${cs.role}. Duration: ${cs.duration}.`,
        `Overview. ${cs.overview}`,
        `Challenge. ${cs.challenge}`,
        `Solution. ${cs.solution}`,
        `Results: ${cs.results.join('. ')}.`,
        `Built with: ${cs.techStack.join(', ')}.`,
      ],
      priority: 0.9,
      changefreq: 'monthly',
      lastmod: CASE_STUDY_LASTMOD,
      imageTitle: `${cs.title}, Web Design Case Study by Canvex Studio`,
    });
  }

  return routes;
}

/** Replace a <meta> tag's content attribute, matching on the whole tag. */
function setMeta(html: string, attr: 'name' | 'property', key: string, value: string): string {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`, 'i');
  if (!re.test(html)) {
    console.warn(`  ! no <meta ${attr}="${key}"> in template, skipped`);
    return html;
  }
  return html.replace(re, `$1${esc(value)}$2`);
}

function renderRoute(template: string, route: Route): string {
  const url = route.path === '/' ? `${SITE}/` : `${SITE}${route.path}`;
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(route.title)}</title>`);
  html = html.replace(
    /(<link rel="canonical" href=")[^"]*(")/i,
    `$1${esc(url)}$2`
  );

  html = setMeta(html, 'name', 'description', route.description);
  html = setMeta(html, 'property', 'og:title', route.title);
  html = setMeta(html, 'property', 'og:description', route.description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:type', route.ogType);
  html = setMeta(html, 'name', 'twitter:title', route.title);
  html = setMeta(html, 'name', 'twitter:description', route.description);

  if (route.image) {
    html = setMeta(html, 'property', 'og:image', route.image);
    html = setMeta(html, 'property', 'og:image:alt', route.title);
    html = setMeta(html, 'name', 'twitter:image', route.image);
    html = setMeta(html, 'name', 'twitter:image:alt', route.title);
  }

  // Page-level JSON-LD, using the same id useSEO() writes to so React replaces
  // this exact node on hydration instead of appending a duplicate.
  if (route.jsonLd?.length) {
    const script = `<script type="application/ld+json" id="page-jsonld">${JSON.stringify(
      route.jsonLd
    ).replace(/</g, '\\u003c')}</script>`;
    html = html.replace('</head>', `  ${script}\n  </head>`);
  }

  // Crawlable content. Sits inside #root so React's createRoot().render()
  // clears it on hydration; a human with JS never sees it, a crawler without
  // JS gets the page's real text instead of the homepage boilerplate.
  const fallback = [
    `<h1>${esc(route.heading)}</h1>`,
    ...route.body.map((p) => `<p>${esc(p)}</p>`),
  ].join('\n      ');

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">\n      ${fallback}\n    </div>`
  );

  return html;
}

/**
 * sitemap.xml, generated from the same route list that produced the HTML.
 * It used to be hand-maintained in public/sitemap.xml and had drifted to 11 of
 * 14 URLs, silently omitting /free-audit. Generating it removes that failure
 * mode: a route that exists is a route that is listed.
 */
function renderSitemap(routes: Route[]): string {
  const entries = routes
    .map((r) => {
      const loc = r.path === '/' ? `${SITE}/` : `${SITE}${r.path}`;
      const image =
        r.image && r.imageTitle
          ? `\n    <image:image>\n` +
            `      <image:loc>${esc(r.image)}</image:loc>\n` +
            `      <image:title>${esc(r.imageTitle)}</image:title>\n` +
            `    </image:image>`
          : '';
      return (
        `  <url>\n` +
        `    <loc>${esc(loc)}</loc>\n` +
        `    <lastmod>${r.lastmod}</lastmod>\n` +
        `    <changefreq>${r.changefreq}</changefreq>\n` +
        `    <priority>${r.priority.toFixed(1)}</priority>${image}\n` +
        `  </url>`
      );
    })
    .join('\n');

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset\n` +
    `  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n` +
    `>\n${entries}\n</urlset>\n`
  );
}

function main(): void {
  const templatePath = path.join(DIST, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('prerender: dist/index.html not found. Run `vite build` first.');
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  const routes = buildRoutes();

  for (const route of routes) {
    const html = renderRoute(template, route);
    const outDir = route.path === '/' ? DIST : path.join(DIST, route.path);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
    console.log(`  prerendered ${route.path.padEnd(22)} ${route.title}`);
  }

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), renderSitemap(routes), 'utf-8');
  console.log(`  generated sitemap.xml    ${routes.length} URLs`);

  console.log(`\nprerender: wrote ${routes.length} routes`);
}

main();
