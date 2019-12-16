//webpack.config.js

const webpack               = require('webpack')

const BrowserSyncPlugin     = require('browser-sync-webpack-plugin')
const CleanWebpackPlugin    = require('clean-webpack-plugin')
const ExtractTextPlugin     = require('extract-text-webpack-plugin')
const ImageminPlugin        = require('imagemin-webpack-plugin').default
const path                  = require('path')
const WebpackAssetsManifest = require('webpack-assets-manifest')
const Uglify                = require('uglifyjs-webpack-plugin')

const themeOpts = require('./webpack/theme.config.json')

module.exports = (env = {}) => {

  const isProduction = env.production === true;
  const isDevelopment = env.production !== true;

  let config = {
    entry: {
      main: "./assets/main.js",
      blog: "./assets/blog.js",
      admin: "./assets/admin.js"
    },
    output: {
      path: __dirname + "/dist/",
      filename: isProduction ? 'scripts/[name]-[hash].js' : 'scripts/[name].js',
      publicPath: '../'
    },
    externals: {
      jquery: 'jQuery',
    },
    devtool: isProduction ? "" : "inline-source-map",
    module: {
      rules: [
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, 'assets'),
        use: ExtractTextPlugin.extract({
          use: [{
            loader: "css-loader", options: {
              sourceMap: isDevelopment,
              minimize: isProduction
            }
          }, {
            loader: "postcss-loader", options: {
              sourceMap: isDevelopment,
              minimize: isProduction,
              config: {
                path: 'webpack/postcss.config.js'
              }
            }
          }, {
            loader: "sass-loader", options: {
              sourceMap: isDevelopment,
              minimize: isProduction
            }
          }],
          // use style-loader in development
          fallback: "style-loader"
        })
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
            loader: 'file-loader',
            options: {
                name: isProduction ? "[name]-[hash].[ext]" : "[name].[ext]",
                outputPath: 'fonts/'
            }
        }]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: isProduction ? "[name]-[hash].[ext]" : "[name].[ext]",
              outputPath: 'images/'
            }
          }
        ]
      }, {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        include: path.resolve(__dirname, 'assets/css-images'),
        use: [
          {
            loader: 'url-loader',
            options: {
              name: isProduction ? "images/[name]-[hash].[ext]" : "images/[name].[ext]",
              limit: 8192
            }
          }
        ]
      }, {
        test: /\.js$/,
        include: path.resolve(__dirname, 'assets'),
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [["env"]]
          }
        }]
      }]
    },
    plugins: [
      new CleanWebpackPlugin('dist'),
      new BrowserSyncPlugin({
          https: true,
          host: 'localhost',
          port: 3000,
          proxy: themeOpts.proxy,
          files: [
            {
              match: [
                '**/*.twig'
              ],
              fn: function(event, file) {
                  if (event === "change") {
                    const bs = require('browser-sync').get('bs-webpack-plugin');
                    bs.reload();
                  }
                }
              }
            ]
      }),
      new webpack.NoEmitOnErrorsPlugin(),
      new WebpackAssetsManifest({
        output: 'assets.json',
        replacer: require('./webpack/assetManifestsFormatter')
        }),
      new ImageminPlugin({
         test: '/\.(jpe?g|png|gif|svg)$/i',
         disable: isDevelopment
      }),
      new ExtractTextPlugin({
        filename: isProduction ? "styles/[name]-[hash].css" : "styles/[name].css",
      }),
    ]
  }

  if(isProduction) {
    config.plugins.push(
      new Uglify({
       uglifyOptions: {
         compress: { warnings: false },
         sourceMap: false,
       },
       parallel: true,
       sourceMap: false,
      })
    )
  }
  return config
}
