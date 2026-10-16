# Base cultures potagères

Vingt légumes et aromatiques courants du potager, décrits pour la Gironde : fenêtres de semis et de plantation, durée de culture, température de base, coefficients d'arrosage, espacements, associations, durée de vie des graines.

Chaque valeur dit d'où elle vient. Une valeur porte `source` seulement si le document cité a été lu et contient cette valeur. Sinon elle porte `estimate: true`. Beaucoup de valeurs sont encore des estimations : les corrections sourcées sont bienvenues.

## Format

Un fichier, `cultures.yaml`, une culture par bloc. Les champs chiffrés suivent la forme :

```yaml
daysToMaturity: { value: 155, source: "FAO-56 tableau 11, ligne Tomato...", estimate: true }
```

| Champ | Sens |
|---|---|
| `id`, `name`, `family` | identifiant, nom, famille botanique (pour la rotation) |
| `sowUnderCover`, `sowDirect`, `transplant` | fenêtres en semaines ISO (`from`, `to`) ; `from > to` quand la fenêtre passe le nouvel an |
| `tBaseC` | température de base en °C |
| `gdd` | degrés-jours jusqu'à maturité (aucun pour l'instant) |
| `daysToMaturity` | durée totale de saison FAO, pas une première récolte |
| `spacingCm` | espacement sur le rang et entre rangs |
| `kc` | coefficients culturaux FAO-56 (initial, mi-saison, fin) |
| `frostSensitive` | sensible au gel |
| `goodCompanions`, `badCompanions` | associations, par `id` |
| `seedLifespanYears` | durée de vie des graines en années |
| `successionDays` | intervalle de semis échelonnés |
| `maturitySigns` | signes visuels de maturité |

L'en-tête du fichier détaille les limites de chaque source. Lisez-le avant de vous en servir : les fenêtres viennent d'un calendrier d'Auvergne-Rhône-Alpes, plus froid que le Médoc, et ne sont pas encore recalées.

## Contribuer

Pour une correction ou une nouvelle région, ouvrez une pull request avec, pour chaque valeur, la source lue (URL ou référence précise). Une valeur sans source reste acceptée si elle porte `estimate: true`.

## Sources principales

- FAO, *Crop evapotranspiration*, Irrigation and Drainage Paper 56, tableaux 11 et 12.
- Paquet R `FAO56` 1.0 (CRAN), jeux de données extraits du tableau 12.
- Purdue University, Midwestern Regional Climate Center, températures de base.
- CIVAM / DRAAF Auvergne-Rhône-Alpes, calendrier de semis, plantations et récoltes.

## Licence

[CC BY-SA 4.0](LICENSE). Vous pouvez réutiliser et modifier ces données, y compris à des fins commerciales, en citant « Base cultures potagères, Pierrick Deniel » et en partageant vos modifications sous la même licence.
