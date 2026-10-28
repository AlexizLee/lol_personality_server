const express = require('express');
const router = express.Router();
const personalityController = require('../../controllers/personalityController')

router.get('/',(req, res)=>{
    res.send('personality route');
});

router.get('/info', personalityController.getPersonalityInfo);

module.exports = router;