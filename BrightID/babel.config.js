module.exports = (api) => {
  console.log('api env prod', api.env('production'));
  return {
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
      api.env('production') && [
        'transform-remove-console',
        { exclude: ['error'] },
      ],
    ],
  };
};
