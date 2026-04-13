// app.js
// Entry point. Owns application state, boot sequence, and UI wiring.

import { startPresentation } from './presentation.js';
import {
  renderClusters,
  renderNodesOverview,
  renderSelectedCluster,
  renderOverviewDetail,
  renderClusterDetail,
  renderNodeDetail,
  updateActiveClusterCards,
  updateActiveNodeCards,
} from './renderers.js';

import {
  generateTopicPrompt,
  generateLearningActivityPrompt,
} from './prompts.js';

// ─── State ───────────────────────────────────────────────────────────────────

let mapData = null;
let schema = null;
let selectedClusterId = null;
let selectedNodeIndex = null;

// ─── Boot ────────────────────────────────────────────────────────────────────

async function boot() {
  try {
    const [schemaRes, mapRes] = await Promise.all([
      fetch('./learning_map_schema.json'),
      fetch('./ww2_learning_map.json'),
    ]);

    schema = await schemaRes.json();
    mapData = await mapRes.json();

    initialise();
    setupUI();

  } catch (err) {
    console.error(err);
    document.getElementById('detail-header').innerHTML = `
      <div class="detail-title">Could not load data</div>
      <div class="detail-subtitle">Check the JSON filenames and file location.</div>
    `;
  }
}

// ─── Initialise ──────────────────────────────────────────────────────────────

function initialise() {
  document.getElementById('page-title').textContent = mapData.title || 'Topic Exploration';
  document.getElementById('page-subtitle').textContent = mapData.subtitle || '';

  renderClusters(mapData, handleClusterClick);
  renderOverviewState();
}

// ─── State transitions ───────────────────────────────────────────────────────

function renderOverviewState() {
  selectedClusterId = null;
  selectedNodeIndex = null;
  updateActiveClusterCards(null);
  renderNodesOverview(mapData, handleClusterClick);
  renderOverviewDetail(mapData);
}

function handleClusterClick(cluster) {
  hidePromptGenerator();
  selectedClusterId = cluster.id;
  selectedNodeIndex = null;
  updateActiveClusterCards(selectedClusterId);
  renderSelectedCluster(cluster, selectedClusterId, selectedNodeIndex, handleNodeClick);
  renderClusterDetail(cluster);
}

function handleNodeClick(cluster, node, index) {
  hidePromptGenerator();
  selectedNodeIndex = index;
  updateActiveNodeCards(selectedClusterId, selectedNodeIndex);
  renderNodeDetail(cluster, node);
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

function hidePromptGenerator() {
  document.getElementById('prompt-generator').style.display = 'none';
}

// ─── UI wiring ───────────────────────────────────────────────────────────────

function setupUI() {

  // Toggle prompt generator panel
  document.getElementById('open-prompt-btn').addEventListener('click', () => {
    const panel = document.getElementById('prompt-generator');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

  // Generate topic prompt
  document.getElementById('generate-btn').addEventListener('click', async () => {
    const topic = document.getElementById('topic-input').value;
    const yearLevel = document.getElementById('year-input').value;
    const inquiryQuestion = document.getElementById('inquiry-input').value;

    const prompt = await generateTopicPrompt({ topic, yearLevel, inquiryQuestion, schema });
    document.getElementById('prompt-output').value = prompt;
  });

  // Copy prompt output
  document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('prompt-output').value);
  });

  // Load map from pasted JSON
  document.getElementById('load-map-btn').addEventListener('click', () => {
    const raw = document.getElementById('json-input').value;
    try {
      mapData = JSON.parse(raw);
      selectedClusterId = null;
      selectedNodeIndex = null;
      initialise();
      hidePromptGenerator();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert('Invalid JSON. Check formatting and try again.');
      console.error(err);
    }
  });

  // Present mode
  document.getElementById('open-present-btn').addEventListener('click', () => {
    if (!mapData) { alert('No topic loaded yet.'); return; }
    startPresentation(mapData);
  });

  // Copy learning activity prompt to clipboard
  document.getElementById('open-learning-prompt-btn').addEventListener('click', async () => {
    if (!mapData) {
      alert('No topic loaded yet.');
      return;
    }
    const prompt = await generateLearningActivityPrompt(mapData);
    await navigator.clipboard.writeText(prompt);
    alert('Learning Activity Prompt copied to clipboard.');
  });

}

// ─── Run ─────────────────────────────────────────────────────────────────────

boot();