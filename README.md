# NeoMusic

Le lecteur de musique de NeoDex : des playlists en ligne (en streaming) ou hors ligne (téléchargées), l'ajout de musiques depuis YouTube, SoundCloud ou Deezer, un égaliseur, un visualiseur, des statistiques d'écoute détaillées, des succès et des niveaux qui débloquent des thèmes, des raccourcis qui marchent partout dans Windows et un petit lecteur flottant.

*English version: [README.en.md](README.en.md)*

## Avant de commencer

L'ajout et le téléchargement de musiques passent par **yt-dlp**, un outil gratuit en Python. S'il manque, NeoMusic le dit et donne la commande : `python -m pip install -U yt-dlp`.

## Playlists

- **Nouvelle playlist** : donne-lui un nom et choisis son mode.
  - **Hors ligne** : chaque musique ajoutée est téléchargée et s'écoute sans connexion.
  - **En ligne** : seule la pochette est gardée ; la musique est diffusée au moment de la lecture.
- Trois playlists sont gérées par NeoMusic et ne se suppriment pas :
  - **Favoris** : les morceaux marqués d'un cœur ;
  - **Radar des sorties** : jusqu'à 24 nouveautés des artistes que tu écoutes, mises à jour chaque semaine ;
  - **Découvertes de la semaine** : 12 morceaux proches de tes goûts, mis à jour chaque semaine.
- Dans une playlist : recherche par titre ou artiste, filtre par durée (moins de 3 min, 3 à 5 min, plus de 5 min) et tri (ajout récent, lecture récente, alphabétique, artiste, date de sortie). La vue **mur de pochettes** remplace la liste par une grille.
- Sélectionne plusieurs morceaux pour les ajouter à une autre playlist, les mettre en favoris ou les supprimer d'un coup. Pour un morceau hors ligne, **Afficher le fichier** ouvre son dossier.

## Ajouter de la musique

- **Rechercher / importer** : tape un nom de musique pour chercher sur YouTube et choisir dans les résultats, ou colle un lien de vidéo ou de playlist YouTube, de piste ou de playlist SoundCloud, ou de piste ou de playlist Deezer.
- **Chercher un artiste** : liste les titres d'un artiste, coche ceux à ajouter.
- **Importer une playlist** : depuis un lien de playlist ou un fichier CSV exporté d'un autre service (colonnes « Track Name » et artiste). L'import peut être annulé ; le bilan indique les morceaux ajoutés, déjà présents et introuvables.
- **Recommandé pour toi** propose un morceau d'après tes écoutes ; **Proposer une autre musique** en tire un autre.

## Lecture

- Lecture, pause, précédent, suivant, lecture aléatoire, barre de progression (avec la forme d'onde du morceau en option), volume et balance gauche / droite.
- **Égaliseur** de 10 bandes, de 31 Hz à 16 kHz, avec des profils prêts (Normal, Bass boost, Bass extreme, Treble, Rock, Electronic, Vocal) et un profil Custom dès qu'on bouge un curseur ; les flèches du profil audio passent d'un profil à l'autre.
- **Limiteur** contre la saturation à fort volume, et **normalisation du volume** entre les morceaux (ReplayGain).
- **Mode sommeil** : arrêt après un nombre de morceaux ou une durée en minutes.
- **Réveil musical** : la lecture démarre à l'heure choisie (HH:MM).
- **Petit lecteur** : une petite fenêtre flottante. Glisser pour la déplacer, clic pour pause ou lecture, double-clic pour revenir à NeoMusic, molette pour le volume.

## Raccourcis globaux

Lecture / pause, morceau précédent et suivant, volume + et −, muet, avancer et reculer de 10 secondes, lecture aléatoire, favori sur le morceau en cours, plein écran et petit lecteur. Ils fonctionnent partout dans Windows, même NeoDex en arrière-plan.

Dans **Options**, clique dans un champ puis appuie sur la combinaison voulue : elle doit contenir Ctrl, Alt ou Maj, sauf les touches F1 à F12 qui peuvent être seules. Retour arrière ou Suppr désactive un raccourci, Échap annule.

## Statistiques

Lectures totales, temps écouté, titres et artistes différents, durée moyenne, jours d'activité, série actuelle et meilleure série, jour le plus actif, écoutes du jour, de la semaine et du mois, activité des 14 derniers jours, répartition par jour de la semaine, top 10 des titres (en lectures et en temps), top 10 des artistes et activité récente.

## Niveaux et succès

- Chaque minute écoutée fait monter ton **niveau** ; il faut de plus en plus de temps d'un niveau au suivant (environ 115 heures d'écoute pour le niveau 100).
- 18 **thèmes** de couleurs, dont 7 qui se débloquent avec le niveau : Onyx (3), Grenat (6), Aube (10), Ambre (16), Abyme (24), Sakura (35) et Néon (50).
- Niveau 100 : le **super visualiseur** (reflet, étincelles, lueur et pulsation des basses).
- Niveau 150 : la pochette en cours devient une **platine vinyle** complète, avec des socles et des bras en bois, pierre ou métal à combiner, débloqués jusqu'au niveau 190.
- Niveau 200 : l'**interface Deluxe**, qui change tout le style de l'appli.
- 34 **succès** à débloquer : nombre d'écoutes, séries de jours, écoute de nuit ou un 25 décembre, favoris, playlists, raccourcis… Clique sur un succès verrouillé pour voir comment l'obtenir.

## Options

- **Affichage** : visualiseur, pochette en cercle, forme d'onde, dates d'ajout et de sortie, style compact, mode petit lecteur, mur de pochettes, mode sans images pour les PC lents, fondu de pochette.
- **Corbeille** : une musique supprimée se restaure pendant 7 jours.
- **Vérifier la bibliothèque** : trouve les fichiers manquants (à retirer ou retélécharger), les doublons et les fichiers qui ne sont dans aucune playlist.
- **Journal** des erreurs (téléchargement, lecture, import) et **poids** de NeoMusic sur le disque, détaillé par catégorie.
- **Capsule** : exporte dans un seul .zip ta bibliothèque avec ses fichiers audio et ses pochettes, ou en réimporte une (elle remplace la bibliothèque actuelle).
- **Importer depuis MuPlayer** : reprend playlists, musiques, pochettes, statistiques, succès, niveau et réglages, en complétant ce qui existe déjà.

## Données et synchronisation

Ta bibliothèque, tes playlists, tes statistiques, tes succès et tes réglages sont enregistrés par NeoDex, sauvegardés et synchronisés entre tes PC si la synchro est activée. Les ajouts et suppressions sont fusionnés des deux côtés ; pour les statistiques et le niveau, la plus haute valeur l'emporte. Sur un autre PC, les musiques hors ligne se retéléchargent toutes seules.

## Installer

Dans NeoDex : **NeoStore → À découvrir → NeoMusic → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
