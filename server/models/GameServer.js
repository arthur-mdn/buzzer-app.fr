// models/Server.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const serverSchema = new Schema({
    name: String,
    code: String, // vous pouvez générer un code unique pour chaque serveur
    hostId: String, // référence à l'ID de l'utilisateur qui a créé le serveur
    // autres champs selon vos besoins
});

module.exports = mongoose.model('Server', serverSchema);
