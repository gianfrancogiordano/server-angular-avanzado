const express = require('express');
const mdAuth = require('../middlewares/autenticacion');

const app = express();
const Hospital = require('../models/hospital');

app.get('/', mdAuth.verificarToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({ })
        .skip(desde)
        .limit(5)
        .populate('usuario')
        .exec( (err, hospitalBD) => {

        if( err ) {

            return res.status(400).json({
                ok: false,
                err
            });
        }

        Hospital.count({}, (err, count) => {

            res.status(400).json({
                ok: false,
                hospitalBD,
                count
            });

        });

    });

});

app.post('/', mdAuth.verificarToken, (req, res) => {

    const hospital = new Hospital({

      nombre: req.body.nombre,
      img: null,
      usuario: req.usuario._id

    });

    hospital.save((err, hospitalBD) => {

        if( err ) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando Hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospitalBD
        });

    });

});

app.put('/:id', mdAuth.verificarToken, (req, res) => {

    const id = req.params.id;

    Hospital.findById(id, (err, hospitalBD) => {

        if ( err ) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar el Hospital',
                err
            });

        }

        if ( !hospitalBD ) {

            return res.status(400).json({
                    ok: true,
                    mensaje: 'El hospital no existe',
                    errors: { message: 'No existe un hospital en la BD con ese ID' }
                }
            );
        }

        if ( req.body.nombre ) {
            hospitalBD.nombre = req.body.nombre;
        }

        if ( req.body.img ) {
            hospitalBD.img = req.body.img;
        }

        if ( req.usuario.id ) {
            hospitalBD.usuario = req.usuario.id;
        }

        hospitalBD.save((err, hospitalActualizado) => {

            if ( err ) {
                return res.status(400).json({
                        ok: true,
                        mensaje: 'Error al actualizar hospital',
                        errors: err
                    }
                );
            }

            res.status(200).json({
                ok: true,
                hospitalActualizado
            });

        });

    });

});

app.delete('/:id', mdAuth.verificarToken, (req, res) => {

    const id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalDeleted) => {

        if ( err ) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Ocurrio un error al eliminar el Hospital',
            });
        }

        if ( !hospitalDeleted ) {

            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID en la BD',
            });

        }

        res.status(200).json({
            ok: true,
            mensaje: 'Hospital elimindado correctamente',
            hospitalDeleted
        });



    });

});

module.exports = app;
