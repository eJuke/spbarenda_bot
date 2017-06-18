let states = {
    request: undefined,
    states: {},

    setRequest: function(request){
        this.request = request;
    },

    setAllUsersStates: function(){
        return new Promise((resolve, reject) => {
            this.request.getAllUsersId().then(response => {
                response.forEach((item, i, arr) => {
                    this.states[item.id] = 'default';
                });
                resolve();
            })
            .catch(err => console.log(err));
        });
    },

    getAllUsersStates: function(){
        return this.states;
    },

    getUserState: function(id) {
        return this.states[id];
    },

    setUserState: function(id, state) {
        this.states[id] = state;
    }
}

module.exports = states;