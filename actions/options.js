let optionMessages = {
    'default': [
        {
            text: '⚙ Настройки',
            state: 'options'
        },
        {
            text: '/options',
            state: 'options'
        }
    ],  
    'options': [
        {
            text: 'Выбрать количество комнат',
            state: 'options/select'
        },
        {
            text: 'Ввести минимальную цену',
            state: 'options/minprice'
        },
        {
            text: 'Ввести максимальную цену',
            state: 'options/maxprice'
        },
        {
            text: 'Наличие фотографий у объявлений',
            state: 'options/photo'
        },
        {
            text: 'Завершить настройку',
            state: 'default'
        }
    ],
    'options/select': [
        {
            text: '← Назад',
            state: 'options'
        },
        {
            text: 'Студия',
            state: 'options/select',
            option: 'type0'
        },
        {
            text: '1-к. квартира',
            state: 'options/select',
            option: 'type1'
        },
        {
            text: '2-к. квартира',
            state: 'options/select',
            option: 'type2'
        },
        {
            text: '3-к. квартира',
            state: 'options/select',
            option: 'type3'
        },
        {
            text: '4-к. квартира',
            state: 'options/select',
            option: 'type4'
        }
    ],
    'options/minprice': [],
    'options/maxprice': [],
    'options/photo' : [
        {
            text: '← Назад',
            state: 'options'
        },
        {
            text: 'Только с фотографиями',
            state: 'options/photo',
            option: 'photo',
            value: 1           
        },
        {
            text: 'С фото и без',
            state: 'options/photo',
            option: 'photo',
            value: 0           
        }
    ]
}

let options = {
    options: {},
    // При изменении не забудь поменять и в sqlrequests
    optionExample: {
        type0: false,
        type1: false,
        type2: false,
        type3: false,
        type4: false,
        maxPrice: 200000,
        minPrice: 0,
        photo: false,
        broadcast: false
    },
    request: undefined,
    states: undefined,
    messages: undefined,
    setStates: function(states) {
        this.states = states;
    },
    setRequest: function(request) {
        this.request = request;
    },
    setMessages: function(messages) {
        this.messages = messages;
    },
    showOptions: function(app, ctx){
        let state = this.states.getUserState(ctx.from.id);
        let possibleMessages = optionMessages[state];

        // Перевод в состояние в зависимости от текста, иначе оставляем текущее состояние
        Object.keys(possibleMessages).forEach((item) => {
            if (ctx.text.indexOf(possibleMessages[item].text) != -1) {
                this.states.setUserState(ctx.from.id, possibleMessages[item].state);
                state = possibleMessages[item].state;
            }
        });

        switch (state) {
            case 'options':
                this.showMainOptions(app, ctx);
                break;
            case 'options/select':
                this.showOptionsSelect(app, ctx);
                break;
            case 'options/minprice':
                this.showOptionsMinprice(app, ctx);
                break;
            case 'options/maxprice':
                this.showOptionsMaxprice(app, ctx);
                break;
            case 'options/photo':
                this.showOptionsPhoto(app, ctx);
                break;
            default: 
                this.states.setUserState(ctx.from.id, 'default');
                this.messages.defaultStatusReply(ctx, ['Настройка завершена'], this.options[ctx.from.id]);
        }
    },

    // Вывод главного экрана options
    showMainOptions: function(app, ctx) {
        let keyboardArray = [];
        Object.keys(optionMessages['options']).forEach(item => {
            keyboardArray.push([optionMessages['options'][item].text]);
        });

        var keyboard = app.keyboard(keyboardArray, {once: false, resize: true});
        this.messages.sendKeyboardMessage(ctx.from.id, 'Выберите пункт настроек', keyboard);
    },

    // Вывод выбора количества комнат
    showOptionsSelect: function(app, ctx) {
        let keyboardArray = [];

        var messageReply = function(text) {
            optionMessages['options/select'].forEach((item, i, arr) => {
                let option = this.options[ctx.from.id][item.option];
                if (option == undefined) {
                    keyboardArray.push([item.text]);
                } else {
                    let preSign = (option) ? '● ' : '○ ';
                    keyboardArray.push([preSign + item.text]);
                }
            });

            var keyboard = app.keyboard(keyboardArray, {once: false, resize: true});
            this.messages.sendKeyboardMessage(ctx.from.id, text, keyboard);
        }

        if (ctx.text.indexOf('● ') != -1 || ctx.text.indexOf('○ ') != -1) {
            optionMessages['options/select'].forEach((item, i, arr) => {
                if (ctx.text.indexOf(item.text) != -1) {
                    let val = this.options[ctx.from.id][item.option];
                    this.setOption(ctx.from.id, item.option, ((val == 1) ? 0 : 1))
                        .then(() => {messageReply.apply(this, ['Данные обновлены'])});
                }
            });
        } else {
            messageReply.apply(this, ['По каким квартирам вы хотите получать объявления (отметьте необходимые)']);
        }
    },

    // Ввод минимальной цены
    showOptionsMinprice : function(app, ctx) {
        if (ctx.text.indexOf('Ввести') != -1) {
            this.messages.sendMessage(ctx.from.id, 'Введите минимальную цену (текущая: ' + this.options[ctx.from.id].minPrice + 'р.). Цена должна быть в промежутке от 0 до 200000р');
        } else if (isFinite(ctx.text)) {
            let value = (ctx.text < 0) ? 0 : ctx.text;
            value = (value > 200000) ? 200000 : value;

            if (value <= this.options[ctx.from.id].maxPrice) {
                this.setOption(ctx.from.id, 'minPrice', parseInt(value))
                    .then(() => {
                        this.states.setUserState(ctx.from.id, 'options');
                        this.messages.sendMessage(ctx.from.id, 'Установлена минимальная цена - ' + value + 'р.');
                        this.showMainOptions(app, ctx);
                    })
            } else {
                this.messages.sendMessage(ctx.from.id, 'Указанная цена больше чем максимальная (' + this.options[ctx.from.id].maxPrice + 'р.). Введите другое значение.');
            }
        } else {
            this.messages.sendMessage(ctx.from.id, 'Введите целое число');
        }
    },

    // Ввод максимальной цены
    showOptionsMaxprice : function(app, ctx) {
        if (ctx.text.indexOf('Ввести') != -1) {
            this.messages.sendMessage(ctx.from.id, 'Введите максимальную цену (текущая: ' + this.options[ctx.from.id].maxPrice + 'р.). Цена должна быть в промежутке от 0 до 200000р');
        } else if (isFinite(ctx.text)) {
            let value = (ctx.text < 0) ? 0 : ctx.text;
            value = (value > 200000) ? 200000 : value;
            if (value >= this.options[ctx.from.id].minPrice) {
                this.setOption(ctx.from.id, 'maxPrice', parseInt(value))
                    .then(() => {
                        this.states.setUserState(ctx.from.id, 'options');
                        this.messages.sendMessage(ctx.from.id, 'Установлена максимальная цена - ' + value + 'р.');
                        this.showMainOptions(app, ctx);
                    })
            } else {
                this.messages.sendMessage(ctx.from.id, 'Указанная цена меньше чем минимальная (' + this.options[ctx.from.id].minPrice + 'р.). Введите другое значение.');
            }
        } else {
            this.messages.sendMessage(ctx.from.id, 'Введите целое число');
        }
    },

    showOptionsPhoto: function(app, ctx) {
        let keyboardArray = [];

        var messageReply = function(text) {
            optionMessages['options/photo'].forEach((item, i, arr) => {
                let option = this.options[ctx.from.id][item.option];
                if (option == undefined) {
                    keyboardArray.push([item.text]);
                } else {
                    let preSign = (option == item.value) ? '● ' : '○ ';
                    keyboardArray.push([preSign + item.text]);
                }
            });

            var keyboard = app.keyboard(keyboardArray, {once: false, resize: true});
            this.messages.sendKeyboardMessage(ctx.from.id, text, keyboard);
        }

        if (ctx.text.indexOf('● ') != -1 || ctx.text.indexOf('○ ') != -1) {
            optionMessages['options/photo'].forEach((item, i, arr) => {
                if (ctx.text.indexOf(item.text) != -1) {
                    let text = item.value ? 'Теперь будут показываться объявления только с фото' : 'Будут показываться все объявления';
                    this.setOption(ctx.from.id, item.option, item.value)
                        .then(() => {messageReply.apply(this, [text])});
                }
            });
        } else {
            messageReply.apply(this, ['Выберите одну из опций']);
        }
    },

    setOption: function(id, optName, optValue) {
        return new Promise((resolve, reject) => {
            this.request.updateUserConfig(id, optName, optValue)
                .then(res => {
                    this.options[id][optName] = optValue;
                    resolve(this.options[id]);
                })
                .catch(() => {reject()});
        })
    },
    getOptionsForUsers: function(users) {
        let opts = {};
        users.forEach((item) => {
            opts[item] = this.options[item];
        });
        return opts;
    },
    getUserOptions: function(id) {
        return new Promise((resolve, reject) => {
            if (this.options[id] == undefined) reject();
            else resolve(this.options[id]);
        });
    },
    createUserOptions: function(id) {
        return new Promise((resolve, reject) => {
            this.request.createUserConfig(id)
                .then(() => {
                    this.options[id] = this.optionExample;
                    resolve(this.options[id]);
                })
                .catch(err => {reject(err)});
        })
    },
    loadOptions: function() {
        return this.request.getUserConfigs()
            .then(result => {
                result.forEach((item, i) => {
                    this.options[item.id] = item;
                });
            })
            .catch(() => {});
    }
}

module.exports = options;