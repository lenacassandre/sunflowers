Webpack permet de regrouper tous les fichiers du projet en un ou plusieurs bundle, afin d'être lu par un navigateur. C'est webpack-dev-server qui permet de dev en local, tout en raffraichissant la page à chaque changement (option --hot).

Babel permet de lire des versions ou syntaxes différentes de JS, comme ES2020 ou React. On indique à webpack d'utiliser babel pour traduire notre code JSX/ES2020 en "common JS".

# PRESETS BABEL
@babel/env permet de traduire l'ECMAscript
@babel/typescript permet de traduire le TS/TSX
@babel/preset-react permet de traduire le JSX/TSX


# Loaders Webpack
Pour JS et JSX : babel-loader.
Pour TS et TSX : ts-loader.
Pour CSS et SASS : style-loader, css-loader et sass-loader.