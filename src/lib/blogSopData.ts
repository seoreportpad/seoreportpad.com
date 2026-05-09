export interface BlogCheck {
  id: string;
  label: string;
  detail?: string;
  priority: "must" | "should" | "nice";
}

export interface BlogPhase {
  id: string;
  title: string;
  icon: string;
  phase: string;
  description: string;
  checks: BlogCheck[];
}

export const blogSopData: BlogPhase[] = [
  // ─────────────────────────────────────────────
  // PHASE 1: RESEARCH & PLANNING
  // ─────────────────────────────────────────────
  {
    id: "brief-assignment",
    title: "Brief & Assignment",
    icon: "📋",
    phase: "Phase 1 — Research",
    description: "Clarify the assignment 100% before you start writing",
    checks: [
      { id: "bl-br-01", label: "Read the entire brief — do not skip a single point", priority: "must" },
      { id: "bl-br-02", label: "Note the primary keyword", priority: "must" },
      { id: "bl-br-03", label: "Note the secondary / supporting keywords", priority: "must" },
      { id: "bl-br-04", label: "Note the target word count", priority: "must" },
      { id: "bl-br-05", label: "Note the target audience — who will read this blog", priority: "must" },
      { id: "bl-br-06", label: "Note the tone / voice — casual / formal / expert / friendly", priority: "must" },
      { id: "bl-br-07", label: "Confirm the deadline", priority: "must" },
      { id: "bl-br-08", label: "Confirm the submission format — Google Docs / Word / CMS", priority: "must" },
      { id: "bl-br-09", label: "Are NLP terms / semantic entities listed in the brief? Note them", priority: "should" },
      { id: "bl-br-10", label: "Are internal links provided in the brief? Note them", priority: "should" },
      { id: "bl-br-11", label: "If anything is unclear, ask the SEO manager before starting", priority: "must" },
      { id: "bl-br-12", label: "Are competitor URLs provided in the brief? Open them", priority: "must" },
    ],
  },

  {
    id: "keyword-intent",
    title: "Keyword & Search Intent Research",
    icon: "🔍",
    phase: "Phase 1 — Research",
    description: "Without understanding keyword and intent, the article will not rank",
    checks: [
      { id: "bl-ki-01", label: "Search the primary keyword on Google", priority: "must" },
      { id: "bl-ki-02", label: "Identify search intent — Informational / Commercial / Navigational", priority: "must" },
      { id: "bl-ki-03", label: "Note the SERP format — listicle / how-to / guide / comparison / definition", priority: "must" },
      { id: "bl-ki-04", label: "Is a featured snippet present? Note the format — Paragraph / List / Table", priority: "must" },
      { id: "bl-ki-05", label: "Note all People Also Ask (PAA) questions — minimum 5", priority: "must" },
      { id: "bl-ki-06", label: "Note related searches at the bottom of Google results", priority: "must" },
      { id: "bl-ki-07", label: "Note Google Autocomplete suggestions", priority: "should" },
      { id: "bl-ki-08", label: "Find long-tail keyword variations", priority: "should" },
      { id: "bl-ki-09", label: "Decide which secondary keywords will be used in H2 headings", priority: "must" },
      { id: "bl-ki-10", label: "Note LSI keywords / related terms", priority: "must" },
      { id: "bl-ki-11", label: "Note semantic entities — relevant people, places, brands, concepts", priority: "should" },
      { id: "bl-ki-12", label: "Identify keyword funnel stage — awareness / consideration / decision", priority: "should" },
      { id: "bl-ki-13", label: "Identify voice search queries — conversational format", priority: "nice" },
      { id: "bl-ki-14", label: "Does the keyword have video intent? Is there a video carousel in SERP?", priority: "nice" },
    ],
  },

  {
    id: "competitor-research-blog",
    title: "Competitor Blog Research",
    icon: "🏆",
    phase: "Phase 1 — Research",
    description: "Properly analyze the top 3 results — this is how you write better content",
    checks: [
      { id: "bl-cr-01", label: "Properly open and read the top 3 ranking pages", priority: "must" },
      { id: "bl-cr-02", label: "Competitor #1 — note the word count", priority: "must" },
      { id: "bl-cr-03", label: "Competitor #1 — note the H1, H2, H3 structure", priority: "must" },
      { id: "bl-cr-04", label: "Competitor #1 — note everything they have covered", priority: "must" },
      { id: "bl-cr-05", label: "Competitor #2 — note word count, H2s, and coverage", priority: "must" },
      { id: "bl-cr-06", label: "Competitor #3 — note word count, H2s, and coverage", priority: "must" },
      { id: "bl-cr-07", label: "Calculate average competitor word count — set your target", priority: "must" },
      { id: "bl-cr-08", label: "Identify common sections — topics all competitors covered (must-have)", priority: "must" },
      { id: "bl-cr-09", label: "Identify content gaps — topics no competitor has covered", priority: "must" },
      { id: "bl-cr-10", label: "Identify outdated information in competitor articles — fresh angle opportunity", priority: "must" },
      { id: "bl-cr-11", label: "Identify thin content in competitor articles — areas where you can do better", priority: "must" },
      { id: "bl-cr-12", label: "Note competitor FAQ sections", priority: "should" },
      { id: "bl-cr-13", label: "Note competitor examples and data — provide better examples in your article", priority: "should" },
      { id: "bl-cr-14", label: "Note competitor tone — decide your different and better angle", priority: "should" },
      { id: "bl-cr-15", label: "Decide your unique angle — why will your article be the best", priority: "must" },
    ],
  },

  {
    id: "topic-depth-research",
    title: "Topic Deep Research",
    icon: "📚",
    phase: "Phase 1 — Research",
    description: "Know the topic well enough to sound like an expert — do not stay surface level",
    checks: [
      { id: "bl-td-01", label: "Properly read 3-5 authoritative sources about the topic", priority: "must" },
      { id: "bl-td-02", label: "Read the Wikipedia page — understand the background", priority: "should" },
      { id: "bl-td-03", label: "Find recent statistics and data from credible sources", priority: "must" },
      { id: "bl-td-04", label: "Find expert quotes from industry authorities", priority: "should" },
      { id: "bl-td-05", label: "Find research papers and studies if available", priority: "nice" },
      { id: "bl-td-06", label: "Search the topic on Reddit and Quora — find real user pain points", priority: "should" },
      { id: "bl-td-07", label: "Watch popular YouTube videos on the topic — understand popular angles", priority: "nice" },
      { id: "bl-td-08", label: "Note common myths and misconceptions about the topic", priority: "should" },
      { id: "bl-td-09", label: "Note recent updates and news related to the topic", priority: "should" },
      { id: "bl-td-10", label: "Find real-world examples and case studies", priority: "must" },
      { id: "bl-td-11", label: "Do you have personal experience with this topic? Note it — use it in your writing", priority: "should" },
      { id: "bl-td-12", label: "After completing research — can you write about this topic confidently?", priority: "must" },
    ],
  },

  // ─────────────────────────────────────────────
  // PHASE 2: OUTLINE
  // ─────────────────────────────────────────────
  {
    id: "outline",
    title: "Outline Creation",
    icon: "🗂️",
    phase: "Phase 2 — Outline",
    description: "Get the outline approved before writing. Writing without an outline is wasted time",
    checks: [
      { id: "bl-oc-01", label: "Create an outline before writing content — this is mandatory", priority: "must" },
      { id: "bl-oc-02", label: "Draft the H1 title — keyword + power word + benefit or number", priority: "must" },
      { id: "bl-oc-03", label: "Plan the intro — hook, problem, promise, preview", priority: "must" },
      { id: "bl-oc-04", label: "List all H2 sections in logical order", priority: "must" },
      { id: "bl-oc-05", label: "Note H3 sub-points under each H2", priority: "must" },
      { id: "bl-oc-06", label: "Plan the FAQ section — minimum 5 PAA-based questions", priority: "must" },
      { id: "bl-oc-07", label: "Plan the conclusion — summary + CTA + next step", priority: "must" },
      { id: "bl-oc-08", label: "Does the outline cover the competitor content gaps?", priority: "must" },
      { id: "bl-oc-09", label: "Does the outline address all the PAA questions?", priority: "must" },
      { id: "bl-oc-10", label: "Roughly split the word count across sections", priority: "should" },
      { id: "bl-oc-11", label: "Check for duplicate sections — no repeated topics", priority: "must" },
      { id: "bl-oc-12", label: "Does the outline fulfill the promise made in the title?", priority: "must" },
      { id: "bl-oc-13", label: "Get the outline approved by the SEO manager if required", priority: "should" },
      { id: "bl-oc-14", label: "Start writing only after the outline is approved", priority: "must" },
    ],
  },

  // ─────────────────────────────────────────────
  // PHASE 3: WRITING
  // ─────────────────────────────────────────────
  {
    id: "title-writing-blog",
    title: "Blog Title (H1) Writing",
    icon: "🏷️",
    phase: "Phase 3 — Writing",
    description: "The title decides whether you get the click or not — make it perfect",
    checks: [
      { id: "bl-tw-01", label: "Primary keyword is in the title", priority: "must" },
      { id: "bl-tw-02", label: "Title is within 50-70 characters", priority: "must" },
      { id: "bl-tw-03", label: "Use a number if applicable — '10 Best', '7 Ways', '5 Steps'", priority: "should" },
      { id: "bl-tw-04", label: "Use a power word — Ultimate, Complete, Proven, Expert, Essential", priority: "should" },
      { id: "bl-tw-05", label: "Clearly show the benefit — what will the reader get", priority: "must" },
      { id: "bl-tw-06", label: "Add the current year if freshness is relevant — '(2025)'", priority: "should" },
      { id: "bl-tw-07", label: "Try a question format if it matches the search intent", priority: "nice" },
      { id: "bl-tw-08", label: "Create a curiosity gap — make the reader want to read", priority: "should" },
      { id: "bl-tw-09", label: "Avoid clickbait — deliver what you promise in the title", priority: "must" },
      { id: "bl-tw-10", label: "Write 2-3 title alternatives and choose the best one", priority: "should" },
      { id: "bl-tw-11", label: "Title is better and more unique than competitor titles", priority: "must" },
      { id: "bl-tw-12", label: "Title reads naturally — does not feel forced", priority: "must" },
    ],
  },

  {
    id: "intro-writing-blog",
    title: "Introduction Writing",
    icon: "🚪",
    phase: "Phase 3 — Writing",
    description: "The first 3 seconds — the reader hooks or bounces. This is decided in the intro",
    checks: [
      { id: "bl-iw-01", label: "First sentence must grab attention — stat / question / bold claim / story", priority: "must" },
      { id: "bl-iw-02", label: "Open with a statistic if strong data is available", priority: "should" },
      { id: "bl-iw-03", label: "Open with a relatable scenario or story", priority: "nice" },
      { id: "bl-iw-04", label: "Open with a bold statement or surprising fact", priority: "nice" },
      { id: "bl-iw-05", label: "Primary keyword appears naturally within the first 100 words", priority: "must" },
      { id: "bl-iw-06", label: "Acknowledge the reader's problem or pain point", priority: "must" },
      { id: "bl-iw-07", label: "Provide a solution or promise — 'In this guide you will learn...'", priority: "must" },
      { id: "bl-iw-08", label: "Give a preview — briefly mention what the article covers", priority: "should" },
      { id: "bl-iw-09", label: "Intro is no longer than 100-150 words", priority: "must" },
      { id: "bl-iw-10", label: "Avoid generic openers — 'In today's world', 'As we all know'", priority: "must" },
      { id: "bl-iw-11", label: "Speak directly to the reader — use 'you' and 'your'", priority: "must" },
      { id: "bl-iw-12", label: "Establish the tone from the very beginning", priority: "must" },
      { id: "bl-iw-13", label: "After the intro the reader naturally wants to keep scrolling", priority: "must" },
    ],
  },

  {
    id: "body-writing-blog",
    title: "Body Content Writing",
    icon: "✍️",
    phase: "Phase 3 — Writing",
    description: "Main content — depth, clarity, value. This is where rankings come from",
    checks: [
      { id: "bl-bw-01", label: "Include a table of contents (for articles 1500+ words)", priority: "must" },
      { id: "bl-bw-02", label: "Each H2 section covers one main idea — do not mix topics", priority: "must" },
      { id: "bl-bw-03", label: "Use secondary keywords naturally in H2 headings", priority: "must" },
      { id: "bl-bw-04", label: "Break down each H2 further with H3 subheadings", priority: "must" },
      { id: "bl-bw-05", label: "Add a subheading every 300 words to guide the reader", priority: "must" },
      { id: "bl-bw-06", label: "Keep paragraphs short — maximum 3-4 lines", priority: "must" },
      { id: "bl-bw-07", label: "Start each paragraph with a topic sentence", priority: "must" },
      { id: "bl-bw-08", label: "Write transition sentences between sections for smooth flow", priority: "must" },
      { id: "bl-bw-09", label: "Use active voice — avoid passive voice", priority: "must" },
      { id: "bl-bw-10", label: "Use simple language — explain any jargon used", priority: "must" },
      { id: "bl-bw-11", label: "Keep sentences short — 15-20 words on average", priority: "must" },
      { id: "bl-bw-12", label: "Use bullet points for list items", priority: "must" },
      { id: "bl-bw-13", label: "Use numbered lists for steps and processes", priority: "must" },
      { id: "bl-bw-14", label: "Use tables for comparisons", priority: "should" },
      { id: "bl-bw-15", label: "Include real-world examples — specific, not generic", priority: "must" },
      { id: "bl-bw-16", label: "Cite statistics with their source", priority: "must" },
      { id: "bl-bw-17", label: "Include expert quotes", priority: "should" },
      { id: "bl-bw-18", label: "Use analogies to explain complex concepts", priority: "should" },
      { id: "bl-bw-19", label: "Avoid fluff — every sentence must add value", priority: "must" },
      { id: "bl-bw-20", label: "Avoid repetition — do not say the same thing multiple times", priority: "must" },
      { id: "bl-bw-21", label: "Bold important terms and key takeaways", priority: "should" },
      { id: "bl-bw-22", label: "Add a callout box for key insights", priority: "nice" },
      { id: "bl-bw-23", label: "Provide practical and actionable advice in every section", priority: "must" },
      { id: "bl-bw-24", label: "Maintain depth — do not stay surface level", priority: "must" },
      { id: "bl-bw-25", label: "Add storytelling elements — do not just present dry information", priority: "should" },
      { id: "bl-bw-26", label: "Add a key takeaways or summary box (also helpful for AI search)", priority: "should" },
      { id: "bl-bw-27", label: "Add a Pros and Cons section where applicable", priority: "should" },
      { id: "bl-bw-28", label: "Include a case study or real example in each major section", priority: "should" },
      { id: "bl-bw-29", label: "Back every claim with evidence, examples, or logic", priority: "must" },
      { id: "bl-bw-30", label: "Track the word count — maintain your pace", priority: "must" },
    ],
  },

  {
    id: "faq-writing-blog",
    title: "FAQ Section Writing",
    icon: "❓",
    phase: "Phase 3 — Writing",
    description: "Featured snippets + PAA + AI answers — FAQ sections unlock all of these",
    checks: [
      { id: "bl-fw-01", label: "Include a minimum of 5 FAQ questions — ideally 7-8", priority: "must" },
      { id: "bl-fw-02", label: "Match questions to People Also Ask (PAA) results", priority: "must" },
      { id: "bl-fw-03", label: "Write questions in natural user language", priority: "must" },
      { id: "bl-fw-04", label: "First sentence of each answer must be the direct answer — context comes after", priority: "must" },
      { id: "bl-fw-05", label: "Each answer is 40-80 words — concise and direct", priority: "must" },
      { id: "bl-fw-06", label: "Naturally include the keyword within the question text", priority: "must" },
      { id: "bl-fw-07", label: "Use secondary and related keywords naturally in answers", priority: "should" },
      { id: "bl-fw-08", label: "Include a 'What is X' format question", priority: "must" },
      { id: "bl-fw-09", label: "Include a 'How to X' format question", priority: "must" },
      { id: "bl-fw-10", label: "Include a 'Why X' format question", priority: "should" },
      { id: "bl-fw-11", label: "Include a 'Best X' or 'Top X' question", priority: "should" },
      { id: "bl-fw-12", label: "Address beginner-level doubts and questions", priority: "must" },
      { id: "bl-fw-13", label: "Include 1-2 advanced questions as well", priority: "nice" },
      { id: "bl-fw-14", label: "FAQ answers are factually accurate — double check", priority: "must" },
      { id: "bl-fw-15", label: "FAQ section is placed at the end of the content, before the conclusion", priority: "should" },
    ],
  },

  {
    id: "conclusion-writing-blog",
    title: "Conclusion Writing",
    icon: "🏁",
    phase: "Phase 3 — Writing",
    description: "Last impression — send the reader to take action",
    checks: [
      { id: "bl-cw-01", label: "Provide a brief summary of the main points", priority: "must" },
      { id: "bl-cw-02", label: "Primary keyword appears naturally in the conclusion", priority: "must" },
      { id: "bl-cw-03", label: "Conclusion should be 100-150 words", priority: "must" },
      { id: "bl-cw-04", label: "Include a clear CTA — subscribe / share / comment / read related article", priority: "must" },
      { id: "bl-cw-05", label: "Suggest a related article or resource — internal link", priority: "should" },
      { id: "bl-cw-06", label: "Empower the reader — 'You are now ready to...'", priority: "should" },
      { id: "bl-cw-07", label: "Conclude what was promised in the introduction", priority: "must" },
      { id: "bl-cw-08", label: "Do not introduce new information in the conclusion", priority: "must" },
      { id: "bl-cw-09", label: "Conclusion does not end abruptly — smooth ending", priority: "must" },
      { id: "bl-cw-10", label: "Tone is positive and motivating", priority: "should" },
    ],
  },

  // ─────────────────────────────────────────────
  // PHASE 4: SEO LAYER
  // ─────────────────────────────────────────────
  {
    id: "keyword-placement",
    title: "Keyword Placement & Optimization",
    icon: "🔑",
    phase: "Phase 4 — SEO Layer",
    description: "Place keywords naturally — do not force them",
    checks: [
      { id: "bl-kp-01", label: "Primary keyword is in the H1", priority: "must" },
      { id: "bl-kp-02", label: "Primary keyword appears within the first 100 words", priority: "must" },
      { id: "bl-kp-03", label: "Primary keyword appears naturally in 2-3 H2 headings", priority: "must" },
      { id: "bl-kp-04", label: "Primary keyword also appears in the conclusion", priority: "should" },
      { id: "bl-kp-05", label: "Primary keyword density is 1-2% — no keyword stuffing", priority: "must" },
      { id: "bl-kp-06", label: "Secondary keywords appear naturally in H2s and body text", priority: "must" },
      { id: "bl-kp-07", label: "Synonyms are used — the same keyword is not repeated excessively", priority: "must" },
      { id: "bl-kp-08", label: "LSI keywords appear naturally in the body text", priority: "must" },
      { id: "bl-kp-09", label: "NLP terms and semantic entities are included", priority: "must" },
      { id: "bl-kp-10", label: "PAA question wording is used in FAQ answers", priority: "must" },
      { id: "bl-kp-11", label: "Primary keyword is in the image alt text", priority: "must" },
      { id: "bl-kp-12", label: "Keyword appears naturally as anchor text in internal links", priority: "should" },
      { id: "bl-kp-13", label: "Keywords fit naturally in the flow — nothing feels forced", priority: "must" },
    ],
  },

  {
    id: "meta-url",
    title: "Meta Description & URL",
    icon: "🔗",
    phase: "Phase 4 — SEO Layer",
    description: "This is what appears in the SERP — CTR comes from here",
    checks: [
      { id: "bl-mu-01", label: "Draft a meta description — 150-160 characters", priority: "must" },
      { id: "bl-mu-02", label: "Primary keyword is in the meta description", priority: "must" },
      { id: "bl-mu-03", label: "Meta description is compelling — gives a reason to click", priority: "must" },
      { id: "bl-mu-04", label: "Meta description includes a CTA — 'Learn', 'Discover', 'Get'", priority: "should" },
      { id: "bl-mu-05", label: "Meta description is unique — no duplicates", priority: "must" },
      { id: "bl-mu-06", label: "URL slug includes the primary keyword", priority: "must" },
      { id: "bl-mu-07", label: "URL slug is short and clean", priority: "must" },
      { id: "bl-mu-08", label: "URL slug is lowercase, uses hyphens, stop words removed", priority: "must" },
      { id: "bl-mu-09", label: "URL slug avoids numbers and dates (for evergreen content)", priority: "should" },
    ],
  },

  {
    id: "internal-external-links",
    title: "Internal & External Links",
    icon: "🔗",
    phase: "Phase 4 — SEO Layer",
    description: "Links build topical authority",
    checks: [
      { id: "bl-il-01", label: "Include a minimum of 3 internal links", priority: "must" },
      { id: "bl-il-02", label: "Internal links point to relevant pages", priority: "must" },
      { id: "bl-il-03", label: "Anchor text is descriptive — not 'click here'", priority: "must" },
      { id: "bl-il-04", label: "Anchor text naturally includes the keyword", priority: "should" },
      { id: "bl-il-05", label: "Link to the pillar page if this is cluster content", priority: "should" },
      { id: "bl-il-06", label: "Link to related blog posts", priority: "must" },
      { id: "bl-il-07", label: "Link to service pages where relevant", priority: "should" },
      { id: "bl-il-08", label: "Include 2-3 external authority links", priority: "must" },
      { id: "bl-il-09", label: "External links are from credible sources — .gov / .edu / research / news", priority: "must" },
      { id: "bl-il-10", label: "External links should open in a new tab — inform the SEO manager", priority: "should" },
      { id: "bl-il-11", label: "All links are working — no broken links", priority: "must" },
    ],
  },

  {
    id: "images-blog",
    title: "Images & Media",
    icon: "🖼️",
    phase: "Phase 4 — SEO Layer",
    description: "Images explain content and increase engagement",
    checks: [
      { id: "bl-img-01", label: "Suggest a featured image — relevant to topic and visually attractive", priority: "must" },
      { id: "bl-img-02", label: "Include a minimum of 2-3 images or visuals in the article", priority: "must" },
      { id: "bl-img-03", label: "Write descriptive alt text for every image — descriptive + keyword", priority: "must" },
      { id: "bl-img-04", label: "Alt text is under 125 characters", priority: "must" },
      { id: "bl-img-05", label: "Image file names are descriptive — keyword-description.jpg", priority: "must" },
      { id: "bl-img-06", label: "Include screenshots where applicable — especially in how-to guides", priority: "should" },
      { id: "bl-img-07", label: "Suggest an infographic if complex data or a process is involved", priority: "nice" },
      { id: "bl-img-08", label: "Suggest a chart or graph if statistics are present", priority: "nice" },
      { id: "bl-img-09", label: "Image placement is logical — relevant image near the related text", priority: "must" },
      { id: "bl-img-10", label: "Avoid stock photos — original or contextual images are better", priority: "should" },
      { id: "bl-img-11", label: "Images are copyright-clear — licensed or original", priority: "must" },
    ],
  },

  // ─────────────────────────────────────────────
  // PHASE 5: E-E-A-T & AEO
  // ─────────────────────────────────────────────
  {
    id: "eeat-blog",
    title: "E-E-A-T Signals",
    icon: "🏅",
    phase: "Phase 5 — E-E-A-T & AEO",
    description: "Build trust with both Google and the reader — show these signals in your content",
    checks: [
      { id: "bl-ee-01", label: "Experience — show firsthand experience: 'I tested / used / saw this'", priority: "must" },
      { id: "bl-ee-02", label: "Experience — share specific details — dates, results, numbers", priority: "must" },
      { id: "bl-ee-03", label: "Expertise — demonstrate deep knowledge — avoid generic surface-level content", priority: "must" },
      { id: "bl-ee-04", label: "Expertise — use technical terms correctly", priority: "must" },
      { id: "bl-ee-05", label: "Expertise — show industry-specific insight", priority: "must" },
      { id: "bl-ee-06", label: "Authority — cite reputable sources with links", priority: "must" },
      { id: "bl-ee-07", label: "Authority — include original data or research", priority: "should" },
      { id: "bl-ee-08", label: "Authority — include expert quotes", priority: "should" },
      { id: "bl-ee-09", label: "Trustworthiness — no misleading claims or exaggeration", priority: "must" },
      { id: "bl-ee-10", label: "Trustworthiness — all facts are accurate — double check", priority: "must" },
      { id: "bl-ee-11", label: "YMYL content (health / finance / legal) — extra care + disclaimer required", priority: "must" },
      { id: "bl-ee-12", label: "Set the author byline — mention credentials", priority: "should" },
    ],
  },

  {
    id: "aeo-blog",
    title: "AEO / AI Search Optimization",
    icon: "🤖",
    phase: "Phase 5 — E-E-A-T & AEO",
    description: "Get cited in ChatGPT, Gemini, and Perplexity — this is the future of search",
    checks: [
      { id: "bl-ae-01", label: "Write definition-style sentences — 'X is Y that does Z'", priority: "must" },
      { id: "bl-ae-02", label: "Provide a direct answer in the first sentence of each major question", priority: "must" },
      { id: "bl-ae-03", label: "Keep answers concise — 40-60 words per concept definition", priority: "must" },
      { id: "bl-ae-04", label: "Use numbered lists — AI prefers numbered format", priority: "must" },
      { id: "bl-ae-05", label: "Use step-by-step format for processes", priority: "must" },
      { id: "bl-ae-06", label: "Add a key takeaways or summary box", priority: "must" },
      { id: "bl-ae-07", label: "Include statistics and data — AI cites data-backed content", priority: "must" },
      { id: "bl-ae-08", label: "Clearly mention the brand name throughout the article", priority: "must" },
      { id: "bl-ae-09", label: "Use an authoritative and confident tone", priority: "must" },
      { id: "bl-ae-10", label: "Include a Pros and Cons section", priority: "should" },
      { id: "bl-ae-11", label: "Use comparison format where applicable", priority: "should" },
      { id: "bl-ae-12", label: "Match the featured snippet format — paragraph / list / table", priority: "must" },
      { id: "bl-ae-13", label: "Content is up to date — remove any stale information", priority: "must" },
    ],
  },

  // ─────────────────────────────────────────────
  // PHASE 6: QUALITY CHECK
  // ─────────────────────────────────────────────
  {
    id: "quality-check-blog",
    title: "Content Quality Check",
    icon: "💎",
    phase: "Phase 6 — Quality Check",
    description: "Do not submit mediocre content — run this checklist first",
    checks: [
      { id: "bl-qc-01", label: "Content is 100% original — absolutely no copy-paste", priority: "must" },
      { id: "bl-qc-02", label: "No AI-generic phrases — 'delve', 'leverage', 'realm', 'crucial', 'comprehensive', 'it is worth noting'", priority: "must" },
      { id: "bl-qc-03", label: "Content feels human — personal, specific, and real", priority: "must" },
      { id: "bl-qc-04", label: "Has a unique angle — better than competitor articles", priority: "must" },
      { id: "bl-qc-05", label: "No thin sections — every part has substantial content", priority: "must" },
      { id: "bl-qc-06", label: "All facts are accurate — no incorrect information", priority: "must" },
      { id: "bl-qc-07", label: "All sources are credible", priority: "must" },
      { id: "bl-qc-08", label: "Target word count has been achieved", priority: "must" },
      { id: "bl-qc-09", label: "The reader's query is fully answered", priority: "must" },
      { id: "bl-qc-10", label: "Content is engaging throughout — no boring sections", priority: "must" },
      { id: "bl-qc-11", label: "Consistent terminology — one term has one meaning", priority: "must" },
      { id: "bl-qc-12", label: "Content is skimmable — headings and bullets provide value on their own", priority: "must" },
      { id: "bl-qc-13", label: "Brand voice is consistent throughout", priority: "must" },
      { id: "bl-qc-14", label: "Content does not contain outdated information", priority: "must" },
      { id: "bl-qc-15", label: "Would you personally share this article? If not — improve it first", priority: "must" },
    ],
  },

  {
    id: "proofreading-blog",
    title: "Proofreading & Editing",
    icon: "🔎",
    phase: "Phase 6 — Quality Check",
    description: "Always do this before submitting",
    checks: [
      { id: "bl-pr-01", label: "Run Grammarly — fix all spelling and grammar errors", priority: "must" },
      { id: "bl-pr-02", label: "Punctuation is correct throughout", priority: "must" },
      { id: "bl-pr-03", label: "Sentence structure is clear — rewrite any ambiguous sentences", priority: "must" },
      { id: "bl-pr-04", label: "Run a readability check — use the Hemingway App", priority: "should" },
      { id: "bl-pr-05", label: "Aim for Grade 7-8 reading level for general blog content", priority: "should" },
      { id: "bl-pr-06", label: "Minimize passive voice — use active voice", priority: "must" },
      { id: "bl-pr-07", label: "Remove wordy phrases — replace 'in order to' with 'to'", priority: "should" },
      { id: "bl-pr-08", label: "Remove clichés", priority: "should" },
      { id: "bl-pr-09", label: "Remove AI phrases — 'delve', 'leverage', 'crucial', 'realm'", priority: "must" },
      { id: "bl-pr-10", label: "Check the flow — reads smoothly from beginning to end", priority: "must" },
      { id: "bl-pr-11", label: "Review the full structure once through the headings only", priority: "must" },
      { id: "bl-pr-12", label: "Do a final word count check", priority: "must" },
      { id: "bl-pr-13", label: "Verify all links are working", priority: "must" },
      { id: "bl-pr-14", label: "Double-check all numbers and facts", priority: "must" },
      { id: "bl-pr-15", label: "Read the content aloud — identify any awkward phrases", priority: "should" },
      { id: "bl-pr-16", label: "Read with fresh eyes — a few hours after writing", priority: "should" },
      { id: "bl-pr-17", label: "Run a plagiarism check — target 0% result", priority: "must" },
      { id: "bl-pr-18", label: "Run an AI content detector check", priority: "should" },
    ],
  },

  // ─────────────────────────────────────────────
  // PHASE 7: FINAL SUBMISSION
  // ─────────────────────────────────────────────
  {
    id: "final-submission-blog",
    title: "Final Submission Checklist",
    icon: "🚀",
    phase: "Phase 7 — Submission",
    description: "Confirm everything before submitting — missing one item means sending it back",
    checks: [
      { id: "bl-fs-01", label: "Target word count has been achieved", priority: "must" },
      { id: "bl-fs-02", label: "All brief instructions have been followed", priority: "must" },
      { id: "bl-fs-03", label: "Primary keyword is in the H1, intro, H2s, and conclusion", priority: "must" },
      { id: "bl-fs-04", label: "Secondary keywords are included", priority: "must" },
      { id: "bl-fs-05", label: "NLP terms and semantic entities are included", priority: "must" },
      { id: "bl-fs-06", label: "Table of contents is present (for 1500+ word articles)", priority: "must" },
      { id: "bl-fs-07", label: "Minimum 3 internal links have been added", priority: "must" },
      { id: "bl-fs-08", label: "2-3 external links have been added", priority: "must" },
      { id: "bl-fs-09", label: "Alt text has been written for all images", priority: "must" },
      { id: "bl-fs-10", label: "A featured image suggestion has been provided", priority: "must" },
      { id: "bl-fs-11", label: "FAQ section has at least 5 questions", priority: "must" },
      { id: "bl-fs-12", label: "Meta description is drafted — 150-160 characters, keyword + CTA", priority: "must" },
      { id: "bl-fs-13", label: "A URL slug suggestion has been provided", priority: "should" },
      { id: "bl-fs-14", label: "Heading hierarchy is correct — H1 > H2 > H3", priority: "must" },
      { id: "bl-fs-15", label: "Plagiarism check is done — 0%", priority: "must" },
      { id: "bl-fs-16", label: "Grammar check is done — Grammarly", priority: "must" },
      { id: "bl-fs-17", label: "AI detection check is done", priority: "should" },
      { id: "bl-fs-18", label: "Formatting is clean — no extra spaces, consistent headings", priority: "must" },
      { id: "bl-fs-19", label: "All links are working", priority: "must" },
      { id: "bl-fs-20", label: "Submitting in the correct format", priority: "must" },
      { id: "bl-fs-21", label: "Submitting before the deadline", priority: "must" },
      { id: "bl-fs-22", label: "Special notes for the SEO manager have been added", priority: "nice" },
    ],
  },
];

export const getBlogTotalChecks = () =>
  blogSopData.reduce((total, phase) => total + phase.checks.length, 0);

export const getBlogPhaseProgress = (
  phaseId: string,
  checked: Record<string, boolean>
) => {
  const phase = blogSopData.find((p) => p.id === phaseId);
  if (!phase) return { done: 0, total: 0 };
  const done = phase.checks.filter((ch) => checked[ch.id]).length;
  return { done, total: phase.checks.length };
};

export const getBlogOverallProgress = (checked: Record<string, boolean>) => {
  const total = getBlogTotalChecks();
  const done = Object.values(checked).filter(Boolean).length;
  return { done, total };
};

export const getBlogPhaseGroups = () => {
  const groups: Record<string, typeof blogSopData> = {};
  blogSopData.forEach((phase) => {
    if (!groups[phase.phase]) groups[phase.phase] = [];
    groups[phase.phase].push(phase);
  });
  return groups;
};
