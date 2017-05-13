const TELEBOT = require('telebot');
const http = require('http');

const options = require('./actions/options.js');
// const getData = require('./actions/get-data.js');

let config = require('./config.json');

const app = new TELEBOT(config);
app.state = '';

app.on('/start', (ctx) => {
	ctx.reply.text('Привет, я помогу тебе мониторить объявления на Авито о съеме квартир без посредников. '+
	'Учти, что я работаю только в Санкт-Петербурге. Для начала необходимо настроить несколько параметров:');
	ctx.reply.text('Итак, какие квартиры я должен отслеживать?');
	app.state = 'options/type'
});

app.on('/options', (ctx) => {
	app.state = 'options';
	options.showOptions(app, ctx);
});

app.on('text', (ctx) => {
	if(app.state.indexOf('options') != -1){
		options.showOptions(app, ctx);
	}
});

app.start();