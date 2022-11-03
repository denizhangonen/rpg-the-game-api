const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const charSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    race: {
        type: String,
        required: true,
    },
    level: {
        type: Number,
        required: true,
    },
    currentExperiencePoint: {
        type: Number,
        required: true,
    },
    gold: {
        type: Number,
        required: true,
    },
    inventoryItems: [
        {
            itemTitle: { type: String, required: true },
        },
    ],
    status: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Char', charSchema);

