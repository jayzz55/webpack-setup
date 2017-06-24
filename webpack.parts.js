exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    historyApiFallback: true,
    stats: 'errors-only',
    host, // Defaults to `localhost`
    port, // Defaults to 8080
    overlay: {
      errors: true,
      warnings: true,
    },
  },
});

exports.lintJavaScript = ({ include, exclude, options }) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include,
        exclude,
        enforce: 'pre',
        loader: 'eslint-loader',
        options,
      },
    ],
  },
});

exports.loadCSS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(scss|sass|css)$/,
        use: ['style-loader'],
      },
      {
        test: /\.(scss|sass|css)$/,
        include: /node_modules/,
        use: ['css-loader', 'fast-sass-loader'],
      },
      {
        test: /\.(scss|sass)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          {
            loader: 'fast-sass-loader',
          }
        ]
      },
    ],
  },
});
