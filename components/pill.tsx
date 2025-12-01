import { G, Ellipse, Path, Circle } from "react-native-svg";

export default function Pill({ pillHeight = "5rem", x = 0, y = 0, size = 1, taken = false }: { pillHeight?: string, x?: number, y?: number, size?: number, taken?: boolean }) {
  const rx = 2 * size;
  const ry = 1.8 * size;
  const pillOpacity = taken ? 0 : 1;
  const spotOpacity = taken ? 0 : 1;
  const holeOpacity = taken ? 1 : 0;

  return (

    <G transform={`translate(${x}, ${y})`}>
      {/* Blister container outline */}
      <Ellipse
        cx="0"
        cy="0.3"
        rx={rx + 0.8 * size}
        ry={ry + 0.5 * size}
        fill="none"
        stroke="black"
        strokeWidth={0.15 * size}
      />


      {/* The pill */}
      <Ellipse cx="0" cy="0" rx={rx} ry={ry} fill="plum" opacity={pillOpacity} />
      <Path
        d={`
        M ${-rx} 0 
        A ${rx} ${ry} 0 0 0 ${rx} 0
        V ${0.4 * size}
        A ${rx} ${ry} 0 0 1 ${-rx} ${0.4 * size}
        `}
        fill="purple"
        opacity={pillOpacity} />

      {/* Some shiny spots to it */}
      <Ellipse
        cx="2.4"
        cy="-0.5"
        rotate="20"
        rx={rx * size * 0.2}
        ry={ry * size * 0.1}
        fill="white"
        opacity={0.8 * spotOpacity}
        transform="
        rotate(-20 0 0)"
      />
      <Circle
        cx="2.4"
        cy="0.4"
        rotate="20"
        r={rx * size * 0.07}
        fill="white"
        opacity={1 * spotOpacity}
      />

      {/* The hole for taken pills */}
      <Path
        d={`
        M 2 2
        L 1 0
        L 2 -2
        L -1 -1
        L -2 0
        L 0 1
        L 1 2
        `}
        strokeWidth="0.3"
        stroke="black"
        fill="black"
        opacity={holeOpacity}
      />

    </G>
  )
}
