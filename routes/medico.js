const express = require('express');
const mdAuth = require('../middlewares/autenticacion');

const app = express();
const Medico = require('../models/medico');

app.get('/', mdAuth.verificarToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({ })
        .skip(desde)
        .limit(5)
        .populate('hospital')
        .exec(

        (err, medicoBD) => {

        if( err ) {

            return res.status(400).json({
                ok: false,
                err
            });
        }

        Medico.count({}, (err, count) => {

            res.status(400).json({
                ok: false,
                medicoBD,
                total: count
            });

        });

    });

});

app.post('/', mdAuth.verificarToken, (req, res) => {

    const medico = new Medico({

        nombre: req.body.nombre,
        img: null,
        usuario: req.usuario._id,
        hospital: req.body.hospital

    });

    medico.save((err, medicoBD) => {

        if( err ) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando Medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medicoBD
        });

    });

});

app.put('/:id', mdAuth.verificarToken, (req, res) => {

    const id = req.params.id;

    Medico.findById(id, (err, medicoBD) => {

        if ( err ) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar el Medico',
                err
            });

        }

        if ( !medicoBD ) {

            return res.status(400).json({
                    ok: true,
                    mensaje: 'El medico no existe',
                    errors: { message: 'No existe un medico en la BD con ese ID' }
                }
            );
        }

        if ( req.body.nombre ) {
            medicoBD.nombre = req.body.nombre;
        }

        if ( req.body.img ) {
            medicoBD.img = req.body.img;
        }

        if ( req.body.hospital ) {
            medicoBD.hospital = req.body.hospital;
        }

        if ( req.body.usuario ) {
            medicoBD.hospital = req.body.usuario;
        }

        medicoBD.save((err, medicoActualizado) => {

            if ( err ) {
                return res.status(400).json({
                        ok: true,
                        mensaje: 'Error al actualizar el médico',
                        errors: err
                    }
                );
            }

            res.status(200).json({
                ok: true,
                medicoActualizado
            });

        });

    });

});

app.delete('/:id', mdAuth.verificarToken, (req, res) => {

    const id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoDeleted) => {

        if ( err ) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Ocurrio un error al eliminar el Médico',
            });
        }

        if ( !medicoDeleted ) {

            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un Médico con ese ID en la BD',
            });

        }

        res.status(200).json({
            ok: true,
            mensaje: 'Médico elimindado correctamente',
            medicoDeleted
        });


    });

});

module.exports = app;
