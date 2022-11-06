const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CHAR_ENUMS = require('../shared/enums/generalEnums');

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
    class: {
        type: String,
        Enumerator: CHAR_ENUMS.CHAR_CLASSES
    },
    stats: {
        str: {
            type: Number,
            required: true,
        },
        hp: {
            type: Number,
            required: true,
        },
        mp: {
            type: Number,
            required: true,
        },        
        dex: {
            type: Number,
            required: true,
        },
        int: {
            type: Number,
            required: true,
        } 
    },
    gold: {
        type: Number,
        required: true,
    },
    inventoryItems: [
        {
            itemId: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
                required: true,
            },
        },
    ],
    location: {
        type: String,
        Enumerator: CHAR_ENUMS.MAPS,
        required: true,
    },
    status: {
        type: String,
        Enumerator: CHAR_ENUMS.CHAR_STATUSES,
        default: CHAR_ENUMS.CHAR_STATUSES.idle,
    },
    actionType: {
        type: String,
        Enumerator: CHAR_ENUMS.CHAR_STATUSES,
        default: CHAR_ENUMS.CHAR_STATUSES.idle,
    },
    actionStart: {
        type: Date,
    },
    actionEnd: {
        type: Date,
    },
    farmMonster: {
        type: Schema.Types.ObjectId,
        ref: 'Monster',
    },
    weapon: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
    },
});

module.exports = mongoose.model('Char', charSchema);

