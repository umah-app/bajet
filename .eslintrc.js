module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-unused-vars': ['error', {
      vars: 'all',
      args: 'after-used',
      ignoreRestSiblings: true,
      argsIgnorePattern: '^_',
    }],
    'object-property-newline': ['error', {
      allowAllPropertiesOnSameLine: false,
    }],
  },
};
