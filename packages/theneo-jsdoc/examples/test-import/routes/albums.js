const express = require('express');
const router = express.Router();

/**
 * GET /api/v1/albums
 * @summary This is the summary of the endpoint for albums
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
router.get("/api/v1/albums", (req, res) =>
  res.json([
    {
      title: "track 1",
    },
    {
      title: "track 2",
    },
  ])
);


module.exports = router;