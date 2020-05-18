const express = require('express');
const bcrypt = require('bcrypt');
const app = express();

const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

// =======================================================
//  Google Sign In
// =======================================================
const CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

app.post('/', (req, res) => {

    const body = req.body;

    const usuario = {
        email: body.email,
        password: body.password
    }

    Usuario.findOne({ email: usuario.email }, ( err, usuarioLogin ) => {

        if ( err ) {
            return res.status(500).json({
                    ok: true,
                    mensaje: 'Error en el login',
                    errors: err
                }
            );
        }

        if ( !usuarioLogin ) {

            return res.status(400).json({
                    ok: true,
                    mensaje: 'Credenciales invalidas - email',
                    errors: { message: 'Credenciales invalidas' }
                }
            );
        }

        if ( !bcrypt.compareSync( usuario.password, usuarioLogin.password) ) {

            return res.status(400).json({
                    ok: true,
                    mensaje: 'Credenciales invalidas - password',
                    errors: { message: 'Credenciales invalidas' }
                }
            );
        }

        usuarioLogin.password = ':)';

        const token = jwt.sign(
            { usuario: usuarioLogin },
            SEED,
            { expiresIn: 144000 });

        res.status(200).json({
            ok: true,
            usuarioLogin,
            id: usuarioLogin._id,
            token
        });

    });

});

// =======================================================
// Autenticacion con google
// =======================================================
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async (req, res) => {

    const token = req.body.idToken;
    let googleUser = await verify( token )
        .then( (googleRes) => {

            Usuario.findOne({ email: googleRes.email }, (err, usuarioBD) => {

                if ( err ) {
                    return res.status(500).json({
                            ok: true,
                            mensaje: 'Error en el login/google',
                            errors: err
                        }
                    );
                }

                if ( usuarioBD ) {

                    if ( usuarioBD.google === false ) {

                        return res.status(400).json({
                                ok: true,
                                mensaje: 'Debe usar auth normal',
                                errors: err
                            }
                        );

                    } else {

                        const token = jwt.sign(
                            { usuario: usuarioBD },
                            SEED,
                            { expiresIn: 144000 });

                        res.status(200).json({
                            ok: true,
                            usuarioBD,
                            id: usuarioBD._id,
                            token
                        });

                    }

                } else {

                    // Debemos crear el usuario
                    let usuarioNew = new Usuario({

                        nombre: googleRes.nombre,
                        email: googleRes.email,
                        password: ':)',
                        img: googleRes.img,
                        role: googleRes.role,
                        google: true
                    });

                    usuarioNew.save( (err, usuarioDB ) => {

                        if ( err ) {
                            return res.status(400).json({
                                    ok: true,
                                    mensaje: 'Error creando usuario Google',
                                    errors: err
                                }
                            );
                        }

                        // Dar token
                        const token = jwt.sign(
                            { usuario: usuarioDB },
                            SEED,
                            { expiresIn: 144000 });

                        res.status(200).json({
                            ok: true,
                            usuarioDB,
                            id: usuarioDB._id,
                            token
                        });

                    });

                }

            });

        })
        .catch( e => {

            return res.status(403).json({
                ok: false,
                msn: 'Token no válido'
            });
        });
});

module.exports = app;
