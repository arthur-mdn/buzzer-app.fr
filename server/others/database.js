const mongoose = require('mongoose');
const config = require('./config');

module.exports.connect = async () => {
    const maxRetries = 10;
    const delayMs = 3000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await mongoose.connect(config.dbUri);
            console.log('MongoDB connected...');
            return;
        } catch (err) {
            console.log(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, err.message);
            if (attempt === maxRetries) {
                throw err;
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
};
