import { useState } from 'react';
import { Text, StyleSheet, View, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import Pill from "./pill"

function formatDate(date: Date) {
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    month: 'short',
    day: '2-digit'
  }).format(new Date(date));
  return formattedDate;
}

export default ({ startDate, nWeeks = 3, placebo = false }: { startDate: Date | string, nWeeks?: number, placebo?: boolean }) => {
  const rows = 7;
  const cols = nWeeks;
  const total = rows * cols;

  const [takenPills, setTakenPills] = useState(new Array(total).fill(false));

  // Container dimensions from the path
  const topLeft = 5;
  const topRight = 45;
  const bottomLeft = 1;
  const bottomRight = 49;
  const containerHeight = 98; // 99 - 1

  // Calculate pill positions with perspective
  const pills = [];
  const textLabels = [];
  const pressables = [];
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

      pills.push(
        <Pill
          key={`${row}-${col}`}
          x={x}
          y={y}
          size={pillSize}
          taken={takenPills[i]}
        />
      );

      // Convert SVG coordinates to percentage for absolute positioning
      const xPercent = (x / 50) * 100;
      const yPercent = (y / 100) * 100;

      // Calculate date for this pill
      const pillDate = new Date(startDate);
      pillDate.setDate(pillDate.getDate() + i);
      const formattedPillDate = formatDate(pillDate);

      // Create pressable overlay for each pill
      // The variable for the pill index needs to be within the function scope
      // Otherwise, the onPress function will look for i and find its final value
      const pillIndex = i;
      pressables.push(
        <Pressable
          key={`pressable-${row}-${col}`}
          style={[
            styles.pillPressable,
            {
              left: `${xPercent}%`,
              top: `${yPercent}%`,
            }
          ]}
          onPress={() => setTakenPills(prev => {
            const newState = [...prev];
            newState[pillIndex] = !prev[pillIndex];
            console.log('setting pill ' + pillIndex + ' to ' + newState[pillIndex]);
            return newState;
          })
          }
        />
      );

      textLabels.push(
        <Text
          key={`text-${row}-${col}`}
          style={[
            styles.dateLabel,
            {
              left: `${xPercent}%`,
              top: `${yPercent + pillSize + 4.4}%`,
            }
          ]}
        >
          {formattedPillDate}
        </Text>
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
      </Svg>
      {pressables}
      {textLabels}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  pillPressable: {
    position: 'absolute',
    width: 40,
    height: 40,
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  dateLabel: {
    position: 'absolute',
    fontFamily: 'Inter 18pt Black',
    fontSize: '0.6em',
    color: 'black',
    fontWeight: '600',
    transform: [{ translateX: -27 }, { translateY: -9 }],
  },
});
