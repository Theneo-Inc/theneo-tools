[![GitHub](https://img.shields.io/badge/GitHub-Repository-brightgreen)](https://github.com/Theneo-Inc/theneo-docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)


Theneo is an npm package designed to simplify the process of documenting API endpoints and generating comprehensive documentation using Theneo. With this library, you can effortlessly create and maintain API documentation by utilizing comments similar to `jsdoc` on each endpoint. The package eliminates the need for writing YAML or JSON, allowing you to focus on your code and documentation simultaneously.

Theneo is a powerful tool that offers a range of features for documenting APIs, including the ability to generate an interactive UI based on the OpenAPI 3 Specification. By integrating Theneo into your workflow, you can streamline your API documentation process and ensure that it stays up-to-date with your codebase.

## Key Features

- Automatically generate API documentation based on comments in your code
- Utilize comments similar to `jsdoc` to describe each endpoint
- Seamlessly integrate with Theneo to create interactive documentation
- Support for the OpenAPI 3 Specification
- Eliminate the need to write YAML or JSON manually
- Generate a UI for easy navigation and testing of your API

## Installation

To install Theneo, use npm:

```shell
npm install theneo
```

## Usage
To generate documentation for your API endpoints using Theneo, follow these steps:

1.  Create a file 'theneo.js' and import the Theneo module:
```javascript
const {
  Theneo,
  ImportOption,
} = require("theneo");
```

2.  Configure the Theneo options:
```javascript
const TheneoOptions = {

  // Obtain your API key from the user settings in Theneo dashboard
  apiKey: "<YOUR_API_KEY>",

  // Obtain the project slug from the project settings in Theneo dashboard
  projectSlug: "<PROJECT_SLUG>",

  // Set the import option to determine how existing documentation is handled
  importOption: ImportOption.OVERWRITE,
};
```

3.  Configure the Spec options:
```javascript
const SpecOptions = {
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
  // Set the base directory to locate your JSDOC files
  baseDir: path.join(__dirname, "../routes"),

  // Set the file pattern to find your JSDOC files
  filesPattern: "./**/*.js",
};

```
4.  Call the generator:
```javascript
Theneo({
  TheneoOptions,
  SpecOptions,
});

```

5. Create a runner script in package.json
```json
"run:theneo": "node scripts/theneo.js"
```

## Components definition


- Endpoint which returns a `Songs` model array in the response.

```javascript
/**
 * GET /api/v1/albums
 * @summary This is the summary of the endpoint
 * @tags album
 * @return {array<Song>} 200 - success response - application/json
 */
app.get("/api/v1/albums", (req, res) =>
  res.json([
    {
      title: "abum 1",
    },
  ])
);
```

- Endpoint PUT with body and path params which returns a `Songs` model array in the response.

```javascript
/**
 * PUT /api/v1/albums/{id}
 * @summary Update album
 * @tags album
 * @param {string} name.path - name param description
 * @param {Song} request.body.required - songs info
 * @return {array<Song>} 200 - success response - application/json
 */
app.put("/api/v1/albums/:id", (req, res) =>
  res.json([
    {
      title: "album 1",
    },
  ])
);
```

-  Basic endpoint definition with tags, params and basic authentication

```javascript
/**
 * GET /api/v1/album
 * @summary This is the summary of the endpoint
 * @security BasicAuth
 * @tags album
 * @param {string} name.query.required - name param description
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
app.get("/api/v1/album", (req, res) =>
  res.json({
    title: "album 1",
  })
);
```

- Basic endpoint definition with code example for response body

```javascript
/**
 * GET /api/v1/albums
 * @summary This is the summary of the endpoint
 * @tags album
 * @return {array<Song>} 200 - success response - application/json
 * @example response - 200 - success response example
 * [
 *   {
 *     "title": "Bury the light",
 *     "artist": "Casey Edwards ft. Victor Borba",
 *     "year": 2020
 *   }
 * ]
 */
app.get("/api/v1/albums", (req, res) =>
  res.json([
    {
      title: "track 1",
    },
  ])
);
```



Thank you for using Theneo! We hope this package helps you streamline your API documentation process and create comprehensive documentation effortlessly. If you have any questions, issues, or feedback, please don't hesitate to reach out to us. Happy documenting!
