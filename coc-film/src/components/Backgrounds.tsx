import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, WIDTH, HEIGHT } from "../theme";

const Full: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    width={WIDTH}
    height={HEIGHT}
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    style={{ position: "absolute", inset: 0 }}
    preserveAspectRatio="xMidYMid slice"
  >
    {children}
  </svg>
);

/** Simple layered tree silhouette row. */
const TreeRow: React.FC<{ y: number; color: string; scale?: number; offset?: number }> = ({
  y,
  color,
  scale = 1,
  offset = 0,
}) => (
  <g fill={color} transform={`translate(${offset} 0)`}>
    {new Array(10).fill(0).map((_, i) => {
      const x = i * 230 * scale;
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${scale})`}>
          <rect x="40" y="60" width="26" height="160" rx="10" />
          <ellipse cx="53" cy="60" rx="90" ry="80" />
          <ellipse cx="0" cy="90" rx="70" ry="64" />
          <ellipse cx="106" cy="90" rx="70" ry="64" />
        </g>
      );
    })}
  </g>
);

const Reeds: React.FC<{ color?: string; opacity?: number }> = ({
  color = COLORS.forestLeaf,
  opacity = 1,
}) => (
  <g fill={color} opacity={opacity}>
    {new Array(16).fill(0).map((_, i) => {
      const x = 40 + i * 130;
      const h = 180 + (i % 4) * 70;
      const lean = (i % 2 === 0 ? 1 : -1) * 18;
      return (
        <path
          key={i}
          d={`M${x} ${HEIGHT} C ${x + lean} ${HEIGHT - h / 2} ${x + lean} ${
            HEIGHT - h
          } ${x + lean * 1.4} ${HEIGHT - h - 30} L ${x + lean * 1.4 + 10} ${
            HEIGHT - h - 10
          } C ${x + 12} ${HEIGHT - h / 2} ${x + 12} ${HEIGHT - h / 3} ${x + 16} ${HEIGHT} Z`}
        />
      );
    })}
  </g>
);

/** Night forest exterior with warm house glow — used for home & arrival. */
export const ForestNight: React.FC = () => (
  <AbsoluteFill>
    <Full>
      <defs>
        <linearGradient id="skyN" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLORS.nightSky} />
          <stop offset="1" stopColor={COLORS.nightSky2} />
        </linearGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#skyN)" />
      <TreeRow y={300} color="#14304A" scale={1.3} />
      <TreeRow y={440} color="#0F2638" scale={1.6} offset={-120} />
      <rect y={HEIGHT - 240} width={WIDTH} height={240} fill={COLORS.forest} />
      <rect y={HEIGHT - 120} width={WIDTH} height={120} fill={COLORS.forestDark} />
      <Reeds color={COLORS.forestDark} />
    </Full>
  </AbsoluteFill>
);

/** Cosy home interior inside a tree, warm lamp light. */
export const HomeInterior: React.FC = () => (
  <AbsoluteFill>
    <Full>
      <defs>
        <radialGradient id="lamp" cx="0.35" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#3A4A3A" />
          <stop offset="1" stopColor="#121E1A" />
        </radialGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#lamp)" />
      {/* floor */}
      <rect y={HEIGHT - 300} width={WIDTH} height={300} fill="#1A2A22" />
      <rect y={HEIGHT - 300} width={WIDTH} height={16} fill="#24392E" />
      {/* bookshelf */}
      <g transform={`translate(${WIDTH - 520} ${HEIGHT - 760})`}>
        <rect width="420" height="470" rx="12" fill="#20463A" />
        {[0, 1, 2].map((r) => (
          <g key={r} transform={`translate(24 ${30 + r * 150})`}>
            <rect width="372" height="120" rx="6" fill="#163228" />
            {new Array(7).fill(0).map((_, b) => (
              <rect
                key={b}
                x={10 + b * 50}
                y={18}
                width="40"
                height="96"
                rx="4"
                fill={["#C96B5A", "#E6B64C", "#6FA7C0", "#B58CD6", "#7FB069"][b % 5]}
              />
            ))}
          </g>
        ))}
      </g>
      {/* window with moon */}
      <g transform={`translate(140 150)`}>
        <ellipse cx="150" cy="150" rx="150" ry="150" fill="#24405C" stroke="#0E1B28" strokeWidth="12" />
        <circle cx="150" cy="150" r="130" fill="#2E4E6E" />
        <circle cx="110" cy="120" r="46" fill={COLORS.moon} opacity="0.9" />
        <line x1="150" y1="20" x2="150" y2="280" stroke="#0E1B28" strokeWidth="10" />
        <line x1="20" y1="150" x2="280" y2="150" stroke="#0E1B28" strokeWidth="10" />
      </g>
      {/* string lights */}
      <path d={`M0 90 Q ${WIDTH / 2} 220 ${WIDTH} 70`} stroke="#3b3b3b" strokeWidth="4" fill="none" />
      {new Array(12).fill(0).map((_, i) => {
        const x = 80 + i * 150;
        const y = 120 + Math.sin(i) * 20 + i * 2;
        return (
          <circle key={i} cx={x} cy={y} r="10" fill={["#F27D9D", "#FFE58A", "#6FA7C0", "#7FB069"][i % 4]} opacity="0.9" />
        );
      })}
    </Full>
  </AbsoluteFill>
);

/** Forest path at night (travel scenes). */
export const ForestPath: React.FC<{ tint?: string }> = ({ tint = COLORS.nightSky2 }) => (
  <AbsoluteFill>
    <Full>
      <defs>
        <linearGradient id="skyP" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E2236" />
          <stop offset="1" stopColor={tint} />
        </linearGradient>
        <radialGradient id="moonGlow" cx="0.8" cy="0.2" r="0.5">
          <stop offset="0" stopColor="rgba(255,244,194,0.5)" />
          <stop offset="1" stopColor="rgba(255,244,194,0)" />
        </radialGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#skyP)" />
      <rect width={WIDTH} height={HEIGHT} fill="url(#moonGlow)" />
      <circle cx={WIDTH * 0.82} cy={200} r="70" fill={COLORS.moon} />
      <TreeRow y={280} color="#102A40" scale={1.4} />
      <TreeRow y={430} color="#0B1E2E" scale={1.7} offset={-150} />
      {/* ground path */}
      <path
        d={`M0 ${HEIGHT} L ${WIDTH} ${HEIGHT} L ${WIDTH} ${HEIGHT - 150} C ${
          WIDTH * 0.6
        } ${HEIGHT - 210} ${WIDTH * 0.4} ${HEIGHT - 120} 0 ${HEIGHT - 170} Z`}
        fill={COLORS.forest}
      />
      <path
        d={`M0 ${HEIGHT} L ${WIDTH} ${HEIGHT} L ${WIDTH} ${HEIGHT - 70} C ${
          WIDTH * 0.55
        } ${HEIGHT - 120} ${WIDTH * 0.45} ${HEIGHT - 40} 0 ${HEIGHT - 90} Z`}
        fill={COLORS.forestDark}
      />
    </Full>
  </AbsoluteFill>
);

/** Pond surface seen from the side (jump / splash scenes). */
export const PondSurface: React.FC = () => (
  <AbsoluteFill>
    <Full>
      <defs>
        <linearGradient id="skyW" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#13395A" />
          <stop offset="1" stopColor="#1E5878" />
        </linearGradient>
        <linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLORS.waterLight} />
          <stop offset="1" stopColor={COLORS.pond} />
        </linearGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#skyW)" />
      <circle cx={WIDTH * 0.2} cy={200} r="60" fill={COLORS.moon} opacity="0.85" />
      <TreeRow y={330} color="#0E2C40" scale={1.5} />
      <rect y={HEIGHT * 0.52} width={WIDTH} height={HEIGHT * 0.48} fill="url(#waterG)" />
      {/* lily pads */}
      {[[300, 0.62], [900, 0.7], [1500, 0.6], [1750, 0.72]].map(([x, yf], i) => (
        <ellipse key={i} cx={x} cy={HEIGHT * (yf as number)} rx="90" ry="26" fill={COLORS.forestLeaf} />
      ))}
      <Reeds color={COLORS.forestDark} opacity={0.9} />
    </Full>
  </AbsoluteFill>
);

/** Deep underwater (peril scene). */
export const Underwater: React.FC = () => (
  <AbsoluteFill>
    <Full>
      <defs>
        <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COLORS.water} />
          <stop offset="1" stopColor={COLORS.pondDeep} />
        </linearGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#deep)" />
      {/* light rays */}
      {[0.2, 0.4, 0.62, 0.8].map((fx, i) => (
        <polygon
          key={i}
          points={`${WIDTH * fx} 0 ${WIDTH * fx + 140} 0 ${WIDTH * fx - 120} ${HEIGHT} ${
            WIDTH * fx - 320
          } ${HEIGHT}`}
          fill="rgba(180,230,245,0.08)"
        />
      ))}
      {/* weeds */}
      {new Array(12).fill(0).map((_, i) => {
        const x = 60 + i * 170;
        return (
          <path
            key={i}
            d={`M${x} ${HEIGHT} C ${x - 30} ${HEIGHT - 200} ${x + 30} ${HEIGHT - 320} ${x} ${
              HEIGHT - 460
            }`}
            stroke={COLORS.forestLeaf}
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
        );
      })}
    </Full>
  </AbsoluteFill>
);

/** Concert clearing at night with a little stage and bunting. */
export const ConcertClearing: React.FC = () => (
  <AbsoluteFill>
    <Full>
      <rect width={WIDTH} height={HEIGHT} fill="#0C1E16" />
      <TreeRow y={250} color="#0F3326" scale={1.5} />
      <TreeRow y={430} color="#0A2419" scale={1.8} offset={-100} />
      {/* stage */}
      <rect x={WIDTH / 2 - 520} y={HEIGHT - 430} width="1040" height="320" rx="20" fill="#13392B" />
      <rect x={WIDTH / 2 - 520} y={HEIGHT - 150} width="1040" height="60" fill="#0C2A1F" />
      {/* bunting */}
      <path d={`M60 150 Q ${WIDTH / 2} 300 ${WIDTH - 60} 150`} stroke="#2a2a2a" strokeWidth="3" fill="none" />
      {new Array(18).fill(0).map((_, i) => {
        const t = i / 17;
        const x = 60 + t * (WIDTH - 120);
        const y = 150 + Math.sin(t * Math.PI) * 150;
        return (
          <polygon
            key={i}
            points={`${x - 16},${y} ${x + 16},${y} ${x},${y + 34}`}
            fill={["#F27D9D", "#FFE58A", "#79C4D8", "#B89BE6"][i % 4]}
          />
        );
      })}
    </Full>
  </AbsoluteFill>
);

/** Moonlit path home. */
export const MoonPath: React.FC = () => (
  <AbsoluteFill>
    <Full>
      <defs>
        <linearGradient id="skyM" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A1626" />
          <stop offset="1" stopColor="#13263D" />
        </linearGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#skyM)" />
      <circle cx={WIDTH * 0.8} cy={220} r="90" fill={COLORS.moon} />
      <circle cx={WIDTH * 0.8} cy={220} r="140" fill="rgba(255,244,194,0.12)" />
      <TreeRow y={300} color="#0C2036" scale={1.5} />
      {/* moonlit road */}
      <path
        d={`M${WIDTH * 0.2} ${HEIGHT} C ${WIDTH * 0.45} ${HEIGHT - 260} ${WIDTH * 0.55} ${
          HEIGHT - 420
        } ${WIDTH * 0.8} ${HEIGHT - 560}`}
        stroke="rgba(255,244,194,0.5)"
        strokeWidth="120"
        fill="none"
        strokeLinecap="round"
      />
      <rect y={HEIGHT - 110} width={WIDTH} height={110} fill={COLORS.forestDark} />
    </Full>
  </AbsoluteFill>
);
