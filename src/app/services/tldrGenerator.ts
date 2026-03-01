const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Mock Gemini 1.5 Flash TL;DR Generator
 *
 * In production, the PDF binary (base64-encoded) would be sent to the
 * Gemini Files API, then referenced in a generateContent call with the prompt:
 *   "Read this research paper. In exactly 2 sentences, explain it like I'm 5
 *    years old. Focus on what problem was solved and why anyone would care."
 *
 * The structured JSON response schema would be:
 *   { "summary": string }
 */
export async function generatePaperTldr(
  title: string,
  tags: string[],
  _hasPdf: boolean,
): Promise<string | null> {
  // Simulate Gemini reading & processing the PDF (~2–3s)
  await sleep(2000 + Math.random() * 1000);

  // ~5% failure rate for fallback testing
  if (Math.random() < 0.05) return null;

  const combined = (title + ' ' + tags.join(' ')).toLowerCase();

  // ── Keyword-matched ELI5 summaries ─────────────────────────────────────────
  const templates: { test: RegExp; summary: string }[] = [
    {
      test: /iot|smart home|smart.home|zero.day|exploit|firmware|cyber|malware|ransomware|attack|defense|intrusion|vulnerability/i,
      summary:
        'We found a new way to stop hackers from taking over smart-home devices like your speaker or doorbell, even from brand-new tricks they\'ve never used before. We trained a computer to spot dangerous patterns super fast — like a guard dog that never sleeps — so your devices stay safe without you doing anything.',
    },
    {
      test: /machine learning|deep learning|neural|model|classification|training|dataset/i,
      summary:
        'We taught a computer to get really good at a difficult task by showing it thousands of examples, kind of like how you learn to recognize cats by seeing lots of pictures of cats. Our method works better and faster than the old way, which means computers can now help us solve harder real-world problems.',
    },
    {
      test: /hci|user interface|usability|accessibility|screen.reader|adaptive ui|human.computer/i,
      summary:
        'We designed a new app interface that\'s much easier to use for people who can\'t see the screen, like someone who\'s blind. By testing it with real users and making changes based on their feedback, we ended up with something that works for everyone — not just people with disabilities.',
    },
    {
      test: /nlp|natural language|sentiment|text|language model|transformer|bert|gpt/i,
      summary:
        'We built a smarter way for computers to understand what people mean when they write things online, even when they\'re being sarcastic or using slang. This helps apps know if a review is positive or negative way more accurately than before.',
    },
    {
      test: /psychology|cognitive|behavior|mental|stress|wellbeing|emotion/i,
      summary:
        'We studied how people\'s feelings and thoughts affect the way they behave in everyday situations, and found a surprising pattern that no one had proven before. This could help doctors and teachers make better decisions about how to support people\'s mental health.',
    },
    {
      test: /climate|environment|sustainable|carbon|energy|renewable|solar|wind/i,
      summary:
        'We figured out a smarter way to use clean energy so that homes and buildings waste less electricity, which is great for the planet. Our approach is like giving your house a really good energy budget so it only uses what it actually needs.',
    },
    {
      test: /biology|gene|protein|dna|genomic|rna|crispr|cell|molecular/i,
      summary:
        'We discovered how a tiny part inside living cells controls whether certain genes get turned on or off, like a light switch for your DNA. This could one day help scientists make better medicines that fix problems at the very root instead of just treating the symptoms.',
    },
    {
      test: /chemistry|material|synthesis|compound|polymer|catalyst/i,
      summary:
        'We created a new material that is stronger and lighter than what we had before, kind of like inventing a super-strong fabric made of invisible threads. This could make future cars, planes, and phone cases much tougher without adding extra weight.',
    },
    {
      test: /education|learning|student|pedagogy|curriculum|classroom|teaching/i,
      summary:
        'We tested a new way of teaching students that makes it way more fun and easier to remember things long after class is over. It turns out that mixing short videos with hands-on practice beats sitting through long lectures every time.',
    },
    {
      test: /network|distributed|cloud|edge computing|latency|throughput|protocol/i,
      summary:
        'We found a smarter way for computers to talk to each other over the internet so that data gets where it needs to go much faster and without getting jammed up. Think of it like adding an express lane to a highway specifically for the most important traffic.',
    },
    {
      test: /robot|autonomous|drone|navigation|slam|sensor|lidar/i,
      summary:
        'We taught a robot to find its way around a messy real-world environment without bumping into things or getting lost, even when the map is wrong. Our approach is like giving the robot better instincts so it can handle surprises instead of freezing up.',
    },
    {
      test: /capstone|thesis|undergraduate|senior|project/i,
      summary:
        'In this project, we tackled a real-world problem from scratch — doing all the research, building the solution, and testing it to make sure it actually works. The result shows that students can build things that genuinely make a difference, not just class exercises.',
    },
  ];

  for (const { test, summary } of templates) {
    if (test.test(combined)) return summary;
  }

  // Generic fallback ELI5
  return (
    'This research paper tackles a tricky problem that lots of people deal with, and the authors found a cleaner, smarter solution than what existed before. ' +
    'The key finding is that their new approach works better in the real world — which means it could actually be used to help people, not just look good on paper.'
  );
}
