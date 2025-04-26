const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.stage-volcano.com',
    viewportWidth: 1500,
    viewportHeight: 1200,
  },
});
