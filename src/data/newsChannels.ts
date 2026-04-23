export interface NewsChannel {
  id: string;
  name: string;          // "BBC Radio 4"
  segmentTitle: string;  // "Morning Briefing"
  headline: string;      // one-liner summary
  duration: number;      // seconds — auto-advances to next channel when reached
  accent: string;        // tailwind gradient for brand block
}

// Simulated morning-commute radio lineup
export const newsChannels: NewsChannel[] = [
  {
    id: 'bbc',
    name: 'BBC Radio 4',
    segmentTitle: 'Morning Briefing',
    headline: "Today's top stories and analysis from across the UK.",
    duration: 240,
    accent: 'from-rose-700 to-red-800',
  },
  {
    id: 'lbc',
    name: 'LBC News',
    segmentTitle: 'Business Update',
    headline: 'Markets respond to the Bank of England rate decision.',
    duration: 180,
    accent: 'from-amber-700 to-orange-800',
  },
  {
    id: 'sky',
    name: 'Sky News Radio',
    segmentTitle: 'Tech Today',
    headline: 'AI regulation debate continues in European Parliament.',
    duration: 210,
    accent: 'from-blue-700 to-indigo-800',
  },
  {
    id: 'npr',
    name: 'NPR Morning Edition',
    segmentTitle: 'World News',
    headline: 'Climate summit reaches agreement on emissions targets.',
    duration: 300,
    accent: 'from-teal-700 to-emerald-800',
  },
  {
    id: 'times',
    name: 'Times Radio',
    segmentTitle: "Today's Headlines",
    headline: 'Parliament debates new transport infrastructure bill.',
    duration: 220,
    accent: 'from-violet-700 to-purple-800',
  },
];
