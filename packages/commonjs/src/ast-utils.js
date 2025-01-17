export { default as isReference } from 'is-reference';

const operators = {
  '==': (x) => equals(x.left, x.right, false),

  '!=': (x) => not(operators['=='](x)),

  '===': (x) => equals(x.left, x.right, true),

  '!==': (x) => not(operators['==='](x)),

  '!': (x) => isFalsy(x.argument),

  '&&': (x) => isTruthy(x.left) && isTruthy(x.right),

  '||': (x) => isTruthy(x.left) || isTruthy(x.right)
};

function not(value) {
  return value === null ? value : !value;
}

function equals(a, b, strict) {
  if (a.type !== b.type) return null;
  // eslint-disable-next-line eqeqeq
  if (a.type === 'Literal') return strict ? a.value === b.value : a.value == b.value;
  return null;
}

export function isTruthy(node) {
  if (!node) return false;
  if (node.type === 'Literal') return !!node.value;
  if (node.type === 'ParenthesizedExpression') return isTruthy(node.expression);
  if (node.operator in operators) return operators[node.operator](node);
  return null;
}

export function isFalsy(node) {
  return not(isTruthy(node));
}

export function getKeypath(node) {
  const parts = [];

  while (node.type === 'MemberExpression') {
    if (node.computed) return null;

    parts.unshift(node.property.name);
    // eslint-disable-next-line no-param-reassign
    node = node.object;
  }

  if (node.type !== 'Identifier') return null;

  const { name } = node;
  parts.unshift(name);

  return { name, keypath: parts.join('.') };
}

export const KEY_COMPILED_ESM = '__esModule';

export function isDefineCompiledEsm(node) {
  const definedProperty =
    getDefinePropertyCallName(node, 'exports') || getDefinePropertyCallName(node, 'module.exports');
  if (definedProperty && definedProperty.key === KEY_COMPILED_ESM) {
    return isTruthy(definedProperty.value);
  }
  return false;
}

function getDefinePropertyCallName(node, targetName) {
  const {
    callee: { object, property }
  } = node;
  if (!object || object.type !== 'Identifier' || object.name !== 'Object') return;
  if (!property || property.type !== 'Identifier' || property.name !== 'defineProperty') return;
  if (node.arguments.length !== 3) return;

  const targetNames = targetName.split('.');
  const [target, key, value] = node.arguments;
  if (targetNames.length === 1) {
    if (target.type !== 'Identifier') {
      return;
    }
  }

  if (targetNames.length === 2) {
    if (target.type !== 'MemberExpression' || target.property.name !== targetNames[1]) {
      return;
    }
  }

  if (value.type !== 'ObjectExpression' || !value.properties) return;

  const valueProperty = value.properties.find((p) => p.key && p.key.name === 'value');
  if (!valueProperty || !valueProperty.value) return;

  // eslint-disable-next-line consistent-return
  return { key: key.value, value: valueProperty.value };
}

export function isShorthandProperty(parent) {
  return parent && parent.type === 'Property' && parent.shorthand;
}

export function hasDefineEsmProperty(node) {
  return node.properties.some((property) => {
    if (
      property.type === 'Property' &&
      property.key.type === 'Identifier' &&
      property.key.name === '__esModule' &&
      isTruthy(property.value)
    ) {
      return true;
    }
    return false;
  });
}
