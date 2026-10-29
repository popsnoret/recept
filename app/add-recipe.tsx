import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { apiRequest } from "../services/api";

type Recipe = {
  id: number;
  title: string;
  cookingTime: number;
  difficulty: "Enkel" | "Medel" | "Svår";
  image: string;
  servings: number;
  ingredients: { id: number; text: string }[];
  instructions: { id: number; text: string }[];
};

export default function AddRecipeScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [difficulty, setDifficulty] = useState<"Enkel" | "Medel" | "Svår">("Enkel");
  const [servings, setServings] = useState("4");
  const [image, setImage] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [instructions, setInstructions] = useState([""]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadRecipe() {
        if (!id) {
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");

        try {
          const recipe = await apiRequest<Recipe>(`/recipes/${id}`);

          if (!active) return;

          setTitle(recipe.title);
          setCookingTime(String(recipe.cookingTime));
          setDifficulty(recipe.difficulty);
          setServings(String(recipe.servings));
          setImage(recipe.image || "");
          setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients.map((item) => item.text) : [""]);
          setInstructions(recipe.instructions.length > 0 ? recipe.instructions.map((item) => item.text) : [""]);
        } catch (error) {
          if (active) {
            setError(error instanceof Error ? error.message : "Kunde inte hämta receptet.");
          }
        } finally {
          if (active) setLoading(false);
        }
      }

      loadRecipe();

      return () => {
        active = false;
      };
    }, [id]),
  );

  function updateIngredient(index: number, value: string) {
    setIngredients((current) => current.map((item, i) => (i === index ? value : item)));
  }

  function updateInstruction(index: number, value: string) {
    setInstructions((current) => current.map((item, i) => (i === index ? value : item)));
  }

  async function handleSave() {
    if (saving) return;

    if (!title.trim() || !cookingTime.trim() || !servings.trim() || ingredients.some((item) => !item.trim()) || instructions.some((item) => !item.trim())) {
      setError("Fyll i alla obligatoriska fält innan du fortsätter.");
      return;
    }

    if (!Number.isInteger(Number(cookingTime)) || Number(cookingTime) <= 0 || !Number.isInteger(Number(servings)) || Number(servings) <= 0) {
      setError("Tillagningstid och portioner måste vara positiva heltal.");
      return;
    }

    if (image.trim() && !/^https?:\/\/\S+$/i.test(image.trim())) {
      setError("Ange en giltig bildlänk som börjar med http:// eller https://.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const recipeData = {
        title: title.trim(),
        cookingTime: Number(cookingTime),
        difficulty,
        servings: Number(servings),
        image: image.trim(),
        ingredients: ingredients.map((item) => item.trim()),
        instructions: instructions.map((item) => item.trim()),
      };

      if (isEditing && id) {
        await apiRequest(`/recipes/${id}`, {
          method: "PUT",
          body: recipeData,
        });

        Alert.alert("Recept uppdaterat", "Dina ändringar har sparats.", [
          {
            text: "OK",
            onPress: () => router.replace(`/recipe/${id}`),
          },
        ]);
      } else {
        await apiRequest("/recipes", {
          method: "POST",
          body: recipeData,
        });

        Alert.alert("Recept sparat", "Ditt recept har lagts till.", [
          {
            text: "OK",
            onPress: () => router.replace("/recipes"),
          },
        ]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Kunde inte spara receptet. Försök igen.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingText}>Hämtar recept...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <TouchableOpacity
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

            <Text style={styles.headerTitle}>{isEditing ? "Redigera recept" : "Nytt recept"}</Text>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.intro}>{isEditing ? "Uppdatera informationen i ditt recept." : "Lägg till ett favoritrecept i din samling."}</Text>

            <Text style={styles.label}>Receptnamn *</Text>
            <TextInput
              style={styles.input}
              placeholder="T.ex. Krämig pastasås"
              placeholderTextColor="#777"
              value={title}
              onChangeText={setTitle}
              maxLength={150}
            />

            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <Text style={styles.label}>Tillagningstid (min) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  placeholderTextColor="#777"
                  value={cookingTime}
                  onChangeText={setCookingTime}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.column}>
                <Text style={styles.label}>Portioner *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="4"
                  placeholderTextColor="#777"
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Text style={styles.label}>Svårighetsgrad *</Text>
            <View style={styles.difficultyRow}>
              {(["Enkel", "Medel", "Svår"] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.difficultyButton, difficulty === level && styles.difficultyButtonActive]}
                  onPress={() => setDifficulty(level)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: difficulty === level }}
                >
                  <Text style={[styles.difficultyText, difficulty === level && styles.difficultyTextActive]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Bildlänk</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor="#777"
              value={image}
              onChangeText={setImage}
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredienser *</Text>
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => setIngredients((current) => [...current, ""])}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={21}
                  color="#263D30"
                />
                <Text style={styles.addItemText}>Lägg till</Text>
              </TouchableOpacity>
            </View>

            {ingredients.map((ingredient, index) => (
              <View
                key={index}
                style={styles.itemRow}
              >
                <Text style={styles.itemNumber}>{index + 1}.</Text>

                <TextInput
                  style={[styles.input, styles.itemInput]}
                  placeholder="T.ex. 2 dl mjölk"
                  placeholderTextColor="#777"
                  value={ingredient}
                  onChangeText={(value) => updateIngredient(index, value)}
                />

                {ingredients.length > 1 && (
                  <TouchableOpacity
                    onPress={() => setIngredients((current) => current.filter((_, i) => i !== index))}
                    accessibilityLabel={`Ta bort ingrediens ${index + 1}`}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={23}
                      color="#555"
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Instruktioner *</Text>
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => setInstructions((current) => [...current, ""])}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={21}
                  color="#263D30"
                />
                <Text style={styles.addItemText}>Lägg till</Text>
              </TouchableOpacity>
            </View>

            {instructions.map((instruction, index) => (
              <View
                key={index}
                style={styles.instructionInputRow}
              >
                <Text style={styles.instructionNumber}>{index + 1}</Text>

                <TextInput
                  style={[styles.input, styles.instructionInput]}
                  placeholder="Beskriv steget..."
                  placeholderTextColor="#777"
                  value={instruction}
                  onChangeText={(value) => updateInstruction(index, value)}
                  multiline
                  textAlignVertical="top"
                />

                {instructions.length > 1 && (
                  <TouchableOpacity
                    onPress={() => setInstructions((current) => current.filter((_, i) => i !== index))}
                    accessibilityLabel={`Ta bort instruktion ${index + 1}`}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={23}
                      color="#555"
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {error !== "" && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel={isEditing ? "Spara ändringar" : "Spara recept"}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="#111"
              />
              <Text style={styles.saveButtonText}>{saving ? "Sparar..." : isEditing ? "Spara ändringar" : "Spara recept"}</Text>
            </TouchableOpacity>

            <Text style={styles.requiredNote}>* Obligatoriska fält</Text>
          </ScrollView>
        </KeyboardAvoidingView>
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
    borderRadius: 30,
    overflow: "hidden",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    minHeight: 70,
    backgroundColor: "#F7FAFA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#080808",
  },
  headerSpacer: {
    width: 27,
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  intro: {
    fontSize: 15,
    color: "#414747",
    marginBottom: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    minHeight: 48,
    backgroundColor: "#F7FAFA",
    borderWidth: 1,
    borderColor: "#D0DEDA",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111",
  },
  twoColumns: {
    flexDirection: "row",
    gap: 12,
  },
  column: {
    flex: 1,
  },
  difficultyRow: {
    flexDirection: "row",
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    minHeight: 43,
    borderRadius: 22,
    backgroundColor: "#F7FAFA",
    borderWidth: 1,
    borderColor: "#D0DEDA",
    alignItems: "center",
    justifyContent: "center",
  },
  difficultyButtonActive: {
    backgroundColor: "#AEC9B7",
    borderColor: "#AEC9B7",
  },
  difficultyText: {
    fontSize: 14,
    color: "#222",
  },
  difficultyTextActive: {
    fontWeight: "700",
    color: "#111",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111",
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 5,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#263D30",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 9,
  },
  itemNumber: {
    width: 18,
    fontSize: 15,
    color: "#333",
  },
  itemInput: {
    flex: 1,
  },
  instructionInputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 10,
  },
  instructionNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: "hidden",
    backgroundColor: "#AEC9B7",
    textAlign: "center",
    textAlignVertical: "center",
    paddingTop: 3,
    color: "#111",
    fontWeight: "700",
    marginTop: 10,
  },
  instructionInput: {
    flex: 1,
    minHeight: 76,
    paddingTop: 12,
  },
  error: {
    color: "#B42318",
    fontSize: 14,
    marginTop: 15,
  },
  saveButton: {
    minHeight: 52,
    backgroundColor: "#AEC9B7",
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 28,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
  },
  requiredNote: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginTop: 12,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#E0EEEE",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#111",
  },
});
