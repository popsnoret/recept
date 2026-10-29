import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { apiRequest } from "../../services/api";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password) {
      Alert.alert("Fyll i alla fält", "Ange e-post och lösenord.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiRequest<{
        message: string;
        token: string;
        user: {
          id: number;
          name: string;
          email: string;
        };
      }>("/auth/login", {
        method: "POST",
        body: {
          email: username.trim(),
          password,
        },
      });

      Alert.alert("Inloggad", `Välkommen ${result.user.name}!`, [
        {
          text: "Fortsätt",
          onPress: () => router.replace("/recipes"),
        },
      ]);
    } catch (error) {
      Alert.alert("Kunde inte logga in", error instanceof Error ? error.message : "Ett oväntat fel uppstod.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.background}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.pageTitle}>Logga in</Text>

          <View style={styles.panel}>
            <View style={styles.content}>
              <Text style={styles.logo}>Recept</Text>

              <Text style={styles.description}>Logga in för att se dina recept</Text>

              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="E-post"
                  placeholderTextColor="#858585"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="E-post"
                  returnKeyType="next"
                />

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Lösenord"
                    placeholderTextColor="#858585"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    accessibilityLabel="Lösenord"
                    returnKeyType="done"
                  />

                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Dölj lösenord" : "Visa lösenord"}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={21}
                      color="#171717"
                    />
                  </Pressable>
                </View>

                <Pressable
                  style={styles.primaryButton}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#111111" /> : <Text style={styles.buttonText}>Logga in</Text>}
                </Pressable>
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>Har du inget konto? </Text>

                <Link
                  href="/register"
                  asChild
                >
                  <Pressable accessibilityRole="link">
                    <Text style={styles.switchLink}>Skapa konto</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#202020",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 14,
    paddingBottom: 20,
  },
  pageTitle: {
    color: "#858585",
    fontSize: 22,
    marginBottom: 14,
  },
  panel: {
    flex: 1,
    minHeight: 650,
    backgroundColor: "#ECF8F9",
    borderRadius: 27,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 35,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  logo: {
    fontSize: 25,
    fontWeight: "800",
    color: "#080808",
    marginBottom: 20,
  },
  description: {
    color: "#111111",
    fontSize: 17,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 47,
  },
  form: {
    width: "100%",
    gap: 16,
  },
  input: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 18,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111111",
  },
  passwordContainer: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 18,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111111",
  },
  eyeButton: {
    height: 46,
    width: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    height: 43,
    backgroundColor: "#F2E2E1",
    borderWidth: 1,
    borderColor: "#A89A99",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#111111",
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 32,
  },
  switchText: {
    fontSize: 14,
    color: "#111111",
  },
  switchLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
});
