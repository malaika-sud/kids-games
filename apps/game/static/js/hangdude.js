let init = function () {

    var self = {};
    
    //vue data
    self.data = {
        word: '', //the word to guess
        hiddenWord: '', //the word but in _, updates to fill in correctly guessed letters
        guess: '', //the guessed letter
        attempts: 6, //# of attempts for user
        gameOver: false, //starts at false, game is ongoing at the beginning
        youWon: false, //starts at false, game has not yet been won at the beginning
        guessedList: [], //the list of incorrectly guessed letters
        points: 12, //the max number of points that the user can earn from guesssing correctly
    };

    //all of the methods 
    self.methods = {

        //this function is called whenever a user guesses a letter in hangdude
        makeGuess: function() {

          //the hangdude word includes the letter that the user guessed
          if (self.data.word.includes(self.data.guess)) {
            let hiddenArr = self.data.hiddenWord.split('') 
            
            //creates the hangdude word but only in _ and whenever correct letter is guessed, adds that letter into the ___
            for (let i = 0; i < self.data.word.length; i++) {
              if (self.data.word[i] === self.data.guess) {
                hiddenArr[i] = self.data.guess
              }   
            }
    
            self.data.hiddenWord = hiddenArr.join('');
    
            if (self.data.hiddenWord === self.data.word) { //word finally matches, aka user guessed
              self.data.youWon = true 

              let score = { score: self.data.points };
              axios.post("../post_won_hangdude", score); //calls the function in py that handles winning hangdude
            }
          } 

          //the hangdude word does not include the letter that the user guessed
          else {
            //subtract 2 points and 1 attempt with each incorrectly guessed letter
            self.data.attempts--
            self.data.points -= 2

            //helps remove duplicate wrong letters from the already guessed list of letters
            if (!self.data.guessedList.includes(self.data.guess)) {
              self.data.guessedList.push(self.data.guess)
            }
    
            if (self.data.attempts === 0) { //no more attempts left, user lost
              self.data.gameOver = true
              self.data.guessedList = []
              axios.post("../post_lost_hangdude"); //calls the function in py that handles losing hangdude
            }
          }
    
          self.data.guess = ''; //refreshes the search bar after each guess
        },

        //this function handles getting a random word from the txt file and displaying it on screen
        fetchWord: function() {
          axios.get("../get_word").then((t) => { //calls the function in py that handles randomizing word from txt 
            self.data.word = t.data.word
            console.log("This is the word: ", self.data.word)
            self.data.hiddenWord = '_'.repeat(self.data.word.length)
          });
        },

    };

    //creates vue instance
    self.vue = new Vue({
        el: "#vue-hangdude",
        data: self.data,
        methods: self.methods
    });

    //initialization
    self.vue.fetchWord();

    return self;
};

var app = init();