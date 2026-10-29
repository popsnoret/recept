import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { apiRequest } from "../../services/api";

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

type Favorite = {
  id: number;
};

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [checkedInstructions, setCheckedInstructions] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadRecipe() {
        setLoading(true);

        try {
          const result = await apiRequest<Recipe>(`/recipes/${id}`);

          if (active) {
            setRecipe(result);
          }

          try {
            const favorites = await apiRequest<Favorite[]>("/favorites");

            if (active) {
              setIsFavorite(favorites.some((favorite) => Number(favorite.id) === Number(id)));
            }
          } catch (error) {
            console.error("Kunde inte hämta favoriter:", error);
          }
        } catch (error) {
          if (active) {
            Alert.alert("Kunde inte hämta recept", error instanceof Error ? error.message : "Något gick fel.");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      loadRecipe();

      return () => {
        active = false;
      };
    }, [id]),
  );

  async function toggleFavorite() {
    if (favoriteLoading) return;

    setFavoriteLoading(true);

    try {
      if (isFavorite) {
        await apiRequest(`/favorites/${id}`, {
          method: "DELETE",
        });

        setIsFavorite(false);
      } else {
        await apiRequest(`/favorites/${id}`, {
          method: "POST",
        });

        setIsFavorite(true);
      }
    } catch (error) {
      Alert.alert("Kunde inte uppdatera favorit", error instanceof Error ? error.message : "Något gick fel.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  function toggleIngredient(ingredientId: number) {
    setCheckedIngredients((current) => (current.includes(ingredientId) ? current.filter((item) => item !== ingredientId) : [...current, ingredientId]));
  }

  function toggleInstruction(instructionId: number) {
    setCheckedInstructions((current) => (current.includes(instructionId) ? current.filter((item) => item !== instructionId) : [...current, instructionId]));
  }

  function editRecipe() {
    router.push({
      pathname: "/add-recipe",
      params: { id: String(id) },
    });
  }

  function confirmDelete() {
    Alert.alert("Ta bort recept", `Vill du ta bort "${recipe?.title}"? Det går inte att ångra.`, [
      {
        text: "Avbryt",
        style: "cancel",
      },
      {
        text: "Ta bort",
        style: "destructive",
        onPress: deleteRecipe,
      },
    ]);
  }

  async function deleteRecipe() {
    if (deleting) return;

    setDeleting(true);

    try {
      await apiRequest(`/recipes/${id}`, {
        method: "DELETE",
      });

      Alert.alert("Recept borttaget", "Receptet har tagits bort.", [
        {
          text: "OK",
          onPress: () => router.replace("/recipes"),
        },
      ]);
    } catch (error) {
      Alert.alert("Kunde inte ta bort receptet", error instanceof Error ? error.message : "Något gick fel.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
          style={{ marginTop: 40 }}
        />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>Receptet kunde inte hittas.</Text>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Tillbaka</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity
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
              style={styles.title}
              numberOfLines={1}
            >
              {recipe.title}
            </Text>

            <TouchableOpacity
              onPress={toggleFavorite}
              disabled={favoriteLoading}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? "Ta bort favorit" : "Lägg till favorit"}
              style={{
                width: 44,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={34}
                color={isFavorite ? "#E52D35" : "#555"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="time-outline"
                size={15}
                color="#222"
              />
              <Text style={styles.infoText}>{recipe.cookingTime} min</Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name="restaurant-outline"
                size={15}
                color="#222"
              />
              <Text style={styles.infoText}>{recipe.difficulty}</Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name="people-outline"
                size={15}
                color="#222"
              />
              <Text style={styles.infoText}>{recipe.servings} portioner</Text>
            </View>
          </View>

          <Image
            source={recipe.image ? { uri: recipe.image } : require("../../assets/images/icon.png")}
            style={styles.recipeImage}
            resizeMode="cover"
          />

          <SectionHeading title="Ingredienser" />

          <View style={styles.ingredients}>
            {recipe.ingredients.map((ingredient) => {
              const checked = checkedIngredients.includes(ingredient.id);

              return (
                <TouchableOpacity
                  key={ingredient.id}
                  style={styles.ingredientRow}
                  onPress={() => toggleIngredient(ingredient.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  activeOpacity={1}
                >
                  <View style={[styles.checkCircle, !checked && styles.uncheckedCircle]}>
                    {checked && (
                      <Ionicons
                        name="checkmark"
                        size={17}
                        color="#FFFFFF"
                      />
                    )}
                  </View>

                  <Text style={styles.ingredientText}>{ingredient.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <SectionHeading title="Instruktioner" />

          <View style={styles.instructions}>
            {recipe.instructions.map((instruction) => {
              const checked = checkedInstructions.includes(instruction.id);

              return (
                <TouchableOpacity
                  key={instruction.id}
                  style={styles.instructionRow}
                  onPress={() => toggleInstruction(instruction.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                >
                  <View style={[styles.instructionCircle, checked && styles.instructionCircleChecked]}>
                    {checked && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color="#FFF"
                      />
                    )}
                  </View>

                  <Text style={[styles.instructionText, checked && styles.completedText]}>{instruction.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={editRecipe}
              accessibilityRole="button"
            >
              <Ionicons
                name="create-outline"
                size={20}
                color="#111"
              />
              <Text style={styles.editButtonText}>Redigera recept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={confirmDelete}
              disabled={deleting}
              accessibilityRole="button"
            >
              {deleting ? (
                <ActivityIndicator color="#B4232C" />
              ) : (
                <>
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color="#B4232C"
                  />
                  <Text style={styles.deleteButtonText}>Ta bort recept</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionHeadingText}>{title}</Text>
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
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    minHeight: 100,
    backgroundColor: "#F7FAFA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    gap: 10,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: "#080808",
  },
  infoRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 5,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  infoText: {
    fontSize: 15,
    color: "#222",
  },
  recipeImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#D0D8D8",
  },
  sectionHeading: {
    minHeight: 44,
    backgroundColor: "#DDECEC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  sectionHeadingText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#080808",
  },
  ingredients: {
    paddingVertical: 8,
    backgroundColor: "#F7FAFA",
  },
  ingredientRow: {
    minHeight: 39,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#438847",
    alignItems: "center",
    justifyContent: "center",
  },
  uncheckedCircle: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#777",
  },
  ingredientText: {
    flex: 1,
    fontSize: 17,
    color: "#111",
  },
  completedText: {
    color: "#777",
    textDecorationLine: "line-through",
  },
  instructions: {
    backgroundColor: "#F7FAFA",
  },
  instructionRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0EEEE",
  },
  instructionCircle: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#555",
    alignItems: "center",
    justifyContent: "center",
  },
  instructionCircleChecked: {
    backgroundColor: "#438847",
    borderColor: "#438847",
  },
  instructionText: {
    flex: 1,
    fontSize: 17,
    color: "#111",
  },
  actions: {
    backgroundColor: "#F7FAFA",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 10,
  },
  editButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#DDECEC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#B7CECE",
  },
  editButtonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#FFF5F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E8C5C5",
  },
  deleteButtonText: {
    color: "#B4232C",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 35,
    fontSize: 17,
  },
  backText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
  },
});
