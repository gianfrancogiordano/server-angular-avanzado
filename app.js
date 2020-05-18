// Requerimientos
const express = require('express');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const appRoutes = require('./routes/app');
const loginRoutes = require('./routes/login');
const medicoRoutes = require('./routes/medico');
const uploadRoutes = require('./routes/upload');
const usuarioRoutes = require('./routes/usuario');
const buscadoRoutes = require('./routes/buscador');
const hospitalRoutes = require('./routes/hospital');
const imagenesRoutes = require('./routes/imagenes');

// Inicializar variables
const app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// Midleware - BodyParser - parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rutas
app.use('/login', loginRoutes);
app.use('/medico', medicoRoutes);
app.use('/upload', uploadRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/buscador', buscadoRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/imagenes', imagenesRoutes);

app.use('/', appRoutes );

// Conectar a Mongo
mongoose.connect('mongodb://localhost:27017/hospitalDB',
    {useNewUrlParser: true, useUnifiedTopology: true}, ( err, res ) => {
        if ( err )
            throw err;

        console.log('[DB - Conectado]');
    });

// Escuchar peticiones
app.listen( 3000, () => {
    console.log('[Server-up] - \x1b[32m%s\x1b[0m', 'http://localhost:3000');
});
