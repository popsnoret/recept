import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [destination, setDestination] = useState<"/login" | "/recipes" | null>(null);

  useEffect(() => {
    async function checkLogin() {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        setDestination(token ? "/recipes" : "/login");
      } catch {
        setDestination("/login");
      }
    }

    checkLogin();
  }, []);

  if (!destination) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#202020" }}>
        <ActivityIndicator color="#ECF8F9" />
      </View>
    );
  }

  return <Redirect href={destination} />;
}
