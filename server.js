const express = require('express');
const cors = require('cors');
const app = express();
//// 모든 도메인 허용 시 (개발용)
//app.use(cors()); 

// 특정 도메인만 허용 시 (프로덕션 추천)
//app.use(cors({ origin: 'https://your-frontend-domain.com' })); 
app.use(cors())


app.get('/', (req, res) => {
    res.send('<h1>Express.js Server has been set up!</h1>')
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});

const accountRoute = require('./routes/api/account');
const personalityRoute = require('./routes/api/personality');
const gameplayRoute = require('./routes/api/gameplay');

app.use('/account', accountRoute);
app.use('/personality', personalityRoute);
app.use('/gameplay', gameplayRoute);
