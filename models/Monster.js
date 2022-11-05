const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GENERAL_ENUMS = require('../shared/enums/generalEnums');

const Item = require('./Item');

const monsterSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    level: {
        type: Number,
        required: true,
    },
    maps: [
        {
            map: {
                type: String,
                Enumerator: GENERAL_ENUMS.MAPS,
                required: true,
            },
        },
    ],
    goldDrop: {
        type: Number,
        required: true,
    },
    itemDrops: [
        {
            itemId: {
                type: Schema.Types.ObjectId,
                ref: Item,
                required: true,
            },
            rate: {
                type: Number,
                required: true,
            },
        },
    ],
});

module.exports = mongoose.model('Monster', monsterSchema);

