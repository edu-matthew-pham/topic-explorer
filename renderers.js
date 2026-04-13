// renderers.js
// All DOM rendering functions for clusters, nodes, and detail panel.
// Imports state from app.js via passed parameters — no direct state access.

import { hexToRgba } from './utils.js';
import { renderContentBlock } from './contentBlocks.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function makeSection(labelText, contentText, muted = false) {
  const section = document.createElement('div');
  section.className = 'detail-section';

  const label = document.createElement('div');
  label.className = 'detail-label';
  label.textContent = labelText;

  const content = document.createElement('div');
  content.className = muted ? 'detail-muted' : 'detail-text';
  content.textContent = contentText;

  section.appendChild(label);
  section.appendChild(content);
  return section;
}

// ─── Cluster Panel ───────────────────────────────────────────────────────────

export function renderClusters(mapData, onClusterClick) {
  const list = document.getElementById('cluster-list');
  list.innerHTML = '';

  // Journey / inquiry block
  if (mapData.journey) {
    const j = mapData.journey;
    const journey = document.createElement('div');
    journey.style.cssText = `
      padding:12px; margin-bottom:10px;
      border:1px solid var(--border); border-radius:12px;
      background:rgba(255,255,255,0.03);
      font-size:11px; line-height:1.6; color:var(--muted);
    `;
    journey.innerHTML = `
      <div style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">
        ${j.title || 'Inquiry'}
      </div>
      <div style="color:var(--text);margin-bottom:6px;">${j.text || ''}</div>
      ${j.guidance ? `<div style="opacity:0.8;">${j.guidance}</div>` : ''}
    `;
    list.appendChild(journey);
  }

  (mapData.clusters || []).forEach(cluster => {
    const badgeBg = hexToRgba(cluster.color || '#666666', 0.2);
    const badgeBorder = hexToRgba(cluster.color || '#666666', 0.4);

    const card = document.createElement('article');
    card.className = 'cluster-card';
    card.dataset.clusterId = cluster.id;
    card.style.borderColor = hexToRgba(cluster.color || '#666666', 0.32);

    card.innerHTML = `
      <div class="cluster-badge" style="background:${badgeBg};color:${cluster.light || '#fff'};border:1px solid ${badgeBorder};">
        CLUSTER
      </div>
      <div class="cluster-title" style="color:${cluster.light || '#fff'}">${cluster.title}</div>
      <div class="cluster-desc">${cluster.description || ''}</div>
    `;

    card.addEventListener('click', () => onClusterClick(cluster));
    list.appendChild(card);
  });
}

export function updateActiveClusterCards(selectedClusterId) {
  document.querySelectorAll('.cluster-card').forEach(card => {
    card.classList.toggle('active', card.dataset.clusterId === selectedClusterId);
  });
}

// ─── Nodes Panel ─────────────────────────────────────────────────────────────

export function renderNodesOverview(mapData, onClusterClick) {
  document.getElementById('nodes-header').innerHTML = `
    <div class="panel-kicker">Overview</div>
    <div class="panel-title">${mapData.overview?.title || mapData.title}</div>
    <div class="panel-subtitle">${mapData.overview?.description || ''}</div>
  `;

  const nodesList = document.getElementById('nodes-list');
  nodesList.innerHTML = '';

  (mapData.clusters || []).forEach(cluster => {
    const card = document.createElement('article');
    card.className = 'node-card';
    card.style.borderColor = hexToRgba(cluster.color || '#666666', 0.28);
    card.innerHTML = `
      <div class="node-title" style="color:${cluster.light || '#fff'}">${cluster.title}</div>
      <div class="node-subtitle">cluster overview</div>
      <div class="node-divider"></div>
      <div class="node-desc">${cluster.description || ''}</div>
    `;
    card.addEventListener('click', () => onClusterClick(cluster));
    nodesList.appendChild(card);
  });
}

export function renderSelectedCluster(cluster, selectedClusterId, selectedNodeIndex, onNodeClick) {
  document.getElementById('nodes-header').innerHTML = `
    <div class="panel-kicker">Selected Cluster</div>
    <div class="panel-title">${cluster.title}</div>
    <div class="panel-subtitle">${cluster.description || ''}</div>
  `;

  const nodesList = document.getElementById('nodes-list');
  nodesList.innerHTML = '';

  (cluster.nodes || []).forEach((node, index) => {
    const card = document.createElement('article');
    card.className = 'node-card';
    card.dataset.clusterId = cluster.id;
    card.dataset.nodeIndex = index;
    card.style.borderColor = hexToRgba(cluster.color || '#666666', 0.32);

    card.innerHTML = `
      <div class="node-title" style="color:${cluster.light || '#fff'}">${node.title}</div>
      <div class="node-subtitle">${node.subtitle || ''}</div>
      <div class="node-divider"></div>
      <div class="node-desc">${node.description || ''}</div>
    `;

    card.addEventListener('click', () => onNodeClick(cluster, node, index));
    nodesList.appendChild(card);
  });

  updateActiveNodeCards(selectedClusterId, selectedNodeIndex);
}

export function updateActiveNodeCards(selectedClusterId, selectedNodeIndex) {
  document.querySelectorAll('.node-card').forEach(card => {
    const isActive =
      card.dataset.clusterId === selectedClusterId &&
      Number(card.dataset.nodeIndex) === selectedNodeIndex;
    card.classList.toggle('active', isActive);
  });
}

// ─── Detail Panel ────────────────────────────────────────────────────────────

export function renderOverviewDetail(mapData) {
  document.getElementById('detail-header').innerHTML = `
    <div class="detail-title">${mapData.overview?.title || mapData.title}</div>
    <div class="detail-subtitle">${mapData.overview?.description || ''}</div>
  `;

  const body = document.getElementById('detail-body');
  body.innerHTML = '';

  const box = document.createElement('div');
  box.className = 'overview-box';

  (mapData.overview?.sections || []).forEach(section => {
    const sec = document.createElement('div');
    sec.className = 'overview-section';

    if (section.title) {
      const title = document.createElement('div');
      title.className = 'overview-title';
      title.textContent = section.title;
      sec.appendChild(title);
    }

    if (section.quote) {
      const quote = document.createElement('div');
      quote.className = 'overview-quote';
      quote.textContent = section.quote;
      sec.appendChild(quote);
    }

    if (section.text) {
      const text = document.createElement('div');
      text.className = 'overview-text';
      text.textContent = section.text;
      sec.appendChild(text);
    }

    box.appendChild(sec);
  });

  body.appendChild(box);
}

export function renderClusterDetail(cluster) {
  const badgeBg = hexToRgba(cluster.color || '#666666', 0.2);
  const badgeBorder = hexToRgba(cluster.color || '#666666', 0.4);

  document.getElementById('detail-header').innerHTML = `
    <div class="detail-badge" style="background:${badgeBg};color:${cluster.light || '#fff'};border:1px solid ${badgeBorder};">
      Cluster
    </div>
    <div class="detail-title" style="color:${cluster.light || '#fff'}">${cluster.title}</div>
    <div class="detail-subtitle">${cluster.description || ''}</div>
  `;

  document.getElementById('detail-body').innerHTML = `
    <div class="detail-section">
      <div class="detail-label">Focus</div>
      <div class="detail-text">${cluster.description || ''}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">Included nodes</div>
      <div class="detail-muted">${(cluster.nodes || []).map(n => n.title).join(' • ')}</div>
    </div>
  `;
}

export function renderNodeDetail(cluster, node) {
  const badgeBg = hexToRgba(cluster.color || '#666666', 0.2);
  const badgeBorder = hexToRgba(cluster.color || '#666666', 0.4);

  document.getElementById('detail-header').innerHTML = `
    <div class="detail-badge" style="background:${badgeBg};color:${cluster.light || '#fff'};border:1px solid ${badgeBorder};">
      ${cluster.title}
    </div>
    <div class="detail-title" style="color:${cluster.light || '#fff'}">${node.title}</div>
    <div class="detail-subtitle">${node.subtitle || ''}</div>
  `;

  const body = document.getElementById('detail-body');
  body.innerHTML = '';

  body.appendChild(makeSection('Description', node.description || '', false));

  if (node.content && node.content.length) {
    const contentSection = document.createElement('div');
    contentSection.className = 'detail-section';

    const label = document.createElement('div');
    label.className = 'detail-label';
    label.textContent = 'Content';
    contentSection.appendChild(label);

    const wrap = document.createElement('div');
    node.content.forEach(block => wrap.appendChild(renderContentBlock(block)));
    contentSection.appendChild(wrap);
    body.appendChild(contentSection);
  }

  if (node.significance) {
    body.appendChild(makeSection('Why this matters', node.significance, true));
  }

  body.appendChild(makeSection('Cluster context', cluster.description || '', true));
}
