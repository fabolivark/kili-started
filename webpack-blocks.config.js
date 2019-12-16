//webpack.config.js

const webpack               = require('webpack')

const BrowserSyncPlugin     = require('browser-sync-webpack-plugin')
const CleanWebpackPlugin    = require('clean-webpack-plugin')
const ExtractTextPlugin     = require('extract-text-webpack-plugin')
const ImageminPlugin        = require('imagemin-webpack-plugin').default
const path                  = require('path')
const WebpackAssetsManifest = require('webpack-assets-manifest')
const Uglify                = require('uglifyjs-webpack-plugin')
const glob                  = require('glob');

const themeOpts = require('./webpack/theme.config.json')

const makeEntryObj = () => {
  const entryFiles = glob.sync('assets/blocks/*.js', {});
  const entryFilesRegExp = /^assets\/blocks\/(.+)\.js$/;

  return entryFiles.reduce((acc, path) => {
    const match = path.match(entryFilesRegExp)[1];
    acc[match] = `./${path}`;
    return acc;
  }, {});
};

module.exports = (env = {}) => {

  const isProduction = env.production === true;
  const isDevelopment = env.production !== false;

  let config = {
    entry: makeEntryObj(),
    output: {
      path: __dirname + "/dist/",
      filename: 'scripts/[name].js',
      publicPath: '../'
    },
    externals: {
      jquery: 'jQuery',
    },
    devtool: isProduction ? "" : "",
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
                name: "[name].[ext]",
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
              name: "[name].[ext]",
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
              name: "images/[name].[ext]",
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
      new CleanWebpackPlugin('dist/blocks'),
      new BrowserSyncPlugin({
          https: true,
          host: 'localhost',
          port: 3002,
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
      new ImageminPlugin({
         test: '/\.(jpe?g|png|gif|svg)$/i',
         disable: isDevelopment
      }),
      new ExtractTextPlugin({
        filename: "styles/blocks/[name].css",
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
