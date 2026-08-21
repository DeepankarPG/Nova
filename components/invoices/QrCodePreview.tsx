/**
 * A deterministic, QR-shaped SVG placeholder (not a real scannable code).
 * This is a mock invoice flow with no payment backend to encode a real
 * link into, so we render a stable pseudo-random module grid seeded from
 * the value string instead of pulling in a QR-generation dependency.
 */
function seededModules(seed: string, size: number): boolean[][] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const modules: boolean[][] = [];
  for (let row = 0; row < size; row++) {
    const rowModules: boolean[] = [];
    for (let col = 0; col < size; col++) {
      hash = (hash * 1103515245 + 12345) >>> 0;
      rowModules.push((hash >>> 16) % 2 === 0);
    }
    modules.push(rowModules);
  }
  return modules;
}

function FinderPattern({ x, y, cell }: { x: number; y: number; cell: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={cell * 7} height={cell * 7} fill="currentColor" />
      <rect x={cell} y={cell} width={cell * 5} height={cell * 5} fill="white" />
      <rect x={cell * 2} y={cell * 2} width={cell * 3} height={cell * 3} fill="currentColor" />
    </g>
  );
}

export function QrCodePreview({ value, size = 96 }: { value: string; size?: number }) {
  const gridSize = 21;
  const cell = size / gridSize;
  const modules = seededModules(value, gridSize);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="text-foreground"
      role="img"
      aria-label="QR code preview"
    >
      <rect width={size} height={size} fill="white" />
      {modules.map((rowModules, row) =>
        rowModules.map((on, col) => {
          const inFinderZone =
            (row < 8 && col < 8) || (row < 8 && col >= gridSize - 8) || (row >= gridSize - 8 && col < 8);
          if (!on || inFinderZone) return null;
          return (
            <rect
              key={`${row}-${col}`}
              x={col * cell}
              y={row * cell}
              width={cell}
              height={cell}
              fill="currentColor"
            />
          );
        })
      )}
      <FinderPattern x={0} y={0} cell={cell} />
      <FinderPattern x={size - cell * 7} y={0} cell={cell} />
      <FinderPattern x={0} y={size - cell * 7} cell={cell} />
    </svg>
  );
}
