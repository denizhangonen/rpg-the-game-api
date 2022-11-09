const { validationResult } = require('express-validator/check');

const Monster = require('../models/Monster');

const GENERAL_ENUMS = require('../shared/enums/generalEnums');

const Battle = require('../models/Battle');

exports.createBattle = async (req, res, next) => {
    const errors = validationResult(req);
    // Check if any errors exists
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'validation failed', errors: errors });
    }

    try {
        const { char1, char2 } = req.body;
        const newBattle = new Battle({
            char1,
            char2,
            whoseTurn: char1,
            logs: [],
            startedAt: new Date(),
        });

        const savedBattle = await newBattle.save();

        res.status(200).json({
            message: 'New Battle created',
            savedBattle,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

