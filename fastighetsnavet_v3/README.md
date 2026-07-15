# Fastighetsnavet v2

Svenskt fastighetsförvaltningssystem med riktig databas, inloggning, roller och CRUD.

## Funktioner

- Inloggning
- Roller: administratör och tekniker
- Dashboard
- Fastigheter
- Hyresgäster
- Felanmälningar
- Arbetsorder
- Skapa, läsa, uppdatera och ta bort poster
- SQLite-databas
- REST API
- Docker-stöd
- Svenskt gränssnitt

## Demoanvändare

**Administratör**
- E-post: admin@fastighetsnavet.se
- Lösenord: Admin123!

**Tekniker**
- E-post: tekniker@fastighetsnavet.se
- Lösenord: Teknik123!

## Start lokalt

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:4000/api

## Docker

```bash
docker compose up --build
```

## Säkerhetsnotering

Detta är en portfolio-MVP. För produktion bör du lägga till:
- miljövariabler och hemlighetshantering
- rate limiting
- säkrare cookie-baserad auth
- CSRF-skydd
- audit log
- backupstrategi
- datavalidering med Zod
