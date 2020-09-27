module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'index.js'
  },
  mode: 'development',
  // see https://github.com/webpack/webpack-dev-server/issues/1161
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  }
};
