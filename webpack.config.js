module.exports = {
  context: __dirname,
  entry: "./main.js",
  output: {
    path: __dirname,
    filename: "neura.js"
  },
  module: {
  loaders: [
    {
      test: [/\.jsx?$/, /\.js?$/], // Specifies file types to transpile
      exclude: /(node_modules)/, // Leaves dependencies alone
      loader: 'babel', // Sets Babel as the transpiler
      query: {
        presets: ['es2015'] // Tells Babel what syntaxes to translate
      }
    }
  ]
}
};
