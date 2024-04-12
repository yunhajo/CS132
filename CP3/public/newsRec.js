/*
Author: Yunha Jo
CS 132 Spring 2023
Date: May 20th, 2023
This is the javascript file for handling index, accepts json element from index.html and changes
index.html accordingly.
*/

(function() {

    "use strict";

    const BASE_URL = "https://newsapi.org/v2/everything?"
    const API_KEY = "426040ada80d426b8650252cab72e049"

    /**
    Initializes all the necessary buttons
    */
    function init() {
        const keywordButton = id("rec-btn-keyword");
        keywordButton.addEventListener("click", recKeyword);
        const selectButton = id("rec-btn-select");
        selectButton.addEventListener("click", recSelect);
        const backKeywordButton = id("back-btn");
        backKeywordButton.addEventListener("click", backToMain);
    }

    /**
    Handles the case when the user inputs a keyword: fetches 
    news articles related to the input keywords
    */
    function recKeyword() {
        toggleview();
        fetchKeywordData();
    }

    /**
    Handles the case where user selects items from the dropdown:
    fetches news articles given the category and country selected
    in the dropdown
    */
    function recSelect() {
        toggleview();
        fetchSelectData();
    }
    
    /**
    Returns to the homepage and deletes news articles on screen
    */
    function backToMain() {
        toggleview();
        let articleLst = qsa(".news-article");
        let board = id("board");
        articleLst.forEach((article) => {
            board.removeChild(article);
        })
    }

    /**
    Toggles between home page and recommendations page
    */
    function toggleview() {
        id("home-page").classList.toggle("hidden");
        id("rec-screen").classList.toggle("hidden");
    }

    /**
    Fetches data from API if user inputs a keyword then populates
    the news article page using the fetched data
    */
    function fetchKeywordData() {

        const keyword = qs(".input").value;

        let url = BASE_URL +
        `q=${keyword}&` +
        'sortBy=popularity&' +
        'apiKey='+API_KEY;

        fetch(url)
            .then(checkStatus)
            .then(response => response.json()) 
            .then(processResponse)
            .catch(handleError);
    }

    /**
    * Processes json object returned from API and modifies html accordingly
    * Looks at top 10 news articles from given keyword or categories and displays
    * them on screen
    * @param {obj} data - a json object from API
    */
    function processResponse(data) { 
        let text = gen("h2");
        text.textContent = "Here are the results";
        id("board").appendChild(text);
        let newsLst = data.articles;
        for (let i = 0; i < 10; i++) {
            let article = newsLst[i];
            let newElem = generateHeadline(article);
            id("board").appendChild(newElem);
        }
    }

    /**
    * Looks at json object representing news article and parses it into
    * a div element to be added to html
    * @param {object} obj - a json object from API, an actual article
    * @return {object} - a div element that will be added
    */
    function generateHeadline(obj) {
        let newElem = gen("div");

        let heading = gen("a");
        heading.textContent = obj.title;
        heading.href = obj.url;

        let information = gen("h3");
        information.innerText = "Source: " + obj.source.name + " / Author: " + obj.author;
        
        let date = gen("p");
        date.textContent = obj.publishedAt;
        
        newElem.classList.add("news-article");
        newElem.appendChild(heading);
        newElem.appendChild(information);
        newElem.appendChild(date);

        if (!obj.urlToImage) {
            let img = gen("img");
            img.src = obj.urlToImage;
            img.alt = obj.title;
            newElem.appendChild(img);
        }

        if (!obj.description) {
            let description = gen("p");
            description.textContent = obj.description;
            newElem.appendChild(description);
        }
        return newElem;
    }

    /**
    Fetches data from API if user selects category and country then passes it 
    to the functions to populate the news articles page
    */
    function fetchSelectData() {

        let country = id("country").value;
        let category = id("category").value;
        
        let url = 'https://newsapi.org/v2/top-headlines?' +
        "country=" + country + "&category=" + category +
        '&apiKey='+API_KEY;

        fetch(url)
            .then(checkStatus)
            .then(response => response.json()) 
            .then(processResponse)
            .catch(handleError);
    }
    

    /**
     * Handles errors if there is an error with fetch call
     * Displays messages to the screen
     */
    function handleError() { 
        let newElem = gen("h3");
        newElem.textContent = "Looks like there was an error somewhere." 
        + "Please try again with different keyword";
        id("board").appendChild(newElem);
    }

    init();
})();