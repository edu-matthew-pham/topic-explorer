You are generating a structured Topic Explorer for education.

Topic: {{topic}}
Audience: {{yearLevel}}

{{inquiryBlock}}

Follow this JSON schema exactly:
{{schema}}

CRITICAL INSTRUCTIONS:
- Output valid JSON only
- Do not include explanations
- Ensure clusters reflect conceptual structure, not just subtopics
- 4–6 clusters maximum
- 3–4 nodes per cluster

NODE REQUIREMENTS:
- Each node must represent a meaningful sub-concept, not a keyword
- Each node must include a clear explanation (description)

{{widthInstruction}}

CONTENT STYLE:
- Write for Year Level: {{yearLevel}}
- Prefer analytical over descriptive framing
- Include cause → consequence relationships where possible
- Highlight significance or interpretation where appropriate
- Avoid generic textbook definitions

CRITICAL OUTPUT RULES:
- Output MUST be valid JSON that can be parsed by JSON.parse()
- Do NOT include line breaks inside string values
- All strings must be single-line
- Do NOT use trailing commas
- Do NOT include markdown, backticks, or explanations
- Ensure all URLs are fully contained on one line
- Escape quotes properly inside strings
- Return ONLY the JSON object