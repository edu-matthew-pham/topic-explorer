// prompts.js
// Loads markdown prompt templates and fills variables.
// No DOM access. No state. Pure async functions.

import { renderTemplate } from './utils.js';

const templateCache = {};

async function loadTemplate(path) {
  if (templateCache[path]) return templateCache[path];
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load prompt template: ${path}`);
  const text = await res.text();
  templateCache[path] = text;
  return text;
}

/**
 * Generate the Topic Explorer JSON generation prompt.
 * @param {Object} params
 * @param {string} params.topic
 * @param {string} params.yearLevel
 * @param {string} params.inquiryQuestion
 * @param {Object} params.schema - parsed JSON schema object
 * @returns {Promise<string>}
 */
export async function generateTopicPrompt({ topic, yearLevel, inquiryQuestion, schema, widthMode = 'typical' }) {
  const template = await loadTemplate('./prompts/generate_topic.md');

  const inquiryBlock = inquiryQuestion
    ? `Inquiry Question: ${inquiryQuestion}`
    : `No inquiry question provided. Create a meaningful guiding inquiry question that encourages historical thinking, causation, significance, or interpretation.`;

  const widthInstruction = {
    minimum: `CONTENT REQUIREMENTS (Minimum Width):
- 1 content block per node maximum
- Concise descriptions — core concept only
- No enrichment directions or alternative perspectives
- Use text blocks only unless a quote is essential
- At least 1 node per cluster must have a quote`,
    typical: `CONTENT REQUIREMENTS (Typical Width):
- 1–2 content blocks per node
- Balanced descriptions — explain the concept and its significance
- Include some analytical framing (cause → consequence)
- Use a mix of text and quotes; timeline only for change over time
- At least 1 node per cluster must be a rich node (2 blocks)`,
    wider: `CONTENT REQUIREMENTS (Wider Width):
- 2–3 content blocks per node
- Extended descriptions — include significance, interpretation, and enrichment directions
- Include alternative perspectives and analytical framing throughout
- Use a mix of text, quotes, and timelines where relevant
- Every node should be a rich node; push toward 3 blocks for key nodes`,
  }[widthMode] || '';

  return renderTemplate(template, {
    topic,
    yearLevel,
    inquiryBlock,
    schema: JSON.stringify(schema, null, 2),
    widthInstruction,
  });
}

/**
 * Generate the learning activity / coach prompt.
 * @param {Object} mapData - the loaded topic explorer JSON
 * @returns {Promise<string>}
 */
export async function generateLearningActivityPrompt(mapData, widthMode = 'typical') {
  const template = await loadTemplate('./prompts/learning_activity.md');

  const widthCoachInstruction = {
    minimum: 'COACHING MODE: Minimum width — guide toward the core concept only. Keep questioning focused and convergent. Avoid enrichment or tangents.',
    typical: 'COACHING MODE: Typical width — guide through standard depth. Balance structured questioning with some exploration.',
    wider:   'COACHING MODE: Wider width — encourage extended exploration. Ask students to make connections, consider alternative perspectives, and pursue enrichment directions.',
  }[widthMode] || '';

  return renderTemplate(template, {
    topicJSON: JSON.stringify(mapData, null, 2),
    widthCoachInstruction,
  });
}