const { Asset } = require('parcel-bundler');

class WatAsset extends Asset {
  constructor(name, pkg, options) {
    super(name, pkg, options);
    this.type = 'js';
    console.log('!!!!!js');
  }

  parse (code) {
    console.log('!!!!!code');
    return code;
  }

  generate() {
    // Send to JS bundler
    console.log('!!!!gen!');

    const content = this.contents.replace(/`/g, '\\`');

    console.log({ x: this });
    console.log({ loaded: this.name });
    console.log({ content });

    return { js: `module.exports = ${JSON.stringify(this)}` };
  }
}

module.exports = WatAsset;
