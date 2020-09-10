# Esential - Support for WebAssembly in Javascript

Here is your ECMAScripten

## Running with experimental switches

This code relies on a post-MVP feature, multi-value returns. To run from Node, it needs to be started with an experimental flag to enable muti-value returns

### Running jest with switch

node --experimental-wasm-mv node_modules/.bin/jest

### Running ts-node with switch

node --experimental-wasm-mv -r ts-node/register

### setup tests in vscode

Jest: Path To Jest
`node --experimental-wasm-mv node_modules/jest/bin/jest.js`
