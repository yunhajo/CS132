/**
 * Name: Yunha Jo
 * Data: May 13, 2023
 * CS 132
 * Javascript functions for Set! game
 */

(function() {
    "use strict";

    const STYLE = ["solid", "outline", "striped"];
    const COLOR = ["green", "purple", "red"];
    const SHAPE = ["diamond", "oval", "squiggle"];
    const COUNT = 3;

    const game = id("game-view");
    const menu = id("menu-view");

    var timerId;
    var secondsRemaining;

    /**
     * Initializes the game play
     */
    function init () {
        let backButton = id("back-btn");
        let startButton = id("start-btn");
        backButton.addEventListener("click", backToMain);
        startButton.addEventListener("click", toggleView);
        startButton.addEventListener("click", startGame);
        let refreshButton = id("refresh-btn");
        refreshButton.addEventListener("click", refresh);
    }

    /**
     * Refreshes the current board by replacing the cards on the
     * board with new cards
     */
    function refresh() {
        const difficulty = qs('input[name="diff"]:checked');
        const isEasy = (difficulty.value === "easy");
        const currCards = qsa(".card");
        const board = id("board");
        currCards.forEach((card) => {
            const newCard = generateUniqueCard(isEasy);
            newCard.addEventListener("click", cardSelected);
            board.replaceChild(newCard, card);})
    }

    /**
     * Starts the game
     */
    function startGame() {
        startTimer();
        populateBoard();
        id("refresh-btn").disabled = false;
    }

    /**
     * Populates the board by creating random unique cards and placing them
     * on the board. The number of cards depends on the difficulty level of
     * the game.
     */
    function populateBoard() {
        const difficulty = qs('input[name="diff"]:checked');
        const isEasy = (difficulty.value === "easy");
        const board = id("board");
        for (let i = 0; i < 9; i++) {
            const newCard = generateUniqueCard(isEasy);
            newCard.addEventListener("click", cardSelected);
            board.appendChild(newCard);
        }
        
        if (!isEasy) {
            for (let i = 0; i < 3; i++) {
                const newCard = generateUniqueCard(isEasy);
                newCard.addEventListener("click", cardSelected);
                board.appendChild(newCard);
            }
        }
    }
    
    /**
     * Toggles between the game view and the menu view
     */
    function toggleView(){
        game.classList.toggle("hidden");
        menu.classList.toggle("hidden");
    }

    /**
     * Generates an array of random attributes
     * Four attributes are randomly selected for the card, three for easy difficulty
     * @param {bool} isEasy boolean for whether easy difficulty was selected
     * @return {array} array containing attributes in [style, shape, color, count] order
     */
    function generateRandomAttributes(isEasy) {
        var style, color, shape, count;
        if (isEasy) {
            style = "solid";
        }
        else {
            style = STYLE[Math.floor(Math.random() * STYLE.length)];
        }
        color = COLOR[Math.floor(Math.random() * COLOR.length)];
        shape = SHAPE[Math.floor(Math.random() * SHAPE.length)];
        count = Math.floor(Math.random() * COUNT) + 1;
        return [style, shape, color, count];
    }

    /**
     * Generates a random card according to difficulty of the game.
     * @param {bool} isEasy boolean for whether easy difficulty was selected
     * @return {object} div element with images inside it
     */
    function generateUniqueCard(isEasy) {
        while (true) {
            const array = generateRandomAttributes(isEasy);
            const imgID = array[0] + "-" + array[1] + "-" + array[2];
            const imgName = "imgs/" + imgID + ".png";
            const elemID = imgID + "-" + array[3];

            if (id(elemID)) {
                continue;
            }

            var elem = gen("div");
            for (let i = 0; i < array[3]; i++) {
                var subimage = gen("img");
                subimage.src = imgName;
                subimage.alt = elemID;
                elem.appendChild(subimage);
            }

            elem.id = elemID;
            elem.classList.add("card");

            return elem;
        }
    }

    /**
     * Determines if three of the selected cards make a set
     * @param {DOMList} selectedCards A DOM list of 3 card div elements that are 
     * selected.
     * @return {bool} returns true if the cards form a set, else returns false
     */
    function isASet(selectedCards) {
        const card1Att = selectedCards[0].id.split("-");
        const card2Att = selectedCards[1].id.split("-");
        const card3Att = selectedCards[2].id.split("-");

        return (returnBool(card1Att[0], card2Att[0], card3Att[0]) && 
        returnBool(card1Att[1], card2Att[1], card3Att[1])
        && returnBool(card1Att[2], card2Att[2], card3Att[2]) &&
        returnBool(card1Att[3], card2Att[3], card3Att[3]));
    }

    /**
     * Determines if three of the selected cards share an attribute or do not share an
     * attribute
     * @param {string} card1att attribute of first card
     * @param {string} card2att attribute of second card
     * @param {string} card3att attribute of third card
     * @return {bool} returns true if all of the cards or none of the cards share an attribute
     */
    function returnBool(card1att, card2att, card3att) {
        if (card1att == card2att && card2att == card3att) {
            return true;
        }
        else if (card1att != card2att && card2att != card3att && card1att != card3att) {
            return true;
        }
        return false;
    }

    /**
     * Starts a timer for the game
     */
    function startTimer() {
        var option = qs("select");
        secondsRemaining = option.value;
        timerId = setInterval(advanceTimer, 1000);
        var minute = Math.floor (secondsRemaining / 60);
        var time = "0" + minute + ":00"
        id("time").innerHTML = time;
    }

    /**
     * Decrements game time and displays it on screen. Ends game once time is over
     */
    function advanceTimer() {
        if (secondsRemaining < 1) {
            endingGame();
        }
        else {
            var minute = Math.floor (secondsRemaining / 60);
            var second = secondsRemaining - (minute * 60);
            var time;
            if (second < 10) {
                time = "0" + minute + ":0" + second
            }
            else {
                time = "0" + minute + ":" + second
            }
            id("time").innerHTML = time;
            secondsRemaining -= 1;
        }
    }

    /**
     * Goes back to the main screen when Back to Main button is pressed
     */
    function backToMain() {
        toggleView();
        const cards = qsa(".card");
        const board = id("board");
        cards.forEach((card) => board.removeChild(card));
        endingGame();
        id("set-count").innerHTML = 0;
        timerId = null;
    }

    /**
     * Ends the game by disabling cards from the game
     * Disables the refresh button
     */
    function endingGame () {
        id("time").innerHTML = "00:00";
        const selected = qsa(".selected");
        selected.forEach((card) => {card.classList.remove(".selected");})
        const cards = qsa(".card");
        cards.forEach((card) => {card.removeEventListener("click", cardSelected);});
        clearInterval(timerId);
        id("refresh-btn").disabled = true;
    }

    /**
     * Handles the case when three cards are selected on screen
     * Displays message on screen and manages time and number of sets accordingly
     */
    function cardSelected() {
        this.classList.add("selected");
        const selected = qsa(".selected");
        if (selected.length == 3) {
            console.log("3 cards selected");
            const bool = isASet(selected);
            selected.forEach((card) => 
            {card.classList.remove("selected");
            card.classList.add("hide-img");
            console.log(card);}
            );

            if (bool) {
                var setCount = id("set-count").innerHTML;
                var newCount = parseInt(setCount) + 1;
                id("set-count").innerHTML = newCount;

                const difficulty = qs('input[name="diff"]:checked');
                const isEasy = (difficulty.value === "easy");

                selected.forEach((card) => {
                const p = gen("p");
                p.innerText = "SET!";
                card.appendChild(p);
                setTimeout(() => {
                card.removeChild(p);
                const newCard = generateUniqueCard(isEasy);
                const board = id("board");
                board.replaceChild(newCard, card);
                newCard.addEventListener("click", cardSelected);
                card.classList.remove("hide-img");}, 1000)})
            }

            else {
                console.log("not a set");
                selected.forEach((card) =>
                {const p = gen("p");
                p.innerText = "Not a set :(";
                card.appendChild(p);
                setTimeout(() => {card.removeChild(p);
                card.classList.remove("hide-img");}, 1000);
                secondsRemaining -= 5;
                })
            }
        }
    }

    init();

  })();