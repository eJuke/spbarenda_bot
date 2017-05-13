let options = {
	config: {
		type: {
			'Студия' : 0,
			'1-к. квартира': 1,
			'2-к. квартира': 2,
			'3-к. квартира': 3,
			'4-к. квартира': 4
		}
	},
	showOptions: function(app, ctx){
		switch (app.state) {
			// Вызов опций на экран
			case 'options':
				let keyboard = app.keyboard(
					[
						['Выбрать количество комнат'],
						['Ввести минимальную цену'],
						['Ввести максимальную цену'],
						['Выводить только с фотографиями?'],
						['Завершить настройку']
					],
					{once: true}
				);
				app.sendMessage(ctx.from.id, 'Выберите необходимый параметр', {markup: keyboard})
				app.state = 'options/select';
				break;

			// Общий обработчик для опций
			case 'options/select':
				switch(ctx.text){
					case 'Выбрать количество комнат':
						let keyboard = app.keyboard(
							[
								[['<- Назад'],['Студия']],
								[['1-к. квартира'],['2-к. квартира']],
								[['3-к. квартира'],['4-к. квартира']]
							],
							{resize: true, once: false}
						);
						app.sendMessage(ctx.from.id, 'Выберите одно или несколько значений', {markup: keyboard});
						app.state = 'options/type';
						break;

					case 'Ввести минимальную цену':
						app.state = 'options/minprice';
						app.reply.text('Введите минимальную цену:')ж
						break;

					case 'Ввести максимальную цену':
						app.state = 'options/maxprice';
						app.reply.text('Введите максимальную цену:')ж
						break;

					case 'Выводить только с фотографиями?':
						let keyboard = app.keyboard(
							[
								[['Все'],['Только с фото']],
							],
							{resize: true, once: true}
						);
						app.state = 'options/photo';
						app.sendMessage(ctx.from.id, 'Какие объявления выводить?', {markup: keyboard});
						break;

					case 'Завершить настройку':
						app.state = '';
						break;

					default:
						app.reply.text('Выберите команду на клавиатуре');
						break;
				}
				break;

			// Выбор типа квартиры
			case 'options/type':
				break;

			// Ввод максимальной цены
			case 'options/maxprice':
				break;

			// Ввод минимальной цены
			case 'options/minprice':
				break;
			
			// Выбор показа фотографий
			case 'options/photo':
				break;
		}
	},
}

module.exports = options;