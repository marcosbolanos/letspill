import { useState } from 'react';
import { View, StyleSheet, Text } from "react-native";
import { authClient } from "@/utils/auth-client";
import { Button } from "@/components/ui/button";
import ErrorScreen from "@/components/error-screen";

export default function SocialSignIn() {
  const [error, setError] = useState(false)
  const handleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/login/redirect"
      })
    } catch (e) {
      setError(true)
    }
  };
  if (error) {
    return <ErrorScreen />
  };

  return (
    <View style={styles.mainView}>
      <Text style={{ fontSize: 40, textAlign: "center", fontFamily: "Inter 18pt Black", fontWeight: 900 }}>
        Sign in
      </Text>
      <Button icon="google" onPress={handleLogin}>
        {"      "}Continue with Google
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: "beige",
    paddingTop: 130,
    textAlign: "center"
  }
})

