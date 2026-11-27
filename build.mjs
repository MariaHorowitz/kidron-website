// Kidron's self-contained website builder. Uses Node's standard library only.
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, 'dist');
const content = JSON.parse(readFileSync(join(root, 'site.json'), 'utf8'));
const { site, theme, sections } = content;
const preview = process.env.CONTEXT !== 'production';
const e = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rich = s => e(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/==(.+?)==/g, '<em>$1</em>').replace(/\n/g, '<br>');
const list = v => Array.isArray(v) ? v : v ? [v] : [];
const paras = v => list(v).map(s => `<p>${rich(s)}</p>`).join('');
function url(value) {
  if (!value || !/^(https?:\/\/|mailto:|#|\/(?!\/)|[\w-]+\/)/i.test(value)) throw new Error(`Unsupported URL: ${value}`);
  return e(value);
}
function asset(value) {
  const target = resolve(root, value);
  if (!target.startsWith(root + sep) || !existsSync(target)) throw new Error(`Missing asset: ${value}`);
  return '/' + e(value);
}
const button = (c, cls = '') => c ? `<a class="btn ${cls}" href="${url(c.href)}">${e(c.label)}</a>` : '';
const eyebrow = s => s ? `<p class="eyebrow">${e(s)}</p>` : '';
const navItems = [{ id: 'top', nav: 'Home' }, ...sections.filter(s => s.nav && s.id !== 'top')];
const nav = (prefix = '') => navItems.map(s => `<a href="${prefix}#${e(s.id)}">${e(s.nav)}</a>`).join('');
const logo = (prefix = '') => `<a class="logo" href="${prefix}#top"><img src="${asset(site.logo)}" alt="${e(site.title)}" width="153" height="50"></a>`;
const header = (prefix = '') => `<header class="topbar"><div class="wrap topbar__inner">${logo(prefix)}
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav" aria-label="Open menu"><span></span><span></span><span></span></button>
  <nav id="nav" class="nav" aria-label="Main navigation">${nav(prefix)}</nav>${button({...site.header_cta,href:prefix+site.header_cta.href}, 'header-cta')}</div></header>`;
const footer = (prefix = '') => `<footer class="footer"><div class="wrap footer__inner">${logo(prefix)}
  <nav class="nav nav--footer" aria-label="Footer navigation">${nav(prefix)}</nav>
  <div class="footer__meta">${list(site.footer_text).map(t => `<span>${e(t)}</span>`).join('')}${list(site.social).map(s => `<a href="${url(s.href)}"${s.href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${e(s.label)}</a>`).join('')}</div></div></footer>`;

function render(s) {
  switch (s.type) {
    case 'hero': return `<section class="hero" id="${e(s.id)}" aria-labelledby="hero-title">
      <img class="hero__bg" src="${asset(s.background)}" alt="${e(s.image_alt)}" fetchpriority="high">
      <div class="wrap hero__inner"><h1 id="hero-title">${rich(s.heading)}</h1>${button(s.cta)}<p class="hero__tagline">${e(s.tagline)}</p></div></section>
      <section class="statement" aria-label="Introduction"><div class="wrap"><p class="statement__box"><strong>${e(s.eyebrow)}.</strong> ${rich(s.text)}</p></div></section>`;
    case 'text': return `<section class="sec textsec tone--${e(s.tone || 'white')}" id="${e(s.id)}"><div class="wrap">
      ${eyebrow(s.eyebrow)}<div class="textsec__grid"><div class="textsec__main"><h2>${rich(s.title)}</h2>${s.lead ? `<p class="textsec__lead">${rich(s.lead)}</p>` : ''}${paras(s.left)}</div>
      <div class="textsec__side">${paras(s.text)}${list(s.aside).map(a => `<div class="aside-card">${eyebrow(a.tag)}<h3>${rich(a.title)}</h3><p>${rich(a.text)}</p></div>`).join('')}</div></div></div></section>`;
    case 'cards': return `<section class="sec tiles tone--${e(s.tone || 'white')}" id="${e(s.id)}"><div class="wrap"><div class="sec__head">${eyebrow(s.eyebrow)}<h2>${rich(s.title)}</h2><p class="sec__intro">${rich(s.intro)}</p></div>
      <div class="tiles__grid tiles__grid--${s.items.length}">${s.items.map((a,i) => `<article class="tile"><p class="tile__num">${e(a.num || String(i+1).padStart(2,'0'))}</p><h3>${rich(a.title)}</h3><p>${rich(a.text)}</p></article>`).join('')}</div></div></section>`;
    case 'strip': return `<section class="co-investors" id="${e(s.id)}"><div class="wrap"><h2>${e(s.title)}</h2><ul>${s.items.map(a => `<li>${e(a.title)}</li>`).join('')}</ul></div></section>`;
    case 'carousel': return `<section class="carousel" id="${e(s.id)}" aria-labelledby="portfolio-title"><div class="wrap">${eyebrow(s.eyebrow)}<h2 id="portfolio-title">${rich(s.title)}</h2><p class="portfolio__intro">${rich(s.intro)}</p>
      <div class="carousel__track" tabindex="0" role="region" aria-label="Portfolio companies; scroll for more">${s.items.map(a => `<article class="slide"><span class="slide__tag">${e(a.category)}</span><img class="slide__logo" src="${asset(a.logo)}" alt="${e(a.logo_alt)}" loading="lazy"><h3>${e(a.name)}</h3>${a.area ? `<p class="slide__area">${e(a.area)}</p>` : ''}${paras(a.text)}<p class="slide__investors">${e(a.investors)}</p><a class="btn btn--small" href="${url(a.link)}" target="_blank" rel="noopener noreferrer">${e(a.link_label || 'View website')}</a></article>`).join('')}</div>
      <div class="carousel__controls"><button class="carousel__prev" type="button" aria-label="Previous portfolio companies">←</button><div class="carousel__dots" aria-label="Portfolio pages"></div><button class="carousel__next" type="button" aria-label="Next portfolio companies">→</button></div></div></section>`;
    case 'people': return `<section class="people" id="${e(s.id)}"><div class="wrap"><div class="people__panel">${eyebrow(s.eyebrow)}<h2>${rich(s.title)}</h2>${paras(s.intro)}<div class="people__grid">${s.items.map((p,i) => `<article class="person-card"><a class="person" href="#person-${i}" data-dialog="person-${i}" aria-haspopup="dialog"><span class="person__photo"><img src="${asset(p.photo)}" alt="${e(p.name)}" loading="lazy"></span><h3 class="person__name">${e(p.name)}</h3><span class="person__meta">${e(p.credentials)}<br>${e(p.role)}<br>${e(p.location)}</span><span class="person__more">Read biography <span aria-hidden="true">↗</span></span></a>
      <dialog class="bio" id="person-${i}" aria-labelledby="person-title-${i}"><button class="bio__close" type="button" aria-label="Close biography">×</button><img src="${asset(p.photo)}" alt="" loading="lazy"><h3 id="person-title-${i}">${e(p.name)}</h3><p class="person__meta">${e(p.credentials)} · ${e(p.role)} · ${e(p.location)}</p>${paras(p.bio)}</dialog></article>`).join('')}</div></div></div></section>`;
    case 'contact': return `<section class="contact" id="${e(s.id)}"><div class="wrap"><div class="contact__panel">${eyebrow(s.eyebrow)}<h2>${rich(s.title)}</h2><p class="contact__intro">${rich(s.intro)}</p><p><a href="mailto:${e(s.email)}">${e(s.email)}</a></p>${form(s.form)}</div></div></section>`;
    case 'quote': return `<section class="quote"><div class="wrap"><p class="quote__text">${rich(s.text)}</p></div></section>`;
    case 'notice': return `<section class="notice" aria-label="Legal notice"><div class="wrap"><p>${rich(s.text)}</p></div></section>`;
    default: throw new Error(`Unknown section type: ${s.type}`);
  }
}
function form(f) {
  const fields = f.fields.map(a => {
    if (a.type === 'hidden') return `<input type="hidden" name="${e(a.name)}" value=""${a.from_param ? ` data-from-param="${e(a.from_param)}"` : ''}>`;
    const autocomplete = {name:'name',email:'email',institution:'organization'}[a.name] || 'off';
    const attrs = `id="field-${e(a.name)}" name="${e(a.name)}"${a.required ? ' required' : ''} autocomplete="${autocomplete}"`;
    return `<label class="field" for="field-${e(a.name)}"><span>${e(a.label)}</span>${a.type === 'textarea' ? `<textarea ${attrs} rows="5"></textarea>` : `<input type="${e(a.type)}" ${attrs}>`}</label>`;
  }).join('');
  return `<form name="${e(f.name)}" method="POST" action="/thank-you/" data-netlify="true" netlify-honeypot="company_website"><input type="hidden" name="form-name" value="${e(f.name)}"><p class="hp" aria-hidden="true"><label>Leave this empty <input name="company_website" tabindex="-1" autocomplete="off"></label></p>${fields}<button class="btn" type="submit">${e(f.submit)}</button></form>`;
}
function page(title, body, {robots = preview ? 'noindex,nofollow' : 'index,follow', canonical = site.url} = {}) {
  for (const key of ['ink','accent','accent_dark','secondary','surface','muted']) if (!/^#[0-9a-f]{6}$/i.test(theme[key])) throw new Error(`Invalid theme color: ${key}`);
  return `<!doctype html><html lang="${e(site.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(title)}</title><meta name="description" content="${e(site.description)}"><meta name="robots" content="${robots}">${canonical ? `<link rel="canonical" href="${url(canonical)}">` : ''}
    <meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(site.description)}"><meta property="og:type" content="website"><meta property="og:image" content="${url(site.url + '/' + site.og_image)}"><meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="${asset(site.favicon)}" sizes="32x32"><link rel="icon" href="${asset(site.favicon_large)}" sizes="192x192"><link rel="apple-touch-icon" href="${asset(site.apple_touch_icon)}">
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300..700&display=swap" rel="stylesheet">
    <style>:root{--ink:${theme.ink};--accent:${theme.accent};--accent-dark:${theme.accent_dark};--secondary:${theme.secondary};--surface:${theme.surface};--muted:${theme.muted};--font:"Outfit",system-ui,sans-serif}</style><link rel="stylesheet" href="/theme/styles.css"><link rel="stylesheet" href="/theme/kidron-v6.css"><script src="/theme/scripts.js" defer></script></head><body><a class="skip-link" href="#main">Skip to content</a>${header(canonical ? '' : '/')}<main id="main">${body}</main>${footer(canonical ? '' : '/')}</body></html>`;
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, 'images'), join(out, 'images'), { recursive: true });
cpSync(join(root, 'theme'), join(out, 'theme'), { recursive: true });
cpSync(join(root, 'static'), out, { recursive: true });
writeFileSync(join(out, 'index.html'), page(site.title, sections.map(render).join('\n')));
const thankYou = sections.find(s => s.type === 'contact').form.thank_you;
mkdirSync(join(out, 'thank-you'), { recursive: true });
writeFileSync(join(out, 'thank-you/index.html'), page(`${thankYou.title} — ${site.title}`, `<section class="thanks"><div class="wrap"><h1>${e(thankYou.title)}</h1><p>${rich(thankYou.text)}</p>${button({label:'Back to the homepage',href:'/'})}</div></section>`, {robots:'noindex,nofollow',canonical:null}));
writeFileSync(join(out, '404.html'), page(`Page not found — ${site.title}`, `<section class="thanks"><div class="wrap"><h1>Page not found</h1>${button({label:'Back to the homepage',href:'/'})}</div></section>`, {robots:'noindex,nofollow',canonical:null}));
if (preview) writeFileSync(join(out, '_headers'), readFileSync(join(out, '_headers'), 'utf8') + '\n/*\n  X-Robots-Tag: noindex, nofollow\n');
writeFileSync(join(out, 'robots.txt'), preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /thank-you/\nDisallow: /fund-ii-teaser.pdf\nSitemap: ${site.url}/sitemap.xml\n`);
writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${e(site.url)}/</loc></url></urlset>`);
console.log(`Built ${sections.length} sections in ${preview ? 'preview' : 'production'} mode; all assets and existing static files included.`);
