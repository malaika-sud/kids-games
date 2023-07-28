//vue instance for the hangdude leaderboard
let init = function () {
  var self = {};

  //vue data
  self.data = {
    result: [], //used to store the 10 top users
  };

  self.methods = {
    //retrieves data of the top 10 users for hangdude
    get_data: function () {
      axios.get("../get_hangdude_leaderboard").then((t) => {
        self.vue.result = t.data.result;
      });
    },
  };

  //creates vue instance
  self.vue = new Vue({
    el: "#vue-hangdude-leaderboard",
    data: self.data,
    methods: self.methods,
  });

  self.vue.get_data(); //retrieving on page render
  return self;
};

var app = init();
