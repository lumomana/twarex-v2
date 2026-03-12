# Instructions pour générer le fichier APK de Twarex

Comme vous souhaitez utiliser l'application localement, vous devez générer le fichier APK (Android Package) vous-même. Voici les étapes à suivre sur votre ordinateur :

## 1. Prérequis

Assurez-vous d'avoir les éléments suivants installés sur votre machine :
*   **Node.js** (version 18 ou supérieure)
*   **npm** ou **pnpm**
*   Un compte **Expo** (gratuit sur [expo.dev](https://expo.dev))

## 2. Installation des outils de build

Ouvrez un terminal et installez l'outil de ligne de commande Expo Application Services (EAS) :

```bash
npm install -g eas-cli
```

## 3. Connexion à votre compte Expo

Connectez-vous à votre compte Expo dans le terminal :

```bash
eas login
```

## 4. Configuration du projet (si nécessaire)

Si c'est la première fois que vous lancez un build, initialisez le projet EAS :

```bash
eas build:configure
```

## 5. Génération de l'APK

Lancez la commande suivante pour générer le fichier APK pour Android :

```bash
eas build --platform android --profile preview --local
```

**Note sur l'option `--local`** :
*   L'option `--local` permet de compiler l'APK directement sur votre machine au lieu d'utiliser les serveurs d'Expo.
*   Cela nécessite d'avoir configuré l'environnement Android (Android SDK, Java, etc.) sur votre ordinateur.
*   Si vous n'avez pas d'environnement Android configuré, vous pouvez retirer `--local` pour laisser Expo compiler l'APK pour vous (cela peut prendre quelques minutes et nécessite une connexion internet).

## 6. Récupération et Installation

Une fois le build terminé, vous obtiendrez un lien vers le fichier `.apk` (si build sur serveur) ou le fichier sera généré dans votre dossier local.

1.  Transférez le fichier APK sur votre téléphone Android.
2.  Ouvrez le fichier sur votre téléphone.
3.  Si votre téléphone bloque l'installation, allez dans les paramètres et autorisez "l'installation depuis des sources inconnues" pour votre gestionnaire de fichiers ou navigateur.
4.  Installez et lancez **Twarex** !

## 7. Importation de votre archive Twitter

Une fois l'application lancée :
1.  Allez dans l'onglet **Profil**.
2.  Appuyez sur **Paramètres d'archive**.
3.  Appuyez sur **Importer une archive Twitter**.
4.  Sélectionnez votre fichier ZIP d'archive Twitter.
5.  Attendez la fin du traitement et explorez vos tweets !
