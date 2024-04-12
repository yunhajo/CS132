/**
 * CS 132
 * Javascript functions for index.html - Match the Cards game
 */

 (function() {
    "use strict";

    let flipped = false;
    let first, second;
    let num_pairs = 8;

    var timer;
    var counter;
    
    /**
    * Initializes the page by adding necessary event listeners to buttons
    */
    function init () {
        let backButtonRule = id("back-btn-rule");
        let backButtonGame = id("back-btn-game");
        let ruleButton = id("rule-btn");
        let startButton = id("start-btn");
        backButtonRule.addEventListener("click", toggleRuleview);
        backButtonGame.addEventListener("click", backToHome);
        ruleButton.addEventListener("click", toggleRuleview);
        startButton.addEventListener("click", startGame);
    }

    /**
    * Screen goes back to Home screen, and the game screen is reinitialized again
    */
    function backToHome() {
        console.log("backtohome");
        toggleGameview();
        counter = 0;
        // timer = null;
        const hiddenCards = qsa(".flipped");
        hiddenCards.forEach(card => card.classList.remove("flipped"));
        const backCards = qsa(".back.hidden");
        backCards.forEach(card => card.classList.remove("hidden"));
    }

    /**
    * Toggles between rule screen and home screen
    */
    function toggleRuleview(){
        id("home-screen").classList.toggle("hidden");
        id("rule-screen").classList.toggle("hidden");
    }

    /**
    * Toggles between game screen and home screen
    */
    function toggleGameview(){
        id("home-screen").classList.toggle("hidden");
        id("game-screen").classList.toggle("hidden");
    }
    
    /**
    * Shuffles the cards randomly for the game
    */
    function shuffle() {
        console.log("shuffle");
        const board = id("board");
        const cards = qsa(".card");
        for (let i = cards.length; i >= 0; i--) {
            const index = Math.floor(Math.random() * i);
            const card = cards[index];
            board.appendChild(card);
        }
    }

    /**
    * Initializes the game screen
    */
    function initBoard() {
        console.log("initboard");
        timerStart();
        shuffle();
        addFlipping();
    }

    /**
    * Starts the game
    */
    function startGame() {
        console.log("startgame");
        qs(".win-screen").classList.add("hidden");
        qs(".lose-screen").classList.add("hidden");
        id("board").classList.remove("hidden");
        toggleGameview();
        initBoard();
    }

    /**
    * "Flips" two selected cards, and checks if they match. Removes them from
    * board if they are, flips them back if they aren't
    */
    function showCard() {
        if (second != null) return;
        if (this === first) return;

        const back = this.querySelector(".back");
        back.classList.add("hidden");

        if (flipped == false) {
            flipped = true;
            first = this;
            return;
        }

        else {
            second = this;
            flipped = false;
            
            if (first.getAttribute("data-suite") == second.getAttribute("data-suite")
                && first.getAttribute("data-value") == second.getAttribute("data-value")) {
                setTimeout(removeCards, 500);
            }
            else {
                setTimeout(undoSelected, 1000);
            }
        }
    }

    /**
    * Removes the cards from boards
    */
    function removeCards() {
        first.classList.add("flipped");
        second.classList.add("flipped");
        resetVariables();
        num_pairs--;
        console.log(num_pairs);
        if (num_pairs == 0) {
            showEnd();
        }
    }

    /**
    * Initializes the game screen
    */
    function showEnd() {
        counter = 0;
        id("board").classList.add("hidden");
        if (num_pairs == 0) {
            qs(".win-screen").classList.remove("hidden");
        }
        else {
            qs(".lose-screen").classList.remove("hidden");
        }
    }
    
    /**
    * Unflips the two selected cards
    */
    function undoSelected() {
        const back_first = first.querySelector(".back");
        back_first.classList.remove("hidden");
        const back_second = second.querySelector(".back");
        back_second.classList.remove("hidden");
        resetVariables();
    }

    /**
    * Resets global variables for the selected cards
    */
    function resetVariables() {
        first = null;
        second = null;
    }

    /**
    * Adds flipping event to every card
    */
    function addFlipping() {
        console.log("flip");
        const cards = qsa(".card");
        cards.forEach(card => card.addEventListener("click", showCard));
        console.log(cards);
    }

    /**
    * Sets counter according to selected value
    */
    function setCounter() {
        var option = qs("#options");
        counter = option.value;
    }

    /**
    * Starts the timer at top of the screen
    */
    function timerStart() {
        console.log("timer");
        timer = qs("#time");
        setCounter();
        var interval = setInterval(timerHelper, 1000);

    /**
    * Helper for timer function
    */
    function timerHelper() {
        if (counter < 1) {
            timer.innerHTML = "Game Over";
            timer = null;
            clearInterval(interval);
            endGame();
            return;
        } 
        timer.innerHTML = counter;
        counter--;
    }

    /**
    * Ends the game when called
    */
    function endGame() {
        counter = 0;
        clearInterval(interval);
        timer = null;
        showEnd();
    }
    };

    init();

  })();