import { useState } from 'react';
import { Modal, StyleSheet, Pressable, View, Text } from 'react-native';
import { authClient } from '@/utils/auth-client';
import { useAuth } from '@/utils/ctx';
import { GestureResponderEvent } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Button } from '@/components/ui/button'


const settingsModal = ({ onRequestClose, visible = true }: { onRequestClose: (event: GestureResponderEvent) => void, visible?: boolean }) => {
  const signOut = async () => await authClient.signOut()
  const { session } = useAuth();
  let email;
  if (session) {
    email = session.user.email
  } else {
    email = "Email not found. This is a bug, contact the devs"
  }

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
          <Button onPress={() => { signOut() }} >
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

  },
  closeButton: {
    marginLeft: "auto",
  }
})

