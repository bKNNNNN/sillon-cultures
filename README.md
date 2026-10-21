# Sillon, base cultures potagères

Trente légumes et aromatiques courants du potager, décrits pour la Gironde : fenêtres de semis et de plantation, durée de culture, température de base, coefficients d'arrosage, espacements, associations, durée de vie des graines.

Chaque valeur dit d'où elle vient. Une valeur porte `source` seulement si le document cité a été lu et contient cette valeur. Sinon elle porte `estimate: true`. Beaucoup de valeurs sont encore des estimations : les corrections sourcées sont bienvenues.

## Format

Un fichier, `cultures.yaml`, une culture par bloc. Les champs chiffrés suivent la forme :

```yaml
daysToMaturity: { value: 155, source: "FAO-56 tableau 11, ligne Tomato...", estimate: true }
```

| Champ | Sens |
|---|---|
| `id`, `name`, `family` | identifiant, nom, famille botanique (pour la rotation) |
| `aliases` | anciens identifiants qui désignent encore cette culture (`chou` pour `chou-ete`) |
| `sowUnderCover`, `sowDirect`, `transplant` | fenêtres en semaines ISO (`from`, `to`) ; `from > to` quand la fenêtre passe le nouvel an ; une liste de fenêtres quand la culture a deux saisons ; `note` qualifie une fenêtre (« sous voile ») |
| `firstHarvestDays` | délai jusqu'à la première récolte : `days` (entier) et `from` (`sowing` depuis le semis, `transplant` depuis la plantation) ; une liste de deux délais quand la culture se sème en place ou se plante |
| `tBaseC` | température de base en °C |
| `gdd` | degrés-jours jusqu'à la première récolte d'une plante adulte, jamais une durée de saison (voir « Contrat de `gdd` ») ; pour les cultures d'automne et d'hiver, dérivés du délai du catalogue sur les normales de Bordeaux-Mérignac (`scripts/gdd.mjs`) |
| `daysToMaturity` | durée totale de saison FAO, pas une première récolte |
| `spacingCm` | espacement sur le rang et entre rangs |
| `kc` | coefficients culturaux FAO-56 (initial, mi-saison, fin) |
| `frostSensitive` | sensible au gel (ancien champ, suit `frostClass`) |
| `frostClass` | tenue au froid : `tender` (abîmé par une gelée légère), `semi` (par une vraie gelée), `hardy` (pas d'alerte) |
| `chillC` | nuit froide qui abîme un jeune plant, en °C (basilic) |
| `rootDepthM`, `depletionP` | profondeur racinaire et fraction de réserve utilisable sans stress, FAO-56 tableau 22 |
| `germSoilC` | températures du sol pour la germination, en °C : `min`, `optLow`, `optHigh`, `max` |
| `kcStages` | durée des stades du coefficient cultural, en jours (FAO-56 tableau 11) |
| `goodCompanions`, `badCompanions` | associations, par `id` |
| `seedLifespanYears` | durée de vie des graines en années |
| `successionDays` | intervalle de semis échelonnés |
| `maturitySigns` | signes visuels de maturité |

L'en-tête du fichier détaille les limites de chaque source. Lisez-le avant de vous en servir. Pour 15 cultures, les fenêtres de semis et de plantation viennent en entier du calendrier du livret « Graine d'assiette » du Département de la Gironde, au mois près. Ce livret pédagogique a été écrit par le Conseil départemental des jeunes, donc ces fenêtres restent des estimations. Pour d'autres, seul le début de fenêtre vient d'une source aquitaine (Jardiner Malin, un maraîcher bordelais) et la fin reste une estimation. Les fenêtres sans source régionale gardent leur valeur d'origine, plus froide que le Médoc, avec un commentaire au-dessus. Les délais `firstHarvestDays` viennent de fiches nationales et restent des estimations. Les durées de vie des graines viennent toutes du même tableau d'un vendeur de semences.

Les deux fichiers se valident avec [sillon-core](https://github.com/bKNNNNN/sillon-core) 0.4.0 ou plus récent : `node scripts/check.mjs <chemin vers sillon-core/dist/index.js>`. La CI le lance à chaque push. Le contrôle compare aussi chaque champ d'alerte aux tableaux sources recopiés dans `scripts/sources.mjs`, et recalcule les degrés-jours dérivés.

## Contrat de `gdd`

Depuis 0.4.0, `gdd` compte les degrés-jours jusqu'à la première récolte, comme `firstHarvestDays` compte des jours. Ce n'est pas une durée de saison : celle-ci reste `daysToMaturity`. Toute culture qui a `gdd` a aussi un `firstHarvestDays` depuis le semis, et `scripts/check.mjs` le vérifie. Une application qui affiche une date de première récolte et une date de fin de culture doit donc :

- prendre la prévision en degrés-jours de sillon-core (`forecastHarvest`, sorte `gdd`) pour la ligne de première récolte quand la culture a `gdd`, le délai fixe (`forecastFirstHarvest`) restant le repli sans météo ;
- ne jamais tirer la ligne de fin de culture de cette prévision : elle vient de `daysToMaturity`, et disparaît quand elle ne tombe pas après la première récolte.

L'application n'affiche ainsi jamais deux dates pour la même récolte, ni une seconde date plus tôt que la première. sillon-core 0.4.0 lit encore `gdd` comme une saison dans `forecastHarvest` : c'est l'application qui fait ce tri, tant qu'une version de sillon-core ne le fait pas elle-même.

## Noms scientifiques

Depuis 0.5.0, `scientific-names.yaml` donne pour chaque culture la liste de ses noms scientifiques, sans auteur : le nom accepté d'abord, puis les synonymes qu'un service d'identification par photo (Pl@ntNet) peut encore renvoyer. Le fichier est à part pour que sillon-core 0.4.0 à 0.6.0, qui refuse tout champ inconnu dans une culture, lise toujours `cultures.yaml`.

```yaml
- id: chou-chinois
  scientificNames: [Brassica rapa, Brassica rapa subsp. chinensis, Brassica rapa subsp. narinosa, ...]
  source: "GBIF Backbone, lu le 2026-10-21 : Brassica rapa accepte (7903057) ; ..."
```

Chaque `source` donne le statut et la clé GBIF de chaque nom, lus dans le GBIF Backbone Taxonomy le 2026-10-21. Un nom peut désigner plusieurs cultures : la photo ne distingue pas une betterave d'une blette (Beta vulgaris), ni un chou d'été d'un chou d'hiver (Brassica oleracea). Une application qui lit ce fichier doit :

- comparer les noms sans auteur, sans casse, en ignorant le signe hybride (`Fragaria ×ananassa` et `Fragaria x ananassa` sont le même nom) ;
- chercher d'abord le nom complet, avec son rang infraspécifique (`Raphanus sativus var. niger` ne donne que le radis d'hiver) ;
- si aucune culture ne liste ce rang, chercher le binôme seul parmi les cultures qui listent ce binôme (`Brassica oleracea var. italica` propose les deux choux) ;
- proposer toutes les cultures trouvées et laisser le jardinier choisir ;
- quand rien ne correspond, afficher le nom brut et « pas dans la base ».

`scripts/scientific-names.mjs` est la lecture de référence de ce contrat, et `scripts/check.mjs` vérifie que chaque culture a une entrée sourcée et que des noms types donnent les bonnes cultures.

## Versions

Voir [CHANGELOG.md](CHANGELOG.md). Les applications épinglent une étiquette (`v0.4.0`), jamais une branche.

## Contribuer

Pour une correction ou une nouvelle région, ouvrez une pull request avec, pour chaque valeur, la source lue (URL ou référence précise). Une valeur sans source reste acceptée si elle porte `estimate: true`.

## Sources principales

- FAO, *Crop evapotranspiration*, Irrigation and Drainage Paper 56, tableaux 11, 12 et 22.
- Paquet R `FAO56` 1.0 (CRAN), jeux de données extraits du tableau 12.
- Purdue University, Midwestern Regional Climate Center, températures de base.
- CIVAM / DRAAF Auvergne-Rhône-Alpes, calendrier de semis, plantations et récoltes (référence plus froide, non adaptée au Médoc).
- Jardiner Malin, calendrier par climat (Aquitaine) et fiches culture.
- Bordeaux au Vert, article d'un maraîcher bio de Bordeaux sur les semis de février.
- Conseil départemental des jeunes de la Gironde, livret « Graine d'assiette » 2016-2017, calendrier page 11.
- Météo-France, fiche climatologique 1991-2020 de Bordeaux-Mérignac (jours de gel par mois, températures moyennes mensuelles).
- Harrington (UC Davis), températures du sol pour la germination, reproduites par Oregon State University Extension.
- GBIF Backbone Taxonomy, noms scientifiques acceptés et synonymes (`scientific-names.yaml`).
- NC State Extension, « Frost and Freeze Protection for Vegetables » (tenue au froid).
- Truffaut et Bricomarché, fiches produit Vilmorin pour les délais de première récolte.
- Alsagarden, tableau de durée de conservation des graines potagères.
- Kokopelli, calendriers imprimés au dos des sachets de coriandre, roquette, navet, moutarde (Mizuna, Red Giant) et cerfeuil.
- SEMAE, fiche « Plant d'ail, saveur facile à cultiver » (2021).
- CAB Pays de la Loire, fiche technico-économique courgette.
- Réussir, « Le pois d'hiver est adapté à nos climats », pour la date de semis d'automne des pois.

## Licence

[CC BY-SA 4.0](LICENSE). Vous pouvez réutiliser et modifier ces données, y compris à des fins commerciales, en citant « Sillon, base cultures potagères, Pierrick Deniel » et en partageant vos modifications sous la même licence.
