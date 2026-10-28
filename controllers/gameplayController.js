const axios = require('axios');
const ext_api = require('../routes/ext_api')

const NUM_MATCHES = 10;

const getAccountInfo = async (region, gameName, tagLine) => {
    return await axios.get(ext_api.API.account.info(region, gameName, tagLine));
}

const getAllMatchesInfo = async (region, count, puuid) => {
    return await axios.get(ext_api.API.match.history(region, count, puuid))
}

const getMatchInfobyId = async (region, matchId) => {
    return await axios.get(ext_api.API.match.info(region, matchId))
}

const RANKED_QUEUE_IDS = [420, 440];
const SCORE_KEYS = ['aggressiveness', 'optimism', 'competitiveness', 'friendliness', 'diligence'];

const clamp01 = (x) => Math.min(Math.max(x, 0), 1);

// each score is 0-1 for a single match, built from a few weighted signals
const getMatchScores = (p, info) => {
    const minutes = Math.max(p.timePlayed || 0, 60) / 60;
    const c = p.challenges || {};
    const team = info.participants.filter(x => x.teamId === p.teamId);
    const teamKills = team.reduce((s, x) => s + x.kills, 0);
    const teamDamage = team.reduce((s, x) => s + x.totalDamageDealtToChampions, 0);

    const damageShare = teamDamage ? p.totalDamageDealtToChampions / teamDamage : 0;
    const killParticipation = teamKills ? (p.kills + p.assists) / teamKills : 0;
    const assistShare = (p.kills + p.assists) ? p.assists / (p.kills + p.assists) : 0;
    const cs = (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0);
    const gaveUp = !p.win && (p.gameEndedInSurrender || p.gameEndedInEarlySurrender);

    return {
        // kills, damage share, solo kills and first blood
        aggressiveness: 0.4 * clamp01(p.kills / minutes / 0.3)
            + 0.4 * clamp01(damageShare / 0.3)
            + 0.2 * clamp01((c.soloKills || 0) / 3 + (p.firstBloodKill ? 0.5 : 0)),
        // plays on after being behind, wins, and doesn't die constantly
        optimism: 0.5 * (gaveUp ? 0 : 1)
            + 0.3 * (p.win ? 1 : 0)
            + 0.2 * (1 - clamp01(p.deaths / minutes / 0.3)),
        // farming, gold, winning, and queueing ranked
        competitiveness: 0.3 * clamp01(cs / minutes / 8)
            + 0.3 * clamp01(p.goldEarned / minutes / 450)
            + 0.2 * (p.win ? 1 : 0)
            + 0.2 * (RANKED_QUEUE_IDS.includes(info.queueId) ? 1 : 0),
        // team fights, assists, healing/shielding allies, vision for the team
        friendliness: 0.35 * clamp01(killParticipation)
            + 0.25 * assistShare
            + 0.2 * clamp01(((p.totalHealsOnTeammates || 0) + (p.totalDamageShieldedOnTeammates || 0)) / minutes / 300)
            + 0.2 * clamp01((p.visionScore || 0) / minutes / 1.2),
        // farm or vision, time alive, and objective damage
        diligence: 0.35 * clamp01(Math.max(cs / minutes / 8, (p.visionScore || 0) / minutes / 2))
            + 0.3 * (1 - clamp01((p.totalTimeSpentDead || 0) / (p.timePlayed || 1) / 0.3))
            + 0.35 * clamp01((p.damageDealtToObjectives || 0) / minutes / 600)
    };
}

const getGameplayInfo = async (req, res)=>{
    const region = req.query.region;
    const gameName = req.query.gameName;
    const tagLine = req.query.tagLine;
    const accountInfoRes =  await getAccountInfo(region, gameName, tagLine);
    if (accountInfoRes && accountInfoRes.data && accountInfoRes.data.puuid){
        const puuid = accountInfoRes.data.puuid;
        const count = NUM_MATCHES;
        const allMatchesInfoRes = await getAllMatchesInfo(region, count, puuid);
        if (allMatchesInfoRes && allMatchesInfoRes.data){
            const matchIds = allMatchesInfoRes.data;
            const matchInfos = [];
            let sumKill = 0;
            let sumDeath = 0
            let sumAssist = 0;
            let numCorrMatches = 0;
            const sumScores = Object.fromEntries(SCORE_KEYS.map(k => [k, 0]));
            let mostPlayedChamp = "";
            let mostPlayedPos = "";
            const champs = {};
            const poss = {};
            for (const matchId of matchIds){
                const matchInfoRes = await getMatchInfobyId(region, matchId);
                if (matchInfoRes && matchInfoRes.data && matchInfoRes.data.info && matchInfoRes.data.info.participants){
                    for (const participant of matchInfoRes.data.info.participants){
                        if (participant.puuid === puuid){
                            const matchInfo = { championName: participant.championName, gamedate: new Date(matchInfoRes.data.info.gameCreation).toLocaleDateString(), kills: participant.kills, deaths: participant.deaths, assists: participant.assists};
                            matchInfos.push(matchInfo);
                            sumKill += participant.kills;
                            sumDeath += participant.deaths;
                            sumAssist += participant.assists;
                            numCorrMatches += 1;
                            const matchScores = getMatchScores(participant, matchInfoRes.data.info);
                            for (const k of SCORE_KEYS){
                                sumScores[k] += matchScores[k];
                            }
                            if (champs.hasOwnProperty(participant.championName)){
                                champs[participant.championName] +=1
                            } else {
                                champs[participant.championName] = 1
                            }
                            if (poss.hasOwnProperty(participant.teamPosition)){
                                poss[participant.teamPosition] +=1
                            } else {
                                poss[participant.teamPosition] = 1
                            }
                        }
                    }
                }
            }
            mostPlayedChamp = Object.keys(champs).reduce(function(a, b){ return champs[a] > champs[b] ? a : b });
            const topChamps = Object.entries(champs)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([championName]) => championName);
            mostPlayedPos = Object.keys(poss).reduce(function(a, b){ return poss[a] > poss[b] ? a : b });
            const topPoss = Object.entries(poss)
                .filter(([pos]) => pos)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([pos]) => pos);
            const avgKill = sumKill/numCorrMatches;
            const avgDeath = sumDeath/numCorrMatches;
            const avgAssist = sumAssist/numCorrMatches;
            const scores = Object.fromEntries(SCORE_KEYS.map(k => [k, Math.round(sumScores[k] / numCorrMatches * 100)]));
            res.send({success:true, data: {matchInfos, analysis: {avgKill, avgDeath, avgAssist, mostPlayedChamp, topChamps, mostPlayedPos, topPoss, scores}}})
        }
        else {
            res.send({success: false})
        }
    } else {
        res.send({success: false})
    }
}

module.exports = {
    getGameplayInfo
}