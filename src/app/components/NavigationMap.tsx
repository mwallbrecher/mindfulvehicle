import { Navigation, MapPin } from 'lucide-react';
import { NavState, RouteStatus, DrivingModeId } from '../../data/drivingModes';
import { CarPos } from '../../simulation/useDrivingSimulation';

interface Props {
  navigation: NavState;
  modeId:     DrivingModeId;
  /** Live car position from useDrivingSimulation — falls back to route start. */
  carPos?: CarPos;
}

const ROUTE_COLOR: Record<RouteStatus, string> = {
  clear:    '#4285f4',
  moderate: '#f59e0b',
  heavy:    '#ef4444',
};
const ROUTE_GLOW: Record<RouteStatus, string> = {
  clear:    'rgba(66,133,244,0.22)',
  moderate: 'rgba(245,158,11,0.22)',
  heavy:    'rgba(239,68,68,0.22)',
};

// ── To-Work route: bottom-left (120,450) → top-right (591,178) ───────────────
// N on local st → E on y=386 → N on City Rd → E on A40 → N on Old St → E to office
const WORK_ROUTE = [
  'M 120 450',
  'L 120 401 Q 120 386 135 386',   // round turn E onto y=386 arterial
  'L 171 386 Q 186 386 186 371',   // round turn N onto City Rd
  'L 186 305 Q 186 290 201 290',   // round turn E onto A40
  'L 482 290 Q 497 290 497 275',   // round turn N onto Old St
  'L 497 190 Q 497 178 517 178',   // round turn E onto y=178
  'L 591 178',                      // east to office
].join(' ');

const WORK_ARROWS = [
  { x: 120, y: 425, a: -90 },  // N on local street x=120
  { x: 186, y: 340, a: -90 },  // N on City Rd x=186
  { x: 300, y: 290, a:   0 },  // E on A40 (west half)
  { x: 405, y: 290, a:   0 },  // E on A40 (east half)
  { x: 497, y: 232, a: -90 },  // N on Old St x=497
  { x: 554, y: 178, a:   0 },  // E on y=178 to office
] as const;

// ── Heading-Home route: top-right (671,115) → bottom-left (120,420) ─────────
// Starts at y=115 so the route origin clears the top-right distance overlay.
// S on x=671 → W on y=178 → S on Old St → W on A40 → S on City Rd → W on y=386 → S home
const HOME_ROUTE = [
  'M 671 115',
  'L 671 163 Q 671 178 656 178',   // round turn W onto y=178 arterial
  'L 512 178 Q 497 178 497 193',   // round turn S onto Old St
  'L 497 275 Q 497 290 482 290',   // round turn W onto A40
  'L 201 290 Q 186 290 186 305',   // round turn S onto City Rd
  'L 186 371 Q 186 386 171 386',   // round turn W onto y=386
  'L 135 386 Q 120 386 120 401',   // round turn S to home
  'L 120 420',                      // south to home at (120,420)
].join(' ');

const HOME_ARROWS = [
  { x: 671, y: 146, a:  90 },  // S on x=671 (midpoint 115..178)
  { x: 590, y: 178, a: 180 },  // W on y=178 arterial
  { x: 497, y: 234, a:  90 },  // S on Old St x=497
  { x: 340, y: 290, a: 180 },  // W on A40
  { x: 186, y: 338, a:  90 },  // S on City Rd x=186
  { x: 148, y: 386, a: 180 },  // W on y=386 toward home
] as const;

export function NavigationMap({ navigation, modeId, carPos }: Props) {
  const isHome     = modeId === 'to_home';
  const cx         = carPos?.x ?? (isHome ? 671 : 120);
  const cy         = carPos?.y ?? (isHome ? 115 : 450);
  const routeColor = ROUTE_COLOR[navigation.routeStatus];
  const routeGlow  = ROUTE_GLOW[navigation.routeStatus];
  const isHeavy    = navigation.routeStatus === 'heavy';
  const etaColor   = navigation.routeStatus === 'clear' ? 'text-white' : 'text-amber-400';

  const routePath = isHome ? HOME_ROUTE : WORK_ROUTE;
  const arrows    = isHome ? HOME_ARROWS : WORK_ARROWS;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#1e2026]">

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 520"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* ── Base ── */}
        <rect width="800" height="520" fill="#1e2026" />

        {/* ── Evening warm tint (home mode only) ── */}
        {isHome && <rect width="800" height="520" fill="#f59e0b" opacity="0.035" />}

        {/* ── Parks ── */}
        <rect x="476" y="48"  width="65"  height="78" rx="6" fill="#1e2b1e" />
        <rect x="28"  y="332" width="58"  height="46" rx="4" fill="#1d2a1d" />
        <rect x="310" y="420" width="48"  height="36" rx="3" fill="#1d2a1d" />
        {/* Extra residential greenery around the home area */}
        {isHome && (
          <>
            <rect x="30"  y="440" width="55"  height="36" rx="4" fill="#1d2b1d" />
            <rect x="200" y="442" width="40"  height="28" rx="3" fill="#1c291c" />
          </>
        )}

        {/* ── Water / canal ── */}
        <path d="M 0 408 Q 150 400 300 410 Q 450 420 600 408 Q 700 400 800 408"
              fill="none" stroke="#1b2f50" strokeWidth="20" />
        <path d="M 0 408 Q 150 400 300 410 Q 450 420 600 408 Q 700 400 800 408"
              fill="none" stroke="#1e3358" strokeWidth="11" />

        {/* ── Building blocks — charcoal ── */}
        <rect x="0"   y="0"   width="85"  height="85"  fill="#232429" />
        <rect x="128" y="0"   width="50"  height="85"  fill="#222328" />
        <rect x="196" y="0"   width="42"  height="68"  fill="#232429" />
        <rect x="256" y="0"   width="74"  height="95"  fill="#222328" />
        <rect x="348" y="0"   width="85"  height="45"  fill="#232429" />
        <rect x="452" y="0"   width="37"  height="38"  fill="#222328" />
        <rect x="503" y="0"   width="80"  height="38"  fill="#232429" />
        <rect x="600" y="0"   width="63"  height="38"  fill="#222328" />
        <rect x="679" y="0"   width="55"  height="45"  fill="#232429" />
        <rect x="0"   y="113" width="85"  height="57"  fill="#222328" />
        <rect x="128" y="113" width="50"  height="57"  fill="#232429" />
        <rect x="196" y="86"  width="42"  height="84"  fill="#222328" />
        <rect x="256" y="113" width="74"  height="57"  fill="#232429" />
        <rect x="348" y="63"  width="85"  height="57"  fill="#222328" />
        <rect x="452" y="56"  width="37"  height="64"  fill="#232429" />
        <rect x="600" y="56"  width="63"  height="44"  fill="#222328" />
        <rect x="679" y="63"  width="55"  height="37"  fill="#232429" />
        <rect x="0"   y="188" width="85"  height="78"  fill="#232429" />
        <rect x="128" y="188" width="50"  height="78"  fill="#222328" />
        <rect x="196" y="188" width="42"  height="78"  fill="#232429" />
        <rect x="256" y="188" width="74"  height="78"  fill="#222328" />
        <rect x="348" y="158" width="85"  height="88"  fill="#232429" />
        <rect x="452" y="158" width="37"  height="88"  fill="#222328" />
        <rect x="503" y="56"  width="80"  height="110" fill="#232429" />
        <rect x="600" y="118" width="63"  height="52"  fill="#222328" />
        <rect x="679" y="118" width="55"  height="62"  fill="#232429" />
        <rect x="0"   y="296" width="85"  height="78"  fill="#222328" />
        <rect x="128" y="296" width="50"  height="78"  fill="#232429" />
        <rect x="196" y="296" width="42"  height="78"  fill="#222328" />
        <rect x="256" y="296" width="74"  height="78"  fill="#232429" />
        <rect x="348" y="296" width="85"  height="78"  fill="#222328" />
        <rect x="452" y="296" width="37"  height="78"  fill="#232429" />
        <rect x="503" y="188" width="80"  height="78"  fill="#222328" />
        <rect x="600" y="188" width="63"  height="78"  fill="#232429" />
        <rect x="679" y="188" width="55"  height="78"  fill="#222328" />
        <rect x="503" y="296" width="80"  height="78"  fill="#232429" />
        <rect x="600" y="296" width="63"  height="78"  fill="#222328" />
        <rect x="679" y="296" width="55"  height="78"  fill="#232429" />
        <rect x="0"   y="396" width="85"  height="48"  fill="#232429" />
        <rect x="128" y="396" width="50"  height="48"  fill="#222328" />
        <rect x="196" y="396" width="42"  height="48"  fill="#232429" />
        <rect x="256" y="396" width="74"  height="48"  fill="#222328" />
        <rect x="452" y="396" width="37"  height="48"  fill="#232429" />
        <rect x="503" y="396" width="80"  height="48"  fill="#222328" />
        <rect x="600" y="396" width="63"  height="48"  fill="#232429" />
        <rect x="0"   y="466" width="85"  height="54"  fill="#222328" />
        <rect x="128" y="466" width="50"  height="54"  fill="#232429" />

        {/* ── Tier 1: local streets (thinnest) ── */}
        {[55, 107, 148, 230, 432, 466].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="800" y2={y}
                stroke="#2c2d34" strokeWidth="2.5" />
        ))}
        {[93, 120, 246, 338, 440, 591, 671, 744].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="520"
                stroke="#2c2d34" strokeWidth="2.5" />
        ))}
        <path d="M 0 348 Q 120 341 240 350 Q 360 359 480 344 Q 600 329 720 340 Q 760 345 800 340"
              fill="none" stroke="#2c2d34" strokeWidth="2.5" />
        <path d="M 150 490 Q 300 483 450 491 Q 600 499 750 487"
              fill="none" stroke="#2c2d34" strokeWidth="2.5" />

        {/* ── Tier 2: arterial roads ── */}
        <line x1="0"   y1="178" x2="800" y2="178" stroke="#38393f" strokeWidth="7" />
        <line x1="0"   y1="386" x2="800" y2="386" stroke="#38393f" strokeWidth="7" />
        <line x1="186" y1="0"   x2="186" y2="520" stroke="#38393f" strokeWidth="7" />
        <line x1="497" y1="0"   x2="497" y2="520" stroke="#38393f" strokeWidth="7" />
        {/* Curved arterial in NE corner */}
        <path d="M 591 0 Q 620 80 650 178 Q 680 280 700 386"
              fill="none" stroke="#38393f" strokeWidth="7" strokeLinecap="round" />

        {/* ── Tier 3: main road A40 (thickest + centre stripe) ── */}
        <line x1="0" y1="290" x2="800" y2="290" stroke="#464750" strokeWidth="13" />
        <line x1="0" y1="290" x2="800" y2="290" stroke="#525363" strokeWidth="4"  />

        {/* ── Road labels ── */}
        <text x="700" y="284"
              textAnchor="middle" dominantBaseline="middle"
              fill="#565765" fontSize="9"
              fontFamily="system-ui,sans-serif" fontWeight="700" letterSpacing="3">A 4 0</text>
        <text x="497" y="90"
              textAnchor="middle" dominantBaseline="middle"
              fill="#484956" fontSize="7"
              fontFamily="system-ui,sans-serif" fontWeight="600" letterSpacing="1.5"
              transform="rotate(-90,497,90)">OLD ST</text>
        <text x="186" y="455"
              textAnchor="middle" dominantBaseline="middle"
              fill="#484956" fontSize="7"
              fontFamily="system-ui,sans-serif" fontWeight="600" letterSpacing="1.5"
              transform="rotate(-90,186,455)">CITY RD</text>

        {/* ── Route — three depth layers + optional centre thread ── */}
        {/* 1. White outer glow */}
        <path d={routePath} fill="none" stroke="white"      strokeWidth="15"  strokeLinecap="round" opacity="0.08" />
        {/* 2. Colour glow */}
        <path d={routePath} fill="none" stroke={routeGlow}  strokeWidth="20"  strokeLinecap="round"
              className="transition-[stroke] duration-1000" />
        {/* 3. Route line */}
        <path d={routePath} fill="none" stroke={routeColor} strokeWidth="5.5" strokeLinecap="round"
              strokeDasharray={isHeavy ? '12 6' : 'none'}
              className="transition-[stroke] duration-1000" />
        {/* 4. Thin white centre thread (clear / moderate only) */}
        {!isHeavy && (
          <path d={routePath} fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.22" />
        )}

        {/* ── Direction chevrons ── */}
        {arrows.map(({ x, y, a }, i) => (
          <g key={i} transform={`translate(${x},${y}) rotate(${a})`}>
            <path
              d="M -5 -4 L 3 0 L -5 4"
              fill="none"
              stroke={routeColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.75"
              className="transition-[stroke] duration-1000"
            />
          </g>
        ))}

        {/* ── Destination pin — full circle head + triangle tail ── */}
        {isHome ? (
          // Home pin at (120, 420) — lower-left residential area
          <>
            <ellipse cx="120" cy="424" rx="7" ry="2.5" fill="black" opacity="0.18" />
            <polygon
              points="109,407 131,407 120,420"
              fill={routeColor} opacity="0.95"
              className="transition-[fill] duration-1000"
            />
            <circle
              cx="120" cy="395" r="12"
              fill={routeColor} opacity="0.95"
              className="transition-[fill] duration-1000"
            />
            <circle cx="120" cy="395" r="4.5" fill="white" opacity="0.9" />
          </>
        ) : (
          // Work pin at (591, 178) — upper-right office district
          <>
            <ellipse cx="591" cy="182" rx="7" ry="2.5" fill="black" opacity="0.18" />
            <polygon
              points="580,161 602,161 591,178"
              fill={routeColor} opacity="0.95"
              className="transition-[fill] duration-1000"
            />
            <circle
              cx="591" cy="151" r="12"
              fill={routeColor} opacity="0.95"
              className="transition-[fill] duration-1000"
            />
            <circle cx="591" cy="151" r="4.5" fill="white" opacity="0.9" />
          </>
        )}

        {/* ── Car / GPS ping — position driven by useDrivingSimulation ── */}
        <circle cx={cx} cy={cy} r="14" fill="rgba(66,133,244,0.12)">
          <animate attributeName="r"       values="11;20;11" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4"  dur="2.2s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={cy} r="7"   fill="#4285f4" />
        <circle cx={cx} cy={cy} r="3.5" fill="white"   opacity="0.9" />

      </svg>

      {/* ── Navigation Info Overlay (top-left) ───────────────────────────── */}
      <div className="absolute top-5 left-5 bg-black/75 backdrop-blur-md rounded-2xl px-5 py-4 border border-slate-700/40 max-w-[280px]">
        <div className="flex items-start gap-3">
          <div className="bg-blue-600/80 rounded-xl p-2.5 shrink-0 mt-0.5">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-snug">
              {navigation.destination}
            </div>
            <div className="text-slate-400 text-xs mt-0.5 leading-snug">{navigation.address}</div>
            <div className="text-slate-500 text-xs mt-1.5 leading-snug">{navigation.nextTurn}</div>
          </div>
        </div>
      </div>

      {/* ── Destination distance (top-right) ─────────────────────────────── */}
      <div className="absolute top-5 right-5 bg-black/75 backdrop-blur-md rounded-2xl px-4 py-3 border border-slate-700/40">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <div className="text-xs text-slate-400">Distance</div>
            <div className="text-sm text-white font-medium">{navigation.distance}</div>
          </div>
        </div>
      </div>

      {/* ── Speed + ETA (bottom-right — clear of both route origins) ─────── */}
      <div className="absolute bottom-5 right-5 flex gap-3">

        {/* Speed card — speed-limit sign + live speed */}
        {/* shrink-0 + tabular-nums: speed is always 2 digits (40–50), no layout shift */}
        <div className="bg-black/75 backdrop-blur-md rounded-2xl px-4 py-3 border border-slate-700/40 flex items-center gap-3 shrink-0">
          {/* European speed-limit sign: red ring, white fill, black numeral */}
          <div className="w-11 h-11 rounded-full bg-white border-[4px] border-red-500 flex items-center justify-center shrink-0 shadow-lg">
            <span className="text-black text-sm font-black leading-none tracking-tight">50</span>
          </div>
          <div>
            <div className="tabular-nums text-2xl font-bold text-white leading-none whitespace-nowrap">
              {navigation.speed} km/h
            </div>
            <div className="text-xs text-slate-500 mt-1">Speed</div>
          </div>
        </div>

        {/* ETA card — fixed width so "9:14" and "19:07" never change card size */}
        <div className="bg-black/75 backdrop-blur-md rounded-2xl px-4 py-3 border border-slate-700/40 w-28 shrink-0">
          <div className={`tabular-nums text-2xl font-bold leading-none ${etaColor}`}>{navigation.eta}</div>
          <div className="text-xs text-slate-500 mt-1">ETA</div>
        </div>

      </div>

    </div>
  );
}
