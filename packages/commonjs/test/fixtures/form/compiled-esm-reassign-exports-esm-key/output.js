import * as commonjsHelpers from "_commonjsHelpers.js";
import { __module as inputModule, exports as input } from "\u0000fixtures/form/compiled-esm-reassign-exports-esm-key/input.js?commonjs-module"

(function (module) {
module.exports = { __esModule: true, default: { foo: 'bar' }}
}(inputModule));

export default /*@__PURE__*/commonjsHelpers.getDefaultExportFromCjs(input);
export { input as __moduleExports };
