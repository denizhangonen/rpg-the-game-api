const { validationResult } = require('express-validator/check');

const Char = require('../models/Char');
const Monster = require('../models/Monster');

const GENERAL_CONFIG = require('../config/general');

const {
    CHAR_STATUSES,
    MAPS,
    CHAR_CLASSES,
} = require('../shared/enums/generalEnums');

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
        char.farmMonster = monsterId;

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

        // get monster
        const mob = await Monster.findById(char.farmMonster);
        if (!mob) {
            return res
                .status(422)
                .json({ message: 'no mob found', errors: errors });
        }
        // if status is not idle then we need to check,
        // if there is any operation that needs to be finalize such as farming

        if (char.status === CHAR_STATUSES.farming) {
            // check if endDate has passed
            if (char.actionEnd < new Date()) {
                // handle farm end like calculate
                return farmCompleteHandler(req, res, next, char, mob);
            } else {
                return res.status(200).json({
                    message: 'Char is farming',
                    data: char.status,
                    farmEndDate: char.actionEnd,
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

const farmCompleteHandler = async (req, res, next, char, mob) => {
    const farmDurationInSecs =
        (new Date(char.actionEnd) - new Date(char.actionStart)) / 1000;

    console.log('farmDurationInSecs : ' + farmDurationInSecs);
    const oneMobKillTimeInSecs = getHowLongToKillAMob(char, mob);
    const numMobs = Math.round(farmDurationInSecs / oneMobKillTimeInSecs);    

    const FARM_EXP_REWARD = calculateGainedExp(numMobs, mob);
    const FARM_GOLD_REWARD = calculateGainedGold(numMobs, mob);
    const itemDrops = farmItemDrops(mob, numMobs);

    console.log('> FARM_EXP_REWARD: ' + FARM_EXP_REWARD);
    console.log('> FARM_GOLD_REWARD: ' + FARM_GOLD_REWARD);

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
    char.farmMonster = undefined;
    char.level = newLevel;
    //TODO: add item drops to inventory

    const updatedChar = await char.save();

    return res.status(200).json({
        message: 'Char completed farming successfully.',
        data: {
            char: updatedChar,
            earnedExp: FARM_EXP_REWARD,
            earnedGold: FARM_GOLD_REWARD,
            previousLevel: currentLevel,
            isLevelUp: newLevel > currentLevel,
            mob: mob.name,
            numberOfMobsKilled: numMobs,
        },
    });
};

exports.getHowLongToKillAMob = (char, mob) => {
    // initiate a turn based combat between char and mob

    const charCombat = {
        ...char,
        hp: 20,
        defense: 3,
        attackPower: calculateCharAttackPower(char),
    };

    const data = initTurnBasedCombat(charCombat, mob);

    console.log('data: ', data);

    return data.combat.length;
};

const calculateNumberOfKilledMobs = async (
    mobLevel,
    charLevel,
    mobKillDurationSeconds,
    farmDurationInSeconds
) => {
    /* 
        numberOfMobsKilled = farmDurationInSeconds / (exp duration / 1 mob kill duration)
        farmDurationInSeconds / (( Lm / Lc Factor x item factor ) x mob kill duration property)
    */
    const mobCharFactor = mobLevel / charLevel;
    console.log('mobCharFactor: ' + mobCharFactor);
    let timePerMobInSeconds = mobKillDurationSeconds;
    console.log('timePerMobInSeconds:' + timePerMobInSeconds);
    if (mobCharFactor > 2) {
        // which means char attack to a mob over twice of her level
        // and char has no chance of surviving
        // without killing one char dies
        console.log('mobCharFactor > 2, timePerMobInSeconds = 0');
        timePerMobInSeconds = 0;
    } else if (mobCharFactor < 0.5) {
        // which means char farms on a weak enemy
        // and will not die
        timePerMobInSeconds = mobCharFactor * mobKillDurationSeconds;
        console.log(
            'mobCharFactor < 0.5, timePerMobInSeconds :' + timePerMobInSeconds
        );
    } else {
        // this zone has both die and get exp chance
        timePerMobInSeconds = mobCharFactor * mobKillDurationSeconds;
        console.log('ELSE, timePerMobInSeconds :' + timePerMobInSeconds);
    }
    console.log('farmDurationInSeconds :' + farmDurationInSeconds);
    const totalMobsKilledRaw = farmDurationInSeconds / timePerMobInSeconds;
    console.log('totalMobsKilledRaw :' + totalMobsKilledRaw);

    // apply randomize factor
    const MIN = 70;
    const MAX = 130;
    const randomizeFactor = (Math.random() * (MAX - MIN) + MIN) / 100;
    console.log('randomizeFactor :' + randomizeFactor);
    const randomizedKill = totalMobsKilledRaw * randomizeFactor;
    console.log('randomizedKill: ' + randomizedKill);
    console.log('randomizedKill rounded: ' + Math.round(randomizedKill));

    return Math.round(randomizedKill);
};

exports.calculateGainedExp = (numMobs, mob) => {
    return calculateGainedExp(numMobs, mob);
};

const calculateGainedExp = (numKilledMobs, mob) => {
    const totalRawExp = numKilledMobs * mob.expPerKill;

    const BONUS_EXP_EVENT_RATE = 1;
    const BONUS_PREMIUM_EXP_FACTOR = 1;
    const BONUS_CHAR_EXP_SCROLL = 1;
    const BONUS_CHAR_EXP_ITEMS = 1;

    const bonuses =
        BONUS_EXP_EVENT_RATE *
        BONUS_PREMIUM_EXP_FACTOR *
        BONUS_CHAR_EXP_SCROLL *
        BONUS_CHAR_EXP_ITEMS;

    return totalRawExp * bonuses;
};

exports.calculateGainedGold = (numMobs, mob) => {
    return calculateGainedGold(numMobs, mob);
};

const calculateGainedGold = (numKilledMobs, mob) => {
    const rawEarnedGold = numKilledMobs * mob.goldDrop;

    const BONUS_GOLD_EVENT_RATE = 1;
    const BONUS_PREMIUM_GOLD_FACTOR = 1;
    const BONUS_CHAR_GOLD_SCROLL = 1;
    const BONUS_CHAR_GOLD_ITEMS = 1;

    const bonuses =
        BONUS_GOLD_EVENT_RATE *
        BONUS_PREMIUM_GOLD_FACTOR *
        BONUS_CHAR_GOLD_SCROLL *
        BONUS_CHAR_GOLD_ITEMS;

    return rawEarnedGold * bonuses;
};

const farmItemDrops = (mob, numberOfKills) => {
    const droppedItemIds = [];
    // calculate the additional drop rate bonuses

    // get mob drop rate
    
    // multiply it by other drop rate bonuses

    // loop through the items

    // push to item array if item dropped.

    return droppedItemIds;
};

const calculateCharAttackPower = (char) => {
    let ap = 1;
    // make calculation based on char's class
    switch (char.class) {
        case CHAR_CLASSES.WARRIOR:
            console.log('CHAR_CLASSES.WARRIOR : ' + CHAR_CLASSES.WARRIOR);
            ap = calculateWarriorsAp(char);
            break;
        case CHAR_CLASSES.WIZARD:
            console.log('CHAR_CLASSES.WIZARD : ' + CHAR_CLASSES.WIZARD);
            ap = 1;
            break;
        case CHAR_CLASSES.ROGUE:
            console.log('CHAR_CLASSES.ROGUE : ' + CHAR_CLASSES.ROGUE);
            ap = 1;
            break;
        default:
            console.log('DEFAULT : ');
            break;
    }
    return ap;
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

    const STR_FACTOR = 1.3;
    const WEAPON_FACTOR = 1.4;
    const BONUS_FACTOR = 1.2;
    const SKILL_FACTOR = 1.2;
    const LEVEL_FACTOR = 1.8;

    const STR = warrior.stats.str || 0;
    const WEAPON_AP = warrior.weapon ? warrior.weapon.ap : 0 || 0;
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

    console.log('AP: ' + AP);

    return AP;
};

const initTurnBasedCombat = (char, mob) => {
    const combat = [];
    console.log('######## COMBAT ########');

    // create loop when char.hp > 0 and mob.hp > 0
    let turnCount = 0;
    while (char.hp > 0 && mob.hp > 0) {
        turnCount++;
        // if turnCount is odd, it's char's turn
        if (turnCount % 2 === 1) {
            // char attacks mob
            const damage = char.attackPower - mob.defense;
            mob.hp -= damage;
            combat.push({
                turnInfo: `${turnCount} - Char inflicts ${damage} - charHP: ${char.hp}, mobHP: ${mob.hp}`,
            });
            console.log(
                `${turnCount} - Char inflicts ${damage} - charHP: ${char.hp}, mobHP: ${mob.hp}`
            );
        } else {
            // mob attacks char
            const damage = mob.attackPower - char.defense;
            char.hp -= mob.attackPower - char.defense;
            combat.push({
                turnInfo: `${turnCount} - Mob inflicts ${damage} - charHP: ${char.hp}, mobHP: ${mob.hp}`,
            });
            console.log(
                `${turnCount} - Mob inflicts ${damage} - charHP: ${char.hp}, mobHP: ${mob.hp}`
            );
        }
    }
    const data = {
        result: `${char.hp > 0 ? 'Char' : 'Mob'} wins!`,
        combat,
    };

    console.log('######## END OF COMBAT ########');

    return data;
};

const prepareCharForBattle = (char) => {
    // calculate char's attack power
};

