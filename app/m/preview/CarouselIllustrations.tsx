/* ─── Onboarding carousel illustrations ────────────────────────────────────
   All SVGs: width="100%" height="280" viewBox="0 0 360 280"
   Transparent background — renders directly on the blue gradient area.
   Each builds its own floating white cards in native SVG primitives.
   Zero image assets.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Screen 1: "Complete visibility into every payment"
   Floating payment / account balance card on gradient background          ── */
export function SettlementIllustration() {
  return (
    <svg width="100%" height="280" viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Card drop-shadow */}
        <filter id="s1big" x="-28%" y="-28%" width="156%" height="168%">
          <feDropShadow dx="0" dy="10" stdDeviation="20" floodColor="#001E50" floodOpacity="0.18"/>
        </filter>
        <filter id="s1sm" x="-35%" y="-35%" width="170%" height="180%">
          <feDropShadow dx="0" dy="5" stdDeviation="12" floodColor="#001E50" floodOpacity="0.14"/>
        </filter>
        {/* Card top-strip gradient */}
        <linearGradient id="s1topGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EEF4FF"/>
          <stop offset="100%" stopColor="white"/>
        </linearGradient>
      </defs>

      {/* ── Decorative depth circles on gradient ── */}
      {/* <circle cx="318" cy="22" r="78" fill="white" fillOpacity="0.11"/>
      <circle cx="348" cy="108" r="54" fill="white" fillOpacity="0.07"/>
      <circle cx="16"  cy="264" r="72" fill="white" fillOpacity="0.09"/>
      <circle cx="80"  cy="248" r="34" fill="white" fillOpacity="0.06"/> */}

      {/* ── Main floating balance card ── */}
      {/* <rect x="22" y="26" width="244" height="158" rx="18" fill="url(#s1topGrad)" filter="url(#s1big)"/> */}
      {/* White body below the tinted strip */}
      {/* <rect x="22" y="68" width="244" height="116" rx="0" fill="white"/> */}
      {/* <rect x="22" y="152" width="244" height="32" rx="18" fill="white"/> */}

      {/* US flag (simplified: blue canton + red/white stripes) */}
      {/* <rect x="40" y="42" width="26" height="18" rx="3" fill="#3C3B6E"/> */}
      {/* Stripes */}
      <rect x="40" y="42" width="26" height="5"  fill="#B22234"/>
      <rect x="40" y="52" width="26" height="5"  fill="#B22234"/>
      {/* Star dots */}
      <circle cx="43" cy="47" r="1.2" fill="white"/>
      <circle cx="47" cy="47" r="1.2" fill="white"/>
      <circle cx="43" cy="51" r="1.2" fill="white"/>
      <circle cx="47" cy="51" r="1.2" fill="white"/>

      {/* Currency label */}
      <text x="74" y="55" fontSize="11" fontWeight="500" fill="#6B7280">US Dollar</text>
      <circle cx="122" cy="51" r="2" fill="#D1D5DB"/>
      <text x="128" y="55" fontSize="11" fontWeight="400" fill="#9CA3AF">Savings</text>

      {/* ── Primary amount ── */}
      <text x="40" y="108" fontSize="28" fontWeight="700" fill="#0A0A0A" letterSpacing="-0.5">$40,500.80</text>

      {/* Masked card number */}
      <text x="40" y="130" fontSize="13" fill="#9CA3AF" letterSpacing="2">••••  ••••  9965</text>

      {/* ── ✓ Payment Confirmed badge ── */}
      <rect x="40" y="142" width="152" height="26" rx="13" fill="#E8F5E9"/>
      <text x="60" y="159" fontSize="11.5" fontWeight="600" fill="#2E7D32">✓  Payment Confirmed</text>

      {/* ── Secondary mini-card overlapping bottom-right ── */}
      <rect x="226" y="150" width="126" height="78" rx="14" fill="white" filter="url(#s1sm)"/>
      <text x="240" y="172" fontSize="10" fontWeight="500" fill="#9CA3AF">Last 24 hours</text>
      <text x="240" y="194" fontSize="16" fontWeight="700" fill="#0A0A0A">+₹2,840</text>
      <rect x="240" y="200" width="84" height="18" rx="9" fill="#E8F5E9"/>
      <text x="248" y="213" fontSize="9.5" fontWeight="600" fill="#2E7D32">↑ 8.2% today</text>
    </svg>
  );
}


/* ── Screen 2: "Understand your business with real-time insights"
   White line chart on gradient + floating stats card                      ── */
export function AnalyticsIllustration() {
  /* 6 data points — upward trend left→right */
  const pts: [number, number][] = [
    [28,  224],
    [90,  194],
    [152, 163],
    [214, 132],
    [272, 102],
    [332,  70],
  ];
  const polyPts = pts.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <svg width="100%" height="280" viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="s2card" x="-30%" y="-30%" width="160%" height="165%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#001E50" floodOpacity="0.16"/>
        </filter>
      </defs>

      {/* ── Decorative circles ── */}
      <circle cx="44"  cy="44"  r="68" fill="white" fillOpacity="0.10"/>
      <circle cx="320" cy="234" r="60" fill="white" fillOpacity="0.08"/>
      <circle cx="300" cy="48"  r="38" fill="white" fillOpacity="0.07"/>

      {/* ── Subtle grid lines ── */}
      <line x1="28" y1="148" x2="332" y2="148" stroke="white" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 6"/>
      <line x1="28" y1="188" x2="332" y2="188" stroke="white" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 6"/>

      {/* ── White trend line ── */}
      <polyline
        points={polyPts}
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Area fill under line */}
      <path
        d={`M${pts[0][0]},${pts[0][1]} ${pts.map(([x, y]) => `L${x},${y}`).join(" ")} L${pts[pts.length-1][0]},280 L${pts[0][0]},280 Z`}
        fill="white"
        fillOpacity="0.06"
      />

      {/* ── Circular nodes at each data point ── */}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5} fill="white" stroke="white" strokeOpacity="0.5" strokeWidth="2.5"/>
      ))}
      {/* Active node highlight — last (highest) point */}
      <circle cx={pts[5][0]} cy={pts[5][1]} r={8} fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="2"/>
      <circle cx={pts[5][0]} cy={pts[5][1]} r={5} fill="white"/>

      {/* ── Floating stats card — bottom right ── */}
      <rect x="198" y="176" width="152" height="88" rx="16" fill="white" filter="url(#s2card)"/>
      <text x="214" y="200" fontSize="10.5" fontWeight="500" fill="#9CA3AF">Monthly Total</text>
      <text x="214" y="224" fontSize="19" fontWeight="700" fill="#0A0A0A">$8,240.00</text>
      <rect x="214" y="232" width="118" height="20" rx="10" fill="#E8F5E9"/>
      <text x="222" y="246" fontSize="10" fontWeight="600" fill="#2E7D32">▲  12.4% this month</text>
    </svg>
  );
}


/* ── Screen 3: "Reports that actually tell you something"
   Floating white analytics card: bar chart left + donut right             ── */
export function PaymentLinkIllustration() {
  /* Bar chart data — 5 bars */
  const bars = [44, 64, 50, 82, 96];
  const maxH  = 84;
  const barW  = 24;
  const barGap = 10;
  const barBaseY = 196; /* y-coordinate of bar bottom inside card */
  const barStartX = 34;

  /* Donut chart constants */
  const dcx = 270, dcy = 116, dr = 42, dsw = 11;
  const circ  = 2 * Math.PI * dr;
  const filled = circ * 0.94;
  const empty  = circ * 0.06;

  return (
    <svg width="100%" height="280" viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="s3main" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="8" stdDeviation="18" floodColor="#001E50" floodOpacity="0.16"/>
        </filter>
        <filter id="s3donut" x="-30%" y="-30%" width="160%" height="165%">
          <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#001E50" floodOpacity="0.14"/>
        </filter>
      </defs>

      {/* ── Decorative circles ── */}
      <circle cx="316" cy="24"  r="74" fill="white" fillOpacity="0.10"/>
      <circle cx="22"  cy="258" r="60" fill="white" fillOpacity="0.08"/>

      {/* ── Main analytics card ── */}
      <rect x="14" y="12" width="204" height="210" rx="18" fill="white" filter="url(#s3main)"/>

      {/* Card header */}
      <text x="30" y="38" fontSize="11" fontWeight="600" fill="#374151">Revenue trend</text>
      <text x="30" y="54" fontSize="10"  fontWeight="400" fill="#9CA3AF">This week</text>

      {/* Bar chart */}
      {bars.map((h, i) => {
        const barH = (h / 100) * maxH;
        const bx   = barStartX + i * (barW + barGap);
        const by   = barBaseY - barH;
        const isLast = i === bars.length - 1;
        return (
          <rect
            key={i}
            x={bx} y={by}
            width={barW} height={barH}
            rx="5"
            fill={isLast ? "#0061e3" : "#DBEAFE"}
          />
        );
      })}

      {/* Bar value label above tallest bar */}
      <text
        x={barStartX + (bars.length - 1) * (barW + barGap) + barW / 2}
        y={barBaseY - (bars[bars.length - 1] / 100) * maxH - 6}
        fontSize="9"
        fontWeight="600"
        fill="#0061e3"
        textAnchor="middle"
      >
        96%
      </text>

      {/* ── Donut chart card (right side) ── */}
      <rect x="222" y="44" width="128" height="128" rx="16" fill="white" filter="url(#s3donut)"/>

      {/* Donut ring — track */}
      <circle cx={dcx} cy={dcy} r={dr} stroke="#E5E7EB" strokeWidth={dsw} fill="none"/>
      {/* Donut ring — progress (94%) */}
      <circle
        cx={dcx} cy={dcy} r={dr}
        stroke="#0061e3"
        strokeWidth={dsw}
        fill="none"
        strokeDasharray={`${filled} ${empty}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
      />
      {/* Donut labels */}
      <text x={dcx} y={dcy + 5}  fontSize="16" fontWeight="700" fill="#0A0A0A"   textAnchor="middle">94%</text>
      <text x={dcx} y={dcy + 20} fontSize="9"  fontWeight="400" fill="#9CA3AF"   textAnchor="middle">Success</text>

      {/* ── Bottom mini metric badges ── */}
      <rect x="222" y="182" width="128" height="36" rx="12" fill="white" filter="url(#s3donut)"/>
      <text x="236" y="196" fontSize="9.5" fontWeight="500" fill="#9CA3AF">Avg ticket</text>
      <text x="236" y="212" fontSize="13"  fontWeight="700" fill="#0A0A0A">₹6,600</text>
    </svg>
  );
}


/* ── Screen 4: "Meet Echo, your payment assistant"
   Premium AI chat UI — user question + Echo response                      ── */
export function EchoIllustration() {
  return (
    <svg width="100%" height="280" viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="s4user" x="-25%" y="-25%" width="150%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#001E50" floodOpacity="0.14"/>
        </filter>
        <filter id="s4echo" x="-20%" y="-20%" width="140%" height="155%">
          <feDropShadow dx="0" dy="8" stdDeviation="18" floodColor="#001E50" floodOpacity="0.16"/>
        </filter>
      </defs>

      {/* ── Decorative circles ── */}
      <circle cx="308" cy="24"  r="72" fill="white" fillOpacity="0.11"/>
      <circle cx="24"  cy="256" r="66" fill="white" fillOpacity="0.08"/>
      <circle cx="330" cy="200" r="40" fill="white" fillOpacity="0.07"/>

      {/* ── Echo brand header ── */}
      {/* Sparkle icon */}
      <path
        d="M34 76 L36 68 L40 64 L44 68 L46 76 L44 84 L40 88 L36 84 Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path
        d="M26 76 L40 76 M40 64 L40 88"
        stroke="white"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <text x="56" y="80" fontSize="13" fontWeight="700" fill="white" letterSpacing="1">ECHO</text>
      <text x="56" y="95" fontSize="10" fontWeight="400" fill="white" fillOpacity="0.7">Your payments AI</text>

      {/* ── User message bubble (white card, right-aligned) ── */}
      <rect x="128" y="110" width="208" height="54" rx="14" fill="white" filter="url(#s4user)"/>
      {/* Bubble tail (right side) */}
      <path d="M330 138 L342 144 L330 150 Z" fill="white"/>
      <text x="144" y="132" fontSize="12" fontWeight="500" fill="#374151">Why did this</text>
      <text x="144" y="150" fontSize="12" fontWeight="500" fill="#374151">payment fail?</text>

      {/* ── Echo response bubble (blue card, left-aligned) ── */}
      <rect x="18" y="178" width="228" height="82" rx="14" fill="#007AFF" filter="url(#s4echo)"/>
      {/* Bubble tail (left side) */}
      <path d="M26 206 L14 212 L26 218 Z" fill="#007AFF"/>
      <text x="34" y="200" fontSize="11.5" fontWeight="400" fill="white">The card issuer declined</text>
      <text x="34" y="218" fontSize="11.5" fontWeight="400" fill="white">due to insufficient</text>
      <text x="34" y="236" fontSize="11.5" fontWeight="400" fill="white">funds.</text>

      {/* Echo checkmark / verified badge */}
      <circle cx="228" cy="248" r="14" fill="white" fillOpacity="0.2"/>
      <circle cx="228" cy="248" r="9"  fill="white"/>
      <path d="M222 248 L226 252 L234 244" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
