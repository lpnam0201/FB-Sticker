const login = require('facebook-chat-api')
const fs = require('fs');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

var appStateFileName = `${__dirname}/appstate.json`;

var apiInstance = null;
var errorObj = null;

wss.on('connection', (ws, req) => {
    ws.on('message', message => {
        let messageJSON = JSON.parse(message);

        if (messageJSON.type === 'login') {
            loginByEmailAndPassword(ws, messageJSON.email, messageJSON.password);
        }

        if (messageJSON.type === 'send') {
            sendSticker(ws, messageJSON.stickerId, messageJSON.recipientId);
        }

        if (messageJSON.type === 'login-approval') {
            sendLoginApprovalCode(ws, messageJSON.code);
        }
    });

    ws.send('Connected');
});

function isReady() {
    return apiInstance != null;
}

function loginByEmailAndPassword(ws, email, password) {
    let loginData = {
        email: email,
        password: password
    }

    login(loginData, (err, api) => {
        if (err) {
            switch (err.error) {
                case 'login-approval':
                    errorObj = err;
                    ws.send('Login approval required');
                    break;
                case 'review-recent-login':
                    console.log(err);
                    break;
                default:
                    console.log(err);
            }
        }

        fs.writeFileSync(appStateFileName, JSON.stringify(api.getAppState()));
        apiInstance = api;
        ws.send('Logged in');
    })

    ws.send('Logging in');
}

function sendSticker(ws, stickerId, recipientId) {
    if (isReady()) {
        let msg = {
            body: '',
            attachment: fs.createReadStream(`${__dirname}/stickers/${stickerId}.gif`)
        }
        apiInstance.sendMessage(msg, recipientId);
        ws.send('Sent')
    } else {
        ws.send('Api not ready')
    }
}

function sendLoginApprovalCode(ws, code) {
    if (errorObj) {
        errorObj.continue(code);
        errorObj = null;
        ws.send('Entered 2FA code');
    } else {
        ws.send('No login approval needed');
    }
}

function getAppState() {
    if (fs.existsSync(appStateFileName)) {
        return JSON.parse(fs.readFileSync(appStateFileName, 'utf-8'));
    }
    return null;
};

function initialize() {
    let initialAppState = getAppState();
    if (initialAppState) {
        login({ appState: getAppState()}, (err, api) => {
            if (err) {
                console.log(err);
            }
            apiInstance = api;
            console.log('api ready');
        });
    }
}

initialize();