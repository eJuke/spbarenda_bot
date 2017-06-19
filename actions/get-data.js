let https = require('https');

let data = {
    url: 'https://www.avito.ru/sankt-peterburg/kvartiry/sdam/na_dlitelnyy_srok?f=550_5702-5703-5704-5705-5706&view=gallery',
    request: undefined,
    setRequest: function(request) {
        this.request = request;
    },
    loadNew: function(){
        let context = this;
        return new Promise((resolve, reject) => {
            https.get(this.url, function(res){
                res.setEncoding('utf8');
                var data = '';
                res.on('data', function(chunk){
                    data += chunk;
                });
                res.on('end', function(){
                    var result = context.parse(data);
                    resolve(result);
                })
            }).on('error', err => reject(err));
        })
    },
    parse: function(body) {
        let split = body.slice(body.indexOf('catalog-list'), body.indexOf('js-pages')).split('js-catalog-item-enum');
        split.shift();
        let result = []; 
        split.forEach((item) => {
            var obj = {};
            let temp = item.indexOf('id="i');
            let titleStartPos = item.indexOf('title="', item.indexOf('description-title-link') + 20);
            let title = item.slice(titleStartPos+7, item.indexOf('"', titleStartPos+7));

            let priceStartPos = item.indexOf('option price">');
            let price = item.slice(priceStartPos+15, item.indexOf('р.', priceStartPos+12)).replace(/ /gi, '');

            let photoStartPos = item.indexOf('<img', item.indexOf('img-link')+8);
            let hasPhoto = (photoStartPos == -1) ? false : true;

            photoStartPos = hasPhoto ? item.indexOf('data-srcpath="//', photoStartPos + 4) + 16 : undefined;
            let photoUrl = hasPhoto ? item.slice(photoStartPos, item.indexOf('"', photoStartPos)) : undefined;

            obj.id = item.slice(temp+5, item.indexOf('"', temp+5));
            obj.type = function(text) {
                if (text.indexOf('Студия') != -1) return 0;
                if (text.indexOf('1-к квартира') != -1) return 1;
                if (text.indexOf('2-к квартира') != -1) return 2;
                if (text.indexOf('3-к квартира') != -1) return 3;
                if (text.indexOf('4-к квартира') != -1) return 4;
            }(title);
            obj.title = title.slice(0, title.indexOf(' в Санкт-Петербурге'));
            obj.price = parseInt(price);
            obj.hasPhoto = hasPhoto;
            obj.photoUrl = photoUrl;
            result.push(obj);
        })
        console.log(result);
        return result;
    }
}

module.exports = data;