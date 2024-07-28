const CHAR_STATUSES = {
  idle: 'IDLE',
  farming: 'FARMING',
  bossChecking: 'BOSS_CHECKING',
};

const CHAR_CLASSES = {
  WARRIOR: 'Warrior',
  WIZARD: 'Wizard',
  ROGUE: 'Rogue',
};

const CHAR_SKILL_TYPES = {
  DAMAGE_RATIO: 'Damage Ratio',
  ADDITIONAL_DAMAGE: 'Additional Damage',
  ELEMENTAL_DAMAGE: 'Elemental Damage',
};

const CHAR_SKILL_CATEGORIES = {
  ATTACK: 'Attack',
  DEFENSE: 'Defense',
  BUFF: 'Buff',
  DEBUFF: 'Debuff',
  HEAL: 'Heal',
  SUMMON: 'Summon',
  TRANSFORMATION: 'Transformation',
};

const MAPS = {
  moradon: 'Moradon',
  elmoradCastle: 'Elmorad Castle',
};

const CALCULATION_REASON = {
  LEVEL_UP: 'LEVEL_UP',
  ITEM_EQUIP: 'ITEM_EQUIP',
  STAT_UPDATE: 'STAT_UPDATE',
  SKILL_POINT_UPDATE: 'SKILL_POINT_UPDATE',
};

module.exports = {
  CHAR_STATUSES,
  CHAR_CLASSES,
  CHAR_SKILL_TYPES,
  MAPS,
  CALCULATION_REASON,
  CHAR_SKILL_CATEGORIES,
};

