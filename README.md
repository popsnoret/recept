# Dina recept

<p align="center">
  <img src="screenshots/login.png" width="250" />
  <img src="screenshots/home.png" width="250" />
</p>

## Om appen

Dina recept är en minimalistisk receptapp för personer som vill samla recept från olika källor på ett och samma ställe. Appen gör det enklare att hitta recept, samla personliga favoriter och hålla ordning på sin egen receptsamling – utan reklam eller onödiga funktioner.

Appen har en egen backend och databas där användarkonton och recept sparas separat för varje användare.

## Funktioner

- Registrering och inloggning
- Skapa, visa, redigera och ta bort recept
- Visa recept med ingredienser och instruktioner
- Spara recept kopplade till det egna användarkontot
- Hantera personliga favoriter

## Vidare utveckling

Funktioner som kan läggas till i framtiden:

- Sökfunktion
- Filtrera recept efter exempelvis tillagningstid och kostpreferenser
- Planera måltider
- Importera recept via URL
- Importera recept via skanning
- Logga när ett recept har lagats och lägga till egna anteckningar och betyg

## Skärmar och data

- **Registrering och inloggning:** Skapa konto och logga in med e-post och lösenord.
- **Startsida:** Lista med användarens sparade recept.
- **Detaljsida för recept:** Namn, kategori, tillagningstid, antal portioner, ingredienser och instruktioner.
- **Lägg till/redigera recept:** Formulär för att skapa och ändra recept.
- **Profil:** Användarens kontoinformation och inställningar.

Varje recept kopplas till användaren som har skapat det. Användarkonton och recept sparas i MySQL-databasen och finns kvar även efter att appen har stängts.

## Teknik

- **React Native** – mobilapp
- **Expo och Expo Router** – utveckling och navigation
- **Node.js och Express** – backend och API
- **MySQL** – databas
- **JWT** – autentisering
- **bcrypt** – säker lösenordshashning
- **Docker och Docker Compose** – containerisering och driftsättning
- **GitHub Actions** – automatiserad testning och deployment
- **AWS EC2** – server för backend och databas
- **Nginx** – reverse proxy
- **DuckDNS och Let's Encrypt** – domän och HTTPS

## CI/CD

Projektet använder GitHub Actions för Continuous Integration (CI) och Continuous Deployment (CD).

Vid push till `main` körs automatiskt följande steg:

1. GitHub Actions hämtar den senaste koden.
2. Backendens beroenden installeras.
3. Automatiska tester körs med Jest.
4. En Docker-image byggs.
5. Om testerna och Docker-bygget lyckas ansluter GitHub Actions till AWS EC2 via SSH.
6. Den senaste koden hämtas till servern och backend byggs om och startas om med Docker Compose.

Vid pull requests till `main` körs testerna och Docker-bygget, men ingen deployment genomförs.

På så sätt kontrolleras koden automatiskt innan en ny version driftsätts.

## Deployment

Backend och databas är driftsatta på en AWS EC2-server med Docker Compose.

API-adress: https://dinarecept.duckdns.org

Backend och databas körs i separata Docker-containrar. MySQL använder en persistent Docker-volym så att sparad data finns kvar när containrar startas om.

Nginx fungerar som reverse proxy och HTTPS används för säker kommunikation mellan appen och backend.

Deployment av backend sker automatiskt via GitHub Actions när ändringar pushas till `main` och samtliga kontroller godkänns.

## Lokal utveckling

För att köra projektet lokalt behöver du installera Node.js, npm och Expo.

1. Klona repot.
2. Installera beroenden i appens och backendens mappar.
3. Konfigurera miljövariabler för backend och databas.
4. Starta backend och databas.
5. Starta Expo-appen.

Se till att använda en lokal API-adress i appens konfiguration när du utvecklar lokalt.
