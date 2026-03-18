# Authentification — wordevent

## Flux global

```
[Client]
    |
    |── Email/Password ──→ POST /auth/login    ──→ JWT
    |── Google OAuth   ──→ POST /auth/google  ──→ JWT
    |── Apple Sign In  ──→ POST /auth/apple   ──→ JWT
    |── Facebook       ──→ POST /auth/facebook ──→ JWT
    |
    ↓
[JWT dans le header Authorization: Bearer <token>]
    |
[NestJS JwtGuard vérifie le token à chaque requête]
```

## Endpoints auth

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /auth/register | Inscription email/password |
| POST | /auth/login | Connexion email/password |
| POST | /auth/google | Connexion via Google OAuth |
| POST | /auth/apple | Connexion via Apple Sign In |
| POST | /auth/facebook | Connexion via Facebook |
| POST | /auth/refresh | Rafraîchir le JWT (refresh token) |
| POST | /auth/logout | Révoquer le refresh token |
| GET | /auth/me | Profil de l'utilisateur connecté |

## Sécurité

- Mots de passe hashés avec **bcrypt** (12 rounds)
- **JWT** avec expiration courte (15min) + refresh token (7 jours)
- Apple Sign In obligatoire sur iOS App Store si Google Login présent
- Routes protégées par `JwtAuthGuard`
- Routes admin protégées par `RolesGuard` + `@Roles(Role.ADMIN)`

## Compte admin

- Email : défini dans `.env` → `ADMIN_EMAIL`
- Password : défini dans `.env` → `ADMIN_PASSWORD`
- Créé automatiquement au `npm run seed`
- Role : ADMIN (accès total)
