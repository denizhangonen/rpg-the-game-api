const Item = require('../models/Item');

exports.createItems = async (req, res, next) => {
    try {
        const newItem = new Item({
            name: 'Bardish',
            level: 3,
            type: 'Spear',
            bonus: {
                attack: 8,
                defense: 0,
                magic: 0,
                luck: 0,
            },
        });

        const savedItem = await newItem.save();

        res.status(200).json({
            message: 'New Item created',
            savedItem,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};
