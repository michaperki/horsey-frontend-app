// babel.config.js
module.exports = {
  presets: [
    ["react-app", { 
      // Enable ES modules support
      absoluteRuntime: false,
      // Enable dynamic imports
      useESModules: true,
    }]
  ]
};