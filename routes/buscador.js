const express = require('express');
const mdAuth = require('../middlewares/autenticacion');

const app = express();
const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');


// ===========================================================
//          Busqueda Especifica
// ===========================================================
    app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    const busqueda = req.params.busqueda;
    const tabla = req.params.tabla;
    const regex = new RegExp(busqueda, 'i');

    switch ( tabla ) {

        case 'hospitales':
            promesa = buscarHospitales( busqueda, regex );
            break;

        case 'medicos':
            promesa = buscarMedicos( busqueda, regex );
            break;

        case 'usuarios':
            promesa = buscarUsuarios( busqueda, regex );
            break;

        default:

            res.status(400).json({
                ok: false,
                mensaje: 'Error en el buscador de colecciones'
            });
            break;
    }

    promesa.then( data => {

        res.status(200).json({
            ok: true,
            [tabla]: data,
        });

    }).catch( err => {

        res.status(500).json({
            ok: false,
            mensaje: 'Error interno del servidor',
            err
        });

    });

});

// ===========================================================
//          Busqueda General
// ===========================================================
    app.get('/todo/:busqueda', ( req, res ) => {

        const busqueda = req.params.busqueda;
        const regex = new RegExp(busqueda, 'i');

        Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ]).then( respuesta => {

                res.status(200).json({
                    ok: true,
                    hospitales: respuesta[0],
                    medicos: respuesta[1],
                    usuarios: respuesta[2]
                });

        }).catch((err) => {

            res.status(500).json({
                ok: false,
                mensaje: 'Error interno del servidor',
                err
            });

        });

    });

    const buscarHospitales = (busqueda, regex) => {
        return new Promise( (resolve, reject) =>{

            Hospital.find({ nombre: regex })
                .populate('usuario', 'nombre email')
                .exec((err, hospitalesBD) => {
                if (err)
                    reject('Error al buscar los hospitales');
                else
                    resolve(hospitalesBD);
            });

        });
    }

    const buscarMedicos = (busqueda, regex) => {
        return new Promise( (resolve, reject) =>{

            Medico.find({ nombre: regex })
                .populate('usuario', 'nombre email')
                .populate('hospital')
                .exec( (err, medicosBD) => {

                if ( err )
                    reject(err);
                else
                    resolve(medicosBD);

            });

        });
    }

    const buscarUsuarios = (busqueda, regex) => {
        return new Promise( (resolve, reject) =>{

            Usuario.find()
                .or( [{ nombre: regex }, { email: regex }] )
                .exec((err, usuariosBd) => {

                    if ( err )
                            reject('Error buscando los usuarios');
                    else
                        resolve( usuariosBd );

                });
        });
    }

module.exports = app;
