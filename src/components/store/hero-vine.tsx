import { VINE_LEAF_PATH } from "@/components/effects/vine-leaf";

// grape berries of the bunch: [cx, cy, shade 1–3]
const BERRIES: [number, number, number][] = [
  [150, 150, 1],
  [195, 145, 2],
  [240, 152, 1],
  [128, 192, 2],
  [173, 190, 1],
  [218, 188, 2],
  [262, 194, 3],
  [150, 232, 3],
  [195, 230, 2],
  [240, 234, 1],
  [172, 272, 2],
  [217, 272, 3],
  [194, 310, 3],
  [206, 346, 3],
];

/** Large decorative grape bunch that sways gently in the hero. */
export function HeroVine() {
  return (
    <svg viewBox="0 0 400 420" className="h-full w-full" aria-hidden>
      <g className="hero-vine">
        <path
          d="M200 0 C 205 40, 190 70, 196 118"
          stroke="var(--vine-800)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          className="tendril"
          d="M204 60 C 250 50, 290 70, 285 105 C 281 130, 250 128, 255 108 C 259 94, 275 98, 272 108"
          stroke="var(--vine-500)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <g transform="translate(52 20) rotate(-18) scale(6.2)">
          <path d={VINE_LEAF_PATH} fill="var(--vine-500)" />
          <path
            d="M12 22V9M12 14l-4-3M12 14l4-3M12 18l-5 0M12 18l5 0"
            stroke="var(--vine-800)"
            strokeWidth=".35"
            fill="none"
            opacity=".5"
          />
        </g>
        <g transform="translate(250 40) rotate(28) scale(3.6)">
          <path d={VINE_LEAF_PATH} fill="var(--vine-400)" />
        </g>
        {BERRIES.map(([cx, cy, shade]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r="25" fill={`var(--berry-${shade})`} />
            <circle cx={cx - 8} cy={cy - 9} r="6" fill="var(--berry-shine)" />
          </g>
        ))}
      </g>
    </svg>
  );
}
