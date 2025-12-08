import { Pressable, Text, StyleSheet, PressableProps, TextStyle, ViewStyle } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import React from "react";

interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  icon?: keyof typeof AntDesign.glyphMap;
  iconSize?: number;
  iconColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  icon,
  iconSize = 22,
  iconColor = "black",
  style,
  textStyle,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        style
      ]}
      {...props}
    >
      <Text style={[styles.text, textStyle]}>
        {icon && (
          <AntDesign
            name={icon}
            size={iconSize}
            color={iconColor}
            style={styles.icon}
          />
        )}
        <Text>{children}</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    marginTop: 140,
    padding: 10,
    borderRadius: 15,
    backgroundColor: "plum",
  },
  buttonPressed: {
    backgroundColor: "#C77DCD",
  },
  text: {
    fontSize: 20,
    fontFamily: "Inter 18pt Black",
    fontWeight: "500",
  },
  icon: {
    position: "absolute",
    translateY: -8,
  },
});
