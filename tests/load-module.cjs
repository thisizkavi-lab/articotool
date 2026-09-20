const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

module.exports = function loadModule(file, mocks = {}, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const testModule = { exports: {} }
  vm.runInNewContext(code, {
    module: testModule, exports: testModule.exports,
    require: id => Object.hasOwn(mocks, id) ? mocks[id] : require(id),
    console, URL, Blob, Date, crypto: globalThis.crypto, TextEncoder, AbortSignal,
    Request, Response, fetch, process, setTimeout, clearTimeout, ...globals,
  }, { filename: file })
  return testModule.exports
}
