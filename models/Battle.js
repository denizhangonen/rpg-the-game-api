const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const battleSchema = new Schema({
    host: {
        type: Schema.Types.ObjectId,
        ref: 'Char',
        required: true,
    },
    opponent: {
        type: Schema.Types.ObjectId,
        ref: 'Char',
        required: true,
    },
    whoseTurn: {
        type: Schema.Types.ObjectId,
        ref: 'Char',
        required: true,
    },
    logs: [{ message: { type: String, required: true } }],
    startedAt: {
        type: Date,
        required: true,
    },
    endedAt: {
        type: Date,
    },
});

module.exports = mongoose.model('Battle', battleSchema);

