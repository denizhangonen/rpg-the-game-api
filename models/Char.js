const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GENERAL_ENUMS = require('../shared/enums/generalEnums');

const charSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    race: {
        type: String,
        required: true,
    },
    level: {
        type: Number,
        required: true,
    },
    currentExperiencePoint: {
        type: Number,
        required: true,
    },
    class: {
        type: String,
        Enumerator: GENERAL_ENUMS.CHAR_CLASSES,
    },
    stats: {
        str: {
            type: Number,
            required: true,
        },
        hp: {
            type: Number,
            required: true,
        },
        mp: {
            type: Number,
            required: true,
        },
        dex: {
            type: Number,
            required: true,
        },
        int: {
            type: Number,
            required: true,
        },
    },
    gold: {
        type: Number,
        required: true,
    },
    inventoryItems: [
        {
            itemId: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
                required: true,
            },
        },
    ],
    location: {
        type: String,
        Enumerator: GENERAL_ENUMS.MAPS,
        required: true,
    },
    status: {
        type: String,
        Enumerator: GENERAL_ENUMS.CHAR_STATUSES,
        default: GENERAL_ENUMS.CHAR_STATUSES.idle,
    },
    actionType: {
        type: String,
        Enumerator: GENERAL_ENUMS.CHAR_STATUSES,
        default: GENERAL_ENUMS.CHAR_STATUSES.idle,
    },
    actionStart: {
        type: Date,
    },
    actionEnd: {
        type: Date,
    },
    farmMonster: {
        type: Schema.Types.ObjectId,
        ref: 'Monster',
    },
    availableStatPoints: {
        type: Number,
        required: true,
        default: 0,
    },
    equippedItems: {
        weapon: {
            left: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            right: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
        },
        armor: {
            head: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            chest: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            pants: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            boots: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            gloves: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
        },
        jewelry: {
            ring: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            necklace: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            bracelet: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            belt: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
            earing: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
            },
        },
    },
    ap: {
        type: Number,
        required: true,
        default: 0,
    },
    hp: {
        type: Number,
        required: true,
        default: 0,
    },
    currentHp: {
        type: Number,
        required: true,
        default: 0,
    },
    mana: {
        type: Number,
        required: true,
        default: 0,
    },
    currentMana: {
        type: Number,
        required: true,
        default: 0,
    },
    defense: {
        type: Number,
        required: true,
        default: 0,
    },
    skills: {
        attack: [
            {
                type: Schema.Types.ObjectId,
                ref: 'CharSkill',
            },
        ],
        defense: [
            {
                type: Schema.Types.ObjectId,
                ref: 'CharSkill',
            },
        ],
        passive: [
            {
                type: Schema.Types.ObjectId,
                ref: 'CharSkill',
            },
        ],
    },
    skillPoints: {
        attack: {
            type: Number,
            required: true,
            default: 0,
        },
        defense: {
            type: Number,
            required: true,
            default: 0,
        },
        passive: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    availableSkillPoints: {
        type: Number,
        required: true,
        default: 0,
    },
});

charSchema.methods.calculateSpecialties = async function (calculationReason) {
    const ap = this.calculateAP();
    const hp = this.calculateHP();
    const def = this.calculateDEF();
    const mana = this.calculateMana();

    this.ap = ap;
    this.hp = hp;
    this.defense = def;
    this.mana = mana;

    // check the calculation reason and update the current hp and mana
    switch (calculationReason) {
        case GENERAL_ENUMS.CALCULATION_REASON.LEVEL_UP:
            this.currentHp = hp;
            this.currentMana = mana;
            break;
        case GENERAL_ENUMS.CALCULATION_REASON.STAT_UPDATE:
            break;
        case GENERAL_ENUMS.CALCULATION_REASON.SKILL_POINT_UPDATE:
            break;
        case GENERAL_ENUMS.CALCULATION_REASON.ITEM_EQUIP:
            break;
        default:
            break;
    }

    await this.save();
    return;
};

charSchema.methods.calculateAP = function () {
    let ap = 1;
    // make calculation based on char's class
    switch (this.class) {
        case GENERAL_ENUMS.CHAR_CLASSES.WARRIOR:
            ap = calculateWarriorsAp(this);
            break;
        case GENERAL_ENUMS.CHAR_CLASSES.WIZARD:
            ap = 1;
            break;
        case GENERAL_ENUMS.CHAR_CLASSES.ROGUE:
            ap = 1;
            break;
        default:
            console.log('DEFAULT ap:' + ap);
            break;
    }

    return ap;
};

charSchema.methods.calculateHP = function () {
    const HP_STAT_FACTOR = 1.5;
    const WEAPON_FACTOR = 1.2;
    const BONUS_FACTOR = 1.2;
    const SKILL_FACTOR = 1.2;
    const LEVEL_FACTOR = 1.8;

    const STAT_HP = this.stats.hp || 0;
    const BONUS_HP = this.bonus ? this.bonus.hp : 0 || 0;
    const SKILL_HP = 0;
    const LEVEL = this.level || 0;
    const PERCENT = this.percent || 1;

    let WEAPON_HP = 0;
    if (
        this.equippedItems.weapon.right &&
        this.equippedItems.weapon.right.bonus.hp
    ) {
        WEAPON_HP += this.equippedItems.weapon.right.bonus.hp;
    }
    if (
        this.equippedItems.weapon.left &&
        this.equippedItems.weapon.left.bonus.hp
    ) {
        WEAPON_HP += this.equippedItems.weapon.left.bonus.hp;
    }

    const hp = Math.round(
        (STAT_HP * HP_STAT_FACTOR +
            WEAPON_HP * WEAPON_FACTOR +
            BONUS_HP * BONUS_FACTOR +
            SKILL_HP * SKILL_FACTOR +
            LEVEL * LEVEL_FACTOR) *
            PERCENT
    );

    return hp;
};

charSchema.methods.calculateMana = function () {
    const INT_STAT_FACTOR = 1.5;
    const WEAPON_FACTOR = 1.2;
    const BONUS_FACTOR = 1.2;
    const SKILL_FACTOR = 1.2;
    const LEVEL_FACTOR = 1.8;

    const STAT_INT = this.stats.int || 0;
    const BONUS_INT = this.bonus ? this.bonus.hp : 0 || 0;
    const SKILL_INT = 0;
    const LEVEL = this.level || 0;
    const PERCENT = this.percent || 1;

    let WEAPON_INT = 0;
    if (
        this.equippedItems.weapon.right &&
        this.equippedItems.weapon.right.bonus.int
    ) {
        WEAPON_INT += this.equippedItems.weapon.right.bonus.int;
    }
    if (
        this.equippedItems.weapon.left &&
        this.equippedItems.weapon.left.bonus.int
    ) {
        WEAPON_INT += this.equippedItems.weapon.left.bonus.int;
    }

    const int = Math.round(
        (STAT_INT * INT_STAT_FACTOR +
            WEAPON_INT * WEAPON_FACTOR +
            BONUS_INT * BONUS_FACTOR +
            SKILL_INT * SKILL_FACTOR +
            LEVEL * LEVEL_FACTOR) *
            PERCENT
    );

    return int;
};

charSchema.methods.calculateDEF = function () {
    /**
     * Level Factor, Stat Factor, Weapon Factor, Armor Factor, Bonus Factor, Skill Factor
     */

    const STR_FACTOR = 0.5;
    const WEAPON_FACTOR = 1;
    const BONUS_FACTOR = 1;
    const SKILL_FACTOR = 1;
    const LEVEL_FACTOR = 1;
    const ARMOR_FACTOR = 1;

    let WEAPON_DEF = 0;
    if (
        this.equippedItems.weapon.right &&
        this.equippedItems.weapon.right.bonus.defense
    ) {
        WEAPON_DEF += this.equippedItems.weapon.right.bonus.defense;
    }
    if (
        this.equippedItems.weapon.left &&
        this.equippedItems.weapon.left.bonus.defense
    ) {
        WEAPON_DEF += this.equippedItems.weapon.left.bonus.defense;
    }

    const STR = this.stats.str || 0;
    const BONUS_DEF = this.bonus ? this.bonus.str : 0 || 0;
    const SKILL_DEF = 0;
    const LEVEL = this.level || 0;
    const PERCENT = this.percent || 1;
    const ARMOR_DEF =
        getArmorsTotalDefense(this) + getJewelryTotalDefense(this);

    const def = Math.round(
        (STR * STR_FACTOR +
            WEAPON_DEF * WEAPON_FACTOR +
            BONUS_DEF * BONUS_FACTOR +
            SKILL_DEF * SKILL_FACTOR +
            LEVEL * LEVEL_FACTOR +
            ARMOR_DEF * ARMOR_FACTOR) *
            PERCENT
    );

    return def;
};

const getArmorsTotalDefense = (char) => {
    let totalDefense = 0;
    if (char.equippedItems.armor.head) {
        totalDefense += char.equippedItems.armor.head.bonus.defense;
    }
    if (char.equippedItems.armor.chest) {
        totalDefense += char.equippedItems.armor.chest.bonus.defense;
    }
    if (char.equippedItems.armor.legs) {
        totalDefense += char.equippedItems.armor.legs.bonus.defense;
    }
    if (char.equippedItems.armor.feet) {
        totalDefense += char.equippedItems.armor.feet.bonus.defense;
    }
    if (char.equippedItems.armor.belt) {
        totalDefense += char.equippedItems.armor.belt.bonus.defense;
    }
    return totalDefense;
};

const getJewelryTotalDefense = (char) => {
    let totalDefense = 0;
    if (char.equippedItems.jewelry.ring) {
        totalDefense += char.equippedItems.jewelry.ring.bonus.defense;
    }
    if (char.equippedItems.jewelry.necklace) {
        totalDefense += char.equippedItems.jewelry.necklace.bonus.defense;
    }
    if (char.equippedItems.jewelry.earring) {
        totalDefense += char.equippedItems.jewelry.earring.bonus.defense;
    }
    if (char.equippedItems.jewelry.belt) {
        totalDefense += char.equippedItems.jewelry.belt.bonus.defense;
    }
    if (char.equippedItems.jewelry.bracelet) {
        totalDefense += char.equippedItems.jewelry.bracelet.bonus.defense;
    }
    return totalDefense;
};

const calculateWarriorsAp = (warrior) => {
    /*
        Below are the things to consider when calculating a warrior's attack power;
        1. STAT - Stats: Just STR
            - STR * a
        2. WEAPON - Weapons: 
            - This is kind of tricky as we'll have both 1 handed and 2 handed weapons
            - Weapon Damage * b
            - [left hand weapon damage + right hand weapon damage] *b
        3. BONUS - Additional STR Bonuses
            - Armor STR bonuses
            - Jewellery STR bonuses
            - Scroll STR bonuses
            - ?Other STR bonuses -> Skills maybe?
            - BONUS * c
        4. SKILL - Skill bonuses
            - Passive skills that alter STR
            - SKILL * c
        5. PERCENT - Percentage Bonuses
            - This might be a skill
            - This might be a again scroll
        6. LEVEL - LEvel's effect on AP -> ADDITIVE        
            - LEVEL * d

        So the formula is;

        AP = [STAT + WEAPON + BONUS + SKILL + LEVEL] * PERCENT
        a: 2.5
        b: 4
        c: 1.5
        d: 5
        AP = [STAT + WEAPON + BONUS + SKILL + LEVEL] * PERCENT
        AP = [ (Str * a) + (WeaponAP * b) + (BonusStr * c) + (SKILL * c) + (LEVEL * d) ] * PERCENT

        =ROUND(((B2*$M$2) +(C2*$J$2) + (D2*$K$2) + (E2*$L$2) + (F2*$L$2))*G2)
    */

    const STR_FACTOR = 1.5;
    const WEAPON_FACTOR = 1.5;
    const BONUS_FACTOR = 1.2;
    const SKILL_FACTOR = 1.2;
    const LEVEL_FACTOR = 2;

    let WEAPON_AP = 0;
    if (
        warrior.equippedItems.weapon.right &&
        warrior.equippedItems.weapon.right.bonus.attack
    ) {
        WEAPON_AP += warrior.equippedItems.weapon.right.bonus.attack;
    }
    if (
        warrior.equippedItems.weapon.left &&
        warrior.equippedItems.weapon.left.bonus.attack
    ) {
        WEAPON_AP += warrior.equippedItems.weapon.left.bonus.attack;
    }

    const STR = warrior.stats.str || 0;
    const BONUS_STR = warrior.bonus ? warrior.bonus.str : 0 || 0;
    const SKILL_STR = 0;
    const LEVEL = warrior.level || 0;
    const PERCENT = warrior.percent || 1;

    const AP = Math.round(
        (STR * STR_FACTOR +
            WEAPON_AP * WEAPON_FACTOR +
            BONUS_STR * BONUS_FACTOR +
            SKILL_STR * SKILL_FACTOR +
            LEVEL * LEVEL_FACTOR) *
            PERCENT
    );

    return AP;
};

module.exports = mongoose.model('Char', charSchema);

