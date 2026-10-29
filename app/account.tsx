import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AccountScreen() {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Tillbaka"
          >
            <Ionicons
              name="arrow-back"
              size={25}
              color="#080808"
            />
          </TouchableOpacity>

          <Text style={styles.heading}>Mitt konto</Text>
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

            <Text style={styles.name}>Min profil</Text>
            <Text style={styles.email}>Dina kontouppgifter</Text>
          </View>

          <Text style={styles.sectionTitle}>Min receptsamling</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.replace("/recipes")}
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
            onPress={() => alert("Funktionen för kontoinställningar kommer snart.")}
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
            onPress={() => router.replace("/(auth)/login")}
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
  screen: {
    flex: 1,
    backgroundColor: "#202020",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  container: {
    flex: 1,
    backgroundColor: "#E0EEEE",
    borderRadius: 36,
    overflow: "hidden",
  },
  header: {
    minHeight: 85,
    backgroundColor: "#F7FAFA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 24,
    backgroundColor: "#AEC9B7",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 25,
    fontWeight: "800",
    color: "#080808",
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
