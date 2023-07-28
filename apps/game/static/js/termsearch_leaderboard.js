//vue instance for the termsearch leaderboard
let init = function () {
  var self = {};

  //vue data
  self.data = {
    result: [], //used to store the 10 top users
  };

  self.methods = {
    //retrieves data of the top 10 users for termsearch
    get_data: function () {
      axios.get("../get_termsearch_leaderboard").then((t) => {
        self.vue.result = t.data.result;
      });
    },
  };

  //creates vue instance
  self.vue = new Vue({
    el: "#vue-termsearch-leaderboard",
    data: self.data,
    methods: self.methods,
  });

  self.vue.get_data(); //retrieving on page render
  return self;
};

var app = init();
