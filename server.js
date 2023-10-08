const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');

const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});

const PORT = 3000;

const secretKey = "My secret key";

const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']

});

let users = [
    {
        id: 1,
        username: 'Sireesha',
        password: '1434'
    },
    {
        id: 2,
        username: 'Sammeta',
        password: '9876'
    }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let userFound = false;

    for (let user of users) {
        if (username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '180s' });
            res.json({
                success: true,
                err: null,
                token
            });
            userFound = true;
            break;
        }
    }

    if (!userFound) {
        res.status(401).json({
            success: false,
            token: null,
            err: 'Username or password is incorrect'
        });
    }
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content by Sireesha that only logged-in people can see'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Settings content using JWT token by JWT'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    if (err.name === "UnthorizedError") {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    }
    else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(' app serving at http://localhost:'+PORT);
});