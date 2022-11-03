const { validationResult } = require('express-validator/check');

const Char = require('../models/Char');

exports.createChar = async (req, res, next) => {
    const errors = validationResult(req);
    // Check if any errors exists
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'validation failed', errors: errors });
    }

    try {
        const { name, race } = req.body;

        const newChar = new Char({
            userId: req.userId,
            name,
            race,
            level: 1,
            currentExperiencePoint: 0,
            gold: 0,
            inventoryItems: [],
            status: 'IDLE',
        });

        const savedChar = await newChar.save();

        res.status(200).json({
            message: 'New Char created',
            savedChar,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.getCharDetails = async (req, res, next) => {
    const errors = validationResult(req);
    // Check if any errors exists
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'validation failed', errors: errors });
    }

    try {
        const { id } = req.params;

        const char = await Char.findById(id);

        if (!char) {
            return res
                .status(422)
                .json({ message: 'no char found', errors: errors });
        }

        res.status(200).json({
            message: 'Char fetched successfully.',
            data: char,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

