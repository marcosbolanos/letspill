export default function Pill() {
  const radius = '1.5em';
  const diameter = '3em';
  const stroke = "none";
  const fill = "black";
  const strokeWidth = 2;

  return (
    <svg
      style={{ width: "5rem", height: "5rem" }}
      viewBox="0 0 100 100"
    >
      {/* Outline for the pill */}
      <circle
        cx="50"
        cy="50"
        r="38"
        style={{
          fill: "white",
          fillOpacity: "0",
          stroke: "black",
          strokeWidth: "4"
        }}
      />
      {/* A solid pink circle inside the outline */}
      <circle
        id="shadow"
        cx="50"
        cy="50"
        r="33"
        style={{
          fill: "purple",
        }}
      />
      {/* A crescent-shaped shadow inside of the circle */}
      <clipPath id="body-path">
        <circle
          cx="52"
          cy="49"
          r="31"
        />
      </clipPath>
      <circle
        id="body-bg"
        cx="50"
        cy="50"
        r="33"
        style={{
          fill: "plum",
          clipPath: "url(#body-path)"
        }}
      />
    </svg>
  )
}
