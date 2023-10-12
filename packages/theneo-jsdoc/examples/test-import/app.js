const express = require('express');
const albumsRouter = require('./routes/albums');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/albums', albumsRouter);

module.exports = app;
