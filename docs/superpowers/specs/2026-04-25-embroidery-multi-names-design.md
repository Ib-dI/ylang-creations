# Broderie multi-noms — Design Spec
**Date :** 2026-04-25  
**Scope :** Configurateur — étape Broderie (`app/configurateur/page.tsx`)

---

## Contexte

Le configurateur permet actuellement d'ajouter **un seul nom brodé** sur un produit. L'objectif est de permettre jusqu'à **3 noms** empilés verticalement, avec un rendu preview en temps réel fidèle au résultat final.

---

## Contraintes métier

- Maximum **3 noms** par commande
- Tous les noms partagent la **même couleur de fil**
- Le prix de broderie reste **+15€ forfaitaire**, quel que soit le nombre de noms
- La **rotation** de la zone de broderie s'applique à l'ensemble du groupe, sans modification

---

## 1. Modèle de données

### Avant
```ts
interface Configuration {
  embroidery: string;
  embroideryColor: string;
  // ...
}
```

### Après
```ts
interface Configuration {
  embroideries: string[];   // tableau de 1 à 3 éléments, initialisé à [""]
  embroideryColor: string;
  // ...
}
```

**Règles :**
- Initialisé à `[""]` (un seul champ vide)
- Jamais plus de 3 éléments
- Un élément vide (`""`) est autorisé (le champ existe, pas encore rempli)

### Impacts sur la logique existante

| Avant | Après |
|-------|-------|
| `configuration.embroidery.length > 0` | `configuration.embroideries.some(e => e.length > 0)` |
| `if (configuration.embroidery) total += 1500` | `if (configuration.embroideries.some(e => e)) total += 1500` |
| `embroidery: configuration.embroidery \|\| undefined` | `embroidery: configuration.embroideries.filter(Boolean).join(", ") \|\| undefined` |

---

## 2. UI — Étape Broderie

### Champs de saisie

- Chaque nom a son propre `<input>` avec compteur de caractères (max 15 par nom)
- Les inputs sont listés verticalement, numérotés (Nom 1, Nom 2, Nom 3)
- Bouton **×** sur chaque ligne pour supprimer ce nom (visible uniquement si > 1 nom dans la liste)
- Bouton **"+ Ajouter un nom"** affiché sous la liste si :
  - Moins de 3 noms dans la liste
  - Le dernier champ est non vide

### Sélecteur de couleur

Inchangé, reste commun à tous les noms, affiché sous les inputs.

### Comportement

- Supprimer un nom du milieu décale les suivants (splice)
- Ajouter insère un nouveau `""` à la fin du tableau

---

## 3. Rendu preview — `EmbroideryZoneOverlay`

### Changement de signature

```ts
// Avant
interface Props {
  text: string;
  threadColor: string;
  zone: EmbroideryZone;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// Après
interface Props {
  texts: string[];          // noms non vides à afficher
  threadColor: string;
  zone: EmbroideryZone;
  containerRef: React.RefObject<HTMLDivElement | null>;
}
```

### Rendu multi-lignes

- Filtrer `texts` pour ne garder que les non vides
- Si aucun texte → ne rien rendre
- Les `EmbroideryPreview` sont empilés dans un `div` flex-col
- **Espacement** : `marginTop: -PY * scale` sur les lignes 2+ pour compenser le double padding (12px haut + 12px bas entre deux canvas = 24px → réduire à ~6px de gap visuel)
- Le wrapper entier est centré sur `(zone.x, zone.y)` via `transform: translate(-50%, -50%)`

### Effet "poussé vers le haut"

**Naturel par construction** : le groupe est ancré sur son centre. Quand un 2e nom est ajouté, le groupe grandit vers le bas, ce qui fait remonter le 1er nom. La rotation s'applique à tout le groupe via le conteneur parent — l'orientation de chaque nom reste intacte.

### Compensation de descenders

La logique de `verticalCompensation` actuelle décale le groupe vers le bas de `(descender / 2) * scale` pour que les lettres restent visuellement centrées sur l'ancre. Avec plusieurs lignes, la compensation se calcule sur le **dernier** `EmbroideryPreview` (le plus bas), car c'est lui qui détermine le débordement inférieur du groupe. Les canvases intermédiaires n'ont pas de rôle dans ce calcul.

---

## 4. Récapitulatif (Step 4 — Summary)

Dans la section Broderie du résumé :

- **1 nom** : comportement actuel inchangé
- **2-3 noms** : chaque nom affiché sur une ligne séparée, avec le même indicateur de couleur
- Le prix reste `+15€` affiché une seule fois

---

## 5. Panier (cart item)

```ts
embroidery: configuration.embroideries.filter(Boolean).join(", ") || undefined,
embroideryColor: configuration.embroideries.some(e => e) ? configuration.embroideryColor : undefined,
```

---

## 6. Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `app/configurateur/page.tsx` | Modèle de données, UI étape 3, résumé, panier |
| `components/configurator/EmbroideryZoneOverlay.tsx` | `text` → `texts[]`, rendu multi-lignes |

`EmbroideryPreview.tsx` — **non modifié** (API inchangée).

---

## 7. Ce qui n'est PAS dans ce scope

- Prix par nom supplémentaire (forfait unique confirmé)
- Couleur de fil différente par nom
- Alignement individuel par nom
- Persistance en base de données (le panier gère déjà la sérialisation)
