"use strict";

/**
 * L'objectif de ce fichier et de disposer d'un serveur ed développement qui
 * autorise les url qui ne sont pas à la racine. Le routeur client pourra
 * alors changer l'URL sans recevoir de 404.
 */

var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.js')('dev');
var webpack = require('webpack');
var express = require('express');
var proxy = require('proxy-middleware');
var url = require('url');

// --------your proxy----------------------
var app = express();
// proxy the request for static assets
app.use('/assets', proxy(url.parse('http://localhost:8081/assets')));

app.get('/*', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// -----your-webpack-dev-server------------------
var server = new WebpackDevServer(webpack(config), {
    contentBase: __dirname,
    hot: true,
    quiet: false,
    noInfo: false,
    publicPath: "/assets/",

    stats: { colors: true }
});

// run the two servers
server.listen(8081, "localhost", function() {});
app.listen(8080);
