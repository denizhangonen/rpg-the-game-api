const { validationResult } = require('express-validator/check');

const Monster = require('../models/Monster');
const Char = require('../models/Char');

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

exports.attack = async (req, res, next) => {
    const errors = validationResult(req);
    // Check if any errors exists
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'validation failed', errors: errors });
    }

    try {
        const { battleId, attackerId } = req.params;
        //#region validations
        // check if battle exists
        const battle = await Battle.findById(battleId);
        if (!battle) {
            return res.status(404).json({
                message: 'Battle not found',
            });
        }

        // check if battle ended
        if (battle.endedAt) {
            return res.status(400).json({
                message: 'Battle already ended',
            });
        }

        const { char1Id, char2Id, skillId } = req.body;
        if(!char1Id || !char2Id) {
            return res.status(400).json({
                message: 'char1 or char2 not provided',
            });
        }

        // check if char1 and char2 are in the battle
        if (battle.char1.toString() !== char1Id || battle.char2.toString() !== char2Id) {
            return res.status(400).json({
                message: 'char1 or char2 not in the battle',
            });
        }

        // check if it is attacker's turn
        if (battle.whoseTurn.toString() !== attackerId) {
            return res.status(400).json({
                message: 'It is not your turn',
            });
        }

        // check if both chars are alive
        const char1 = await Char.findById(char1Id);
        const char2 = await Char.findById(char2Id);
        if (!char1 || !char2) {
            return res.status(404).json({
                message: 'Char not found',
            });
        }

        if (char1.hp <= 0 || char2.hp <= 0) {
            return res.status(400).json({
                message: 'One of the chars is dead',
            });
        }

        // validate attacker has enough mana for the skill



        //#endregion validations
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

