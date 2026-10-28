import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { recipes } from "../../data/recipes";

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const recipe = recipes.find((item) => item.id === Number(id));

  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [checkedInstructions, setCheckedInstructions] = useState<number[]>([]);
  const [rating, setRating] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);

  if (!recipe) {
    return (
      <View style={styles.screen}>
        <Text>Receptet kunde inte hittas.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text>Tillbaka</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleIngredient(ingredientId: number) {
    setCheckedIngredients((current) => (current.includes(ingredientId) ? current.filter((item) => item !== ingredientId) : [...current, ingredientId]));
  }

  function toggleInstruction(instructionId: number) {
    setCheckedInstructions((current) => (current.includes(instructionId) ? current.filter((item) => item !== instructionId) : [...current, instructionId]));
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

            <TouchableOpacity accessibilityLabel="Favorit">
              <Ionicons
                name="heart"
                size={25}
                color="#E52D35"
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
                name="flame-outline"
                size={15}
                color="#222"
              />
              <Text style={styles.infoText}>Ugn</Text>
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
            source={{ uri: recipe.image }}
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

          <TouchableOpacity
            style={styles.timerButton}
            onPress={() => setTimerStarted((current) => !current)}
          >
            <Ionicons
              name={timerStarted ? "pause" : "play"}
              size={17}
              color="#111"
            />
            <Text style={styles.timerText}>{timerStarted ? "Pausa timer" : `Starta timer (${recipe.cookingTime} minuter)`}</Text>
          </TouchableOpacity>

          {/* <SectionHeading title="Betyg" />

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                accessibilityLabel={`${star} av 5 stjärnor`}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={32}
                  color={star <= rating ? "#F2C500" : "#777"}
                />
              </TouchableOpacity>
            ))}
          </View> */}

          <SectionHeading title="Historik" />

          <View style={styles.historyCard}>
            <Text style={styles.historyText}>
              Receptet hämtades från:
              {"\n"}Min receptsamling
            </Text>
            <Text style={styles.historyDate}>2026-10-28</Text>
          </View>

          <View style={styles.historyCard}>
            <Text style={styles.historyText}>Uppdaterades av dig</Text>
            <Text style={styles.historyDate}>2026-10-28</Text>
          </View>

          <View style={styles.historyCard}>
            <Text style={styles.historyText}>Recept tillagt</Text>
            <Text style={styles.historyDate}>2026-10-28</Text>
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
    fontSize: 17,
  },
  timerButton: {
    minHeight: 42,
    backgroundColor: "#AEC9B7",
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  timerText: {
    fontSize: 15,
    color: "#111",
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    paddingVertical: 12,
    backgroundColor: "#F7FAFA",
  },
  historyCard: {
    backgroundColor: "#F7FAFA",
    marginHorizontal: 12,
    marginTop: 6,
    padding: 10,
    alignItems: "center",
  },
  historyText: {
    fontSize: 15,
    textAlign: "center",
    color: "#222",
  },
  historyDate: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
  },
});
