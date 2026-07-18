import { addDaysISO, Category, Flexibility, Priority, todayISO } from './types';

export interface ParsedTask {
  name: string;
  category: Category;
  durationMin: number;
  priority: Priority;
  date: string;
  startMin: number | null;
  flexibility: Flexibility;
}

const CATEGORY_HINTS: [RegExp, Category][] = [
  [/\b(meeting|client|invoice|email|report|deck|slides|standup|review|deploy|ship|work|project|storyboard|design|code)\b/i, 'work'],
  [/\b(study|exam|homework|lecture|class|read chapter|revise|course)\b/i, 'study'],
  [/\b(gym|yoga|run|jog|workout|walk|stretch|meditat|doctor visit|exercise)\b/i, 'health'],
  [/\b(buy|pick ?up|grocer|pharmacy|post office|bank|drop off|return|errand|shop)\b/i, 'errand'],
  [/\b(dentist|doctor|appointment|checkup|interview|haircut)\b/i, 'appointment'],
  [/\b(breakfast|lunch|dinner|brunch|meal|cook|eat)\b/i, 'meal'],
  [/\b(break|rest|nap|pause)\b/i, 'break'],
  [/\b(flight|train|drive to|commute|travel|bus|airport)\b/i, 'travel'],
  [/\b(laundry|clean|tidy|water plants|journal|skincare|routine)\b/i, 'routine'],
];

const DURATION_DEFAULTS: Partial<Record<Category, number>> = {
  meal: 45, break: 15, errand: 40, appointment: 60, health: 60, travel: 45,
};

export function parseTaskLine(raw: string): ParsedTask {
  let text = raw.trim();
  let date = todayISO();
  let startMin: number | null = null;
  let durationMin: number | null = null;
  let priority: Priority | null = null;
  let flexibility: Flexibility = 'flexible';

  // relative dates
  if (/\btomorrow\b/i.test(text)) {
    date = addDaysISO(todayISO(), 1);
    text = text.replace(/\btomorrow\b/gi, '').trim();
  } else if (/\btoday\b/i.test(text)) {
    text = text.replace(/\btoday\b/gi, '').trim();
  }

  // explicit duration: "for 45 min", "45m", "1h", "1.5 hours"
  const dur = text.match(/\b(?:for\s+)?(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|m|min|mins|minutes)\b/i);
  if (dur) {
    const n = parseFloat(dur[1]);
    durationMin = /^h/i.test(dur[2]) ? Math.round(n * 60) : Math.round(n);
    text = text.replace(dur[0], '').trim();
  }

  // time: "at 4", "at 4pm", "at 16:30", "4:30 pm"
  const time = text.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (time && (time[3] || time[2] || /\bat\s/i.test(text))) {
    let h = parseInt(time[1], 10);
    const m = time[2] ? parseInt(time[2], 10) : 0;
    const ampm = time[3]?.toLowerCase();
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    // bare "at 4" with no am/pm: assume afternoon for 1–7, morning for 8–12
    if (!ampm && h >= 1 && h <= 7) h += 12;
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      startMin = h * 60 + m;
      flexibility = 'fixed';
      text = text.replace(time[0], '').trim();
    }
  }

  // priority hints
  if (/\b(must|urgent|important|deadline|before)\b/i.test(text)) priority = 'must';
  else if (/\b(maybe|if i can|optional|sometime|someday)\b/i.test(text)) {
    priority = 'optional';
    text = text.replace(/\b(maybe|if i can|optional|sometime|someday)\b/gi, '').trim();
  }

  const name = text
    .replace(/\s{2,}/g, ' ')
    .replace(/[,\-–]\s*$/, '')
    .trim();

  let category: Category = 'personal';
  for (const [re, cat] of CATEGORY_HINTS) {
    if (re.test(name)) { category = cat; break; }
  }
  if (category === 'appointment') flexibility = 'fixed';

  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    category,
    durationMin: durationMin ?? DURATION_DEFAULTS[category] ?? 30,
    priority: priority ?? (category === 'appointment' ? 'must' : 'should'),
    date,
    startMin,
    flexibility,
  };
}

export function parseBrainDump(text: string): ParsedTask[] {
  return text
    .split(/\n|(?:^|\s)[•·]\s|;/)
    .map((line) => line.replace(/^[\s\-*\d.)]+/, '').trim())
    .filter((line) => line.length > 1)
    .map(parseTaskLine);
}
