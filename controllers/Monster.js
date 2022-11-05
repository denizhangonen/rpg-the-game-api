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

