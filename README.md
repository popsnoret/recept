# Favoritrecept

## Om appen

Favoritrecept är en minimalistisk receptapp för personer som vill samla recept från olika källor på ett och samma ställe. Appen ska göra det enklare att hitta recept, komma på vad man ska laga och spara personliga favoriter, utan reklam eller onödiga funktioner.

## Funktioner

**Under konstruktion**

- Registrering och inloggning
- Skapa, visa, redigera och ta bort recept
- En receptlista och en detaljsida med ingredienser och instruktioner
- Spara recepten i en databas kopplad till respektive användare

**Vidare utveckling**

- Sökfunktion
- Filtrera recept efter exempelvis tillagningstid, kostpreferenser och andra behov
- Planera måltider
- Importera recept via URL
- Importera recept via skanning
- Logga när ett recept har lagats och lägga till egna anteckningar och betyg

## Skärmar och data

- **Registrering/inloggning:** E-post och lösenord.
- **Startsida:** Lista med användarens sparade recept.
- **Detaljsida för recept:** Namn, kategori, tillagningstid, antal portioner, ingredienser och instruktioner.
- **Lägg till/redigera recept:** Formulär för att skapa och ändra recept.

Varje recept kopplas till den användare som har skapat det. Användarkonton och recept sparas i en databas så att informationen finns kvar efter att appen stängts.

## Teknik och deployment

- React Native med Expo och Expo Router
- Node.js och Express för backend
- MySQL för databas
- JWT för autentisering och bcrypt för lösenordshashning
- Docker för paketering och driftsättning
- GitHub Actions för automatiska tester och CI/CD

Server för backend och databas är alltid aktiv. Appen kommer ha en publik HTTPS-adress.
