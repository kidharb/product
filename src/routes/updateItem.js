const db = require('../persistence');

module.exports = async (req, res) => {
    await db.updateItem(req.params.id, {
        url: req.body.url,
        completed: req.body.completed,
    });
    const item = await db.getItem(req.params.id);
    res.send(item);
};
