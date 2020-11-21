module.exports = {
  root: true, 
  parser: "babel-eslint",
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12,
  },
  "rules": {
    "no-mixed-spaces-and-tabs": [2, "smart-tabs"],
    "no-undef": 0,
    "no-unused-vars": 0,
    "indent": ["warn", 2, { "SwitchCase": 1 }],
  }
};
