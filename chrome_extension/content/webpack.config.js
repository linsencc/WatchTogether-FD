module.exports = {
  watch: true,
  devtool: 'cheap-module-source-map',
  entry: __dirname + '/src/js/babel/index.js',
  output: {
    path: __dirname + '/src/js/webpack',
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
};