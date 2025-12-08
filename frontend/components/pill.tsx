import { G, Ellipse, Path, Circle } from "react-native-svg";

const Pill = ({ x = 0, y = 0, size = 1, taken = false, showContainer = true }: { pillHeight?: string, x?: number, y?: number, size?: number, taken?: boolean, showContainer?: boolean }) => {
  const rx = 2 * size;
  const ry = 1.8 * size;
  const pillOpacity = taken ? 0 : 1;
  let spotOpacity = taken ? 0 : 1;
  const holeOpacity = taken ? 1 : 0;
  const holeScale = 0.5; // Adjust this to fine-tune hole size

  const containerOpacity = showContainer ? 1 : 0;
  spotOpacity = showContainer ? spotOpacity : 0;

  return (

    <G transform={`translate(${x}, ${y})`}>
      {/* Blister container outline */}
      <Ellipse
        cx="0"
        cy="0.3"
        rx={rx + 0.9}
        ry={ry + 0.7}
        fill="none"
        stroke="black"
        strokeWidth={0.15 * size}
        opacity={containerOpacity}
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
        cx="2.3"
        cy="-0.1"
        rx={rx * 0.4}
        ry={ry * 0.2}
        fill="white" opacity={0.6 * spotOpacity} transform="
        rotate(-40 0 0)"
      />
      <Circle
        cx="2.7"
        cy="-0.8"
        r={rx * 0.11}
        fill="white"
        opacity={0.9 * spotOpacity}
      />

      {/* The hole for taken pills */}
      <Path
        d={`
        M ${2 * size * holeScale} ${2 * size * holeScale}
        L ${1 * size * holeScale} 0
        L ${2 * size * holeScale} ${-2 * size * holeScale}
        L ${-1 * size * holeScale} ${-1 * size * holeScale}
        L ${-2 * size * holeScale} 0
        L 0 ${1 * size * holeScale}
        L ${1 * size * holeScale} ${2 * size * holeScale}
        `}
        strokeWidth={0.3 * size * holeScale}
        stroke="black"
        fill="black"
        opacity={holeOpacity}
      />

    </G>
  )
}

export default Pill
