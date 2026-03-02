import { AppraiserResult, BoardType } from '../types';
// ----------------------------MOCK APPRAISER (for testing UI without API key)----------------------------
/*
//  * Mock AI Gig Appraiser
//  *
//  * In production, replace this function body with a real API call:
//  *
//  * const response = await fetch('/api/gigs/appraise', {
//  *   method: 'POST',
//  *   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//  *   body: JSON.stringify({ description }),
//  * });
//  * if (!response.ok) return null;  // Triggers fallback to manual pricing
//  * return response.json() as AppraiserResult;
//  *
//  * The backend uses Gemini 1.5 Flash with response_mime_type="application/json"
//  * and a strict JSON schema to prevent hallucination/injection.
//  * System prompt: "You are an objective campus gig appraiser. Output strictly valid JSON
//  * with keys: 'price' (int 0-100), 'tags' (array of 3 strings), 'board' ('ACADEMIC' | 'LIFE')."

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
export async function appraiseGig(description: string): Promise<AppraiserResult | null> {

export async function appraiseGig(description: string): Promise<AppraiserResult | null> {
  // Simulate network latency (1.0–1.8s to feel realistic)
  await sleep(1000 + Math.random() * 800);

  // Simulate rare API failure (~5% chance) to test fallback UI
  if (Math.random() < 0.05) return null;

  const lower = description.toLowerCase();

  // --- Board Classification ---
  const academicKeywords = [
    'class', 'course', 'homework', 'assignment', 'exam', 'midterm', 'final', 'finals',
    'professor', 'study', 'tutoring', 'tutor', 'math', 'physics', 'chemistry', 'biology',
    'code', 'coding', 'programming', 'java', 'python', 'c++', 'debug', 'debugging',
    'essay', 'paper', 'calculus', 'algebra', 'statistics', 'lab', 'lecture', 'thesis',
    'capstone', 'project', 'gpa', 'grade', 'csci', 'iste', 'igm', 'differential',
    'integral', 'proofread', 'writing', 'research', 'formula', 'equation', 'test',
  ];
  const isAcademic = academicKeywords.some(kw => lower.includes(kw));

  // --- Price Calculation ---
  let price = 30;

  if (/(urgent|sos|emergency|asap|panic|please help|4 hours|3 hours|2 hours|tonight|deadline|desperately)/.test(lower)) price += 25;
  if (/(difficult|hard|struggling|complex|advanced|comprehensive|stuck|cannot|can't understand|been staring)/.test(lower)) price += 15;
  if (/(quick|simple|easy|small|minor|brief|fast|30 min|30-min|one hour|1 hour)/.test(lower)) price -= 10;
  if (/(volunteer|free|mutual|favor|no cost|trade|swap)/.test(lower)) price = 0;
  if (/(ongoing|weekly|multiple sessions|regular)/.test(lower)) price += 20;

  price = Math.max(0, Math.min(100, price));

  // --- Tag Generation ---
  const tags: string[] = [];
  const addTag = (tag: string) => { if (!tags.includes(tag)) tags.push(tag); };

  if (/c\+\+/.test(lower)) addTag('C++');
  if (/\bjava\b/.test(lower)) addTag('Java');
  if (/python/.test(lower)) addTag('Python');
  if (/debug/.test(lower)) addTag('Debugging');
  if (/pointer/.test(lower)) addTag('Pointers');
  if (/tutor/.test(lower)) addTag('Tutoring');
  if (/essay|writ/.test(lower)) addTag('Writing');
  if (/proofread/.test(lower)) addTag('Proofreading');
  if (/math|calculus|algebra|integral|derivative/.test(lower)) addTag('Mathematics');
  if (/physics|gauss|electric|magnetic/.test(lower)) addTag('Physics');
  if (/statistics|stat/.test(lower)) addTag('Statistics');
  if (/chemistry/.test(lower)) addTag('Chemistry');
  if (/oop|object.oriented/.test(lower)) addTag('OOP');
  if (/bike|bicycle|chain/.test(lower)) addTag('Bike Repair');
  if (/3d.print|stl|prusa/.test(lower)) addTag('3D Printing');
  if (/drive|car|ride|transport/.test(lower)) addTag('Transportation');
  if (/cook|food|meal|kitchen/.test(lower)) addTag('Cooking');
  if (/laundry|washing/.test(lower)) addTag('Laundry');
  if (/dining|meal swipe|gracie|shift swap/.test(lower)) addTag('Dining');
  if (/photo|photography|camera/.test(lower)) addTag('Photography');
  if (/design|figma|ui|ux/.test(lower)) addTag('Design');
  if (/move|furniture|ikea|assemble/.test(lower)) addTag('Assembly');

  // Fill to exactly 3 tags with context-appropriate fallbacks
  const academicFallbacks = ['Tutoring', 'Academic Help', 'Study Session', 'Peer Support', 'Campus Help'];
  const lifeFallbacks = ['Quick Task', 'Campus Life', 'Peer Help', 'Practical Skills', 'Mutual Aid'];
  const fallbacks = isAcademic ? academicFallbacks : lifeFallbacks;
  let fi = 0;
  while (tags.length < 3) {
    const f = fallbacks[fi++ % fallbacks.length];
    addTag(f);
  }

  const board: BoardType = isAcademic ? 'ACADEMIC' : 'LIFE';

  return { price, tags: tags.slice(0, 3), board };
}
*/

// ----------------------------MOCK APPRAISER (for testing UI without API key)----------------------------





const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL?.trim() || 'gemini-2.5-flash-lite';
const GEMINI_TIMEOUT_MS = 12000;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

function sanitizePrice(value: number): number {
  if (!Number.isFinite(value)) return 25;
  if (value <= 0) return 0;

  const clamped = Math.max(5, Math.min(100, value));
  return Math.round(clamped / 5) * 5;
}

function normalizeAppraisal(raw: unknown): AppraiserResult | null {
  if (!raw || typeof raw !== 'object') return null;

  const parsed = raw as { price?: unknown; tags?: unknown; board?: unknown };
  const boardRaw = typeof parsed.board === 'string' ? parsed.board.toUpperCase() : '';
  const board: BoardType = boardRaw === 'ACADEMIC' ? 'ACADEMIC' : 'LIFE';

  const tags = Array.isArray(parsed.tags)
    ? parsed.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    : [];

  const normalizedTags = Array.from(new Set(tags.map(tag => tag.trim()))).slice(0, 3);
  const fallbacks = board === 'ACADEMIC'
    ? ['Tutoring', 'Academic Help', 'Study Session']
    : ['Campus Life', 'Quick Task', 'Peer Help'];

  while (normalizedTags.length < 3) {
    normalizedTags.push(fallbacks[normalizedTags.length]);
  }

  const priceNumber = typeof parsed.price === 'number' ? parsed.price : Number(parsed.price ?? 25);

  return {
    price: sanitizePrice(priceNumber),
    tags: normalizedTags,
    board,
  };
}

export async function appraiseGig(description: string): Promise<AppraiserResult | null> {
  if (!GEMINI_API_KEY) return null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text:
                      'You are an objective RIT campus gig appraiser.' + 
                      'TigerCredits are equivalent to US dollars. ' +
                      'Some tasks which are serious/urgent/important will need to have a higher price than usual.' +
                      'Return only feasible student-market pricing that a student should pay to another student for help with the requested gig.'+
                      'Output strict JSON with: ' +
                      "price (integer), tags (exactly minimum 3 short strings and relevant based on the gig desscription), board ('ACADEMIC' or 'LIFE'). " +
                      'Pricing rules: use 0 only for explicit volunteer/free work; otherwise 5-50 inclusive; ' +
                      'round to nearest 5.\n\n' +
                      `Gig description: ${description}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                required: ['price', 'tags', 'board'],
                properties: {
                  price: { type: 'INTEGER' },
                  tags: {
                    type: 'ARRAY',
                    minItems: 3,
                    maxItems: 3,
                    items: { type: 'STRING' },
                  },
                  board: { type: 'STRING', enum: ['ACADEMIC', 'LIFE'] },
                },
              },
            },
          }),
        },
      );

      if (!response.ok) {
        // Retry on 429 (rate limit) with exponential backoff
        if (response.status === 429 && attempt < MAX_RETRIES - 1) {
          const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, backoffMs));
          continue;
        }
        return null;
      }

      const payload = await response.json();
      const text = payload?.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => typeof part?.text === 'string')?.text;
      if (!text) return null;

      const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
      const parsed = JSON.parse(cleaned);

      return normalizeAppraisal(parsed);
    } catch {
      if (attempt === MAX_RETRIES - 1) return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}
