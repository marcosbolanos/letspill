import { useState } from "react"
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native";
import SettingsButton from "@/components/settings-button";
import SettingsModal from "@/components/settings-modal";

import Blister from '@/components/blister';

export default function Index() {
  const [showModal, setShowModal] = useState(false);

  const now = new Date();
  return (
    <View style={styles.mainView}>
      <SettingsModal visible={showModal} onRequestClose={() => setShowModal(false)} />
      <View style={styles.topBar}>
        <View style={{ width: 54 }}>
        </View>
        <Text>
          <Text style={styles.title1}>Let's
            <Text style={title2}> Pill</Text>
          </Text>
        </Text>
        <Pressable onPress={() => setShowModal(true)}>
          <SettingsButton />
        </Pressable>
      </View>

      <View style={styles.blister}>
        <Blister startDate={now} />
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
