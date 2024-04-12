/*
 * Name: Yunha Jo
 * Class: CS 132
 * Data: May 27, 2023
 * Javascript functions for Spotify game implemented using spotify API
 */
(function() {
    "use strict";

    const BASE_URL = "https://api.spotify.com/v1/";
    const SEARCH_EP = BASE_URL + "search?"; 
    const ARTIST_EP = BASE_URL + "artists/";

    const CLIENT_ID = "b3f905d960044b6b9b308dcf7fc055d5";
    const CLIENT_SECRET = "3ec904d554564b44b79f2105dec3bbcc";

    const MAX_SEARCH_RESULTS = 5;

    // Access token granted from Spotify to be updated in
    // getAccessToken()
    let accessToken;
    // module-global tracks data for a game session to avoid
    // redundant fetch calls. This is populated for you in initializeTracks.
    let tracks;

    /**
     * Sets up the game, getting an access token and registering event handlers
     * to manage view-switching and search queries.
     * @returns none
     */
    async function init() {
        getAccessToken();

        const searchBar = qs("input");
        searchBar.addEventListener("change", () => {
            if (searchBar.value) {
                fetchArtists(searchBar.value);
            }
        });

        id("play-view-done").addEventListener("click", () => {
            populateResults();
            showSection("results-view");
        });

        id("results-view-done").addEventListener("click", () => {
            showSection("search-view");
        });
    }

    /**
     * Uses the 'token' Spotify API endpoint following the Client Credentials flow.
     * https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/
     * Updates the accessToken given the response JSON's token. Refer to spec
     * for this function, simplifying the Spotify documentation for the scope of HW3.
     * @returns none
     */
    async function getAccessToken() {
        try {
            let resp = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
                "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "grant_type=client_credentials"
            });
            resp = checkStatus(resp);
            const data = await resp.json();
            accessToken = data.access_token;
            }
        catch(err) {
            handleError(err);
        }
    }

    /**
     * Uses the 'search' Spotify API endpoint:
     * https://developer.spotify.com/documentation/web-api/reference/#/operations/search
     * 
     * Fetches artists from the Spotify API using the given search query
     * string and populates artist results (use populateArtistResults). Displays a
     * useful error message if an error occurs during the request.
     * @param {string} name - search query for the artist name.
     * @returns none
     */
    async function fetchArtists(name) {
        try {
            name = encodeURIComponent(name);
            const url =  SEARCH_EP + "type=artist&limit=" + MAX_SEARCH_RESULTS + "&q=" + name;
            let resp = await fetch(url, {
                method: "GET",
                headers: {
                Authorization: `Bearer ${accessToken}`
                },
            });
            resp = checkStatus(resp);
            const data = await resp.json();
            populateArtistResults(data);
            }
        catch(err) {
            handleError(err);
        }
    }

    /**
     * Populates the #search-results area with artist results from the user's
     * search query, one card per artist. If no results were found, reports a
     * useful error message to the user.
     * @param {Object} artistsData - the data returned from the Spotify API /search endpoint
     * @returns none
     */
    function populateArtistResults(artistsData) {
        const noArtistErr = "The search didn't return any artists on Spotify; please try again.";
        const children = id("search-results").childNodes;
        children.forEach((child) => id("search-results").removeChild(child))
        if (artistsData.artists.items.length == 0) {
            handleError(noArtistErr);
        }
        id("message-area").classList.add(".hidden");
        artistsData.artists.items.forEach((item) => {
            let card = genArtistCard(item);
            id("search-results").appendChild(card);
        })
    }

    /**
     * Takes info about an artist and returns an article "card"
     * with relevant info (h3 and img).
     * @param {Object} artistInfo - an object as described here: 
     *   https://developer.spotify.com/documentation/web-api/reference/#/operations/get-an-album
     * @return {DOMElement} The element representing an artist's card. The format
     * of the returned article is the following:
     * <article>
     *    <img src="[img path]" alt="[artist name]">
     *    <h3>[artist name]</h3>
     * </article>
     * For example,
     * <article>
     *   <img src="https://i.scdn.co/image/ab6761610000e5ebf00e2ecf7257c5a910d40f34" 
     *        alt="Moby">
     *   <h3>Moby</h3>
     * </article>
     */
    function genArtistCard(artistInfo) {
        let newCard = gen("article");
        let img = gen("img");
        let heading = gen("h3");
        
        if (artistInfo.images[0] != null) {
            img.src = artistInfo.images[0].url;
            img.alt = artistInfo.name;
        }
        heading.innerHTML = artistInfo.name;

        newCard.appendChild(img);
        newCard.appendChild(heading);

        newCard.addEventListener("click", () => {callFetchArtist(artistInfo)})
        return newCard;
    }

    function callFetchArtist(artistinfo) {
        fetchArtistTopTracks(artistinfo.id);
    }

    /**
     * Uses the 'top-tracks' Spotify API endpoint:
     * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-an-artists-top-tracks
     * Given a Spotify artistId, fetches top tracks for that artist and 
     * updates the module-global tracks variable with initializeTracks.
     * If an error occurs, displays a user-friendly message, otherwise hides any
     * previous contents of #message-area.
     * The page is populated with information for each track (use genTrackCard)
     * and the current section is switched to #play-view.
     * @param {string} artistId - Spotify ID of the artist
     * @returns none
     */
    async function fetchArtistTopTracks(artistId) {
        try {
            const url =  ARTIST_EP + artistId + "/top-tracks?market=US";
            let resp = await fetch(url, {
                headers: {
                Authorization: `Bearer ${accessToken}`
                },
            });
            resp = checkStatus(resp);
            let data = await resp.json();
            id("message-area").classList.add(".hidden");
            initializeTracks(data);
            populateTracks();
            showSection("play-view");
            }
        catch(err) {
            handleError(err);
        }
    }

    /**
    * Clears #tracks-container and re-populates it with tracks represented in 
    * the module-global `tracks` variable. Use sortTracksByGameIdx before populating
    * #track-container with each article generated from genTrackCard.
    * @returns none
    */
    function populateTracks() {
        var trackContainer = id("track-container");
        trackContainer.innerHTML = "";

        sortTracksByGameIdx();
        tracks.forEach((track) => {
            let newCard = genTrackCard(track);
            id("track-container").appendChild(newCard);
        })
    }

    /* ------------------------------ Provided Helper Functions ------------------------------ */  
    
    /**
     * Hides the currently-visible section, reveals the
     * section with the given sectionId.
     * @param {string} sectionId
     * @returns none
     */
    function showSection(sectionId) {
        // Program logic is such that we only have one section !hidden
        const currView = qs("section:not(.hidden)");
        // toggle views
        currView.classList.add("hidden");
        id(sectionId).classList.remove("hidden");
    }

    /* -------------------- Track Management/Sorting -------------------- */  
    
    /**
     * Takes info about a track and returns an article 
     * holding relevant track info with up/down button functionality.
     * @param {Object} trackInfo - one item from `tracks` module-global. See initializeTracks.
     * @return {DOMElement} - the article element representing the relevant track info.
     */
    function genTrackCard(trackInfo) {
        const card = gen("article");

        const h3 = gen("h3");
        h3.textContent = trackInfo.name;
        card.appendChild(h3);

        const btnContainer = gen("div");

        const upBtn = gen("button");
        upBtn.textContent = "Up";
        upBtn.addEventListener("click", () => moveTrack(trackInfo.gameIdx, -1));
        btnContainer.appendChild(upBtn);

        const downBtn = gen("button");
        downBtn.textContent = "Down";
        downBtn.addEventListener("click", () => moveTrack(trackInfo.gameIdx, 1));
        btnContainer.appendChild(downBtn);

        card.appendChild(btnContainer);
        return card;
    }

    /**
     * Using the data from the top-tracks endpoint, sets the
     * module-global `tracks` variable (the current track ordering)
     * as an array with the following schema:
     *
     * [
     *   {
     *     "name" : string representing the name of the track,
     *     "actualIdx" : number representing the order the track appears
     *                   in the top ten
     *     "gameIdx" : number representing the position in which the user has
     *                 placed the track.
     *   }
     * ]
     *
     * @param {Object} tracksData - Data from fetchArtistTopTracks()
     * @returns none
     */
    function initializeTracks(tracksData) {
        const topTen = tracksData.tracks;
        let gameIdxs = [];
        // add the top ten tracks to a temporary game index array
        for (let i = 0; i < topTen.length; i++) {
            gameIdxs.push(i);
        }
        // random sort for game
        gameIdxs.sort(() => Math.random() - 0.5);

        // Apply a map function to process useful data
        // for managing tracks in a current game to avoid repetitive fetch calls.
        tracks = topTen.map((track, idx) => {
            return {
                name: track.name,
                actualIdx: idx,
                gameIdx: gameIdxs[idx]
            };
        });
    }

    /**
     * Sorts the `tracks` module-global by the property `gameIdx`
     * in ascending order. This will modify the array in-place.
     * @returns none
     */
    function sortTracksByGameIdx() {
       tracks.sort((a, b) => a.gameIdx - b.gameIdx);
    }
    
    /**
     * Sorts the `tracks` module-global by the property `actualIdx`
     * (Spotify's provided popularity index) in ascending order. This 
     * will modify the array in-place.
     * @returns none
     */
    function sortTracksByActualIdx() {
        tracks.sort((a, b) => a.actualIdx - b.actualIdx);
    }

    /**
     * Handles the up/down button sorting on a track.
     * Switches elements in the "tracks" variable then rebuilds the DOM.
     * If track can't be moved up/down, does nothing.
     * @param {Number} currIdx - game index of track related to event
     * @param {Number} shift - shift amount to move track (-1 to move up, 1 to move down) 
     */
    function moveTrack(currIdx, shift) {
        if ((shift < 0 && currIdx + shift >= 0) || // up case
            (shift > 0 && currIdx !== tracks.length - shift)) { // down case
            // track card to be replaced
            const tempTrack = tracks[currIdx + shift];
            tempTrack.gameIdx = currIdx;
            // new index of for selected track
            const newIdx = currIdx + shift;
            tracks[newIdx] = tracks[currIdx];
            tracks[newIdx].gameIdx = newIdx;
            // shift track from previous position appropriately
            tracks[currIdx] = tempTrack;
            // repopulate the DOM (could be more efficient, but eh)
            populateTracks();
        }
    }

    /* -------------------- Game Processing -------------------- */  

    /**
     * Populates the results-view with a final score and lists of expected
     * vs actual top ten rankings.
     */
    function populateResults() {
        const scoreboard = qs("#results-view p");
        scoreboard.textContent = (computeScore() * 100).toFixed(2) + "%";

        const actual = id("actual-ordering");
        actual.innerHTML = "";
        // sort by the actual popularity index to show comparisons
        sortTracksByActualIdx();
        tracks.map((track) => {
            let li = gen("li");
            li.textContent = track.name;
            actual.appendChild(li);
        });

        // sort by the guessed popularity index to show comparisons
        const user = id("your-ordering");
        user.innerHTML = "";
        sortTracksByGameIdx();
        tracks.map((track) => {
            let li = gen("li");
            li.textContent = track.name;
            user.appendChild(li);
        });
    }

    /**
     * Computes the normalized kendall distance between the in game ordering
     * and the proper ordering of the tracks.
     * @returns {Number} - Score between 0 (worst) and 1 (best)
     */
    function computeScore() {
        // The tracks array is in order based on gameIdx.
        // Mapping each track to the actualIdx will give the permutation
        // we want.
        return 1 - kendall(tracks.map((t) => t.actualIdx));
    }

    /* -------------------- Custom Error-handling -------------------- */  

    /**
     * Displays an error message on the page, hiding any previous results.
     * If errMsg is passed as a string, the string is used to customize an error message.
     * Otherwise (the errMsg is an object or missing), a generic message is displayed.
     * @param {String} errMsg - optional specific error message to display on page.
     */
     function handleError(errMsg) {
        if (typeof errMsg === "string") {
            id("message-area").textContent = errMsg;
        } else {
            // the err object was passed, don't want to show it on the page;
            // instead use generic error message.
            id("message-area").textContent =
                "An error ocurred fetching the Spotify data. Please try again later.";
        }
        id("message-area").classList.remove("hidden");
    }

    init();
})();