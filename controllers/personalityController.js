const fs = require("fs")
const path = require("path")

const DEFAULT_LANG = "en"
const jsonDir = path.join(__dirname, "../public/jsons")

// loads every personalities.<lang>.json once at startup, e.g. { en: {...}, ko: {...} }
const personalitiesByLang = {}
for (const file of fs.readdirSync(jsonDir)) {
    const match = file.match(/^personalities\.([\w-]+)\.json$/)
    if (match) {
        personalitiesByLang[match[1]] = require(path.join(jsonDir, file))
    }
}

const getPersonalities = (lang) => personalitiesByLang[lang] || personalitiesByLang[DEFAULT_LANG]

// pos: [primary, ...secondary] positions that suit the champion's personality
// kda: the (kill+assist)/death this personality feels most at home with
// TOP: lonely/individualist, MIDDLE: narcissist/carry, JUNGLE: sacrificial/stressed multitasker,
// BOTTOM: patient/sensitive/wants to be king, UTILITY: caring/motherly
const champProfiles = {
    Tryndamere: { pos: ["TOP"], kda: 2.5 },
    Garen: { pos: ["TOP"], kda: 3 },
    Malphite: { pos: ["TOP", "UTILITY"], kda: 2.5 },
    Nasus: { pos: ["TOP"], kda: 3 },
    Teemo: { pos: ["TOP", "JUNGLE"], kda: 1.5 },
    Yasuo: { pos: ["MIDDLE", "TOP"], kda: 1.5 },
    Ahri: { pos: ["MIDDLE"], kda: 4 },
    Zed: { pos: ["MIDDLE", "JUNGLE"], kda: 3.5 },
    Lux: { pos: ["MIDDLE", "UTILITY"], kda: 3 },
    Annie: { pos: ["MIDDLE", "UTILITY"], kda: 2 },
    Fizz: { pos: ["MIDDLE"], kda: 3 },
    Amumu: { pos: ["JUNGLE", "UTILITY"], kda: 2 },
    Gragas: { pos: ["JUNGLE", "TOP"], kda: 2.5 },
    Vi: { pos: ["JUNGLE"], kda: 3 },
    Karthus: { pos: ["JUNGLE", "MIDDLE"], kda: 3.5 },
    Jinx: { pos: ["BOTTOM"], kda: 3.5 },
    Draven: { pos: ["BOTTOM"], kda: 4 },
    Ezreal: { pos: ["BOTTOM", "MIDDLE"], kda: 2.5 },
    Ashe: { pos: ["BOTTOM", "UTILITY"], kda: 3 },
    Thresh: { pos: ["UTILITY"], kda: 2.5 },
    Blitzcrank: { pos: ["UTILITY"], kda: 2 },
    Lulu: { pos: ["UTILITY"], kda: 3 },
    Janna: { pos: ["UTILITY"], kda: 3 },
    Sona: { pos: ["UTILITY"], kda: 3.5 },
    Soraka: { pos: ["UTILITY"], kda: 3 }
}

const MAIN_CHAMP_SCORE = 1
const PRIMARY_POS_SCORE = 3
const SECONDARY_POS_SCORE = 1.5
const MAX_KDA_SCORE = 2

const getPersResult = (avgKill, avgDeath, avgAssist, mostPlayedChamp, mostPlayedPos) => {
    const kda = (avgKill + avgAssist) / Math.max(avgDeath, 1)

    let best = null
    let bestScore = -1
    for (const [champ, profile] of Object.entries(champProfiles)) {
        let score = 0
        if (champ === mostPlayedChamp) score += MAIN_CHAMP_SCORE

        const posIdx = profile.pos.indexOf(mostPlayedPos)
        if (posIdx === 0) score += PRIMARY_POS_SCORE
        else if (posIdx > 0) score += SECONDARY_POS_SCORE

        // closer to the champion's comfortable kda = higher score
        if (Number.isFinite(kda)) {
            score += Math.max(0, MAX_KDA_SCORE - Math.abs(kda - profile.kda) / 2)
        }

        if (score > bestScore) {
            best = champ
            bestScore = score
        }
    }
    return best
}

const getPersonalityInfo = async (req, res)=>{
    const avgKill = parseFloat(req.query.avgKill);
    const avgDeath = parseFloat(req.query.avgDeath);
    const avgAssist = parseFloat(req.query.avgAssist);
    const mostPlayedChamp = req.query.mostPlayedChamp;
    const mostPlayedPos = req.query.mostPlayedPos;

    const persResult = getPersResult(avgKill, avgDeath, avgAssist, mostPlayedChamp, mostPlayedPos);

    const personalities = getPersonalities(req.query.lang)

    res.send({ success: true, data: {persChamp: persResult, personality:personalities[persResult]}})
}

module.exports = {
    getPersonalityInfo
}