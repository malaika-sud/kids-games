let init = function () {
  var self = {};

  //vue data
  self.data = {
    games: [{ termdle_played: 0, hangdude_played: 0 }], //initializes # of games played to 0
  };

  self.enumerate = function (a) {
    let k = 0;
    a.map((e) => {
      e._idx = k++;
    });
    return a;
  };

  //all methods for index page
  self.methods = {
    //this function calls the py method that handles getting user history, aka # of games played
    get_history: function () {
      axios.get("../get_user_history").then((t) => {
        self.vue.games = self.enumerate(t.data.result); //refreshes page using enumerate from professor
      });
    },
  };

  //creates vue instance
  self.vue = new Vue({
    el: "#vue-target",
    data: self.data,
    methods: self.methods,
  });

  self.vue.get_history();
  return self;
};

var app = init();
