import { useState, useEffect, useRef } from 'react';
import { Modal, StyleSheet, Pressable, View, Text, Animated } from 'react-native';
import Svg from 'react-native-svg';
import { authClient } from '@/utils/auth-client';
import { useAuth } from '@/utils/ctx';
import { GestureResponderEvent } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Button } from '@/components/ui/button'
import Pill from '@/components/pill'


interface PillModalProps {
  onRequestClose: (event: GestureResponderEvent) => void;
  visible?: boolean;
  date?: Date | null;
  taken?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const PillModal = ({ onRequestClose, visible = true, date, taken = false, onConfirm, onCancel }: PillModalProps) => {
  const { session } = useAuth();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible || taken) {
      translateY.setValue(0);
      return;
    }

    translateY.setValue(0);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [visible, taken, translateY]);

  const formatFullDate = (date: Date | null | undefined) => {
    if (!date) return '(Full Date)';
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handleConfirm = (event: GestureResponderEvent) => {
    onConfirm?.();
    onRequestClose(event);
  };

  const handleCancel = (event: GestureResponderEvent) => {
    onCancel?.();
    onRequestClose(event);
  };

  return (
    <Modal
      animationType='slide'
      transparent
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.outerView}>
        <View style={styles.innerView}>
          <Pressable style={styles.closeButton} onPress={onRequestClose}>
            <AntDesign name="close" size={24} color="black" />
          </Pressable>
          <Text style={styles.titleText}>
            {formatFullDate(date)}
          </Text>
          <View style={styles.questionView}>
            <Animated.View style={[styles.pillContainer, { transform: [{ translateY }] }]}>
              <Svg width="100" height="100" viewBox="-10 -10 20 20">
                <Pill x={0} y={0} size={4} pillHeight={'100'} taken={taken} showContainer={taken ? true : false} />
              </Svg>
            </Animated.View>
            <Text style={styles.questionText}>
              Have you taken this pill ?
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button onPress={handleCancel} style={button2}>
              No
            </Button>
            <Button onPress={handleConfirm} style={styles.button}>
              Yes
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}
export default PillModal

const styles = StyleSheet.create({
  modal: {
    padding: 20,
  },
  outerView: {
    margin: 38
  },
  innerView: {
    borderRadius: 30,
    backgroundColor: "white",
    height: 450,
    padding: 38,
    outlineStyle: "solid",
    outlineWidth: 3,
    outlineColor: "black"
  },
  titleText: {
    marginTop: 20,
    fontWeight: 800,
    textAlign: "center",
    fontSize: 25,
    marginBottom: 70
  },
  settingsText: {
    padding: 10,

  },
  closeButton: {
    marginLeft: "auto",
  },
  questionView: {
    flex: 1,
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20
  },
  pillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 18,
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 20,
  },
  button: {
    paddingHorizontal: 30,
    marginTop: 100
  }
})

const button2 = StyleSheet.compose(styles.button, {
  backgroundColor: "silver"
})

