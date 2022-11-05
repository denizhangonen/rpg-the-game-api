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
});

module.exports = mongoose.model('Char', charSchema);

