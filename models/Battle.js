const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const battleSchema = new Schema({
    char1: {
        type: Schema.Types.ObjectId,
        ref: 'Char',
        required: true,
    },
    char2: {
        type: Schema.Types.ObjectId,
        ref: 'Char',
        required: true,
    },
    whoseTurn: {
        type: Schema.Types.ObjectId,
        ref: 'Char',
        required: true,
    },
    logs: [{ type: String, required: true }],
    startedAt: {
        type: Date,
        required: true,
    },
    endedAt: {
        type: Date,
    },
});

module.exports = mongoose.model('Battle', battleSchema);

