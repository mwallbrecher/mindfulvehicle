// ─── Types ───────────────────────────────────────────────────────────────────

export type DrivingModeId = 'to_work' | 'to_home';
export type MediaSource = 'music' | 'news';
export type RouteStatus = 'clear' | 'moderate' | 'heavy';

export interface NavState {
  destination: string;
  address: string;
  distance: string;
  eta: string;
  speed: number;
  nextTurn: string;
  routeStatus: RouteStatus;
}

export interface Contact {
  name: string;
  relation: string;    // Boss, Intern, PO, Friend, Family, ...
  accent: string;      // tailwind gradient for avatar
}

export interface Meeting {
  time: string;        // "9:15"
  title: string;
  location?: string;
  isNext?: boolean;
}

export interface CalendarState {
  collapsed: boolean;
  meetings: Meeting[];
}

export interface DrivingMode {
  id: DrivingModeId;
  label: string;         // Short button label
  subLabel: string;      // Status bar label ("Morning Commute")
  simulatedTime: string; // "8:54"
  timeMeridian: 'AM' | 'PM';
  navigation: NavState;
  mediaSource: MediaSource;
  contacts: Contact[];
  calendar: CalendarState;
  /** Remaining range in kilometres */
  rangeKm: number;
  /** Energy consumption in kWh/km */
  efficiencyKwh: number;
}

// ─── Two base driving states ────────────────────────────────────────────────
// Notification banner / AI-intervention use cases will layer on top of these later.

export const drivingModes: Record<DrivingModeId, DrivingMode> = {
  to_work: {
    id: 'to_work',
    label: 'To Work',
    subLabel: 'Morning Commute',
    simulatedTime: '8:54',
    timeMeridian: 'AM',
    navigation: {
      destination: 'Arrival Design Studio',
      address: '14 Shoreditch High St',
      distance: '13.5 km',
      eta: '9:12',
      speed: 68,
      nextTurn: 'Continue on A40 West for 5.1 km',
      routeStatus: 'clear',
    },
    mediaSource: 'news',
    contacts: [
      { name: 'John',  relation: 'Boss',   accent: 'from-blue-600 to-indigo-600' },
      { name: 'Kyler', relation: 'Intern', accent: 'from-emerald-600 to-teal-600' },
      { name: 'Jenna', relation: 'PO',     accent: 'from-purple-600 to-pink-600' },
    ],
    calendar: {
      collapsed: false,
      meetings: [
        { time: '9:15',  title: 'Product Strategy Review', location: 'Studio',  isNext: true },
        { time: '10:30', title: 'Design Sync',             location: 'Online' },
        { time: '14:00', title: '1:1 with Sarah',          location: 'Studio' },
        { time: '16:30', title: 'Q2 Review',               location: 'Room 3B' },
      ],
    },
    rangeKm: 287,
    efficiencyKwh: 0.19,
  },

  to_home: {
    id: 'to_home',
    label: 'Heading Home',
    subLabel: 'Evening Commute',
    simulatedTime: '18:12',
    timeMeridian: 'PM',
    navigation: {
      destination: 'Home',
      address: '22 Kingsland Rd',
      distance: '9.8 km',
      eta: '18:38',
      speed: 55,
      nextTurn: 'Turn left on City Rd in 1.3 km',
      routeStatus: 'moderate',
    },
    mediaSource: 'music',
    contacts: [
      { name: 'Tobi', relation: 'Friend', accent: 'from-amber-600 to-orange-600' },
      { name: 'Mom',  relation: 'Family', accent: 'from-rose-600 to-pink-600' },
      { name: 'Dad',  relation: 'Family', accent: 'from-cyan-600 to-blue-600' },
    ],
    calendar: {
      collapsed: true,
      meetings: [],
    },
    rangeKm: 143,
    efficiencyKwh: 0.21,
  },
};
