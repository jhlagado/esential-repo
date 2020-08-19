module.exports = function(bundler) {
  bundler.addAssetType('wat', require.resolve('./WatAsset'));
};
