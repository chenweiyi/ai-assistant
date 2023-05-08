module.exports = {
  extends: require.resolve('@umijs/max/stylelint'),
  rules: {
    'function-no-unknown': [true, { ignoreFunctions: ['fadein', 'fadeout'] }]
  }
}
