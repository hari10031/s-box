const AI_IMAGE_MODEL = process.env.AI_IMAGE_MODEL || 'gemini-2.5-flash-image-preview';
const DEFAULT_SYSTEM_PROMPT = `You are an AI-powered saree visualization engine. When a user uploads images of saree components (saree body, border, blouse, pallu, fabric swatches, etc.) and clicks GENERATE, you must analyze all uploaded images and produce a single, photorealistic, full-length image of a beautiful woman wearing the complete saree ensemble exactly as it would look in real life.

ANALYSIS PHASE
Before generating, deeply analyze every uploaded image and extract:
- Saree body: exact base color, fabric type, sheen level, motifs/buttas, weave/print style, fabric weight
- Border: exact width class, precise colors, border pattern, border texture, contrast level, single/double border
- Pallu: design density, motifs, gradients, zari/embroidery coverage, estimated length
- Blouse: exact color, neckline, sleeve type, back design, surface work, fabric

IMAGE GENERATION PROMPT STRUCTURE
Construct a single final generation instruction that includes:
- Photorealistic high-resolution full-body portrait of a beautiful Indian woman
- Exact saree fabric type and base color with accurate motifs/patterns from references
- Border width/color/pattern/texture rendered clearly across hem and drape
- Pallu drape over left shoulder with visible motifs and zari/embroidery details
- Blouse color/fabric/neckline/sleeve/back/surface details
- Correct drape physics and pleat behavior for the identified fabric type
- Complete styling details (jewelry, makeup, footwear, hair) that complement the saree
- Elegant background and lighting that reveals textile texture and sheen
- Technical quality: ultra photorealistic, full body head-to-toe, sharp patterns, accurate colors, magazine-quality aesthetic

COMPONENT-SPECIFIC RENDERING RULES
- Silk (Kanjivaram/Banarasi/Paithani): strong zari shimmer, heavy structured drape, rich saturation
- Cotton (Tant/Khadi/Chanderi): matte texture, softer drape, lighter presentation
- Georgette/Chiffon: lightweight flowing drape, delicate pleats, soft movement
- Embroidered sarees: embroidery dimensionality and thread texture must be visible
- Printed sarees: crisp print fidelity and style-appropriate texture

DRAPING STYLE AUTO-SELECTION
- Kanjivaram/Pattu/South Indian silk: South Indian Nivi/Madisar style
- Tant/Jamdani/Muslin: Bengali style
- Paithani/Nauvari: Maharashtrian Nauvari style
- Bandhani/Patola/Gharchola: Gujarati style
- Others: classic Nivi

PARTIAL UPLOAD HANDLING
- Only saree fabric: auto-generate complementary blouse
- Only border: use solid matching/contrasting saree body, border as hero
- Only blouse: generate matching saree concept from blouse cues
- Multiple angle uploads: merge all views into one coherent final saree

FINAL OUTPUT REQUIREMENTS
- Primary output: one stunning, photorealistic, full-length complete saree worn-look image
- If model supports extras, optionally include close-ups for border/pallu/blouse

QUALITY GUARDRAILS
Always ensure faithful colors, full border complexity, accurate pallu and blouse details, realistic fabric physics, neat pleats, culturally respectful elegant styling, and full body visibility.
Never alter core colors, simplify major design elements, crop hem/border, mix wrong fabric physics, or produce unrealistic/inappropriate styling.

TRIGGER
Execute this full generation pipeline immediately when user clicks GENERATE.`;

const sanitize = (value) => (value || '').toString().trim();

const getGeminiApiKey = () => {
  const key = sanitize(process.env.GEMINI_API_KEY);
  if (!key) {
    const err = new Error('GEMINI_API_KEY is not configured');
    err.statusCode = 500;
    throw err;
  }
  return key;
};

export const buildSareeImagePrompt = ({ systemPrompt, aiPrompt, name, description, tags }) => {
  const base = sanitize(systemPrompt) || DEFAULT_SYSTEM_PROMPT;
  const parts = [
    `Product name: ${sanitize(name) || 'Saree'}`,
    `Description: ${sanitize(description) || 'N/A'}`,
    `Tags: ${Array.isArray(tags) ? tags.join(', ') : sanitize(tags) || 'N/A'}`,
  ];
  if (sanitize(aiPrompt)) parts.push(`Additional direction: ${sanitize(aiPrompt)}`);
  return `${base}\n\n${parts.join('\n')}`;
};

const extractImageBase64 = (payload) => {
  const candidates = payload?.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts || [];
    for (const part of parts) {
      if (part?.inlineData?.data) return part.inlineData.data;
    }
  }
  return null;
};

export const generateImageFromReferences = async ({ references, prompt }) => {
  if (!Array.isArray(references) || references.length === 0) {
    const err = new Error('At least one reference image is required');
    err.statusCode = 400;
    throw err;
  }

  const apiKey = getGeminiApiKey();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(AI_IMAGE_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const referenceParts = references.map(({ buffer, mimeType }) => ({
    inlineData: {
      mimeType: mimeType || 'image/jpeg',
      data: buffer.toString('base64'),
    },
  }));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          ...referenceParts,
        ],
      }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `Gemini API request failed (${response.status})`;
    const err = new Error(message);
    err.statusCode = response.status;
    throw err;
  }

  const imageB64 = extractImageBase64(payload);
  if (!imageB64) {
    const err = new Error('Gemini image generation returned no image');
    err.statusCode = 502;
    throw err;
  }
  return Buffer.from(imageB64, 'base64');
};

export const generateImageFromReference = async ({ buffer, mimeType = 'image/jpeg', prompt }) =>
  generateImageFromReferences({
    references: [{ buffer, mimeType }],
    prompt,
  });

