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
        Enumerator: CHAR_ENUMS.CHAR_CLASSES,
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
        },
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
    availableStatPoints: {
        type: Number,
        required: true,
        default: 0,
    },
    equippedItems: {
        weapon: {
            left: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            right: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
        },
        armor: {
            head: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            chest: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            pants: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            boots: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            gloves: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
        },
        jewelry: {
            ring: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            necklace: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            bracelet: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            belt: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
        },
    },
    hp: {
        type: Number,
    },
    defense: {
        type: Number,
    },
});

module.exports = mongoose.model('Char', charSchema);

