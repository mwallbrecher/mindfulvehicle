import { useEffect, useRef, useState } from 'react';

// ─── Route geometry ───────────────────────────────────────────────────────────
// Straight-line segments that approximate the bezier-cornered SVG routes.
// "To work"  : bottom-left (120,450) → top-right (591,178)
// "To home"  : top-right  (671, 70) → bottom-left (120,420)

const WORK_SEGS: Array<[number, number, number, number]> = [
  [120, 450, 120, 386],  // N on local street  x=120
  [120, 386, 186, 386],  // E on y=386 arterial
  [186, 386, 186, 290],  // N on City Rd       x=186
  [186, 290, 497, 290],  // E on A40
  [497, 290, 497, 178],  // N on Old St        x=497
  [497, 178, 591, 178],  // E to office
];

const HOME_SEGS: Array<[number, number, number, number]> = [
  [671, 115, 671, 178],  // S on x=671 to y=178 arterial (start below distance overlay)
  [671, 178, 497, 178],  // W on y=178 to Old St
  [497, 178, 497, 290],  // S on Old St x=497 to A40
  [497, 290, 186, 290],  // W on A40 to City Rd
  [186, 290, 186, 386],  // S on City Rd x=186
  [186, 386, 120, 386],  // W on y=386 arterial
  [120, 386, 120, 420],  // S to home
];

interface RouteGeometry {
  segs:    Array<[number, number, number, number]>;
  lengths: number[];
  totalPx: number;
}

function buildGeometry(segs: Array<[number, number, number, number]>): RouteGeometry {
  const lengths = segs.map(([x1, y1, x2, y2]) => Math.hypot(x2 - x1, y2 - y1));
  return { segs, lengths, totalPx: lengths.reduce((a, b) => a + b, 0) };
}

const WORK_GEO = buildGeometry(WORK_SEGS);
const HOME_GEO  = buildGeometry(HOME_SEGS);

export interface CarPos { x: number; y: number; }

/** Return the SVG coordinate for a given driven distance along a route. */
function routePosition(drivenKm: number, totalKm: number, geo: RouteGeometry): CarPos {
  const t = Math.min(1, drivenKm / totalKm);
  let remaining = t * geo.totalPx;

  for (let i = 0; i < geo.segs.length; i++) {
    if (remaining <= geo.lengths[i] || i === geo.segs.length - 1) {
      const [x1, y1, x2, y2] = geo.segs[i];
      const frac = geo.lengths[i] > 0 ? Math.min(1, remaining / geo.lengths[i]) : 1;
      return { x: x1 + frac * (x2 - x1), y: y1 + frac * (y2 - y1) };
    }
    remaining -= geo.lengths[i];
  }
  const last = geo.segs[geo.segs.length - 1];
  return { x: last[2], y: last[3] };
}

/** Add fractional minutes to a "H:MM" time string → "H:MM". */
function addMinutes(base: string, minutes: number): string {
  const [h, m] = base.split(':').map(Number);
  const total  = h * 60 + m + minutes;
  const hh     = Math.floor(total / 60) % 24;
  const mm     = Math.round(total % 60);
  return `${hh}:${mm.toString().padStart(2, '0')}`;
}

// ─── Public interface ─────────────────────────────────────────────────────────

export interface SimState {
  carPos:       CarPos;
  liveSpeed:    number;   // km/h  (rounded integer)
  liveDistance: string;   // e.g. "12.8 km"
  liveEta:      string;   // e.g. "9:14"
}

const TICK_MS = 250; // update cadence — sub-pixel movement, no visible stutter

/**
 * Real-time driving simulation.
 *
 * The car moves along the route at a speed that slowly drifts around 45 km/h
 * (±5 km/h city range, changing every 3–8 s).  Distance and ETA update every
 * tick.  The simulation resets whenever `modeId` changes.
 */
export function useDrivingSimulation(
  totalKm:            number,
  baseSpeedKmh:       number,
  simulatedStartTime: string,
  modeId:             string,
): SimState {
  const DISPLAY_SPEED_CENTER = 45;

  // Geometry is selected once per modeId and re-selected on mode change
  const geo        = modeId === 'to_home' ? HOME_GEO : WORK_GEO;
  const initialPos: CarPos = { x: geo.segs[0][0], y: geo.segs[0][1] };

  const drivenRef      = useRef(0);
  const speedRef       = useRef(DISPLAY_SPEED_CENTER);
  const targetRef      = useRef(DISPLAY_SPEED_CENTER);
  const nextChangeRef  = useRef(0);

  const [sim, setSim] = useState<SimState>(() => ({
    carPos:       initialPos,
    liveSpeed:    DISPLAY_SPEED_CENTER,
    liveDistance: `${totalKm.toFixed(1)} km`,
    liveEta:      addMinutes(simulatedStartTime, (totalKm / baseSpeedKmh) * 60),
  }));

  useEffect(() => {
    // Re-derive geometry inside the effect so the interval closure captures it
    const activeGeo  = modeId === 'to_home' ? HOME_GEO : WORK_GEO;
    const startPos: CarPos = { x: activeGeo.segs[0][0], y: activeGeo.segs[0][1] };

    // Reset everything when the driving mode changes
    drivenRef.current     = 0;
    speedRef.current      = DISPLAY_SPEED_CENTER;
    targetRef.current     = DISPLAY_SPEED_CENTER;
    nextChangeRef.current = Date.now() + 4_000;

    setSim({
      carPos:       startPos,
      liveSpeed:    DISPLAY_SPEED_CENTER,
      liveDistance: `${totalKm.toFixed(1)} km`,
      liveEta:      addMinutes(simulatedStartTime, (totalKm / baseSpeedKmh) * 60),
    });

    const id = setInterval(() => {
      const now = Date.now();

      // ── Speed drift — city range 40–50 km/h ─────────────────────────
      if (now >= nextChangeRef.current) {
        const delta = (Math.random() - 0.5) * 12;          // ±6 km/h step
        targetRef.current     = Math.max(40, Math.min(50, DISPLAY_SPEED_CENTER + delta));
        nextChangeRef.current = now + 3_000 + Math.random() * 5_000;
      }
      // Gentle lerp toward target (feels like natural acceleration)
      speedRef.current += (targetRef.current - speedRef.current) * 0.06;

      // ── Advance position ─────────────────────────────────────────────
      const deltaKm = speedRef.current * (TICK_MS / 3_600_000);
      drivenRef.current = Math.min(totalKm, drivenRef.current + deltaKm);

      const remaining    = Math.max(0, totalKm - drivenRef.current);
      const elapsedMin   = (drivenRef.current / baseSpeedKmh) * 60;
      const remainingMin = speedRef.current > 0 ? (remaining / speedRef.current) * 60 : 0;

      setSim({
        carPos:       routePosition(drivenRef.current, totalKm, activeGeo),
        liveSpeed:    Math.round(speedRef.current),
        liveDistance: remaining.toFixed(1) + ' km',
        liveEta:      addMinutes(simulatedStartTime, elapsedMin + remainingMin),
      });

      if (drivenRef.current >= totalKm) clearInterval(id);
    }, TICK_MS);

    return () => clearInterval(id);
  }, [modeId]); // eslint-disable-line react-hooks/exhaustive-deps

  return sim;
}
