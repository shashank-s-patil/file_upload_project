const mongoose = require('mongoose');


const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
