import { AppraiserResult, BoardType } from '../types';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Mock AI Gig Appraiser
 *
 * In production, replace this function body with a real API call:
 *
 * const response = await fetch('/api/gigs/appraise', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
 *   body: JSON.stringify({ description }),
 * });
 * if (!response.ok) return null;  // Triggers fallback to manual pricing
 * return response.json() as AppraiserResult;
 *
 * The backend uses Gemini 1.5 Flash with response_mime_type="application/json"
 * and a strict JSON schema to prevent hallucination/injection.
 * System prompt: "You are an objective campus gig appraiser. Output strictly valid JSON
 * with keys: 'price' (int 0-100), 'tags' (array of 3 strings), 'board' ('ACADEMIC' | 'LIFE')."
 */
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
