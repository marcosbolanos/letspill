import { useState, useEffect } from "react"
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';

import SettingsButton from "@/components/settings-button";
import SettingsModal from "@/components/settings-modal";
import PillModal from "@/components/pill-modal";
import BlistersModal from "@/components/blisters-modal";
import Blister from '@/components/blister';
import LoadingScreen from "@/components/loading-screen";
import ErrorScreen from "@/components/error-screen";

import { useGetLoadApp } from "@/api/orval/load-app/load-app";
import { postPillEvents } from '@/api/orval/pill-events/pill-events';
import { putUserProfiles } from '@/api/orval/user-profile/user-profile';
import { putUserPreferences } from "@/api/orval/user-preferences/user-preferences";

export default function Index() {
  const { data, error, isPending } = useGetLoadApp()

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPillModal, setShowPillModal] = useState(false);
  const [showBlistersModal, setShowBlistersModal] = useState(false);
  const [selectedPill, setSelectedPill] = useState<{ index: number; date: string } | null>(null);
  const [pillStates, setPillStates] = useState<Record<string, boolean>>({ 'loading': true });
  const [startDate, setStartDate] = useState(data?.viewedPreferences?.startDate || '');
  const [username, setUsername] = useState(data?.profile?.username || null);

  // Update variables when data loads
  useEffect(() => {
    if (data) {
      setStartDate(data.viewedPreferences.startDate);
      setPillStates(data.viewedPillStates);
      setUsername(data.profile.username);
    }
  }, [data?.viewedPreferences?.startDate]);

  if (isPending) return <LoadingScreen />;
  if (error) return <ErrorScreen />;
  const greeting = (username || "anonyme") + "'s blister"
  const viewingSelf = data.viewedPreferences.userId === data.profile.userId

  const handlePillPress = (index: number, date: string) => {
    if (viewingSelf) {
      setSelectedPill({ index, date });
      setShowPillModal(true);
    }
  };

  const handleConfirmPill = () => {
    if (selectedPill) {
      setPillStates(prev => ({
        ...prev,
        [selectedPill.date]: true
      }));
      postPillEvents({
        pillEvent: {
          pillDate: selectedPill.date,
          pillTaken: true
        }
      })
    };
  };

  const handleCancelPill = () => {
    if (selectedPill) {
      setPillStates(prev => ({
        ...prev,
        [selectedPill.date]: false
      }));
      postPillEvents({
        pillEvent: {
          pillDate: selectedPill.date,
          pillTaken: false
        }
      })
    };
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    putUserPreferences({ newPreferences: { startDate: date } })
  };

  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername);
    putUserProfiles({
      newProfile: {
        username: newUsername
      }
    });
  };

  return (
    <View style={styles.mainView}>
      <SettingsModal
        visible={showSettingsModal}
        onRequestClose={() => setShowSettingsModal(false)}
        startDate={startDate}
        onStartDateChange={handleStartDateChange}
        username={username}
        onUsernameChange={handleUsernameChange}
      />
      <PillModal
        visible={showPillModal}
        onRequestClose={() => setShowPillModal(false)}
        date={selectedPill?.date}
        taken={selectedPill ? pillStates[selectedPill.date] : false}
        onConfirm={handleConfirmPill}
        onCancel={handleCancelPill}
      />
      <BlistersModal
        visible={showBlistersModal}
        onRequestClose={() => setShowBlistersModal(false)}
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

      <View style={styles.userTextContainer}>
        <Text style={styles.userText}>
          {greeting}{'  '}
        </Text>
        <Pressable onPress={() => setShowBlistersModal(true)}>
          <AntDesign name="eye" size={24} color="black" />
        </Pressable>
      </View>

      <View style={styles.blister}>
        <Blister startDate={data.viewedPreferences.startDate} onPillPress={handlePillPress} pillStates={pillStates} />
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
    marginBottom: 10,
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
  userText: {
    fontFamily: "Inter 18pt Black",
    fontSize: 19,
    textAlign: "center",
  },
  userTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  }
});

const title2 = StyleSheet.create({
  text: {
    ...StyleSheet.flatten(styles.title1),
    color: 'plum',
  }
}).text;
