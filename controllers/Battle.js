const { validationResult } = require('express-validator');

const Monster = require('../models/Monster');
const Char = require('../models/Char');

const GENERAL_ENUMS = require('../shared/enums/generalEnums');

const Battle = require('../models/Battle');
const CharSkill = require('../models/CharSkill');
const Player1vs1 = require('../models/Player1vs1');

const BATTLE_SERVICE = require('../services/BattleService');

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
      attacker.ap - defender.defense > 0 ? attacker.ap - defender.defense : 0;

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

    // subsract mana cost
    attacker.currentMana -= skill.manaCost;

    // switch turn
    battle.whoseTurn =
      battle.whoseTurn.toString() === battle.host.toString()
        ? battle.opponent
        : battle.host;

    // add mana recovery
    attacker.currentMana += 1;
    if (attacker.currentMana > attacker.mana) {
      attacker.currentMana = attacker.mana;
    }
    defender.currentMana += 1;
    if (defender.currentMana > defender.mana) {
      defender.currentMana = defender.mana;
    }

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
    // save battle
    await battle.save();

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

exports.create1vs1Battle = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { player1Id, player2Id } = req.body;

    if (!player1Id || !player2Id) {
      return res.status(400).json({ message: 'Both players are required' });
    }

    const savedBattle = await BATTLE_SERVICE.create1vs1Battle(
      player1Id,
      player2Id
    );

    res.status(200).json({
      message: 'New 1v1 Battle created',
      battle: savedBattle,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.perform1vs1Action = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { battleId } = req.params;
    const { playerId, actionType, value } = req.body;

    // Ensure the user performing the action owns the character
    if (req.charId !== playerId) {
      return res.status(403).json({
        message: 'You are not allowed to perform actions with this character',
      });
    }

    const updatedBattle = await BATTLE_SERVICE.perform1vs1Action(
      battleId,
      playerId,
      actionType,
      value
    );

    res.status(200).json({
      message: 'Action performed',
      battle: updatedBattle,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.get1vs1BattleState = async (req, res, next) => {
  try {
    const { battleId } = req.params;

    if (!battleId) {
      return res.status(400).json({ message: 'Battle ID is required' });
    }

    const battle = await BATTLE_SERVICE.get1vs1BattleState(
      battleId,
      req.charId
    );

    res.status(200).json({
      message: 'Battle state retrieved',
      battle,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
