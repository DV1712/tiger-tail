import { ResearchType, ResearchAppraisalResult } from '../types';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Mock AI Research Reward Appraiser
 * Simulates a Gemini 1.5 Flash call that suggests a fair TigerCredit reward
 * for a research request based on its type, title, and abstract.
 *
 * In production, replace with a real Gemini API call with a structured JSON schema.
 */
export async function appraiseResearch(
  type: ResearchType,
  title: string,
  abstract: string,
): Promise<ResearchAppraisalResult | null> {
  // Simulate realistic latency
  await sleep(1100 + Math.random() * 700);

  // ~5% failure rate to test fallback UI
  if (Math.random() < 0.05) return null;

  const lower = (title + ' ' + abstract).toLowerCase();

  // ── Base credit by type ────────────────────────────────────────────────────
  let credits =
    type === 'PARTICIPANTS' ? 50
    : type === 'PEER_REVIEW' ? 30
    : 0; // COLLABORATION is co-authorship by default

  // ── Adjustments ────────────────────────────────────────────────────────────
  if (/(urgent|deadline|asap|this week|today)/.test(lower)) credits += 15;
  if (/(long.term|ongoing|multiple session|semester)/.test(lower)) credits += 20;
  if (/(30.min|quick|brief|short)/.test(lower)) credits -= 10;
  if (/(60.min|one hour|1 hour|extensive|in.depth)/.test(lower)) credits += 10;
  if (/(irb|approved|ethical)/.test(lower)) credits += 5;
  if (type === 'COLLABORATION') credits = 0; // Always 0 (co-authorship deal)

  credits = Math.max(0, Math.min(100, credits));

  // ── Tag generation ─────────────────────────────────────────────────────────
  const tags: string[] = [];
  const add = (t: string) => { if (!tags.includes(t)) tags.push(t); };

  if (/machine learning|ml|deep learning|neural|model|dataset/.test(lower)) add('Machine Learning');
  if (/hci|human.computer|ux|usability|interface/.test(lower)) add('HCI');
  if (/psychology|cognitive|behavior|mental|psychol/.test(lower)) add('Psychology');
  if (/eye.track|gaze|tracking/.test(lower)) add('Eye Tracking');
  if (/survey|questionnaire/.test(lower)) add('Survey');
  if (/interview|qualitative/.test(lower)) add('Qualitative');
  if (/statistics|quantitative|data analysis/.test(lower)) add('Quantitative');
  if (/health|medical|clinical/.test(lower)) add('Healthcare');
  if (/computer science|software|coding|algorithm/.test(lower)) add('CS Research');
  if (/capstone|thesis|dissertation/.test(lower)) add('Capstone');
  if (/chi|acm|ieee|publication|conference|journal/.test(lower)) add('Publication');
  if (/python|java|r\b|matlab/.test(lower)) add('Data Science');
  if (/nlp|natural language|text|language model/.test(lower)) add('NLP');

  // Type-specific fallback tags
  const typeFallbacks: Record<ResearchType, string[]> = {
    PARTICIPANTS: ['User Study', 'Research Participation', 'Human Subjects'],
    PEER_REVIEW:  ['Peer Review', 'Academic Writing', 'Paper Review'],
    COLLABORATION: ['Co-Author', 'Research Collaboration', 'Teamwork'],
  };
  let fi = 0;
  const fallbacks = typeFallbacks[type];
  while (tags.length < 3) {
    add(fallbacks[fi++ % fallbacks.length]);
  }

  // ── Rationale ──────────────────────────────────────────────────────────────
  const rationale =
    type === 'PARTICIPANTS'
      ? `Based on a typical ${/30.min/.test(lower) ? '30-minute' : /60.min|one hour|1 hour/.test(lower) ? '60-minute' : '45-minute'} study commitment, the AI recommends ${credits} TigerCredits as a fair incentive for RIT participants.`
      : type === 'PEER_REVIEW'
      ? `A peer review of an academic paper typically takes 1–2 hours. ${credits} TigerCredits reflects the intellectual effort and expertise required.`
      : `Collaboration gigs are rewarded through co-authorship credit and mutual benefit rather than TigerCredits.`;

  return { credits, tags: tags.slice(0, 3), rationale };
}
