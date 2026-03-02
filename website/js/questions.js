// 10 questions that estimate AI applicability based on work characteristics
// Weights derived from the paper's key findings:
//   - Language/translation tasks → highest AI applicability (interpreters, writers ~0.45-0.49)
//   - Research/analysis tasks → high applicability (historians, analysts ~0.35-0.46)
//   - Physical/manual tasks → lowest applicability (construction, cleaning ~0.00-0.05)
//
// Each question: { id, text, hint, options[], weight, inverse }
//   weight: contribution magnitude (all positive, 0-1 normalized)
//   inverse: if true, higher answer = LOWER AI applicability (physical tasks)

export const questions = [
  {
    id: 1,
    text: "How much of your work involves writing, editing, or creating text content?",
    hint: "Reports, articles, emails, documentation, marketing copy, scripts...",
    weight: 0.15,
    inverse: false,
    options: [
      "Never — I rarely write anything",
      "Occasionally — some emails or short notes",
      "Regularly — writing is a meaningful part of my role",
      "Frequently — I produce substantial written content",
      "Constantly — writing is the core of what I do"
    ]
  },
  {
    id: 2,
    text: "How often do you translate, summarize, or reframe complex information for others?",
    hint: "Translating languages, simplifying technical content, briefing stakeholders...",
    weight: 0.16,
    inverse: false,
    options: [
      "Never — I don't do this",
      "Rarely — only in unusual situations",
      "Sometimes — it's part of my communication duties",
      "Often — I regularly bridge knowledge gaps",
      "Always — this is essentially my job"
    ]
  },
  {
    id: 3,
    text: "How much does your job involve researching, gathering, and synthesizing information?",
    hint: "Market research, literature reviews, data gathering, investigative work...",
    weight: 0.13,
    inverse: false,
    options: [
      "Never — I work with what's given to me",
      "Occasionally — I look things up sometimes",
      "Regularly — research supports my decisions",
      "Frequently — deep research is a major part of my role",
      "Constantly — I'm primarily a researcher or analyst"
    ]
  },
  {
    id: 4,
    text: "How much of your work involves analyzing data, numbers, or quantitative information?",
    hint: "Spreadsheets, statistics, financial analysis, metrics, forecasting...",
    weight: 0.11,
    inverse: false,
    options: [
      "Never — I don't work with numbers",
      "Occasionally — basic calculations or tracking",
      "Regularly — data analysis supports my work",
      "Frequently — I spend significant time with data",
      "Constantly — quantitative analysis is my primary function"
    ]
  },
  {
    id: 5,
    text: "How much of your role involves communicating with or persuading customers, clients, or the public?",
    hint: "Sales calls, customer service, public relations, presentations, counseling...",
    weight: 0.11,
    inverse: false,
    options: [
      "Never — I have no client/public-facing duties",
      "Occasionally — minimal interaction",
      "Regularly — client communication is part of my role",
      "Frequently — persuasion and outreach are key duties",
      "Constantly — I'm in sales, service, or public-facing work all day"
    ]
  },
  {
    id: 6,
    text: "How much of your work involves physical labor or working with your hands?",
    hint: "Construction, repair, surgery, cooking, cleaning, operating machinery...",
    weight: 0.18,
    inverse: true,
    options: [
      "Never — my work is entirely desk/screen-based",
      "Rarely — occasional light physical tasks",
      "Sometimes — a mix of physical and non-physical work",
      "Often — most of my work is physical",
      "Always — my job is almost entirely physical"
    ]
  },
  {
    id: 7,
    text: "How much precision handwork or fine motor skill does your job require?",
    hint: "Surgical procedures, instrument repair, dental work, art restoration, lab work...",
    weight: 0.12,
    inverse: true,
    options: [
      "None — no fine motor precision needed",
      "Minimal — occasional detailed hand work",
      "Moderate — some tasks require careful handwork",
      "High — precision is regularly critical",
      "Extreme — my job demands exceptional manual dexterity"
    ]
  },
  {
    id: 8,
    text: "How much of your work involves routine cognitive tasks that follow defined procedures?",
    hint: "Data entry, form processing, scheduling, bookkeeping, compliance checks...",
    weight: 0.08,
    inverse: false,
    options: [
      "Never — my work is entirely unstructured",
      "Occasionally — some routine paperwork",
      "Regularly — a fair amount of process-driven work",
      "Frequently — much of my job follows set procedures",
      "Constantly — most of my work is procedural"
    ]
  },
  {
    id: 9,
    text: "How often does your job require creative ideation or brainstorming new concepts?",
    hint: "Design thinking, strategy development, content ideation, problem-solving, innovation...",
    weight: 0.09,
    inverse: false,
    options: [
      "Never — I follow existing plans",
      "Rarely — occasional creative input",
      "Sometimes — creativity is a useful part of my role",
      "Often — I generate ideas and concepts regularly",
      "Always — creative thinking is central to my job"
    ]
  },
  {
    id: 10,
    text: "How much does your work involve teaching, explaining, or mentoring others?",
    hint: "Training sessions, tutoring, classroom teaching, onboarding, coaching...",
    weight: 0.10,
    inverse: false,
    options: [
      "Never — I don't teach or mentor",
      "Occasionally — I explain things when asked",
      "Regularly — training is part of my responsibilities",
      "Frequently — I spend significant time educating others",
      "Constantly — teaching or mentoring is my primary role"
    ]
  }
];

// Compute AI applicability score from answers (array of 0-4 values)
// Returns a value between 0 and 1 (matching the paper's scale)
export function computeScore(answers) {
  let score = 0;
  let totalWeight = 0;

  questions.forEach((q, i) => {
    const answer = answers[i];
    if (answer === undefined || answer === null) return;

    const normalized = answer / 4; // 0 to 1
    totalWeight += q.weight;

    if (q.inverse) {
      // Higher answer = less AI applicable
      score += q.weight * (1 - normalized);
    } else {
      // Higher answer = more AI applicable
      score += q.weight * normalized;
    }
  });

  // Normalize to 0-1 range based on total possible weight
  // Then scale to match the paper's observed range (~0 to 0.49)
  // The max raw score would be totalWeight (all maximums)
  // We scale output to 0-0.50 range to match paper's scale
  const rawScore = totalWeight > 0 ? score / totalWeight : 0;
  return rawScore * 0.50;
}

// Get a human-readable label for a score
export function getScoreLabel(score) {
  if (score < 0.08) return { label: "Very Low", description: "AI tools have minimal applicability to your type of work. Your role likely involves significant physical or hands-on tasks." };
  if (score < 0.15) return { label: "Low", description: "AI has limited applicability to your work. While some tasks might benefit, most of what you do requires human presence or physical skill." };
  if (score < 0.22) return { label: "Moderate", description: "AI has moderate applicability to your work. Some of your tasks could be augmented by AI tools, particularly information processing and communication." };
  if (score < 0.32) return { label: "High", description: "AI has significant applicability to your type of work. Many of your tasks involve information, analysis, or communication that AI tools can assist with." };
  return { label: "Very High", description: "AI has very high applicability to your work. Your role heavily involves language, research, and information tasks where current AI tools show strong capability." };
}

// Estimate a timeline for significant AI transformation of the occupation.
// Based on Grace et al. (2024) "Thousands of AI Authors on the Future of AI":
//   - 2,778 AI researchers surveyed (arXiv:2401.02843)
//   - 50% chance of HLMI (AI outperforms humans in all tasks) by 2047
//   - 10% chance of FAOL (all occupations fully automatable) by 2037
//   - 50% chance of FAOL by 2116
//
// The score (0–0.50) is used to interpolate within the research timeline:
//   Higher applicability → tasks are already being transformed → sooner impact
//   Lower applicability → physical/embodied work → later impact
export function getTimelineEstimate(score) {
  // Normalize score to 0–1 range
  const t = Math.min(score / 0.50, 1);

  // Apply easing: high-applicability jobs separate more at the early end
  const eased = Math.pow(t, 0.6);

  // "Significant transformation" = most information tasks automatable
  // High-applicability (0.50): ~2028 optimistic / ~2034 median / ~2042 conservative
  // Low-applicability  (0.00): ~2048 optimistic / ~2060 median / ~2078 conservative
  const earlyRange = [2048, 2028]; // [score=0, score=max]
  const midRange   = [2060, 2034]; // anchored to ~HLMI timeline
  const lateRange  = [2078, 2042]; // conservative bound

  const earlyYear = Math.round(earlyRange[0] - eased * (earlyRange[0] - earlyRange[1]));
  const midYear   = Math.round(midRange[0]   - eased * (midRange[0]   - midRange[1]));
  const lateYear  = Math.round(lateRange[0]  - eased * (lateRange[0]  - lateRange[1]));

  // Generate a description based on score tier
  let outlook;
  if (score >= 0.32) {
    outlook = "Your type of work involves tasks where AI is already proving highly capable. Significant transformation of these roles is likely within the next decade.";
  } else if (score >= 0.22) {
    outlook = "Many of your work tasks align with areas where AI is progressing rapidly. Expect substantial augmentation within 10–15 years, with deeper changes to follow.";
  } else if (score >= 0.15) {
    outlook = "AI will likely augment parts of your work in the coming years, but full transformation will take longer as many tasks still require human judgment or presence.";
  } else if (score >= 0.08) {
    outlook = "Your work has characteristics that are harder for AI to replicate. While some tasks may be augmented, significant transformation is likely further out.";
  } else {
    outlook = "Your work involves substantial physical or embodied tasks where AI progress is slowest. Robotic and physical AI capabilities lag well behind cognitive AI.";
  }

  return { earlyYear, midYear, lateYear, outlook };
}
