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
export async function generateTopicPrompt({ topic, yearLevel, inquiryQuestion, schema }) {
  const template = await loadTemplate('./prompts/generate_topic.md');

  const inquiryBlock = inquiryQuestion
    ? `Inquiry Question: ${inquiryQuestion}`
    : `No inquiry question provided. Create a meaningful guiding inquiry question that encourages historical thinking, causation, significance, or interpretation.`;

  return renderTemplate(template, {
    topic,
    yearLevel,
    inquiryBlock,
    schema: JSON.stringify(schema, null, 2),
  });
}

/**
 * Generate the learning activity / coach prompt.
 * @param {Object} mapData - the loaded topic explorer JSON
 * @returns {Promise<string>}
 */
export async function generateLearningActivityPrompt(mapData) {
  const template = await loadTemplate('./prompts/learning_activity.md');

  return renderTemplate(template, {
    topicJSON: JSON.stringify(mapData, null, 2),
  });
}
