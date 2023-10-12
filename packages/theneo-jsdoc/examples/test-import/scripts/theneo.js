const {
  Theneo,
  ImportOption,
} = require("theneo");

const path = require("path");
Theneo({
  TheneoOptions: {

    // Get YOUR_API_KEY from the user settings in Theneo dashboard
    apiKey: "<YOUR_API_KEY>",

    // Get PROJECT_SLUG from project settings in Theneo dashboard
    projectSlug: "<PROJECT_SLUG>",

    importOption: ImportOption.OVERWRITE,
  },
  SpecOptions: {
    info: {
      version: "1.0.0",
      title: "Albums Store",
      license: {
        name: "MIT",
      },
    },
    security: {
      BasicAuth: {
        type: "http",
        scheme: "basic",
      },
    },
    // Base directory which used to locate your JSDOC files
    baseDir: path.join(__dirname, "../routes"),
    // Glob pattern to find your jsdoc files (multiple patterns can be added in an array)
    filesPattern: "./**/*.js",
  },
});
