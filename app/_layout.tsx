import { Stack } from "expo-router";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#202020",
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}
