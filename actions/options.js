let messages = {
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
            text: '<- Назад',
            state: 'options'
        },
        {
            text: 'Студия',
            state: 'options/select'
        },
        {
            text: '1-к. квартира',
            state: 'options/select'
        },
        {
            text: '2-к. квартира',
            state: 'options/select'
        },
        {
            text: '3-к. квартира',
            state: 'options/select'
        },
        {
            text: '4-к. квартира',
            state: 'options/select'
        }
    ]
}

let options = {
    options: {},
    optionExample: {
        type0: false,
        type1: false,
        type2: false,
        type3: false,
        type4: false,
        maxPrice: 0,
        minPrice: 0,
        photo: false,
        broadcast: false
    },
    request: undefined,
    setRequest(request) {
        this.request = request;
    },
    showOptions: function(app, ctx){

    },
    setOption(id, optName, optValue) {
        return new Promise((resolve, reject) => {
            this.request.updateUserConfig(id, optName, optValue)
                .then(res => {
                    this.options[id][optName] = optValue;
                    resolve(this.options[id]);
                })
                .catch(() => {reject()});
        })
    },
    getUserOptions(id) {
        return new Promise((resolve, reject) => {
            if (this.options[id] == undefined) reject();
            else resolve(this.options[id]);
        });
    },
    createUserOptions(id) {
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