import { CalendarState, RouteStatus } from './drivingModes';

// ─── Types ───────────────────────────────────────────────────────────────

export type InterventionId =
  | 'late_meeting'
  | 'tired'
  | 'sweaty'
  | 'late_home'
  | 'late_reservation';

export type InterventionTone = 'alert' | 'warn' | 'wellness';

// Icons used inside the banner's suggestion buttons
export type SuggestionIconId =
  | 'phone'
  | 'message'
  | 'calendar'
  | 'coffee'
  | 'music'
  | 'snowflake'
  | 'wind'
  | 'sun'
  | 'map-pin';

export interface Suggestion {
  id: string;
  label: string;
  icon: SuggestionIconId;
}

/**
 * Side-effects the intervention applies to the rest of the UI while the
 * banner is visible. Composed on top of the current DrivingMode by App.tsx.
 */
export interface InterventionEffects {
  /** Completely replace the calendar widget's contents (e.g. reservation-only). */
  calendarOverride?: CalendarState;
  /** Override route status — typically 'heavy' (red) to reflect delay cause. */
  routeStatusOverride?: RouteStatus;
  /** Override shown ETA — reflects the delay. */
  etaOverride?: string;
  /** Render next meeting in red instead of blue. */
  meetingAtRisk?: boolean;
}

export interface Intervention {
  id: InterventionId;
  /** Short label for the scenario trigger button. */
  label: string;
  /** One-line message shown in the banner. */
  message: string;
  tone: InterventionTone;
  effects: InterventionEffects;
  suggestions: Suggestion[];
  /** Seconds the banner stays on screen before auto-dismissing. */
  duration: number;
}

// ─── Shared data ─────────────────────────────────────────────────────────

const PARTNER_NAME = 'Anna';

// ─── The 5 scenarios ─────────────────────────────────────────────────────

export const interventions: Record<InterventionId, Intervention> = {
  // ── 1. Running late for a meeting ──────────────────────────────────────
  late_meeting: {
    id: 'late_meeting',
    label: 'Late for meeting',
    message: 'You are running late for your meeting.',
    tone: 'alert',
    effects: {
      routeStatusOverride: 'heavy',
      etaOverride: '9:26',
      meetingAtRisk: true,
    },
    suggestions: [
      { id: 'call',       label: 'Call',       icon: 'phone'    },
      { id: 'message',    label: 'Message',    icon: 'message'  },
      { id: 'reschedule', label: 'Reschedule', icon: 'calendar' },
    ],
    duration: 12,
  },

  // ── 2. Tired ───────────────────────────────────────────────────────────
  // No mode change — works in both contexts.
  tired: {
    id: 'tired',
    label: 'Tired',
    message: 'I can tell you are tired.',
    tone: 'wellness',
    effects: {},
    suggestions: [
      { id: 'places', label: 'Rest stops',   icon: 'coffee' },
      { id: 'music',  label: 'Upbeat music', icon: 'music'  },
    ],
    duration: 12,
  },

  // ── 3. Sweaty / too warm ───────────────────────────────────────────────
  // No mode change — works in both contexts.
  sweaty: {
    id: 'sweaty',
    label: 'Too warm',
    message: 'I think you are feeling warm.',
    tone: 'wellness',
    effects: {},
    suggestions: [
      { id: 'ac',       label: 'Lower AC',      icon: 'snowflake' },
      { id: 'window',   label: 'Open window',   icon: 'wind'      },
      { id: 'panorama', label: 'Open panorama', icon: 'sun'       },
    ],
    duration: 12,
  },

  // ── 4. Running home late ───────────────────────────────────────────────
  // Red navigation, no calendar clash.
  late_home: {
    id: 'late_home',
    label: 'Running home late',
    message: 'You will be later than expected.',
    tone: 'warn',
    effects: {
      routeStatusOverride: 'heavy',
      etaOverride: '18:52',
    },
    suggestions: [
      { id: 'text_partner',  label: `Text ${PARTNER_NAME} "5 min late"`, icon: 'message' },
      { id: 'share',         label: `Share location with ${PARTNER_NAME}`, icon: 'map-pin' },
      { id: 'call_partner',  label: `Call ${PARTNER_NAME}`,              icon: 'phone'   },
    ],
    duration: 12,
  },

  // ── 5. Running late for a reservation ──────────────────────────────────
  // Calendar overridden to show only the reservation.
  late_reservation: {
    id: 'late_reservation',
    label: 'Late for reservation',
    message: 'You will be late for your reservation.',
    tone: 'alert',
    effects: {
      calendarOverride: {
        collapsed: false,
        meetings: [
          { time: '19:30', title: 'Dinner · Le Sanglier', location: 'Soho', isNext: true },
        ],
      },
      routeStatusOverride: 'heavy',
      etaOverride: '19:45',
      meetingAtRisk: true,
    },
    suggestions: [
      { id: 'call_restaurant', label: 'Call restaurant',      icon: 'phone'    },
      { id: 'reschedule',      label: 'Request reschedule',   icon: 'calendar' },
    ],
    duration: 12,
  },
};

// Stable iteration order for the trigger row.
export const interventionOrder: InterventionId[] = [
  'late_meeting',
  'late_home',
  'late_reservation',
  'tired',
  'sweaty',
];
