const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rateLimiter = require('express-rate-limit');
const compression = require('compression');

app.use(compression({
    level: 5,
    threshold: 0,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.all('/favicon.ico', function(req, res) {
    
});

app.all('/player/login/dashboard', function (req, res) {
    const tData = {};
    try {
        const uData = JSON.stringify(req.body).split('"')[1].split('\\n'); const uName = uData[0].split('|'); const uPass = uData[1].split('|');
        for (let i = 0; i < uData.length - 1; i++) { const d = uData[i].split('|'); tData[d[0]] = d[1]; }
        if (uName[1] && uPass[1]) { res.redirect('/player/growid/login/validate'); }
    } catch (why) { console.log(`Warning: ${why}`); }

    res.render(__dirname + '/public/html/dashboard.ejs', {data: tData});
});

app.all('/player/growid/login/validate', (req, res) => {
    const { _token = '', growId = '', password = '', email = '' } = req.body;

    let encodedData;
    if (email === 'guest@gmail.com') {
        encodedData = Buffer.from(
            `_token=${_token}&growId=Guest&password=Guest&email=${email}`
        ).toString('base64');
    } else {
        encodedData = Buffer.from(
            `_token=${_token}&growId=${growId}&password=${password}&email=${email}`
        ).toString('base64');
    }

    const response = {
        status: 'success',
        message: 'Account Validated.',
        token: encodedData,
        url: '',
        accountType: 'growtopia'
    };
    res.type('application/json').send(response);
});

app.all('/player/growid/checktoken', (req, res) => {
    const refreshToken = req.body.refreshToken || req.query.refreshToken || '';

    if (!refreshToken) {
        res.status(404);
        return res.send({
            status: 'error',
            message: 'Missing refresh token.'
        });
    }

    try {
        const decoded = Buffer.from(refreshToken, 'base64').toString('utf-8');

        if (!decoded.includes('growId=') || !decoded.includes('password=')) {
            console.warn('[Growtopia Dashboard] Invalid or malformed token, redirecting...');
            return res.render(__dirname + '/public/html/dashboard.ejs');
        }

        const response = {
            status: 'success',
            message: 'Account Validated.',
            token: refreshToken,
            url: '',
            accountType: 'growtopia'
        };

        console.log('[Growtopia Dashboard] Token validation successful');
        res.type('application/json').send(response);
    } catch (err) {
        console.error('[Growtopia Dashboard] Token decoding failed:', err.message);
        res.render(__dirname + '/public/html/dashboard.ejs');
    }
});

app.get('/', function (req, res) {
   res.send('Diamond PS');
});

app.listen(5000, function () {
    console.log('Listening on port 5000');
});
