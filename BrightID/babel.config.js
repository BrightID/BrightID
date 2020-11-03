const { NODE_ENV } = process.env;

const inProduction = NODE_ENV === 'production';

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.json'],
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
    inProduction && ['transform-remove-console'],
  ].filter(Boolean), // this will filter any falsy plugins (such as removing transform-remove-console when not in production)
};
