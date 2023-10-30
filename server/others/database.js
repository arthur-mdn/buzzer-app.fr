const mongoose = require('mongoose');
const config = require('./config');

module.exports.connect = () => {
    return mongoose.connect(config.dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB connected...'))
        .catch((err) => console.log(err));
};
