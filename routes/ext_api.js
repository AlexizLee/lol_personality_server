// const version = "12.22.1";
const version = "14.10.1";
const API_KEY = process.env.API_KEY;
const getRegionFormat1 = {
    'KR':'kr',
    'kr':'kr',
    'NA':'na1',
    'na':'na1'
}

const getRegionFormat2 = {
    'KR':'asia',
    'kr':'asia',
    'NA':'americas',
    'na':'americas'
}

const API = {
    icon: {
        summoner: (icon) => `http://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${icon}.png`,
        champion: (championName) => `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`,
    },
    match: {
        history: (region, count, puuid) =>`https://${getRegionFormat2[region]}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}&api_key=${API_KEY}`,
        info: (region, matchid) => `https://${getRegionFormat2[region]}.api.riotgames.com/lol/match/v5/matches/${matchid}?api_key=${API_KEY}`,
    },
    summoner: {
       info: (region, encryptedPUUID) => `https://${getRegionFormat1[region]}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encryptedPUUID}?api_key=${API_KEY}`
    },
    account: {
        info: (region, gameName, tagLine) => `https://${getRegionFormat2[region]}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${API_KEY}`
    }
}

module.exports = { API };