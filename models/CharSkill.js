const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GENERAL_ENUMS = require('../shared/enums/generalEnums');

const charSkillSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  charClass: {
    type: String,
    Enumerator: GENERAL_ENUMS.CHAR_CLASSES,
    required: true,
  },
  requiredLevel: {
    type: Number,
    required: true,
  },
  requiredSkillPoints: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enumerator: GENERAL_ENUMS.CHAR_SKILL_CATEGORIES,
    required: true,
  },
  type: {
    type: String,
    enumerator: GENERAL_ENUMS.SKILL_TYPES,
    required: true,
  },
  manaCost: {
    type: Number,
    required: true,
  },
  damageRatio: {
    minimum: {
      type: Number,
      required: true,
    },
    maximum: {
      type: Number,
      required: true,
    },
  },
  additionalDamage: {
    minimum: {
      type: Number,
    },
    maximum: {
      type: Number,
    },
  },
  elementalDamage: {
    minimum: {
      type: Number,
    },
    maximum: {
      type: Number,
    },
  },
});

module.exports = mongoose.model('CharSkill', charSkillSchema);

