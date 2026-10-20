# Journal des versions

## 0.4.0

Champs pour les alertes (gel, arrosage, température du sol) et prévisions d'automne qui ralentissent avec la saison. Il faut sillon-core 0.4.0 ou plus récent : les versions précédentes refusent ces champs. Aucun identifiant ne change. Toutes les valeurs ajoutées portent `estimate: true`, aucune source n'étant propre à la Gironde.

Champs d'alerte, pour les 30 cultures :

- `frostClass`. `tender` pour tomate, courgette, courge, concombre, haricot et basilic : une gelée légère abîme leur feuillage (NC State Extension). `semi` pour la pomme de terre, qui repart du tubercule, et la fraise, dont seule la fleur craint le gel. `hardy` pour les autres. Chou, blette, pois, laitue, moutarde, oignon, radis et navet supportent une gelée forte brève avec un feuillage parfois abîmé ; ils restent `hardy` pour ne pas recevoir une alerte presque chaque nuit d'hiver. `frostSensitive` est inchangé.
- `chillC` : 5 °C pour le basilic (nuit froide pour un jeune plant), estimation.
- `rootDepthM` et `depletionP` : FAO-56 tableau 22, borne basse de la profondeur racinaire, pour un sol sableux. Avec 0,08 m³/m³ d'eau utile, la tomate a une réserve facilement utilisable de 20,7 mm et la laitue de 7,2 mm pour une ETc de 5,75 et 5 mm/j. Poireau, blette, chou chinois, mâche, roquette et moutarde empruntent la ligne d'une culture voisine, et leur source le dit. Basilic, persil, cerfeuil et coriandre : 0,3 m et 0,30, estimation.
- `germSoilC` pour 22 cultures : table de Harrington, convertie de °F en °C. Le chou n'a que le minimum et le maximum, l'optimum imprimé étant une coquille.
- `kcStages` pour 16 cultures : longueurs des stades du tableau 11 de la FAO 56, sur la ligne que `daysToMaturity` cite déjà.

Prévisions d'automne :

- Chou chinois, épinard, roquette, moutarde, radis d'hiver, navet, mâche, blette, betterave, cerfeuil et coriandre ont maintenant `tBaseC` et `gdd`. Aucune source de degrés-jours n'existe pour elles : `gdd` est calculé à partir de leur délai de première récolte, sur une année normale à Bordeaux-Mérignac (`scripts/gdd.mjs`). Le semis de référence tombe dans la fenêtre de semis en place de la culture, au plus près de fin avril (semaine 18) : semaine 18 pour la roquette, la moutarde, la blette, la betterave, le cerfeuil et la coriandre ; début juin (semaine 23) pour le radis d'hiver et le navet, qui ne se sèment pas avant ; début mai (19) pour le chou chinois ; mi-avril (15) pour l'épinard, dont la fenêtre de printemps s'arrête là ; fin août (36) pour la mâche. sillon-core compte ensuite ces degrés-jours sur la météo réelle, en prévision sur une année normale :
  - un radis d'hiver semé le 15 juillet, dans sa fenêtre, arrive vers le 24 septembre, contre le 23 septembre avec le délai fixe de 70 jours ; un navet semé le même jour, vers le 11 septembre contre le 13 ;
  - un chou chinois semé le 8 septembre est annoncé vers le 28 octobre (délai fixe : 23 octobre) ; semé le 1er octobre, vers la fin décembre au lieu du 15 novembre ;
  - un épinard semé le 2 mars arrive vers le 28 avril (délai fixe : 13 avril), semé le 15 octobre vers le 23 décembre (délai fixe : 26 novembre).
  Un radis d'hiver semé le 8 septembre, après sa fenêtre, est annoncé début mars : à cette saison, le calcul extrapole et la lumière (jours courts, mi-ombre) n'est pas comptée.

Contrat pour sillon-core et l'application :

- `gdd` compte les degrés-jours jusqu'à la première récolte d'une plante adulte, jamais une durée de saison. La durée de saison reste `daysToMaturity`. Toute culture qui a `gdd` a aussi un `firstHarvestDays` depuis le semis ; `scripts/check.mjs` le vérifie. Aucune culture n'avait `gdd` avant 0.4.0.
- sillon-core 0.4.0 donne la prévision en degrés-jours par `forecastHarvest`, que l'application affichait comme fin de culture (« Récolte vers le … »). Avant d'épingler 0.4.0, l'application doit prendre cette prévision pour la ligne de première récolte quand la culture a `gdd` (le délai fixe de `forecastFirstHarvest` restant le repli), tirer la ligne de fin de culture de `daysToMaturity` seulement, et la retirer quand elle ne tombe pas après la première récolte. Sans ce changement, le chou chinois semé le 8 septembre afficherait deux dates (23 et 28 octobre) et le radis d'hiver semé le 15 juillet une « récolte » plus tôt que sa première récolte.
- Navet : premier délai de culture, 60 jours, d'après la fiche Vilmorin du navet Boule de Neige (« 60-80 jours selon la saison », borne basse).

Contrôle : `scripts/check.mjs` compare chaque nouveau champ aux tableaux sources recopiés dans `scripts/sources.mjs` et recalcule chaque `gdd` dérivé. La CI construit sillon-core v0.4.0.

## 0.3.0

Audit des 19 sachets du propriétaire, le 2026-10-20 : chaque calendrier imprimé a été relu sur la photo, puis comparé à la fiche produit Kokopelli de la variété et à une fiche de semencier indépendante. Aucun identifiant existant ne change.

Nouvelles cultures :

- `radis-hiver` (Brassicacées) : semis en place de juin à août (semaines 23 à 36), première récolte 70 jours après le semis (Vilmorin, Noir Gros Rond d'hiver). Alias `radis-noir`, `radis-noir-rond` et `daikon`. Un radis noir semé le 8 septembre était annoncé prêt le 13 octobre avec le délai du radis de printemps ; il l'est maintenant vers la mi-novembre.
- `chou-chinois` (Brassicacées) : pak choi et tatsoi, semis en place de mai à août (19 à 36), première récolte 45 jours après le semis, espacement 30 × 30 cm. Alias `pak-choi`, `pak-choy`, `bok-choy` et `tatsoi`. Ces sachets étaient rangés sous `chou`, qui désigne le chou cabus d'été.

Corrections :

- Roquette : semis en place de mars à septembre (10 à 40). La fenêtre sous abri de septembre lue en 0.2.1 venait de la légende « *sous abris » du sachet ; ni la pastille ni la fiche Kokopelli ne la donnent.
- Moutarde : seconde fenêtre de semis en place prolongée jusqu'à fin octobre (32 à 44), fenêtre sous abri d'octobre retirée, pour la même raison.
- Coriandre : semis en place jusqu'à fin septembre (15 à 40), sous abri en mars et avril (10 à 18).
- Cerfeuil : sous abri en février et mars (6 à 14).
- Betterave : semis sous abri en février et mars (6 à 14), d'après les deux sachets et fiches Kokopelli.
- Blette : semis sous abri de mars à mai (10 à 22), espacement 30 × 40 cm.

Données ajoutées : premières récoltes pour la roquette (40 jours), la moutarde (40), la coriandre (50) et le cerfeuil (60) ; espacements Kokopelli pour coriandre, roquette, navet, moutarde et cerfeuil ; succession de 15 jours pour la roquette. Toutes ces valeurs portent `estimate: true` : aucune source n'est propre à la Gironde.

## 0.2.1

Cinq cultures ajoutées, lues sur des sachets Kokopelli le 2026-10-20 :

- `coriandre` (Apiacées) : semis sous abri en mars (semaines 10 à 14), semis en place d'avril à août (15 à 36).
- `roquette` (Brassicacées) : semis en place de mars à août (10 à 36), semis sous abri en septembre (37 à 40).
- `navet` (Brassicacées) : semis en place de juin à septembre (23 à 40), sachet Gilfeather.
- `moutarde` (Brassicacées) : une seule culture pour les moutardes à feuilles, sachets Mizuna et Red Giant. Deux fenêtres de semis en place, mars-avril (10 à 18) et août-septembre (32 à 40), puis semis sous abri en octobre (41 à 44). Alias `moutarde-japonaise`, `moutarde-indienne` et `mizuna`.
- `cerfeuil` (Apiacées) : semis sous abri en février (6 à 9), semis en place de mars à septembre (10 à 40).

Les fenêtres reprennent le calendrier imprimé des sachets, au mois près, et gardent `estimate: true`. La durée de vie des graines vient du tableau Alsagarden déjà utilisé en 0.2.0 : coriandre 5 ans, roquette 4 ans, navet 4 ans, cerfeuil 2 ans. La moutarde est absente de ce tableau : 4 ans, estimation sans source. Aucun identifiant existant ne change.

## 0.2.0

Corrections pour un potager du Médoc, d'après la revue agronomique du 2026-10-20. Il faut sillon-core 0.3.0 ou plus récent : le fichier utilise `aliases`, `note` et les listes de `firstHarvestDays`.

Fenêtres corrigées :

- Tomate, plantation : semaines 19 à 25 au lieu de 19 à 36. Un plant mis en place en août ne mûrit pas avant les nuits froides.
- Concombre, plantation : semaines 19 à 27 au lieu de 19 à 36. Le début suit la fiche Jardiner Malin (« pas avant le mois de mai »). La fin de juin est une estimation : aucune source lue ne la donne.
- Pomme de terre : trois fenêtres au lieu d'une (6 à 31). Février seulement sous voile (6 à 10), plantation principale de mi-mars à fin avril (11 à 17), plantation tardive fin juillet (27 à 30).
- Petit pois : printemps 6 à 16 au lieu de 10 à 31, plus un semis d'automne 43 à 47 pour variété rustique.
- Épinard : 6 à 15 et 35 à 41 au lieu de 6 à 18 et 32 à 40, pour éviter la montée en graines de mai et le sol trop chaud d'août.
- Ail : seconde fenêtre facultative 5 à 9 pour l'ail de printemps.

Cultures :

- `chou` est séparé en `chou-ete` et `chou-hiver`, chacun avec ses fenêtres. `chou` reste un alias de `chou-ete` : les plantations déjà enregistrées restent valides. Les associations qui citaient `chou` citent les deux.
- Nouvelles cultures : `feve` (semis de fin d'hiver et d'automne) et `mache` (semis de fin août à octobre).

Données ajoutées :

- `seedLifespanYears` pour toutes les cultures. Les anciennes valeurs n'avaient pas de source : elles sont remplacées par le tableau Alsagarden lu pendant cette révision. Changements : tomate 5 → 3, courge 6 → 3, petit pois 3 → 2, salade 3 → 4, radis 4 → 5. Nouvelles valeurs pour courgette, carotte, betterave, poireau, oignon, ail, pomme de terre, épinard, blette, fraise, basilic et persil.
- `firstHarvestDays` pour ail, poireau, blette, fraise, basilic et persil.
- Courgette et concombre : un second délai compté depuis la plantation (35 et 32 jours), pour qu'un plant acheté n'ait plus une récolte annoncée trois à quatre semaines trop tard.

Toutes les valeurs ajoutées portent `estimate: true`, avec une `source` quand un document a été lu.

## 0.1.0

Première version : vingt cultures, fenêtres de la Gironde, délais `firstHarvestDays` depuis le semis.
