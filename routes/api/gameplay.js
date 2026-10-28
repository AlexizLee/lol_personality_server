const express = require('express');
const router = express.Router();
const gameplayController = require('../../controllers/gameplayController')

router.get('/',(req, res)=>{
    res.send('personality route');
});

router.get('/info',gameplayController.getGameplayInfo);

module.exports = router;