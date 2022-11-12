const { validationResult } = require('express-validator/check');

const Monster = require('../models/Monster');
const Char = require('../models/Char');

const GENERAL_ENUMS = require('../shared/enums/generalEnums');

const Battle = require('../models/Battle');
const CharSkill = require('../models/CharSkill');

exports.createBattle = async (req, res, next) => {
    const errors = validationResult(req);
    // Check if any errors exists
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'validation failed', errors: errors });
    }

    try {
        const { host, opponent } = req.body;
        const newBattle = new Battle({
            host,
            opponent,
            whoseTurn: host,
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
        const { battleId } = req.params;
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

        const { attackerId, skillId } = req.body;

        if (!attackerId) {
            return res.status(400).json({
                message: 'attackerId is required',
            });
        }

        // check if char1 and char2 are in the battle
        if (
            battle.host.toString() !== attackerId &&
            battle.opponent.toString() !== attackerId
        ) {
            return res.status(400).json({
                message: 'Attacker is not in the battle',
            });
        }

        // check if it is attacker's turn
        if (battle.whoseTurn.toString() !== attackerId) {
            return res.status(400).json({
                message: 'It is not your turn',
            });
        }

        // check if both chars are alive
        const host = await Char.findById(battle.host).populate(
            'skills.attack skills.defense skills.passive'
        );
        const opponent = await Char.findById(battle.opponent).populate(
            'skills.attack skills.defense skills.passive'
        );
        if (!host || !opponent) {
            return res.status(404).json({
                message: 'Char not found',
            });
        }

        if (host.currentHp <= 0 || opponent.currentHp <= 0) {
            battle.endedAt = new Date();
            await battle.save();
            return res.status(400).json({
                message: 'One of the chars is dead',
                battle,
            });
        }

        // validate attacker has the skill
        const attacker = host._id.toString() === attackerId ? host : opponent;
        const defender = host._id.toString() === attackerId ? opponent : host;
        // create an array of attacker's all skills
        const attackerSkills = [
            ...attacker.skills.attack,
            ...attacker.skills.defense,
            ...attacker.skills.passive,
        ];

        //check if attacker has the skill
        if (!attackerSkills.find((skill) => skill._id.toString() === skillId)) {
            return res.status(400).json({
                message: 'Attacker does not have the skill',
            });
        }

        const skill = await CharSkill.findById(skillId);
        if (!skill) {
            return res.status(404).json({
                message: 'Skill not found',
            });
        }

        //#endregion validations
        // #region combat logic

        // check if char has enough mana to use the skill
        if (attacker.currentMana < skill.manaCost) {
            // switch turn
            battle.whoseTurn =
                battle.whoseTurn.toString() === battle.host.toString()
                    ? battle.opponent
                    : battle.host;
            await battle.save();

            return res.status(400).json({
                message: 'Not enough mana',
                battle,
            });
        }
        // calculate damage
        let damage =
            attacker.ap - defender.defense > 0
                ? attacker.ap - defender.defense
                : 0;

        console.log('attacker.ap :', attacker.ap);
        console.log('defender.def :', defender.defense);
        console.log('damage', damage);

        // apply skill effect
        switch (skill.type) {
            case GENERAL_ENUMS.CHAR_SKILL_TYPES.DAMAGE_RATIO:
                // calculate damage with damage ratio skill
                const min = skill.damageRatio.minimum;
                console.log('min', min);

                const max = skill.damageRatio.maximum;
                console.log('max', max);
                const damageRatio = Math.random() * (max - min) + min;
                console.log('damageRatio', damageRatio);
                damage = Math.round(damage * damageRatio);
                console.log('damageWithRatio: ', damage);
                break;
            default:
                console.log('CHAR SKILL TYPES NOT FOUND');
                break;
        }

        // inflict damage
        defender.currentHp -= damage;
        console.log('defender.currentHp', defender.currentHp);
        if (defender.currentHp <= 0) {
            defender.currentHp = 0;
            battle.endedAt = new Date();
            battle.logs.push({
                attacker: attacker._id,
                defender: defender._id,
                skill: skill._id,
                damage,
                message: `${attacker.name} used ${skill.name} and inflicted ${damage} damage to ${defender.name}, ${defender.name} is dead. ${attacker.name} won the battle. ${attacker.name} has ${attacker.currentHp} hp left and ${attacker.currentMana} mana left. ${defender.name} has ${defender.currentHp} hp left and ${defender.currentMana} mana left.`,
            });
        } else {
            battle.logs.push({
                attacker: attacker._id,
                defender: defender._id,
                skill: skill._id,
                damage,
                message: `${attacker.name} used ${skill.name} and inflicted ${damage} damage to ${defender.name}. ${attacker.name} has ${attacker.currentHp} hp left and ${attacker.currentMana} mana left. ${defender.name} has ${defender.currentHp} hp left and ${defender.currentMana} mana left.`,
            });
        }

        // switch turn
        battle.whoseTurn =
            battle.whoseTurn.toString() === battle.host.toString()
                ? battle.opponent
                : battle.host;

        // subsract mana cost
        attacker.currentMana -= skill.manaCost;

        // save battle
        await battle.save();

        // add mana recovery
        attacker.currentMana += 1;
        if (attacker.currentMana > attacker.mana) {
            attacker.currentMana = attacker.mana;
        }
        defender.currentMana += 1;
        if (defender.currentMana > defender.mana) {
            defender.currentMana = defender.mana;
        }

        // save chars
        await host.save();
        await opponent.save();

        // return battle
        return res.status(200).json({
            message: 'Battle updated',
            battle,
        });

        // #endregion combat logic
    } catch (err) {
        console.log(err);
        next(err);
    }
};

