import { Button } from "react-native";
import { authClient } from "@/utils/auth-client";

export default function SocialSignIn() {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/login/redirect"
    })
  };
  return <Button title="Login with Google" onPress={handleLogin} />;
}
