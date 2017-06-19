const TELEBOT = require('telebot');
const options = require('./actions/options.js');
const request = require('./actions/sqlrequests.js');
const states = require('./actions/states.js');
const getData = require('./actions/get-data.js');
const messages = require('./actions/messages.js');


let config = require('./config.json');
let updates = undefined;

// Настройка
const app = new TELEBOT(config.telebot);

request.setConnection(config.sql);
messages.setApp(app);
states.setRequest(request);
options.setRequest(request);

Promise.all(
    [
        states.setAllUsersStates(),
        options.loadOptions(),
    ]
).then(() => {
    initUpdates();
    initMessageHandling();
    options.setStates(states);
    options.setMessages(messages);
});

// Старт проверки объявлений
function initUpdates() {
    // updates = setInterval(() => {
        getData.loadNew().then(result => {
            let allStates = states.getAllUsersStates();
            let defaultStates = [];

            Object.keys(allStates).forEach((item) => {
                if (allStates[item] == 'default') defaultStates.push(item);
            });
            let opts = options.getOptionsForUsers(defaultStates);
            // messages.send(result, opts)
        });
    // }, 60000);
    console.info('Updates started');
}

// Старт обработчика сообщений
function initMessageHandling(){
    app.on('/start', (ctx) => {
        var text = ['Привет, я помогу тебе мониторить объявления на Авито о съеме квартир. Учти, что я работаю только в Санкт-Петербурге. ',
            'Для начала необходимо настроить несколько параметров. Для этого перейди в настройки'];
        states.setUserState(ctx.from.id, 'default');
        options.getUserOptions(ctx.from.id)
            .then(res => {
                messages.defaultStatusReply(ctx, text, res);
            })
            .catch(() => {
                options.createUserOptions(ctx.from.id)
                    .then(res => {
                        messages.defaultStatusReply(ctx, text, res);
                    })
                    .catch(err => {throw err; });
            });
    });

    app.on('/options', (ctx) => {
        states.setUserState(ctx.from.id, 'options');
    });

    app.on('text', (ctx) => {
        if (ctx.text.indexOf('/') == 0) return;
        let state = states.getUserState(ctx.from.id) || 'default';
        if(state.indexOf('options') != -1){
            options.showOptions(app, ctx);
            return;
        }
        if(state.indexOf('default') != -1){
            defaultStatusHandling(ctx);
            return;
        }
    });

    app.start();
    console.info('Message handling started');
}

// Обработка команд в default
function defaultStatusHandling(ctx) {
    if (ctx.text.indexOf('Включить трансляцию') != -1) {
        options.setOption(ctx.from.id, 'broadcast', 1)
            .then((option) => {messages.defaultStatusReply(ctx, ['Трансляция включена'], option)}
        );
    }
    else if (ctx.text.indexOf('Выключить трансляцию') != -1) {
        options.setOption(ctx.from.id, 'broadcast', 0)
            .then((option) => {messages.defaultStatusReply(ctx, ['Трансляция выключена'], option)}
        );
    }
    else if (ctx.text.indexOf('Настройки') != -1) {
        options.showOptions(app, ctx);
    }
    else {
        options.getUserOptions(ctx.from.id)
            .then(res => {
                messages.defaultStatusReply(ctx, ['Извините, я не могу вас понять. Выберите необходимый пункт меню'], res);
            })
            .catch(() => {
                options.createUserOptions(ctx.from.id)
                    .then(res => {
                        messages.defaultStatusReply(ctx, ['Извините, я не могу вас понять. Выберите необходимый пункт меню'], res);
                    })
                    .catch(err => {throw err; });
            });
    }
}

