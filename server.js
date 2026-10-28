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

// must be registered after the routes; catches anything passed to next(err)
app.use((err, req, res, next) => {
    // axios errors from the riot api carry their own status (404 unknown player, 403 bad key, 429 rate limit)
    const status = (err.response && err.response.status) || 500;
    console.error(`${req.method} ${req.originalUrl} failed:`, status, err.message);
    res.status(status).send({ success: false, message: err.message });
});

// last resort so a stray error doesn't take the server down
process.on('unhandledRejection', (reason) => console.error('Unhandled rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));
