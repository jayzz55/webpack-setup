const path = require('path');
const { basename, dirname, join, relative, resolve } = require('path');

const webpack = require('webpack');
const glob = require('glob');
const merge = require('webpack-merge');
const parts = require('./webpack.parts');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
  node_modules: path.join(__dirname, 'node_modules'),
  extensions: ['.js', '.jsx', '.css', '.scss', '.sass', '.png', '.jpg', '.svg'],
};

const commonConfig = merge([
  {
    entry: {
      app: PATHS.app,
    },
    output: {
      path: PATHS.build,
      filename: '[name].js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Webpack demo',
      }),
      new DashboardPlugin(),
    ],
    resolve: {
      extensions: PATHS.extensions,
      modules: [
        resolve(PATHS.app),
        resolve(PATHS.node_modules),
      ],
    },
  },
  parts.lintJavaScript({ include: PATHS.app }),
  parts.loadFonts({
    options: {
      name: '[name].[hash:8].[ext]',
    },
  }),
  parts.loadJavaScript({ include: PATHS.app }),
  parts.lodashWebpackPlugin(),
]);

const productionConfig = merge([
  {
    performance: {
      hints: 'warning', // 'error' or false are valid too
      maxEntrypointSize: 250000, // in bytes
      maxAssetSize:      450000, // in bytes
    },
    output: {
      chunkFilename: '[name].[chunkhash:8].js',
      filename:      '[name].[chunkhash:8].js',
      // publicPath:    '/repo-name/',
    },
    plugins: [
      new webpack.HashedModuleIdsPlugin(),
    ],
  },
  parts.clean(PATHS.build),
  parts.compressFiles({
    asset: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.(js|html)$/,
    threshold: 10240,
    minRatio: 0.8,
  }),
  parts.minifyJavaScript(),
  parts.minifyCSS({
    options: {
      discardComments: {
        removeAll: true,
      },
      // Run cssnano in safe mode to avoid
      // potentially unsafe transformations.
      safe: true,
    },
  }),
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*`, { nodir: true }),
  }),
  parts.generateSourceMaps({ type: 'source-map' }),
  parts.extractCSS(),
  parts.loadImages({
    options: {
      limit: 15000,
      name: 'images/[name].[hash:8].[ext]',
    },
  }),
  parts.extractBundles([
    {
      name: 'vendor',

      minChunks: ({ resource }) => (
        resource &&
        resource.indexOf('node_modules') >= 0 &&
        resource.match(/\.js$/)
      ),
    },
    {
      name: 'manifest',
      minChunks: Infinity,
    },
  ]),
  parts.attachRevision(),
  parts.setFreeVariable(
    'process.env.NODE_ENV',
    'production'
  ),
]);

const developmentConfig = merge([
  {
    output: {
      devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
    },
  },
  parts.generateSourceMaps({ type: 'cheap-module-eval-source-map' }),
  parts.devServer({
    // Customize host/port here if needed
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
  parts.loadImages(),
]);

module.exports = (env) => {
  if (env === 'production') {
    return merge(commonConfig, productionConfig);
  }

  return merge(commonConfig, developmentConfig);
};
