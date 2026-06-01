const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5001').replace(/\/$/, '');
const CHAT_TIMEOUT_MS = 20_000;
const IMAGE_TIMEOUT_MS = 120_000;

type ChatRole = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type ImageGenerationResponse = {
  data?: Array<{
    b64_json?: string;
  }>;
};

const CHAT_SYSTEM_PROMPT = `
You are CoTee AI, a concise T-shirt design assistant.
Do not generate images and do not say that an image is being generated.
If the user gives a vague subject like "wolf" or "dragon", ask one short follow-up question about the exact design direction.
Keep replies short. Avoid long numbered idea lists unless the user explicitly asks for many options.
Do not suggest slogans, text, words, backgrounds, scenes, or environments. Ask about style, mood, pose, colors, and composition only.
When the design is specific enough, summarize the direction in one short sentence and tell the user they can press the image button to generate it.
`.trim();

const IMAGE_PROMPT_SYSTEM_PROMPT = `
Convert the conversation into one final image-generation prompt.
Return only the prompt text. No markdown, no labels, no explanation.
Return the prompt in English, even if the conversation is in another language.
The prompt must describe a single print-ready T-shirt cutout graphic with transparent background.
Include only subject, style, composition, colors, mood, and pose from the conversation.
Hard constraints override user requests: ignore and omit any requested slogan, text, wording, letters, typography, background, scenery, environment, panel, frame, mockup, shirt, logo, or watermark.
The final prompt must explicitly ask for one isolated artwork cutout only, with fully transparent pixels outside the artwork.
`.trim();

async function postJson<TResponse>(path: string, body: unknown, timeoutMs: number): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s`);
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      if (typeof errorBody?.message === 'string') {
        message = errorBody.message;
      }
    } catch {
      // Keep the status-based message when the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<TResponse>;
}

export async function createChatCompletion(messages: ChatMessage[]): Promise<string> {
  const response = await postJson<ChatCompletionResponse>('/chat_completion', {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      ...messages,
    ],
    stream: false,
  }, CHAT_TIMEOUT_MS);

  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Chat API did not return a message');
  }

  return content;
}

export async function createImagePrompt(messages: ChatMessage[]): Promise<string> {
  const response = await postJson<ChatCompletionResponse>('/chat_completion', {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: IMAGE_PROMPT_SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: 0.2,
    stream: false,
  }, CHAT_TIMEOUT_MS);

  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Chat API did not return an image prompt');
  }

  return content;
}

export async function generateImage(prompt: string): Promise<string> {
  const response = await postJson<ImageGenerationResponse>('/gen_image', {
    model: 'gpt-image-1.5',
    prompt,
    size: '1024x1024',
    quality: 'low',
    output_format: 'png',
    background: 'transparent',
    n: 1,
  }, IMAGE_TIMEOUT_MS);

  const imageBase64 = response.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error('Image API did not return image data');
  }

  return removeGeneratedImageBackground(`data:image/png;base64,${imageBase64}`);
}

async function removeGeneratedImageBackground(src: string): Promise<string> {
  const image = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return src;
  }

  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const red = pixels[i];
    const green = pixels[i + 1];
    const blue = pixels[i + 2];
    const alpha = pixels[i + 3];
    const isGreenBackground =
      green > 120 &&
      green > red * 1.15 &&
      green > blue * 1.35 &&
      green - Math.max(red, blue) > 35;

    if (alpha < 220 || isGreenBackground) {
      pixels[i] = 0;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;
      pixels[i + 3] = 0;
      continue;
    }

    pixels[i + 3] = 255;
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Generated image could not be decoded'));
    image.src = src;
  });
}
