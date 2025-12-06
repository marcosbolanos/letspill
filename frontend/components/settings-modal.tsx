import { useState } from 'react';
import { Modal, StyleSheet, Pressable, View, Text } from 'react-native';
import { authClient } from '@/utils/auth-client';
import { useAuth } from '@/utils/ctx';
import AntDesign from '@expo/vector-icons/AntDesign';


const settingsModal = ({ onRequestClose, visible = true }: { onRequestClose: Function, visible?: boolean }) => {
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
      style={styles.modal}
    >
      <Text style={styles.outerView}>
        <View style={styles.innerView}>
          <Pressable style={styles.closeButton} onPress={onRequestClose}>
            <AntDesign name="close" size={24} color="black" />
          </Pressable>
          <Text style={styles.titleText}>
            Settings
          </Text>
          <Text>Signed in as {email}</Text>
          <Text
            onPress={() => {
              // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
              signOut();
            }}>
            Sign Out
          </Text>
        </View>
      </Text>
    </Modal>
  )
}
export default settingsModal

const styles = StyleSheet.create({
  modal: {
    padding: 20
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
    fontSize: 25
  },
  closeButton: {
    marginLeft: "auto",
  }
})

