import { useState, useMemo } from 'react';
import { Modal, StyleSheet, Pressable, View, Text, Platform, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { authClient } from '@/utils/auth-client';
import { useAuth } from '@/utils/ctx';
import { GestureResponderEvent } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { 
  putUserProfilesBodyNewProfileUsernameMin,
  putUserProfilesBodyNewProfileUsernameMax,
  putUserProfilesBodyNewProfileUsernameRegExp
} from '@/api/zod/user-profile/user-profile';


interface SettingsModalProps {
  onRequestClose: (event: GestureResponderEvent) => void;
  visible?: boolean;
  startDate: string;
  onStartDateChange: (date: string) => void;
  username: string | null;
  onUsernameChange: (username: string) => void;
}

const settingsModal = ({ onRequestClose, visible = true, startDate, onStartDateChange, username, onUsernameChange }: SettingsModalProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localUsername, setLocalUsername] = useState(username || '');
  const signOut = async () => await authClient.signOut()
  const { session } = useAuth();
  let email;
  if (session) {
    email = session.user.email
  } else {
    email = "Email not found. This is a bug, contact the devs"
  }

  // Username validation schema
  const usernameSchema = z
    .string()
    .min(putUserProfilesBodyNewProfileUsernameMin, "Username must be at least 3 characters long")
    .max(putUserProfilesBodyNewProfileUsernameMax, "Username must be at most 32 characters long")
    .regex(putUserProfilesBodyNewProfileUsernameRegExp, "Invalid characters in username")
    .refine((val) => !/[_-]{2,}/.test(val), "Separators cannot repeat");

  // Check if save button should be shown
  const showSaveButton = useMemo(() => {
    if (localUsername === (username || '')) return false;
    if (!localUsername.trim()) return false;
    return usernameSchema.safeParse(localUsername.trim()).success;
  }, [localUsername, username]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      // Convert Date to YYYY-MM-DD string
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      onStartDateChange(`${year}-${month}-${day}`);
    }
  };

  const handleWebDateChange = (event: any) => {
    const dateValue = event.target.value;
    if (dateValue) {
      onStartDateChange(dateValue);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No date set';
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatDateForInput = (dateStr: string) => {
    return dateStr || '';
  };

  const handleUsernameSubmit = () => {
    if (localUsername.trim()) {
      onUsernameChange(localUsername.trim());
    }
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
            Settings
          </Text>
          <Text style={styles.settingsText}>Signed in as {email}</Text>

          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Username:</Text>
            <View style={styles.usernameContainer}>
              <TextInput
                style={styles.usernameInput}
                value={localUsername}
                onChangeText={setLocalUsername}
                placeholderTextColor={username ? 'black' : '#856404'}
                placeholder={username || 'Pick a username to receive invites'}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {showSaveButton && (
                <Button onPress={handleUsernameSubmit} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </Button>
              )}
            </View>
          </View>

          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Blister Start Date:</Text>
            <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText} pointerEvents="none">{formatDate(startDate)}</Text>
              {Platform.OS === 'web' && (
                <input
                  type="date"
                  value={formatDateForInput(startDate)}
                  onChange={handleWebDateChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              )}
              <AntDesign name="calendar" size={20} color="black" style={{ pointerEvents: 'none' }} />
            </Pressable>
          </View>

          {showDatePicker && Platform.OS !== 'web' && startDate && (
            <DateTimePicker
              value={new Date(startDate + 'T00:00:00')}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}

          <Button onPress={() => { signOut() }} style={styles.signOutButton}>
            Sign out
          </Button>
        </View>
      </View>
    </Modal>
  )
}
export default settingsModal

const styles = StyleSheet.create({
  modal: {
    padding: 20,
    flex: 1,
  },
  outerView: {
    margin: 38
  },
  innerView: {
    borderRadius: 30,
    backgroundColor: "white",
    height: 800,
    padding: 38,
    outlineStyle: "solid",
    outlineWidth: 3,
    outlineColor: "black"
  },
  titleText: {
    marginTop: 20,
    fontFamily: "Inter 18pt Black",
    fontWeight: 800,
    textAlign: "center",
    fontSize: 25,
    marginBottom: 40
  },
  settingsText: {
    padding: 10,
    marginBottom: 20
  },
  closeButton: {
    marginLeft: "auto",
  },
  settingSection: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'beige',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'black',
  },
  dateText: {
    fontSize: 16,
  },
  signOutButton: {
    marginTop: 40,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderWidth: 2,
    borderColor: '#ffc107',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  usernameContainer: {
    position: 'relative',
    zIndex: 10,
  },
  usernameInput: {
    width: '100%',
    paddingLeft: 15,
    paddingRight: 80,
    paddingVertical: 15,
    backgroundColor: 'beige',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'black',
    fontSize: 16,
    zIndex: 5,
  },
  saveButton: {
    position: 'absolute',
    right: 5,
    top: 5,
    bottom: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minHeight: 0,
    zIndex: 10,
    marginTop: 0,
    alignSelf: 'auto',
  },
  saveButtonText: {
    fontSize: 14,
  }
})

