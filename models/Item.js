const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GENERAL_ENUMS = require('../shared/enums/generalEnums');

const itemSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    level: {
        type: Number,
        required: true,
    },
    type: {
        // TODO: this needs to be changed
        type: String,
        required: true,
    },
    isConsumable: {
        type: Boolean,
        required: true,
        default: false,
    },
    bonus: {
        attack: {
            type: Number,
        },
        defense: {
            type: Number,
        },
        magic: {
            type: Number,
        },
        luck: {
            type: Number,
        },
        hp: {
            type: Number,
        },
    },
    isUpgradable: {
        type: Boolean,
        required: true,
        default: false,
    },
    numberOfSockets: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('Item', itemSchema);

