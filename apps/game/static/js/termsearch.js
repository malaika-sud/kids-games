let init = function () {

    var self = {};

    //vue data
    self.data = {
        searchMap: [], //the array that holds all of the letters to search for words in
        rows: 10, //# of rows in searchMap
        cols: 10, //# of columns in searchMap
        selectedLetters: [], //the indices of selected letters that are being highlighted by a click (part of the words to find)
        finalWordList: [], //the list of words that user should be looking for 
        points: 12, //total number of points possible to earn
        youWon: false, //bool to show whether or not user has won termsearch
        gameOver: false, //bool to show whether or not user has lost termsearch
        cellLetter: '', //holds the letter that is displayed on a cell
        clicked: false, //bool to show whether or not the cell has been clicked on by user
        isPart: false, //bool to show whether or not the cell's letter is part of the word in the map
        wordy: [], //stores the letters of the word in array (created to be helpful for spotTaken function)
        moveCell: [] //helps reassign indices of the selected cell to check if a cell is taken by another word
    };

    //all of the methods 
    self.methods = {

        //this function handles getting 3 random words from the txt file for the game
        fetchWord: function() {
            axios.get("../get_3_words").then((t) => {
                self.data.finalWordList = t.data.words //adds the 3 words to the list of words to search for on map
                self.vue.createMap() //calls the function to avoid createMap being called before fetchWord (an issue i ran into)
            })
        },

        //this function handles generating a random letter (to be placed within the cells on the map that aren't a word)
        generateLetter: function() {
            let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            //excludes additional letters that are part of the words 
            let allowedLett = letters.split('').filter(letter => !self.data.finalWordList.join('').includes(letter))
            return allowedLett[Math.floor(Math.random() * allowedLett.length)]
        },

        //this function handles creating the map of letters to search for words in
        createMap: function() {

            for (let i = 0; i < self.data.rows; i++) {
                let createRow = []
                for (let x = 0; x < self.data.cols; x++) {
                    createRow.push({ celly: self.vue.generateLetter()}) //create a row 
                }
                self.data.searchMap.push(createRow) //add that row to the searchmap
            }

            for (let j = 0; j < 3; j++) { //3 because we only look for 3 words in termsearch
                self.data.wordy = self.data.finalWordList[j].split('') //split the words into letters
                let isHorizon = Math.random() < 0.5 //randomizing whether or not the word should be horizontal or vertical
                let row2, col2

                if (isHorizon) { //make the word horizontal, randomize where it should be placed
                    row2 = Math.floor(Math.random() * self.data.rows) 
                    col2 = Math.floor(Math.random() * 5) //by 5 because we have 10 rows/cols and each word is always 5 letters long

                    self.vue.spotTaken(self.data.wordy, row2, col2, isHorizon) //pass it to a different function to check if letters are already on these cells (we don't want overlapping of words)
                }
                else { //make the word vertical, randomize where it should be placed
                    row2 = Math.floor(Math.random() * 5) //by 5 because we have 10 rows/cols and each word is always 5 letters long
                    col2 = Math.floor(Math.random() * self.data.cols) 

                    self.vue.spotTaken(self.data.wordy, row2, col2, isHorizon)
                }
            }

        },

        //this function handles checking if the indices that a word wants to be placed are taken, which if so it moves the projected cells to be on
        spotTaken: function(bordy, row2, col2, isHorizon) {
            let wordPlace = []

            //need to check if a letter within finalWordList is already placed on the cell (otherwise it's a random letter which we can replace)
            self.data.cellLetter = self.data.searchMap[row2][col2].celly;
            let selectedCell = self.data.searchMap[row2][col2]

            if (self.vue.cellIsPart(selectedCell)) { //the cell we want to start at contains a letter part of the word, aka a word is already placed there
                window.location.reload()
            }

            else { //we need to check the rest
                if (isHorizon) {
                    for (let x = 0; x < 5; x++) { //go through the rest of the letters horizontal to this cell, for the rest of the word we want to place
                        self.data.moveCell = self.data.searchMap[row2][col2 + 1] //one letter across, reassign the value of selected cell

                        //force a window reload if any part of the word overlaps another
                        if (self.vue.cellIsPart(self.data.moveCell)) {
                            window.location.reload()
                            break
                        }

                        wordPlace.push({ bordy, row2, col2, isHorizon }) //store the placing information for each word 
                    }
                }
                else {
                    for (let i = 0; i < 5; i++) { //go through the rest of the letters vertical to this cell, for the rest of the word we want to place
                        self.data.moveCell = self.data.searchMap[row2 + 1][col2] //one letter down, reassign the value of selected cell so we can check
                        
                        if (self.vue.cellIsPart(self.data.moveCell)) {
                            window.location.reload()
                            break
                        }

                        wordPlace.push({ bordy, row2, col2, isHorizon }) //store the placing information for each word 
                    }
                }
            }

            for (let m = 0; m < 3; m++) { //iterate through all of the words (3 total words) to place them
                const { bordy, row2, col2, isHorizon } = wordPlace[m]
                for (let n = 0; n < 5; n++) { //iterate through the letters of the words (each word is always 5 letters long)
                    if (isHorizon) { //if horizontal on the map
                        self.data.searchMap[row2][col2 + n].celly = bordy[n]
                    }
                    else { //if vertical on the map
                        self.data.searchMap[row2 + n][col2].celly = bordy[n]
                    }
                }
            }

        },

        //this function handles styling for the cells, checks to see if the letter is either clicked and correct or not clicked/not correct
        getCellStyle: function(rowInd, colInd) {
            self.data.clicked = self.data.selectedLetters.some(cell => cell.rowInd === rowInd && cell.colInd === colInd);
            let selectedCell = self.data.searchMap[rowInd][colInd]

            if (self.data.clicked && self.vue.cellIsPart(selectedCell)) { //user clicked on the cell and it is part of the word
                return 'cell selected' //css styling to make the cell highlighted pink
            }
            else { 
                return 'cell' //regular css styling, stays greens
            }
        },

        //this function handles an on click event, aka if the cell is part of any of the words we're looking for
        selectCell: function(rowInd, colInd) {
            let selectedCell = self.data.searchMap[rowInd][colInd] 

            if (!self.vue.cellIsPart(selectedCell)) { //user clicks on a cell that is not part of the word to find
                self.data.points -= 2 //minus 2 points for every wrong letter clicked 

                if (self.data.points == 0) { //no more points to lose, game is over
                    self.data.gameOver = true 
                    axios.post("../post_lost_termsearch"); //calls the function in py that handles losing termsearch
                }
            }   
            else {  //user clicks on a cell that is part of the word to find
                self.data.selectedLetters.push({ rowInd, colInd }) //push the indices of the selectedletters so we know its a letter included in word(s) 
                self.vue.checkWin() //check to see if that's the last letter needed to win
            }
        },

        //this function checks to see if the cell user selected contains a letter that is part of the words we're looking for
        cellIsPart: function(selectedCell) {
            return self.data.finalWordList.some(word => word.includes(selectedCell.celly)) //true or false return value 
        },

        //this function checks to see if we win the game or not
        checkWin: function() {
            if (self.data.selectedLetters.length === 15) { //we have 15 highlighted letters (3 words x 5 letters = 15 selected letters)
                self.data.youWon = true
                let score = { score: self.data.points };
                axios.post("../post_won_termsearch", score); //calls the function in py that handles winning termsearch
            }
        }

    };

    //creates vue instance
    self.vue = new Vue({
        el: "#vue-termsearch",
        data: self.data,
        methods: self.methods
    });

    // //fetching 3 words to put in the grid, initialize game with getting these words
    self.vue.fetchWord();

    return self;

};

var app = init();