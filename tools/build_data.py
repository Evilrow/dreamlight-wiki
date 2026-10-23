"""Fusionne data/*.json (sources) en un seul data/ddv.json lu par l'appli."""
import json, pathlib, datetime
D = pathlib.Path(__file__).resolve().parent.parent / "data"
load = lambda n: json.loads((D / f"{n}.json").read_text(encoding="utf-8"))

extensions = [
  {"id": "base",  "nom": "Jeu de base", "sousTitre": "Vallée + mises à jour gratuites", "sortie": "2022-09-06", "payant": False, "couleur": "#8fd3c7"},
  {"id": "rift",  "nom": "A Rift in Time", "sousTitre": "L'Île de l'Éternité", "sortie": "2023-12-05", "payant": True, "couleur": "#f4b183"},
  {"id": "vale",  "nom": "The Storybook Vale", "sousTitre": "Le Val des contes", "sortie": "2024-07-10", "payant": True, "couleur": "#c5a3f0"},
  {"id": "ranch", "nom": "Wishblossom Ranch", "sousTitre": "Ranch de Florespérance", "sortie": "2025-11-19", "payant": True, "couleur": "#f6a6c1"},
]
order = {e["id"]: i for i, e in enumerate(extensions)}

def ids(items, prefix):
    for i, x in enumerate(items):
        x["id"] = f"{prefix}{i}"
    return items

quetes = load("quetes_base") + load("quetes_extensions")
out = {
  "jeu": "Disney Dreamlight Valley",
  "genere": datetime.date.today().isoformat(),
  "extensions": extensions,
  "animaux": ids(sorted(load("animaux"), key=lambda x: order[x["extension"]]), "a"),
  "objets": ids(sorted(load("objets"), key=lambda x: order[x["extension"]]), "o"),
  "recettes": ids(sorted(load("recettes"), key=lambda x: (order[x["extension"]], ["Hors-d'œuvre","Plat principal","Dessert"].index(x["categorie"]), x["etoiles"], x["nom"])), "r"),
  "quetes": ids(sorted(quetes, key=lambda x: order[x["extension"]]), "q"),
}
(D / "ddv.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
print({k: len(v) for k, v in out.items() if isinstance(v, list)})
