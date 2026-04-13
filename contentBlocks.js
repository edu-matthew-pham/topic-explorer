// contentBlocks.js
// Renders individual content block types: image, quote, text, timeline.
// Also handles timeline tooltip interactions.

import { escapeHtml } from './utils.js';

// ─── Tooltip ────────────────────────────────────────────────────────────────

export function showTimelineTooltip(event, text) {
  const tip = document.getElementById('timeline-tooltip');
  if (!text) return;
  tip.textContent = text;
  tip.style.display = 'block';
  moveTimelineTooltip(event);
}

export function moveTimelineTooltip(event) {
  const tip = document.getElementById('timeline-tooltip');
  if (tip.style.display !== 'block') return;
  const offset = 14;
  let left = event.clientX + offset;
  let top = event.clientY + offset;
  const rect = tip.getBoundingClientRect();
  if (left + rect.width > window.innerWidth - 8) left = event.clientX - rect.width - offset;
  if (top + rect.height > window.innerHeight - 8) top = event.clientY - rect.height - offset;
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
}

export function hideTimelineTooltip() {
  document.getElementById('timeline-tooltip').style.display = 'none';
}

// ─── SVG Timeline ────────────────────────────────────────────────────────────

export function renderTimelineSVG(block) {
  const padding = 40;
  const spacing = 120;
  const height = 100;
  const midY = height / 2;
  const totalWidth = padding * 2 + (block.items.length - 1) * spacing;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalWidth} ${height}`);
  svg.style.width = '100%';
  svg.style.height = height + 'px';

  // Baseline
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', padding);
  line.setAttribute('y1', midY);
  line.setAttribute('x2', totalWidth - padding);
  line.setAttribute('y2', midY);
  line.setAttribute('stroke', '#888');
  line.setAttribute('stroke-width', '1');
  svg.appendChild(line);

  block.items.forEach((item, i) => {
    const x = padding + i * spacing;
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.cursor = 'default';

    group.addEventListener('mouseenter', e => showTimelineTooltip(e, item.text));
    group.addEventListener('mousemove', moveTimelineTooltip);
    group.addEventListener('mouseleave', hideTimelineTooltip);

    // Hit area
    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    hit.setAttribute('x', x - 38);
    hit.setAttribute('y', midY - 28);
    hit.setAttribute('width', 76);
    hit.setAttribute('height', 56);
    hit.setAttribute('fill', 'transparent');
    group.appendChild(hit);

    // Dot
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', midY);
    dot.setAttribute('r', 5);
    dot.setAttribute('fill', '#ccc');
    group.appendChild(dot);

    // Date label (above)
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', midY - 14);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '10');
    label.setAttribute('fill', '#aaa');
    label.textContent = item.label;
    group.appendChild(label);

    // Title (below)
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', x);
    title.setAttribute('y', midY + 20);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', '11');
    title.setAttribute('fill', '#ddd');
    title.textContent = item.title;
    group.appendChild(title);

    svg.appendChild(group);
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'content-block';
  wrapper.style.overflowX = 'auto';
  wrapper.appendChild(svg);
  return wrapper;
}

// ─── Content Block Dispatcher ────────────────────────────────────────────────

export function renderContentBlock(block) {
  const el = document.createElement('div');
  el.className = 'content-block';

  if (block.type === 'image') {
    el.innerHTML = `
      <img class="content-image" src="${block.src || ''}" alt="${escapeHtml(block.caption || '')}">
      ${block.caption ? `<div class="content-caption">${block.caption}</div>` : ''}
    `;
    return el;
  }

  if (block.type === 'quote') {
    el.innerHTML = `
      <div class="content-quote">
        <div class="content-quote-text">"${block.text || ''}"</div>
        ${block.source ? `<div class="content-quote-source">${block.source}</div>` : ''}
      </div>
    `;
    return el;
  }

  if (block.type === 'text') {
    el.innerHTML = `<div class="content-text">${block.text || ''}</div>`;
    return el;
  }

  if (block.type === 'timeline') {
    return renderTimelineSVG(block);
  }

  el.innerHTML = `<div class="content-text">Unsupported content block type.</div>`;
  return el;
}
