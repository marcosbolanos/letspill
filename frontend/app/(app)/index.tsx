import { useState } from "react"
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native";
import SettingsButton from "@/components/settings-button";
import SettingsModal from "@/components/settings-modal";
import PillModal from "@/components/pill-modal";

import Blister from '@/components/blister';

export default function Index() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPillModal, setShowPillModal] = useState(false);
  const [selectedPill, setSelectedPill] = useState<{ index: number; date: Date } | null>(null);
  const [takenPills, setTakenPills] = useState<boolean[]>(new Array(21).fill(false));

  const handlePillPress = (index: number, date: Date) => {
    setSelectedPill({ index, date });
    setShowPillModal(true);
  };

  const handleConfirmPill = () => {
    if (selectedPill) {
      setTakenPills(prev => {
        const newState = [...prev];
        newState[selectedPill.index] = true;
        return newState;
      });
    }
  };

  const handleCancelPill = () => {
    if (selectedPill) {
      setTakenPills(prev => {
        const newState = [...prev];
        newState[selectedPill.index] = false;
        return newState;
      });
    }
  };

  const now = new Date();
  return (
    <View style={styles.mainView}>
      <SettingsModal visible={showSettingsModal} onRequestClose={() => setShowSettingsModal(false)} />
      <PillModal 
        visible={showPillModal} 
        onRequestClose={() => setShowPillModal(false)}
        date={selectedPill?.date}
        taken={selectedPill ? takenPills[selectedPill.index] : false}
        onConfirm={handleConfirmPill}
        onCancel={handleCancelPill}
      />

      <View style={styles.topBar}>
        <View style={{ width: 54 }}>
        </View>
        <Text>
          <Text style={styles.title1}>Let's
            <Text style={title2}> Pill</Text>
          </Text>
        </Text>
        <Pressable onPress={() => setShowSettingsModal(true)}>
          <SettingsButton />
        </Pressable>
      </View>

      <View style={styles.blister}>
        <Blister startDate={now} onPillPress={handlePillPress} takenPills={takenPills} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title1: {
    fontFamily: 'Inter 18pt Black',
    fontSize: 47,
    textAlign: 'center',
    // @ts-ignore
    fontWeight: 'bold',
    marginBottom: 50,
    flexDirection: "column",
  },
  blister: {
    marginHorizontal: 20,
    maxHeight: '80%',
    maxWidth: '100%',
  },
  mainView: {
    flex: 1,
    backgroundColor: 'beige',
    padding: 30,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    position: 'relative'
  },
});

const title2 = StyleSheet.compose(styles.title1, {
  color: 'plum',
})
