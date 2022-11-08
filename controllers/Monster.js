const Monster = require('../models/Monster');

const GENERAL_ENUMS = require('../shared/enums/generalEnums');

exports.createMonster = async (req, res, next) => {
    try {
        const newMonster = new Monster({
            name: 'Skeleton',
            level: 12,
            maps: [{ map: GENERAL_ENUMS.MAPS.elmoradCastle }],
            goldDrop: 35,
            expPerKill: 10,
            itemDrops: [
                {
                    itemId: '6366720a19f1fb5ce25acb68',
                    rate: 0.1,
                },
            ],
        });

        const savedMonster = await newMonster.save();

        res.status(200).json({
            message: 'New Monster created',
            savedMonster,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.getMonsters = async (req, res, next) => {
    try {
        const monsters = await Monster.find();

        res.status(200).json({
            message: 'All Monsters',
            monsters,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

//get monsters by map
exports.getMonstersByMap = async (req, res, next) => {    
    try {
        const monsters = await Monster.find({
            maps: { $elemMatch: { map: req.params.map } },
        });

        res.status(200).json({
            message: 'All Monsters',
            monsters,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// get monster details
exports.getMonsterDetails = async (req, res, next) => {
    try {
        const monster = await Monster.findById(req.params.monsterId);

        res.status(200).json({
            message: 'Monster Details',
            monster,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

