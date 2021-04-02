# Cobblestone

## TODO

- Faire un fichier startup

## Configuration
### Lors de la création du eslintrc.js.

Pour avoir toutes les règles d'un plugin, par exemple le plugin React :

- Copier coller les règles dans la section rules.
- Appliquer une fonction de remplacement par RegExp avec Ctrl + F.
- Search for (react\/[0-9a-z-]+):([A-Za-z0-9 -"]+)(\(fixable\))\*
- Replace by "$1": "off", // $3 - $2

## Modèles

## Vues

### Créer une vue

### Comprendre la props des composants de vue

### Créer un vue grâce à cobblestone-cli




## La non-continuité des instances des factory et des documents

React fonctionne de manière a relancer le rendu d'un élément à chaque fois qu'il détecte un changement dans ses props. Les factory et les documents doivent changer de référence, et donc d'instance, à chacune de leur modification, pour que React refasse le rendu de tous les éléments qui le nécessite. Attention donc à la non-continuité des instances des factory et des documents. À chaque modification, les instances changent. Il est donc inutile, par exemple, d'enregistrer un document dans le store. Préférez enregistrer son id et le retrouver ensuite via view.factories.X.findById(_id).

Un post change la référence de la factory, pas des documents.
Un patch change la référece de la factory et de tous les documents modifiés.
Un delete change la référence de la factory, pas des documents.

## Composants
### Table
### Calendar

