const express = require('express');
const bcrypt = require('bcrypt');
const mdAuth = require('../middlewares/autenticacion');

const app = express();

const Usuario = require('../models/usuario');

app.get('/', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(

            ( err, usuarios ) => {

        if ( err ) {
            return res.status(500).json({
                    ok: true,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                }
            );
        }

        Usuario.count({}, (err, count) => {

            res.status(200).json({
                ok: true,
                usuarios,
                total: count
            })

        });

    });

});

app.post('/', (req, res) => {

    const body = req.body;

    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync( body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save( (err, usuarioDB ) => {

        if ( err ) {
            return res.status(400).json({
                    ok: true,
                    mensaje: 'Error creando usuario',
                    errors: err
                }
            );
        }

        res.status(201).json({
            ok: true,
            usuarioDB
        });

    });

});

app.put('/:id', mdAuth.verificarToken, (req, res) => {

    const id = req.params.id;
    const body = req.body;

    Usuario.findById( id, (err, usuario) => {

        if ( err ) {
            return res.status(500).json({
                    ok: true,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                }
            );
        }

        if ( !usuario ) {

            return res.status(400).json({
                    ok: true,
                    mensaje: 'El usuario no existe',
                    errors: { message: 'No existe un suario con ese ID' }
                }
            );
        }

        if ( body.nombre ) {
            usuario.nombre = body.nombre;
        }

        if ( body.email ) {
            usuario.email = body.email;
        }

        if( body.role ) {
            usuario.role = body.role;
        }

        usuario.save( (err, usuarioGuardado) => {


            if ( err ) {
                return res.status(400).json({
                        ok: true,
                        mensaje: 'Error al actualizar usuario',
                        errors: err
                    }
                );
            }

            usuarioGuardado.password = '.!.';

            res.status(200).json({
                ok: true,
                usuarioGuardado
            });

        });

    });

});

app.delete('/:id', mdAuth.verificarToken, (req, res) => {

    const id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if ( err ) {
            return res.status(500).json({
                    ok: true,
                    mensaje: 'Error al eliminar usuario',
                    errors: err
                }
            );
        }

        if ( !usuarioBorrado ) {

            return res.status(400).json({
                    ok: true,
                    mensaje: 'El usuario no existe',
                    errors: { message: 'No existe un suario con ese ID' }
                }
            );
        }

        res.status(200).json({
            ok: true,
            usuarioBorrado
        });

    });

});

module.exports = app;
