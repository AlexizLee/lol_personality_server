const express = require('express');
const router = express.Router();
const gameplayController = require('../../controllers/gameplayController')
const asyncHandler = require('../../utils/asyncHandler')

router.get('/',(req, res)=>{
    res.send('personality route');
});

router.get('/info', asyncHandler(gameplayController.getGameplayInfo));

module.exports = router;