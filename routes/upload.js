const express = require('express');
const fileUpload = require('express-fileupload');
const mdAuth = require('../middlewares/autenticacion');

const fs = require('fs');

const Hospitales = require('../models/hospital');
const Usuarios = require('../models/usuario');
const Medicos = require('../models/medico');

const app = express();

app.use(fileUpload());


app.put('/:tipo/:id', (req, res) => {

    const tipo = req.params.tipo;
    const id = req.params.id;

    tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if ( tiposValidos.indexOf(tipo) < 0 ) {

        return res.status(400).json({
            ok: false,
            mensaje: 'El tipo/colleccion no es valido',
            errors: 'Los tipos disponibles son ' + tiposValidos.join(', ')
        })

    }

    if ( !req.files  ) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No se ha cargado ninguna imagen'
        })

    }

    // Obtener el nombre del archivo
    const archivo = req.files.imagen;
    const cortado = archivo.name.split('.');
    const exten = cortado[ cortado.length - 1 ];

    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if ( extensionesValidas.indexOf(exten) < 0) {

        res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: 'Las extension validas son ' + extensionesValidas.join(', ')
        });

    }

    const nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ exten }`;
    const path = `./uploads/${ tipo }/${ nombreArchivo }`;


    archivo.mv( path, err => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res);

    });

});


const subirPorTipo = ( tipo, id, nombreArchivo, res) => {

    switch ( tipo ) {

        case 'usuarios':

            Usuarios.findById(id, (err, usuarioBD) => {

                if( !usuarioBD ) {

                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No existe ningun usuario con ese ID en la BD',
                        err
                    });
                }

                const pathViejo = './uploads/usuarios/' + usuarioBD.img
                if ( fs.existsSync( pathViejo ) ) {
                    fs.unlinkSync( pathViejo );
                }

                usuarioBD.img = nombreArchivo;
                usuarioBD.save(( err, usuarioActualizado ) => {

                    usuarioActualizado.password = ':)';
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });

                });

            });

            break;

        case 'hospitales':

            Hospitales.findById(id, ( err, hospitalBD ) => {

                if (!hospitalBD) {

                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No existe ningun hospital con ese ID en la BD',
                        err
                    });

                }

                const pathViejo = './uploads/hospitales/' + hospitalBD.img
                if ( fs.existsSync( pathViejo ) ) {
                    fs.unlinkSync( pathViejo );
                }

                hospitalBD.img = nombreArchivo;
                hospitalBD.save(( err, hospitalActualizado ) => {

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
                    });

                });

            });

            break;

        case 'medicos':

            Medicos.findById(id, ( err, medicoBD ) => {

                if ( !medicoBD ) {

                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No existe ningun medico con ese ID en la BD',
                        err
                    });

                }

                const pathViejo = './uploads/medicos/' + medicoBD.img
                if ( fs.existsSync( pathViejo ) ) {
                    fs.unlinkSync( pathViejo );
                }

                medicoBD.img = nombreArchivo;
                medicoBD.save(( err, medicoActualizado ) => {

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        hospital: medicoActualizado
                    });

                });

            });

            break;

    }

}


module.exports = app;
