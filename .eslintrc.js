module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    "no-underscore-dangle": 'off',
    "linebreak-style": [0,"error", "windows"],
    "max-len": [1, 1000],
    "prefer-destructuring": ["error", {"object": false, "array": false}],
    "import/no-extraneous-dependencies": ["error", {"devDependencies": true}],
  },
};
