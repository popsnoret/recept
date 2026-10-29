import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

export default function RecipesScreen() {
  const [activeTab, setActiveTab] = useState("Recept");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingFavorites, setUpdatingFavorites] = useState<number[]>([]);

  const loadRecipes = useCallback(async () => {
    try {
      const [recipeResult, favoriteResult] = await Promise.all([apiRequest<Recipe[]>("/recipes"), apiRequest<Recipe[]>("/favorites")]);

      setRecipes(recipeResult);
      setFavorites(favoriteResult.map((recipe) => String(recipe.id)));
    } catch (error) {
      Alert.alert("Kunde inte hämta recept", error instanceof Error ? error.message : "Något gick fel.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes]),
  );

  async function toggleFavorite(id: number) {
    if (updatingFavorites.includes(id)) {
      return;
    }

    const recipeId = String(id);
    const wasFavorite = favorites.includes(recipeId);

    setUpdatingFavorites((current) => [...current, id]);

    try {
      if (wasFavorite) {
        await apiRequest(`/favorites/${id}`, {
          method: "DELETE",
        });

        setFavorites((current) => current.filter((favorite) => favorite !== recipeId));
      } else {
        await apiRequest(`/favorites/${id}`, {
          method: "POST",
        });

        setFavorites((current) => (current.includes(recipeId) ? current : [...current, recipeId]));
      }
    } catch (error) {
      Alert.alert("Kunde inte uppdatera favoriter", error instanceof Error ? error.message : "Något gick fel.");
    } finally {
      setUpdatingFavorites((current) => current.filter((favoriteId) => favoriteId !== id));
    }
  }

  const visibleRecipes = activeTab === "Favoriter" ? recipes.filter((recipe) => favorites.includes(String(recipe.id))) : activeTab === "Listor" ? [] : recipes;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Dina recept</Text>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push("/account")}
              accessibilityLabel="Mitt konto"
            >
              <Ionicons
                name="person-outline"
                size={28}
                color="#000"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/add-recipe")}
              accessibilityLabel="Lägg till recept"
            >
              <Ionicons
                name="add"
                size={34}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabs}>
          {["Recept", "Favoriter", "Listor"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#414747"
              style={{ marginTop: 35 }}
            />
          ) : (
            <>
              {visibleRecipes.map((recipe) => {
                const isFavorite = favorites.includes(String(recipe.id));
                const isUpdating = updatingFavorites.includes(recipe.id);

                return (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.recipeCard}
                    onPress={() => router.push(`/recipe/${recipe.id}`)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={recipe.image ? { uri: recipe.image } : require("../assets/images/icon.png")}
                      style={styles.recipeImage}
                    />

                    <View style={styles.recipeInfo}>
                      <Text
                        style={styles.recipeTitle}
                        numberOfLines={1}
                      >
                        {recipe.title}
                      </Text>

                      <View style={styles.details}>
                        <Ionicons
                          name="time-outline"
                          size={23}
                          color="#414747"
                        />
                        <Text style={styles.detailText}>{recipe.cookingTime} min</Text>

                        <Ionicons
                          name="restaurant-outline"
                          size={23}
                          color="#414747"
                        />
                        <Text style={styles.detailText}>{recipe.difficulty}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={(event) => {
                        event.stopPropagation();
                        toggleFavorite(recipe.id);
                      }}
                      disabled={isUpdating}
                      accessibilityRole="button"
                      accessibilityLabel={isFavorite ? "Ta bort från favoriter" : "Lägg till i favoriter"}
                    >
                      <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={35}
                        color={isFavorite ? "#E52D35" : "#000"}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}

              {visibleRecipes.length === 0 && (
                <Text style={styles.emptyText}>
                  {activeTab === "Favoriter"
                    ? "Du har inga favoriter ännu."
                    : activeTab === "Listor"
                      ? "Dina receptlistor kommer snart."
                      : "Du har inga recept ännu."}
                </Text>
              )}
            </>
          )}
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
    minHeight: 100,
    backgroundColor: "#F7FAFA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 10,
  },
  heading: {
    fontSize: 25,
    fontWeight: "800",
    color: "#080808",
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 24,
    backgroundColor: "#AEC9B7",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 24,
    backgroundColor: "#AEC9B7",
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#E0EEEE",
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: "#AEC9B7",
  },
  tabText: {
    fontSize: 18,
    color: "#111",
  },
  activeTabText: {
    fontWeight: "700",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  recipeCard: {
    minHeight: 92,
    backgroundColor: "#F7FAFA",
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  recipeImage: {
    width: 62,
    height: 62,
    borderRadius: 7,
    backgroundColor: "#D0D8D8",
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 13,
    minWidth: 0,
  },
  recipeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#080808",
    marginBottom: 8,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  detailText: {
    fontSize: 17,
    color: "#414747",
    marginRight: 8,
  },
  favoriteButton: {
    marginLeft: 0,
    padding: 2,
    width: 44,
    height: 44,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 35,
    marginHorizontal: 20,
    fontSize: 17,
    color: "#414747",
  },
});
