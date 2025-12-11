import { Text, StyleSheet, View, Pressable, Platform } from "react-native";
import Svg, { Path, ForeignObject } from "react-native-svg";
import Pill from "./pill"

function formatDate(date: Date) {
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    month: 'short',
    day: '2-digit'
  }).format(new Date(date));
  return formattedDate;
}

const Blister = ({ startDate, nWeeks = 3, placebo = false, onPillPress, pillStates }: { startDate: string, nWeeks?: number, placebo?: boolean, onPillPress?: (index: number, date: string) => void, pillStates: Record<string, boolean> }) => {
  const rows = 7;
  const cols = nWeeks;
  const total = rows * cols;

  // Container dimensions from the path
  const topLeft = 5;
  const topRight = 45;
  const bottomLeft = 1;
  const bottomRight = 49;
  const containerHeight = 98; // 99 - 1

  // Calculate pill positions with perspective
  const pills = [];
  const interactiveElements = [];
  const padding = 2; // padding from edges

  let i = 0;
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      // Calculate vertical position
      const rowFraction = (row + 0.5) / rows;
      const y = 1 + padding + (containerHeight - 2 * padding) * rowFraction;

      // Calculate horizontal position with perspective
      // Interpolate between top and bottom widths based on y position
      const leftEdge = topLeft + (bottomLeft - topLeft) * rowFraction;
      const rightEdge = topRight + (bottomRight - topRight) * rowFraction;
      const availableWidth = rightEdge - leftEdge;

      const colFraction = (col + 0.5) / cols;
      const x = leftEdge + padding + (availableWidth - 2 * padding) * colFraction;

      // Scale pills to fit in grid cells
      const cellWidth = (availableWidth - 2 * padding) / cols;
      const cellHeight = (containerHeight - 2 * padding) / rows;
      const pillSize = Math.min(cellWidth, cellHeight) * 0.13;

      // Calculate date for this pill as a date string (YYYY-MM-DD)
      const pillDate = new Date(startDate + 'T00:00:00');
      pillDate.setDate(pillDate.getDate() + i);
      const year = pillDate.getFullYear();
      const month = String(pillDate.getMonth() + 1).padStart(2, '0');
      const day = String(pillDate.getDate()).padStart(2, '0');
      const pillDateStr = `${year}-${month}-${day}`;
      const formattedPillDate = formatDate(pillDate);

      pills.push(
        <Pill
          key={`${row}-${col}`}
          x={x}
          y={y}
          size={pillSize}
          taken={pillStates[pillDateStr]}
        />
      );

      // Create pressable and text label using ForeignObject for proper coordinate alignment
      // The variable for the pill index needs to be within the function scope
      // Otherwise, the onPress function will look for i and find its final value
      const pillIndex = i;

      // Size of the pressable area in SVG units
      const pressableSize = 9.5;
      const textHeight = 2.5;

      interactiveElements.push(
        <ForeignObject
          key={`interactive-${row}-${col}`}
          x={x - pressableSize / 2}
          y={y - pressableSize / 2}
          width={pressableSize}
          height={pressableSize + textHeight}
        >
          <View style={styles.foreignObjectContainer}>
            <Pressable
              style={styles.pillPressable}
              onPress={() => {
                onPillPress?.(pillIndex, pillDateStr);
              }}
            />
            <Text style={styles.dateLabel}>
              {formattedPillDate}
            </Text>
          </View>
        </ForeignObject>
      );

      // count which pill we're currently on
      i++;
    }
  }

  const radius = 2; // corner radius

  return (
    <View style={styles.container}>
      <Svg viewBox="0 0 50 100" style={styles.svg}>
        <Path
          d={`
          M 1 ${99 - radius}
          Q 1 99, ${1 + radius} 99
          L ${49 - radius} 99
          Q 49 99, 49 ${99 - radius}
          L ${47 - radius} ${1 + radius}
          Q ${47 - radius} 1, ${45 - radius} 1
          L ${5 + radius} 1
          Q 5 1, 5 ${1 + radius}
          Z
          `}
          stroke="black"
          strokeWidth="0.8"
          fill="silver"
        />
        {pills}
        {interactiveElements}
      </Svg>
    </View>
  )
}
export default Blister

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    maxWidth: '100%'
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  foreignObjectContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pillPressable: {
    width: '100%',
    height: '80%',
    marginBottom: 0.5,
  },
  dateLabel: {
    fontFamily: 'Inter 18pt Black',
    fontSize: 1.6,
    color: 'black',
    fontWeight: '600',
    textAlign: 'center',
  },
});
