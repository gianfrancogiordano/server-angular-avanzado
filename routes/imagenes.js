const express = require('express');

const app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (req, res) => {

    const tipo = req.params.tipo;
    const img = req.params.img;

    const pathImage = path.resolve( __dirname, `../uploads/${ tipo }/${ img }` );
    if (fs.existsSync( pathImage )) {

        res.sendFile( pathImage );
    } else {

        const noImage = path.resolve( __dirname, `../uploads/no-img.jpg` );
        res.sendFile( noImage );
    }

});

module.exports = app;
