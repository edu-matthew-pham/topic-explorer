// presentation.js
// Full-screen presentation mode for Topic Explorer.
// Builds a slide sequence from mapData and handles navigation.
// Self-contained — injects its own overlay into the DOM.

import { hexToRgba } from './utils.js';

// ─── Slide builder ────────────────────────────────────────────────────────────

function buildSlides(mapData) {
  const slides = [];

  // 1. Title
  slides.push({ type: 'title', data: mapData });

  // 2. Inquiry challenge
  if (mapData.journey) {
    slides.push({ type: 'inquiry', data: mapData.journey });
  }

  // 3. Cluster overview
  slides.push({ type: 'cluster-overview', data: mapData });

  // 4. One slide per cluster
  (mapData.clusters || []).forEach(cluster => {
    slides.push({ type: 'cluster', data: cluster });
  });

  return slides;
}

// ─── Slide renderers ──────────────────────────────────────────────────────────

function renderSlide(slide, container) {
  container.innerHTML = '';

  switch (slide.type) {
    case 'title':      renderTitleSlide(slide.data, container);    break;
    case 'inquiry':    renderInquirySlide(slide.data, container);  break;
    case 'cluster-overview': renderClusterOverview(slide.data, container); break;
    case 'cluster':    renderClusterSlide(slide.data, container);  break;
  }
}

function renderTitleSlide(mapData, el) {
  el.innerHTML = `
    <div class="pres-slide pres-title-slide">
      <div class="pres-eyebrow">Topic Explorer</div>
      <h1 class="pres-heading">${mapData.title || ''}</h1>
      <p class="pres-subheading">${mapData.subtitle || ''}</p>
    </div>
  `;
}

function renderInquirySlide(journey, el) {
  el.innerHTML = `
    <div class="pres-slide pres-inquiry-slide">
      <div class="pres-eyebrow">${journey.title || 'Inquiry Challenge'}</div>
      <blockquote class="pres-inquiry-question">${journey.text || ''}</blockquote>
      ${journey.guidance
        ? `<p class="pres-inquiry-guidance">${journey.guidance}</p>`
        : ''}
    </div>
  `;
}

function renderClusterOverview(mapData, el) {
  const clusters = mapData.clusters || [];

  const cards = clusters.map(c => {
    const bg = hexToRgba(c.color || '#666', 0.15);
    const border = hexToRgba(c.color || '#666', 0.35);
    return `
      <div class="pres-overview-card" style="background:${bg};border-color:${border};">
        <div class="pres-overview-card-title" style="color:${c.light || '#fff'}">${c.title}</div>
        <div class="pres-overview-card-desc">${c.description || ''}</div>
      </div>
    `;
  }).join('');

  el.innerHTML = `
    <div class="pres-slide pres-overview-slide">
      <div class="pres-eyebrow">Topic Structure</div>
      <h2 class="pres-slide-title">${mapData.title}</h2>
      <div class="pres-overview-grid">${cards}</div>
    </div>
  `;
}

function renderClusterSlide(cluster, el) {
  const nodes = cluster.nodes || [];

  const nodeCards = nodes.map(n => `
    <div class="pres-node-card" style="border-color:${hexToRgba(cluster.color || '#666', 0.3)};">
      <div class="pres-node-title" style="color:${cluster.light || '#fff'}">${n.title}</div>
      <div class="pres-node-subtitle">${n.subtitle || ''}</div>
      <div class="pres-node-desc">${n.description || ''}</div>
    </div>
  `).join('');

  const bg = hexToRgba(cluster.color || '#666', 0.08);
  const accent = cluster.color || '#666';

  el.innerHTML = `
    <div class="pres-slide pres-cluster-slide" style="background:${bg};">
      <div class="pres-cluster-header">
        <div class="pres-eyebrow" style="color:${cluster.light || '#aaa'}">Cluster</div>
        <h2 class="pres-slide-title" style="color:${cluster.light || '#fff'}">${cluster.title}</h2>
        <p class="pres-cluster-desc">${cluster.description || ''}</p>
        <div class="pres-cluster-accent" style="background:${accent};"></div>
      </div>
      <div class="pres-node-grid">${nodeCards}</div>
    </div>
  `;
}

// ─── Overlay DOM builder ──────────────────────────────────────────────────────

function buildOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'pres-overlay';
  overlay.innerHTML = `
    <div id="pres-slide-container"></div>

    <div id="pres-controls">
      <button id="pres-prev" title="Previous (←)">&#8592;</button>
      <div id="pres-counter"></div>
      <button id="pres-next" title="Next (→)">&#8594;</button>
    </div>

    <button id="pres-exit" title="Exit presentation (Esc)">&#x2715;</button>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function startPresentation(mapData) {
  const slides = buildSlides(mapData);
  let current = 0;

  // Remove any existing overlay
  document.getElementById('pres-overlay')?.remove();
  const overlay = buildOverlay();
  const container = document.getElementById('pres-slide-container');
  const counter = document.getElementById('pres-counter');

  function show(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    renderSlide(slides[current], container);
    counter.textContent = `${current + 1} / ${slides.length}`;
    document.getElementById('pres-prev').disabled = current === 0;
    document.getElementById('pres-next').disabled = current === slides.length - 1;
  }

  function exit() {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') show(current + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   show(current - 1);
    if (e.key === 'Escape') exit();
  }

  document.getElementById('pres-next').addEventListener('click', () => show(current + 1));
  document.getElementById('pres-prev').addEventListener('click', () => show(current - 1));
  document.getElementById('pres-exit').addEventListener('click', exit);
  document.addEventListener('keydown', onKey);

  show(0);
}
