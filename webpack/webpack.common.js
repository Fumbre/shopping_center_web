const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let spritePath = '';

module.exports = {
  entry: './src/js/main.js',
  output: {
    filename: 'js/[name].[contenthash].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    assetModuleFilename: 'assets/[hash][ext][query]',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(gif|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]',
        }
      },
      {
        test: /\.(png|jpe?g)$/i,
        type: 'asset/resource',
        generator: {
          filename: (pathData) => {
            const relativePath = pathData.filename.replace(/^.*assets[\\/]*images[\\/]/, '');
            return `assets/images/${relativePath}`;
          },
        }
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              extract: true,
              spriteFilename: 'assets/images/sprite.[contenthash].svg',
            }
          },
          'svgo-loader'
        ]
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    }),
    new SpriteLoaderPlugin({ plainSprite: true }),
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminGenerate,
        options: {
          plugins: [
            ['imagemin-mozjpeg', { quality: 75 }],
            ['imagemin-pngquant', { quality: [0.65, 0.9] }],
          ],
        },
      },
    }),

    new HtmlWebpackPlugin({
      filename: '../views/partials/webpack-assets.pug',
      templateContent: ({ htmlWebpackPlugin }) => {
        const cssPath = htmlWebpackPlugin.files.css ? htmlWebpackPlugin.files.css[0] : '';
        const jsPath = htmlWebpackPlugin.files.js ? htmlWebpackPlugin.files.js[0] : '';
        return [
          `- var cssPath = "${cssPath}"`,
          `- var jsPath = "${jsPath}"`,
          `- var svgPath = "${spritePath}"`,
        ].join('\n');
      },
      minify: false,
      inject: false,
    }),

    {
      apply: (compiler) => {
        compiler.hooks.thisCompilation.tap('CaptureSpritePathPlugin', (compilation) => {
          const spriteFilenamePattern = /^assets\/images\/sprite\.[a-f0-9]+\.svg$/;

          compilation.hooks.processAssets.tap(
            {
              name: 'CaptureSpritePathPlugin',
              stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
            },
            (assets) => {
              for (const assetName of Object.keys(assets)) {
                if (spriteFilenamePattern.test(assetName)) {
                  spritePath = `/${assetName}`;
                  break;
                }
              }
            }
          );
        });
      },
    },

  ],
};
