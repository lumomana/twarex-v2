# 📦 Instructions de build — Twarex (APK Android)

## Prérequis

- **Node.js** 18+
- **pnpm** (recommandé) ou npm
- Un compte **Expo** gratuit sur [expo.dev](https://expo.dev)
- **EAS CLI** ≥ 12.0.0

## 1. Cloner et installer

```bash
git clone https://github.com/lumomana/twarex-v2.git
cd twarex-v2
pnpm install
```

## 2. Installer EAS CLI

```bash
pnpm add -g eas-cli
# ou
npm install -g eas-cli
```

## 3. Se connecter à Expo

```bash
eas login
```

## 4. Lancer le build preview (APK)

```bash
eas build --platform android --profile preview
```

Une fois le build terminé, EAS te fournit un lien de téléchargement `.apk`.

## 5. Installer l'APK sur Android

1. Copie le `.apk` sur ton téléphone (USB, cloud, email…)
2. Ouvre le fichier avec un gestionnaire de fichiers
3. Autorise l'installation depuis sources inconnues si demandé
4. Lance l'app depuis ton écran d'accueil

---

## Build local (optionnel, nécessite Android SDK)

```bash
eas build --platform android --profile preview --local
```

---

## Profils disponibles

| Profil | Type | Usage |
|---|---|---|
| `development` | APK debug | Dev avec Expo Dev Client |
| `preview` | APK release | Test local/distribution interne |
| `production` | AAB | Google Play Store |
