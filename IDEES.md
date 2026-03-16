# Idées du projet wordevent

---

## L'idée principale
Une map interactive où les utilisateurs peuvent créer des événements géolocalisés, définir une capacité max de participants, et d'autres utilisateurs peuvent voir et rejoindre ces événements directement sur la carte.

## Ce que l'app fait
- Afficher une carte interactive (map)
- Créer un événement sur la carte (avec position, nom, capacité max)
- Voir les événements des autres utilisateurs sur la carte
- Rejoindre un événement (jusqu'à la capacité max)
- Voir combien de personnes ont rejoint un événement
- Supprimer un événement (créateur ou admin)
- Créer des événements **privés** (invisibles sur la map publique)
- Partager un event privé avec des membres spécifiques (par invitation)
- Les events ont une durée (startAt / endAt) — disparaissent automatiquement de la map après la fin
- **Chat de groupe** lié à chaque event rejoint (messagerie groupe uniquement pour l'instant)
- **Points d'intérêt personnels** — poser des marqueurs sur la map qui ne sont pas des events (ex: resto favori) visibles uniquement par soi
- **Map privée/personnalisée** — chaque user a sa propre couche sur la map
- Voir le profil d'un utilisateur

## Pour qui
Tout le monde — grand public.

## Ce qui me plaît dans d'autres apps
Aucune app existante n'est la référence directe — c'est un concept nouveau.
Inspirations possibles : Snapchat (géolocalisation), Meetup (events), Google Maps (POI personnels).

## Fonctionnalités indispensables (MVP)
1. Carte interactive avec events en temps réel
2. Créer / rejoindre / supprimer un event
3. Events publics et privés (invitations)
4. Chat de groupe par event
5. Points d'intérêt personnels sur la map
6. Profil utilisateur
7. Auth (email + Google + Apple)

## Idées bonus (post-MVP)
- Notifications push (event proche, invitation, message chat)
- Filtres sur la map (par date, distance, type d'event)
- Historique des events passés
- Mode "maintenant" — events en cours uniquement
- QR code pour rejoindre un event physiquement
- Réactions sur les events (🔥 👍 etc.)
- Système d'amis — voir les events de ses amis en priorité
- Messages privés entre participants (après le chat groupe)

## Ce qui ne doit PAS être dans l'app
- Publicité
- Algorithme de recommandation intrusif
- Complexité inutile — l'app doit rester simple et rapide

## Vrac / notes
- Le chat est lié à l'event — si tu quittes l'event tu perds l'accès au chat
- Les points d'intérêt personnels sont privés par défaut
- Un event expiré (endAt passé) disparaît de la map mais reste en base
