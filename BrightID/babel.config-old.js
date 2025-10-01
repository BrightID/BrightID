const { NODE_ENV } = process.env;

const inProduction = NODE_ENV === 'production';

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-syntax-export-default-from',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
        },
      },
    ],
    [
      'babel-plugin-inline-import',
      {
        extensions: ['.svg'],
      },
    ],
    'react-native-reanimated/plugin',
  ].filter(Boolean), // this will filter any falsy plugins (such as removing transform-remove-console when not in production)
};
