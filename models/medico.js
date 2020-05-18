const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const medicoSchema = new Schema({

    "nombre"  : { type: String, required: [true, 'El nombre es necesario'] },
    "img"     : { type: String, required: false },
    "usuario" : { type: Schema.Types.ObjectID, ref: 'Usuario' },
    "hospital": { type: Schema.Types.ObjectID, ref: 'Hospital' }

}, { collection: 'medicos' });


module.exports = mongoose.model('Medico', medicoSchema );
