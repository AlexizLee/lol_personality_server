const express = require('express');
const router = express.Router();
const personalityController = require('../../controllers/personalityController')
const asyncHandler = require('../../utils/asyncHandler')

router.get('/',(req, res)=>{
    res.send('personality route');
});

router.get('/info', asyncHandler(personalityController.getPersonalityInfo));

module.exports = router;