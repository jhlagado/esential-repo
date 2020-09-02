# watwasm - wat wasm experimenting

setup tests in vscode
Jest: Path To Jest
The path to the Jest binary, or an npm command to run tests suffixed with `--` e.g. `node_modules/.bin/jest` or `npm test --`

### Running with experimetal switches

Node needs to be run with a flag to enable muti-value returns

#### Running jest with switch
node --experimental-wasm-mv node_modules/.bin/jest

#### Running ts-node with switch
node --experimental-wasm-mv -r ts-node/register
