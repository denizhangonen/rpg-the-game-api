const CharSkill = require('../../models/CharSkill');

const GENERAL_ENUMS = require('../../shared/enums/generalEnums');

exports.createCharSkill = async (req, res, next) => {
    try {
        const newRecord = new CharSkill({
            name: 'Precision Strike',
            description: 'A powerful strike that deals consistent damage.',
            charClass: 'Warrior',
            requiredLevel: 6,
            requiredSkillPoints: 10,
            type: GENERAL_ENUMS.CHAR_SKILL_TYPES.DAMAGE_RATIO,
            damageRatio: {
                minimum: 1,
                maximum: 1,
            },
            manaCost: 10,
        });

        const saved = await newRecord.save();

        res.status(200).json({
            message: 'New Record created',
            saved,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

