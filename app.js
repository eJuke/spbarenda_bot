const TELEBOT = require('telebot');
const http = require('http');
const options = require('./actions/options.js');
const request = require('./actions/sqlrequests.js');
const states = require('./actions/states.js');
const getData = require('./actions/get-data.js');
const messages = require('./actions/messages.js');


let config = require('./config.json');
let updates = undefined;

const app = new TELEBOT(config.telebot);

request.setConnection(config.sql);
states.setRequest(request);
options.setRequest(request);

Promise.all(
    [
        states.setAllUsersStates(),
        options.loadOptions(),
    ]
).then(() => initUpdates()).then(() => initMessageHandling());

function initUpdates() {
    updates = setInterval(() => {
        getData.loadNew().then(result => messages.send(result));
    }, 60000);
    console.log('Updates started');
}

function initMessageHandling(){
    app.on('/start', (ctx) => {
        var messages = ['Привет, я помогу тебе мониторить объявления на Авито о съеме квартир. Учти, что я работаю только в Санкт-Петербурге. ',
            'Для начала необходимо настроить несколько параметров. Для этого перейди в настройки'];
        states.setUserState(ctx.from.id, 'default');
        options.getUserOptions(ctx.from.id)
            .then(res => {
                defaultStatusReply(ctx, messages, res);
            })
            .catch(() => {
                options.createUserOptions(ctx.from.id)
                    .then(res => {
                        defaultStatusReply(ctx, messages, res);
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
    console.log('Message handling started');
}

function defaultStatusHandling(ctx) {
    if (ctx.text.indexOf('Включить трансляцию') != -1) {
        options.setOption(ctx.from.id, 'broadcast', 1)
            .then((option) => {defaultStatusReply(ctx, ['Трансляция включена'], option)}
        );
    }
    else if (ctx.text.indexOf('Выключить трансляцию') != -1) {
        options.setOption(ctx.from.id, 'broadcast', 0)
            .then((option) => {defaultStatusReply(ctx, ['Трансляция выключена'], option)}
        );
    }
    else if (ctx.text.indexOf('Настройки') != -1) {
        states.setUserState(ctx.from.id, 'options');
        options.showOptions(app, ctx);
    }
    else {
        options.getUserOptions(ctx.from.id)
            .then(res => {
                defaultStatusReply(ctx, ['Извините, я не могу вас понять. Выберите необходимый пункт меню'], res);
            }
        );
    }
}

function defaultStatusReply(ctx, texts, uOption) {
    texts.forEach((item, i) => {
        if (i == texts.length - 1){
            var broadcast = (uOption.broadcast) ? '● Выключить трансляцию' : '○ Включить трансляцию';
            let keyboard = app.keyboard(
                [
                    [broadcast],
                    ['⚙ Настройки']
                ],
                {
                    once: false,
                    resize: true
                }
            )
            app.sendMessage(ctx.from.id, item, {markup: keyboard});
        }
        else ctx.reply.text(item);
    })
}