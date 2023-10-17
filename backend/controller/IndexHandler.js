const indexService = require('../service/IndexService');

async function getIndexHandler(req, res, next) {
    const user = req.body;
    try{
        const index = await indexService.getData(user);
        res.status(200).json(index);
    }
    catch{
        res.status(400).json({error: 'Error getting index'});
    }

}

module.exports = {
    getIndexHandler
}