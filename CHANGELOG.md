# Journal des versions

## 0.2.1

Deux cultures ajoutées, lues sur des sachets Kokopelli le 2026-10-20 :

- `coriandre` (Apiacées) : semis sous abri en mars (semaines 10 à 14), semis en place d'avril à août (15 à 36).
- `roquette` (Brassicacées) : semis en place de mars à août (10 à 36), semis sous abri en septembre (37 à 40).

Les fenêtres reprennent le calendrier imprimé des sachets, au mois près, et gardent `estimate: true`. La durée de vie des graines vient du tableau Alsagarden déjà utilisé en 0.2.0 : coriandre 5 ans, roquette 4 ans. Aucun identifiant existant ne change.

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
