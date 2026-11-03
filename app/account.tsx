import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

export default function AccountScreen() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        const name = await SecureStore.getItemAsync("userName");
        const email = await SecureStore.getItemAsync("userEmail");
        const userId = await SecureStore.getItemAsync("userId");
        const savedImage = userId ? await SecureStore.getItemAsync(`profileImage_${userId}`) : null;

        setProfileImage(savedImage);

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

  async function pickProfileImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Behörighet saknas", "Du behöver tillåta åtkomst till dina bilder.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;

      setProfileImage(imageUri);
      const userId = await SecureStore.getItemAsync("userId");

      if (userId) {
        await SecureStore.setItemAsync(`profileImage_${userId}`, imageUri);
      }
    }
  }

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
              size={27}
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
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Svg
                    width={112}
                    height={112}
                    viewBox="0 0 76 76"
                  >
                    <Circle
                      cx="38"
                      cy="27"
                      r="15"
                      fill="none"
                      stroke="#000"
                      strokeWidth="2.5"
                    />
                    <Path
                      d="M8 68 C12 48 26 42 38 42 C50 42 64 48 68 68"
                      fill="none"
                      stroke="#000"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </Svg>
                )}
              </View>

              <TouchableOpacity
                style={styles.editIcon}
                onPress={pickProfileImage}
                accessibilityRole="button"
                accessibilityLabel="Byt profilbild"
              >
                <Ionicons
                  name="pencil"
                  size={16}
                  color="#080808"
                />
              </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 30,
  },
  heading: {
    flex: 2,
    textAlign: "center",
    fontSize: 21,
    fontWeight: "800",
    color: "#080808",
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
  avatarWrapper: {
    width: 86,
    height: 86,
    marginBottom: 14,
    position: "relative",
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#AEC9B7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 43,
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
  editIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 13,
    backgroundColor: "#F7FAFA",
    borderWidth: 1,
    borderColor: "#AEC9B7",
    alignItems: "center",
    justifyContent: "center",
  },
});
