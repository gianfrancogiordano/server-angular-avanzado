const express = require('express');

const app = express();

app.get('/', (req, res, next) => {

    res.status(200).send(
        {
            ok: true,
            mensaje: 'Petición enviada correctamente'
        }
    );

});

module.exports = app;
