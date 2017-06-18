const MYSQL = require('mysql');

let sql = {
    connection: undefined,
    config: undefined,

    setConnection: function(config){
        this.config = config;
        this.reconnect();
    },

    reconnect: function() {
        this.connection = MYSQL.createConnection(this.config);
        this.connection.connect((err) => {
            if (err) {
                console.error('Error when connecting to DB: ', err);
                setTimeout(this.reconnect(), 2000);
            }
        })
        this.connection.on('error', (err) => {
            if (err.code == 'PROTOCOL_CONNECTION_LOST') {
                this.reconnect();
            } else {
                console.error('DB error: ', err);
                throw err;
            }
        })
    },

    getUserConfigs: function(){
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT * FROM usersettings', function(err, result, fields){
                if(err) {
                    console.error(err);
                    reject(err);
                }
                else {
                    resolve(result);
                }
            })
        });
    },

    createUserConfig: function(id, options){
        return new Promise((resolve, reject) => {
            // При изменении запроса не забудь поменять и в options
            this.connection.query('INSERT INTO usersettings (id, type0, type1, type2, type3, type4, maxprice, minprice, photo, broadcast) ' +
            'VALUES (' + id + ', FALSE, FALSE, FALSE, FALSE, FALSE, 200000, 0, FALSE, FALSE)',
            function(err, result, fields){
                if(err) reject(err);
                resolve(result);
            });
        });
    },

    updateUserConfig: function(id, optionName, optionValue){
        return new Promise((resolve, reject) => {
            this.connection.query('UPDATE usersettings SET ' + optionName + ' = ' + optionValue + ' WHERE id=' + id, 
                function(err, result, fields){
                    if(err) reject(err);
                    resolve();
                }
            );
        });
    },

    getAllUsersId: function(){
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT id FROM usersettings', function(err, result){
                if (err) reject(err);
                else (resolve(result));
            })
        })
    }
}

module.exports = sql;