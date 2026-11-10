import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HREFLANG,
  HTML_LANG,
  OG_LOCALE,
  SEO_LOCALES,
  SITE_ORIGIN,
  localeUrl,
  seoByLang,
} from '../src/i18n/seoMeta.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const publicDir = path.resolve(__dirname, '../public');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", '&#39;');
}

function hreflangLinks() {
  const links = SEO_LOCALES.map(
    (lang) =>
      `    <link rel="alternate" hreflang="${HREFLANG[lang]}" href="${localeUrl(lang)}" />`
  );
  links.push(
    `    <link rel="alternate" hreflang="x-default" href="${localeUrl('fr')}" />`
  );
  return links.join('\n');
}

function ogLocaleAlternates(currentLang) {
  return SEO_LOCALES.filter((lang) => lang !== currentLang)
    .map(
      (lang) =>
        `    <meta property="og:locale:alternate" content="${OG_LOCALE[lang]}" />`
    )
    .join('\n');
}

function buildJsonLd(lang, seo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Buzzer App',
    alternateName: seo.alternateNames,
    url: localeUrl(lang),
    applicationCategory: 'GameApplication',
    applicationSubCategory: 'Quiz buzzer',
    operatingSystem: 'Web, iOS, Android',
    browserRequirements: 'Requires JavaScript',
    inLanguage: HTML_LANG[lang],
    description: seo.jsonLdDescription,
    keywords: seo.jsonLdKeywords,
    featureList: seo.featureList,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    creator: {
      '@type': 'Person',
      name: 'Arthur Mondon',
      url: 'https://mondon.pro/projet/buzzer-app',
    },
    isAccessibleForFree: true,
  };
}

function buildRootArticle(seo) {
  const steps = seo.steps
    .map((step) => `            <li>${escapeHtml(step)}</li>`)
    .join('\n');
  const bullets = seo.bullets
    .map((item) => `            <li>${escapeHtml(item)}</li>`)
    .join('\n');

  return `<article>
        <header>
          <h1>${escapeHtml(seo.h1)}</h1>
          <p>
            ${escapeHtml(seo.lead)}
          </p>
          <p><a href="/jouer">${escapeHtml(seo.cta)}</a></p>
        </header>
        <section>
          <h2>${escapeHtml(seo.howTitle)}</h2>
          <ol>
${steps}
          </ol>
        </section>
        <section>
          <h2>${escapeHtml(seo.whyTitle)}</h2>
          <p>
            ${escapeHtml(seo.whyP1)}
          </p>
          <p>
            ${escapeHtml(seo.whyP2)}
          </p>
          <ul>
${bullets}
          </ul>
        </section>
        <footer>
          <p>Buzzer App · Arthur Mondon · <a href="https://mondon.pro/projet/buzzer-app">mondon.pro</a></p>
        </footer>
      </article>`;
}

function replaceTagContent(html, tagName, content) {
  const pattern = new RegExp(`(<${tagName}\\b[^>]*>)([\\s\\S]*?)(</${tagName}>)`, 'i');
  return html.replace(pattern, `$1${content}$3`);
}

function replaceMetaByName(html, name, content) {
  const pattern = new RegExp(
    `(<meta\\s+name="${name}"\\s+content=")([^"]*)("\\s*/?>)`,
    'i'
  );
  if (pattern.test(html)) {
    return html.replace(pattern, `$1${escapeAttr(content)}$3`);
  }
  return html;
}

function replaceMetaByProperty(html, property, content) {
  const pattern = new RegExp(
    `(<meta\\s+property="${property}"\\s+content=")([^"]*)("\\s*/?>)`,
    'i'
  );
  if (pattern.test(html)) {
    return html.replace(pattern, `$1${escapeAttr(content)}$3`);
  }
  return html;
}

function replaceCanonical(html, href) {
  return html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/i,
    `$1${href}$2`
  );
}

function replaceJsonLd(html, jsonLd) {
  return html.replace(
    /(<script\s+type="application\/ld\+json">)([\s\S]*?)(<\/script>)/i,
    `$1\n${JSON.stringify(jsonLd, null, 8).replace(/^/gm, '      ').trimStart()}\n    $3`
  );
}

function replaceRootInner(html, articleHtml) {
  const replaced = html.replace(
    /(<div\s+id="root">)([\s\S]*?)(<\/div>\s*<\/body>)/i,
    `$1\n      ${articleHtml}\n    $3`
  );
  if (replaced === html) {
    throw new Error('Failed to replace #root article content');
  }
  return replaced;
}

function stripExistingHreflang(html) {
  return html.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>/gi, '');
}

function stripOgLocaleAlternates(html) {
  return html.replace(
    /\s*<meta\s+property="og:locale:alternate"\s+content="[^"]*"\s*\/?>/gi,
    ''
  );
}

function injectAfterCanonical(html, block) {
  return html.replace(
    /(<link\s+rel="canonical"[^>]*>)/i,
    `$1\n${block}`
  );
}

function injectAfterOgLocale(html, block) {
  return html.replace(
    /(<meta\s+property="og:locale"[^>]*>)/i,
    `$1\n${block}`
  );
}

function localizeHtml(template, lang) {
  const seo = seoByLang[lang];
  if (!seo) {
    throw new Error(`Missing SEO content for language: ${lang}`);
  }

  let html = template;
  html = stripExistingHreflang(html);
  html = stripOgLocaleAlternates(html);

  html = html.replace(/<html\s+lang="[^"]*"/i, `<html lang="${HTML_LANG[lang]}"`);
  html = replaceTagContent(html, 'title', escapeHtml(seo.title));
  html = replaceMetaByName(html, 'description', seo.description);
  html = replaceMetaByName(html, 'keywords', seo.keywords);
  html = replaceCanonical(html, localeUrl(lang));
  html = injectAfterCanonical(html, hreflangLinks());

  html = replaceMetaByProperty(html, 'og:locale', OG_LOCALE[lang]);
  html = injectAfterOgLocale(html, ogLocaleAlternates(lang));
  html = replaceMetaByProperty(html, 'og:url', localeUrl(lang));
  html = replaceMetaByProperty(html, 'og:title', seo.ogTitle);
  html = replaceMetaByProperty(html, 'og:description', seo.ogDescription);
  html = replaceMetaByProperty(html, 'og:image:alt', seo.ogImageAlt);
  html = replaceMetaByName(html, 'twitter:title', seo.twitterTitle);
  html = replaceMetaByName(html, 'twitter:description', seo.twitterDescription);

  html = replaceJsonLd(html, buildJsonLd(lang, seo));
  html = replaceRootInner(html, buildRootArticle(seo));

  return html;
}

function buildSitemap() {
  const xhtmlNs = 'xmlns:xhtml="http://www.w3.org/1999/xhtml"';
  const urls = SEO_LOCALES.map((lang) => {
    const loc = localeUrl(lang);
    const alternates = SEO_LOCALES.map(
      (alt) =>
        `    <xhtml:link rel="alternate" hreflang="${HREFLANG[alt]}" href="${localeUrl(alt)}" />`
    ).join('\n');
    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${localeUrl('fr')}" />`;
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${lang === 'fr' ? '1.0' : '0.9'}</priority>
${alternates}
${xDefault}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ${xhtmlNs}>
${urls}
  <url>
    <loc>${SITE_ORIGIN}/jouer</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
`;
}

async function main() {
  const templatePath = path.join(distDir, 'index.html');
  const template = await readFile(templatePath, 'utf8');

  for (const lang of SEO_LOCALES) {
    const html = localizeHtml(template, lang);
    if (lang === 'fr') {
      await writeFile(templatePath, html, 'utf8');
      continue;
    }
    const langDir = path.join(distDir, lang);
    await mkdir(langDir, { recursive: true });
    await writeFile(path.join(langDir, 'index.html'), html, 'utf8');
  }

  const sitemap = buildSitemap();
  await writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');

  console.log(
    `Prerendered locales: ${SEO_LOCALES.map((lang) => (lang === 'fr' ? '/' : `/${lang}`)).join(', ')}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
