# Dreamlight Wiki

Guide Disney Dreamlight Valley (lecture seule) classé par extension : animaux, objets & ingrédients, recettes, quêtes.

- Lancer : `DreamlightWiki-portable.exe` (aucune installation).
- Filtre « Extensions possédées » (mémorisé dans `%APPDATA%/dreamlight-wiki/settings.json`) + recherche globale.
- Toutes les données sont dans `data/ddv.json` (un seul fichier). Les fichiers sources `data/recettes.json`, `animaux.json`, `objets.json`, `quetes_base.json`, `quetes_extensions.json` se refusionnent avec `python tools/build_data.py`.

Développement : `npm install`, puis
- `npm run dev` : Electron + Vite avec rechargement à chaud (les modifs de `src/` s'affichent tout de suite ; relancer si tu modifies `electron/`)
- `npm run dev:web` : uniquement dans le navigateur (http://localhost:5173)
- `npm start` : build + Electron
- `npm run dist:win` : exe portable dans `release/`

## Version web / iPad (GitHub Pages)

- Chaque push sur `main` publie automatiquement `dist/` sur GitHub Pages (`.github/workflows/deploy.yml`).
- Sur l'iPad : ouvrir l'adresse dans **Safari** → Partager → **Sur l'écran d'accueil**. L'app s'ouvre en plein écran et fonctionne hors ligne (`public/sw.js`).
- Les extensions cochées sont mémorisées dans le navigateur (localStorage).
- Après une mise à jour des données, l'iPad affiche la nouvelle version au 2ᵉ lancement. Pour forcer : changer `CACHE` dans `public/sw.js`.
