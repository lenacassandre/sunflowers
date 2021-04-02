const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const webpack = require("webpack")

// NOTE from  @pmmmwh/react-refresh-webpack-plugin :
// It is suggested to run both `react-refresh/babel` and the plugin in the `development` mode only,
// even though both of them have optimisations in place to do nothing in the `production` mode.
// If you would like to override Webpack's defaults for modes, you can also use the `none` mode -
// you then will need to set `forceEnable: true` in the plugin's options.

module.exports = (_env, argv) => {
  // Mode production ou development
  const dev = argv.mode === "development"
  const prod = argv.mode === "production"

  console.log("MODE", argv.mode)

  return {
    target: "web",

    mode: prod ? "production" : "development",

    // Entry file pour Webpack. Il lira le javascript à partir d'ici.
    entry: [
      // converted entry to an array
      // to allow me to unshift the client later
      path.resolve(__dirname, 'src/index.js')
    ],

    // Output file pour webpack. Il exportera le projet vers ce chemin.
    output: {
      filename: 'bundle.js',
      path: path.join(__dirname, 'public/'),
      publicPath: "/"
    },

    // adding .ts and .tsx to resolve.extensions will help babel look for .ts and .tsx files to transpile
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },

    // Les loader par types de fichier. Ce sont des "traducteurs", qui vont s'occuper de transformer les fichiers du projet en fichiers lisibles par n'importe quel navigateur
    module: {
      rules: [
        {
          test: /\.(js|jsx)?$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.(ts|tsx)?$/,
          exclude: /node_modules/,
          use: 'ts-loader',
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
          ],
        },
        {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'assets/fonts/'
                    }
                }
            ],
        },
      ],
    },
    // Pour que les erreurs puissent afficher le stack du code d'origine, et pas celui du bundle. C'est le source-map.
    devtool: dev ? "source-map" : "source-map",
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      // ... other plugins here
      dev && new ReactRefreshWebpackPlugin(),
    ],
    // Options du serveur de développement
    devServer: {
      host: 'localhost',
      port: 8080,
      disableHostCheck: true,

      open: true, // Ouvre automatiquement le navigateur
      contentBase: path.resolve(__dirname, "public"), // Le dossier rendu public par le serveur de dev
      openPage: "", // Ouvre la racine du dossier public
      //watchContentBase: true, // Indique à webpack qu'il faut également regarder les changement de fichier dans /public. Cela entraine un raffraichissement complet de la page lors des modifications.
      hot: true, // Refresh automatique
      inline: true, // Script de refresh intégré au bundle de dev, pour ne pas refresh la page entièrement,
      historyApiFallback: {
        disableDotRule: true,
        rewrites: [

        ],
      },
    }
  }
}