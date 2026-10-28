const express = require('express');
const router = express.Router();
const axios = require('axios');

require('dotenv').config();

router.get('/',(req, res)=>{
    res.send('account route');
});
router.get('/info',(req, res, next)=>{
    const gameName = req.query.gameName;
    const tagLine = req.query.tagLine;
    const url = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${process.env.API_KEY}`;
    axios.get(url).then(response => {
        console.log("success", response);
        res.send(response.data);
    }).catch(next);
});

module.exports = router;