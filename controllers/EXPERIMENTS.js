const { validationResult } = require('express-validator/check');

const Char = require('../models/Char');
const Monster = require('../models/Monster');

const { initTurnBasedCombat } = require('./Char');

const GENERAL_CONFIG = require('../config/general');

exports.checkLvlUp = async (req, res, next) => {
    const errors = validationResult(req);
    // Check if any errors exists
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'validation failed', errors: errors });
    }

    try {
        const { id } = req.params;
        const { earnedExp } = req.body;

        const char = await Char.findById(id);

        if (!char) {
            return res
                .status(422)
                .json({ message: 'no char found', errors: errors });
        }
        // for now just add some exp and update status

        // check level up situation
        // loop through the lvl tiers and find out where the result exp would fall
        // then check if the new lvl is equal to the current lvl
        // then return aa lvl up message
        const currentLevel = char.level;
        const newExp = char.currentExperiencePoint + earnedExp;

        let newLevel = 1;
        let counter = 1;
        console.log('newExp:' + newExp);
        while (newExp > GENERAL_CONFIG.LVL_TIERS[counter]) {
            console.log(
                `>${counter} - GENERAL_CONFIG.LVL_TIERS[counter]: ${GENERAL_CONFIG.LVL_TIERS[counter]}`
            );
            newLevel = counter;
            counter++;
        }

        return res.status(200).json({
            message: 'LVL up status result.',
            data: {
                currentLevel,
                newLevel,
                earnedExp: earnedExp,
                isLevelUp: newLevel > char.level,
            },
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.initTurnBasedCombat = async (req, res, next) => {
    const errors = validationResult(req);
    // Check if any errors exists
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'validation failed', errors: errors });
    }

    try {
        const { char, mob } = req.body;

        const data = initTurnBasedCombat(char, mob);

        return res.status(200).json({
            message: 'Combat results.',
            data,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

