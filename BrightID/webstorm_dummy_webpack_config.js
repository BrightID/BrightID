/* Dummy config file for webstorm IDE to make it resolve alias imports like
     import emitter from '@/emitter';
   when the resolve alias is defined in babel.config.js.
   To use this go to "Settings -> Languages & Frameworks -> Webpack" and set this file as webpack configuration.
   Origin: https://intellij-support.jetbrains.com/hc/en-us/community/posts/115000507190-Cannot-Resolve-Imports-when-using-babel-resolver
 */

/* eslint-disable */
const babelConfig = require('./babel.config');
const path = require('path');

const getBabelAlias = () => {
  const [_, { alias }] = babelConfig.plugins.find(([name]) => name === 'module-resolver');
  return Object.keys(alias)
    .reduce(
      (acc, key) => ({ ...acc, [key]: path.resolve(__dirname, alias[key]) }),
      {}
    );
};

module.exports = {
  resolve: {
    alias: {
      ...getBabelAlias()
    }
  }
};
