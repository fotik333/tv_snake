const HTMLWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-inline-script-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    devServer: {
        static: 'dist/no_sound',
        port: 3000
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
            test: /\.(png|jpg|gif|svg|ttf|woff2|css)$/i,
            use: [
              {
                loader: 'url-loader',
                options: {
                  limit: true,
                },
              },
            ],
          },
          {
            test: /\.mp3$/i,
            use: [
              {
                loader: 'file-loader',
                options: {
                  outputPath: 'sounds'
                },
              },
            ],
          }
        ]
    },
    output: {
      publicPath: '',
    },
    plugins: [
        new webpack.DefinePlugin({
          'WITH_SOUND': false
        }),
        new webpack.ProvidePlugin({
          PIXI: 'pixi.js'
        }),
        new HTMLWebpackPlugin({
            // inlineSource: '.js',
            template: 'build/index.html',
            filename: 'index.html',
        }),
        // new HtmlWebpackInlineSourcePlugin()
    ],
};