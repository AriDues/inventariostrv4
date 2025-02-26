const path = require('path');

module.exports = (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@plugin': path.resolve(__dirname, 'src'), // Apunta a la carpeta del plugin
  };

  return config;
};
