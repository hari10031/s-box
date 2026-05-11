const AI_IMAGE_MODEL = process.env.AI_IMAGE_MODEL || 'gemini-2.5-flash-image-preview';
const DEFAULT_SYSTEM_PROMPT = 'Create a premium ecommerce-ready saree product image from the uploaded reference. Keep the saree design, colors, and weaving style faithful to the source image. Use clean studio lighting, neutral background, high detail, and realistic textile texture.';

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

export const generateImageFromReference = async ({ buffer, mimeType = 'image/jpeg', prompt }) => {
  const apiKey = getGeminiApiKey();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(AI_IMAGE_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: buffer.toString('base64'),
            },
          },
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

