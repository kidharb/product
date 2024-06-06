const db = require('../persistence');
const {v4 : uuid} = require('uuid');

module.exports = async (req, res) => {
    const item = {
        id: uuid(),
        url: req.body.url,
        completed: false,
    };

    await db.storeItem(item);
    res.send(item);
};
