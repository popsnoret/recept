import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AccountScreen() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        const name = await SecureStore.getItemAsync("userName");
        const email = await SecureStore.getItemAsync("userEmail");

        if (!token) {
          router.replace("/(auth)/login");
          return;
        }

        setUserName(name ?? "Min profil");
        setUserEmail(email ?? "");
        setCheckingAuth(false);
      } catch {
        router.replace("/(auth)/login");
      }
    }

    checkAuth();
  }, []);

  async function handleLogout() {
    try {
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("userId");
      await SecureStore.deleteItemAsync("userName");
      await SecureStore.deleteItemAsync("userEmail");

      router.replace("/(auth)/login");
    } catch {
      Alert.alert("Fel", "Det gick inte att logga ut. Försök igen.");
    }
  }

  if (checkingAuth) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#AEC9B7"
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Tillbaka"
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color="#111"
            />
          </TouchableOpacity>

          <Text
            style={styles.heading}
            pointerEvents="none"
          >
            Mitt konto
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Ionicons
                name="person-outline"
                size={42}
                color="#080808"
              />
            </View>

            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.email}>{userEmail}</Text>
          </View>

          <Text style={styles.sectionTitle}>Min receptsamling</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.replace("/recipes")}
            accessibilityRole="button"
          >
            <Ionicons
              name="book-outline"
              size={24}
              color="#080808"
            />
            <Text style={styles.menuText}>Mina recept</Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#414747"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.replace("/recipes")}
            accessibilityRole="button"
          >
            <Ionicons
              name="heart-outline"
              size={24}
              color="#080808"
            />
            <Text style={styles.menuText}>Mina favoriter</Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#414747"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.replace("/recipes")}
            accessibilityRole="button"
          >
            <Ionicons
              name="list-outline"
              size={24}
              color="#080808"
            />
            <Text style={styles.menuText}>Mina listor</Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#414747"
            />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Inställningar</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert("Kontoinställningar", "Funktionen kommer snart.")}
            accessibilityRole="button"
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color="#080808"
            />
            <Text style={styles.menuText}>Kontoinställningar</Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#414747"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            accessibilityRole="button"
          >
            <Ionicons
              name="log-out-outline"
              size={23}
              color="#080808"
            />
            <Text style={styles.logoutText}>Logga ut</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#E0EEEE",
    borderRadius: 36,
    overflow: "hidden",
  },
  header: {
    minHeight: 100,
    backgroundColor: "#F7FAFA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 10,
    paddingTop: 70,
    paddingBottom: 30,
  },
  heading: {
    fontSize: 21,
    fontWeight: "800",
    color: "#080808",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    alignItems: "center",
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
    paddingBottom: 35,
  },
  profile: {
    alignItems: "center",
    paddingVertical: 28,
    marginBottom: 20,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#AEC9B7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#080808",
  },
  email: {
    fontSize: 15,
    color: "#414747",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#414747",
    marginTop: 15,
    marginBottom: 10,
  },
  menuItem: {
    minHeight: 60,
    backgroundColor: "#F7FAFA",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#080808",
  },
  logoutButton: {
    minHeight: 54,
    borderRadius: 25,
    backgroundColor: "#F2E2E1",
    borderWidth: 1,
    borderColor: "#A89A99",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 30,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#080808",
  },
});
