module.exports = {
  extends: require.resolve('@umijs/max/eslint'),
  rules: {
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-unused-vars': 'warn'
  }
}
