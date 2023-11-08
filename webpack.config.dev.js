const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    devServer: {
        static: 'dist',
        port: 3000,

    },
    target: ['web', 'es5'],
    module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
              }
            ]
          },
          {
            test: /\.json$/,
            loader: "json-loader",
            type: "javascript/auto"
          },
          {
            test: /\.(png|jpg|gif|svg|ttf|woff2|css|mp3)$/i,
            use: [
              {
                loader: 'url-loader',
                options: {
                  limit: true,
                },
              },
            ],
          },
        ]
    },
    devtool: 'inline-source-map',
    plugins: [
        new webpack.DefinePlugin({
          'WITH_SOUND': true
        }),
        new webpack.ProvidePlugin({
          PIXI: 'pixi.js'
        }),
        new HTMLWebpackPlugin({
            template: 'build/index.html',
            filename: 'index.html',
        }),
    ],
};