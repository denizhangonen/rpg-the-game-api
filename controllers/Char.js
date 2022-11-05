const { validationResult } = require('express-validator/check');

const Char = require('../models/Char');
const Monster = require('../models/Monster');

const GENERAL_CONFIG = require('../config/general');

const { CHAR_STATUSES, MAPS } = require('../shared/enums/generalEnums');

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
            location: MAPS.moradon,
            status: 'idle',
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

exports.sendToFarming = async (req, res, next) => {
    const errors = validationResult(req);
    // Check if any errors exists
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'validation failed', errors: errors });
    }

    try {
        // get user id and duration
        // duration should be in minutes
        const { id } = req.params;
        const { duration, monsterId } = req.body;

        // return error if any data is missing
        if (!id || !duration || !monsterId) {
            return res
                .status(422)
                .json({ message: 'missing data', errors: errors });
        }

        const char = await Char.findById(id);

        if (!char) {
            return res
                .status(422)
                .json({ message: 'no char found', errors: errors });
        }

        // check char status and
        // if char is not idle then
        // indicate that it is not possible

        if (char.status !== CHAR_STATUSES.idle) {
            return res.status(422).json({
                message: 'Your char is busy now.',
            });
        }

        // check monster
        const monster = await Monster.findById(monsterId);
        if (!monster) {
            return res
                .status(422)
                .json({ message: 'no such monster found', errors: errors });
        }

        // check's chars location and mobs location
        // return error if it doesn't match
        if (monster.maps.filter((m) => m.map === char.location).length === 0) {
            return res.status(422).json({
                message: 'no such monster found in this location',
                errors: errors,
            });
        }

        // now char is idle and send char to farm
        // calculate the end time
        const instantDate = new Date();
        const farmEndDate = new Date(instantDate.getTime() + duration * 60000);

        char.status = CHAR_STATUSES.farming;
        char.actionType = CHAR_STATUSES.farming;
        char.actionStart = instantDate;
        char.actionEnd = farmEndDate;

        const updatedChar = await char.save();

        return res.status(200).json({
            message: 'Char sent to farming successfully.',
            data: updatedChar,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.checkCharStatus = async (req, res, next) => {
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

        // first check if status idle,
        // If so there is nothing to check for now and return status
        if (char.status === CHAR_STATUSES.idle) {
            return res.status(200).json({
                message: 'Char status fetched successfully.',
                data: char.status,
            });
        }
        // if status is not idle then we need to check,
        // if there is any operation that needs to be finalize such as farming

        if (char.status === CHAR_STATUSES.farming) {
            // check if endDate has passed
            if (char.actionEnd < new Date()) {
                // handle farm end like calculate
                return farmCompleteHandler(req, res, next, char);
            } else {
                return res.status(200).json({
                    message: 'Char is farming',
                    data: char.status,
                });
            }
        }

        return res.status(200).json({
            message: 'Char status fetched successfully.',
            data: char.status,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

const farmCompleteHandler = async (req, res, next, char) => {
    // for now just add some exp and update status
    const FARM_EXP_REWARD = 100;
    const FARM_GOLD_REWARD = 1000;

    // check level up situation
    const currentLevel = char.level;
    const newExp = char.currentExperiencePoint + FARM_EXP_REWARD;

    let newLevel = 1;
    let counter = 1;

    while (newExp >= GENERAL_CONFIG.LVL_TIERS[counter]) {
        newLevel = counter;
        counter++;
    }

    char.currentExperiencePoint += FARM_EXP_REWARD;
    char.gold += FARM_GOLD_REWARD;
    char.status = CHAR_STATUSES.idle;
    char.actionType = undefined;
    char.actionStart = undefined;
    char.actionEnd = undefined;
    char.level = newLevel;

    const updatedChar = await char.save();

    return res.status(200).json({
        message: 'Char completed farming successfully.',
        data: {
            char: updatedChar,
            earnedExp: FARM_EXP_REWARD,
            earnedGold: FARM_GOLD_REWARD,
            previousLevel: currentLevel,
            isLevelUp: newLevel > currentLevel,
        },
    });
};

