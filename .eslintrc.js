module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    es2021: true
  },
  plugins: [
    'jest'
  ],
  extends: [
    'standard',
    'plugin:jest/recommended',
    'plugin:jest/style'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    curly: [ 'warn', 'multi-or-nest' ],
    'default-param-last': 'off',
    'arrow-parens': [ 'warn', 'as-needed' ],
    'no-prototype-builtins': 'off',
    'object-curly-spacing': [ 'warn', 'always' ],
    'array-bracket-spacing': [ 'warn', 'always', {
      singleValue: false,
      objectsInArrays: false,
      arraysInArrays: true
    }]
  }
}
