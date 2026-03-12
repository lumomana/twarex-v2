# Twarex - Explorateur d'Archives Twitter

![Twarex Logo](./assets/images/icon.png)

Twarex est une application mobile développée avec Expo et React Native, conçue pour vous permettre d'explorer et d'analyser vos archives Twitter personnelles directement sur votre appareil. Importez votre fichier ZIP d'archive Twitter et naviguez à travers vos tweets, médias, statistiques et plus encore, le tout hors ligne et en toute confidentialité.

## Fonctionnalités Clés

*   **Importation d'Archives Twitter** : Importez facilement votre fichier ZIP d'archive Twitter officiel. L'application traite les données localement, garantissant la confidentialité.
*   **Exploration de la Chronologie** : Visualisez vos tweets par année, mois et jour grâce à une interface intuitive.
*   **Statistiques Détaillées** : Obtenez des aperçus sur vos tendances de publication, votre engagement, et les mots clés les plus utilisés.
*   **Recherche Avancée** : Recherchez des tweets spécifiques par mots-clés et filtres de date.
*   **Support Multilingue** : L'application est disponible en plusieurs langues, dont le français.
*   **Mode Confidentialité Renforcée** : Bloquez l'accès réseau de l'application pour une confidentialité accrue, assurant que vos données ne quittent jamais votre appareil.
*   **Exportation au format Markdown (.md)** : Exportez l'intégralité de votre archive Twitter sous forme de fichier Markdown simple, facile à lire et à partager. Cette fonctionnalité a été récemment améliorée pour garantir un encodage UTF-8 correct et une meilleure lisibilité.

## Technologies Utilisées

*   **Expo** & **React Native** : Pour le développement d'applications mobiles multiplateformes.
*   **TypeScript** : Pour un code plus robuste et maintenable.
*   **Zustand** : Pour une gestion d'état simple et efficace.
*   **JSZip** : Pour la décompression des fichiers ZIP d'archives Twitter.
*   **NativeWind** : Pour un stylisme rapide et réactif avec Tailwind CSS.

## Installation Locale (APK Android)

Pour utiliser Twarex sur votre appareil Android, vous devrez générer un fichier APK. Suivez ces étapes :

### 1. Prérequis

Assurez-vous d'avoir les éléments suivants installés sur votre machine de développement :

*   **Node.js** (version 18 ou supérieure)
*   **npm** ou **pnpm** (pnpm est recommandé)
*   Un compte **Expo** (gratuit sur [expo.dev](https://expo.dev))
*   **Git** (pour cloner le dépôt)

### 2. Cloner le Dépôt

```bash
git clone https://github.com/lumomana/twitter-archive-explorer-stable.git
cd twitter-archive-explorer-stable/twitter-explorer-v2
```

### 3. Installation des Dépendances

```bash
pnpm install
# ou npm install
```

### 4. Installation des Outils de Build Expo (EAS CLI)

```bash
pnpm add -g eas-cli
# ou npm install -g eas-cli
```

### 5. Connexion à votre Compte Expo

```bash
eas login
```

### 6. Configuration du Projet EAS (si nécessaire)

Si c'est la première fois que vous lancez un build avec EAS pour ce projet, configurez-le :

```bash
eas build:configure
```

### 7. Génération de l'APK

Vous avez deux options pour générer l'APK :

#### Option A : Build Local (Recommandé si vous avez l'environnement Android)

Cette option compile l'APK directement sur votre machine. Vous devez avoir l'environnement de développement Android (Android SDK, Java) configuré.

```bash
eas build --platform android --profile preview --local
```

#### Option B : Build sur les Serveurs Expo (Plus simple, nécessite une connexion internet)

Cette option utilise les serveurs d'Expo pour compiler l'APK. Vous n'avez pas besoin de configurer l'environnement Android localement.

```bash
eas build --platform android --profile preview
```

Une fois le build terminé, EAS CLI vous fournira un lien pour télécharger le fichier `.apk`.

### 8. Installation de l'APK sur votre Appareil Android

1.  **Transférez le fichier APK** : Copiez le fichier `.apk` généré sur votre téléphone Android (via USB, email, cloud, etc.).
2.  **Ouvrez le fichier APK** : Utilisez un gestionnaire de fichiers sur votre téléphone pour localiser et ouvrir le fichier `.apk`.
3.  **Autorisez l'installation** : Si votre téléphone bloque l'installation, il vous demandera probablement d'autoriser l'installation depuis des sources inconnues pour l'application que vous utilisez (par exemple, votre navigateur ou gestionnaire de fichiers). Activez cette option.
4.  **Installez et Lancez** : Suivez les invites pour installer l'application. Une fois installée, vous pouvez la lancer depuis votre écran d'accueil.

## Utilisation de l'Application

### Importation de votre Archive Twitter

1.  Lancez l'application Twarex.
2.  Naviguez vers l'onglet **Archive** (généralement l'icône utilisateur).
3.  Appuyez sur **Gestion des données**.
4.  Appuyez sur le bouton **Importer une archive ZIP**.
5.  Sélectionnez le fichier ZIP de votre archive Twitter que vous avez téléchargé depuis Twitter.
6.  L'application va traiter l'archive. Une fois l'importation réussie, vous pourrez explorer vos données.

### Comment obtenir votre Archive Twitter

1.  Allez sur [Twitter.com](https://twitter.com) et connectez-vous à votre compte.
2.  Cliquez sur **Plus** dans la barre latérale, puis **Paramètres et confidentialité**.
3.  Allez dans **Votre compte** → **Télécharger une archive de vos données**.
4.  Confirmez votre mot de passe et demandez l'archive.
5.  Twitter vous enverra un e-mail lorsque votre archive sera prête à être téléchargée.
6.  Téléchargez le fichier ZIP et utilisez-le avec Twarex.

## Licence

Ce projet est sous licence **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**. Voir le fichier `LICENSE` pour plus de détails.

## Contribution

Les contributions sont les bienvenues ! Si vous trouvez un bug ou avez une suggestion d'amélioration, n'hésitez pas à ouvrir une issue ou à soumettre une pull request.

--- 
Développé par **lumomana**
