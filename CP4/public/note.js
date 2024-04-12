/**
 * CS 132
 * Name: Yunha Jo
 * Data: June 4, 2023
 * Javascript functions for index.html - a website for Notes
 * Handles adding, editing, and deleting notes on the website
 */

 (function() {
    "use strict";
    
    const BASE_URL = "/"

    /**
    * Initializes the page by adding necessary event listeners to buttons
    * @returns none
    */
    function init () {
        const addBtn = id("add-button");
        const delBtn = id("del-button");
        const editBtn = id("edit-button");
        const titleBtn = id("title-button");

        addBtn.addEventListener("click", addNote);
        delBtn.addEventListener("click", deleteNote);
        editBtn.addEventListener("click", editNote);
        titleBtn.addEventListener("click", getTitles);
    }

    /**
    * Handles adding notes to the website
    * Makes a fetch call using the input parameters (title, data, text)
    * then populates the notes section
    * @returns none
    */
    async function addNote () {

        let params = {noteTitle: qs("input[name='add-title']").value, 
                      noteDate: qs("input[name='add-date']").value,
                        noteText: qs("input[name='add-note']").value};

        try {
            let resp = await fetch(BASE_URL + "addnote", { 
                headers: {
                    "Content-Type": "application/json",
                  },
                method : "POST",
                body : JSON.stringify(params)
             });
            resp = checkStatus(resp);
            const data = await resp.json();
            populateNotes(data);
          } catch (err) {
            handleError(err);
          }
    }

    /**
    * Handles deleting notes to the website
    * Makes a fetch call using the input parameters (title of the note) then 
    * populates the notes section
    * @returns none
    */
    async function deleteNote () {

        let params = {noteTitle: qs("input[name='del-title']").value};
        
        const newURL = BASE_URL + "delete";

        try {
            let resp = await fetch(newURL, { 
                headers: {
                    "Content-Type": "application/json",
                  },
                method : "POST",
                body : JSON.stringify(params)
             });
            resp = checkStatus(resp);
            const data = await resp.json();
            populateNotes(data);
      
          } catch (err) {
            handleError(err);
          }
    }

    /**
    * Handles editing notes to the website
    * Makes a fetch call using the input parameters (title, date, contents) then 
    * populates the notes section
    * @returns none
    */
    async function editNote () {
        let params = {noteTitle: qs("input[name='edit-title']").value, 
                      noteDate: qs("input[name='edit-date']").value,
                        noteText: qs("input[name='edit-note']").value};

        console.log(params);
        try {
            let url = BASE_URL + "edit";
            let resp = await fetch(url, {                
                headers: {"Content-Type": "application/json",},
                method : "POST",
                body : JSON.stringify(params) 
            });
            resp = checkStatus(resp);
            const data = await resp.json();
            populateNotes(data);
      
          } catch (err) {
            handleError(err);
          }
    }

    /**
    * Gets all of the titles on the notes
    * Makes a fetch call and processes the response then displays it on screen
    * @returns none
    */
    async function getTitles () {
        try {
            let titleurl = BASE_URL + "titles";
            let resp = await fetch(titleurl);
            resp = checkStatus(resp);
            const data = await resp.text();
            id("titles").textContent = data;
          } catch (err) {
            handleError(err);
          }
    }

    /**
    * Handles the array of notes returned from fetch call
    * Creates a new div element using the response and populates
    * the notes section
    * @param {Object} notes - an array of json objects returned from fetch call
    * @returns none
    */
    function populateNotes(notes) {
        id("notes-section").innerHTML = "";
        notes.forEach((elm) => {
            let newDiv = createNote(elm);
            id("notes-section").appendChild(newDiv);
        });
    }

    /**
    * Creates a new div element using the data given
    * @param {Object} data - a single json object with data about notes
    * @returns none
    */
    function createNote(data) {
        let newElem = gen("div");
        let heading = gen("h3");
        let date = gen("h4");
        let content = gen("p");

        console.log(data);
        console.log(data.noteTitle);

        heading.textContent = data.noteTitle;
        date.textContent = data.noteDate;
        content.textContent = data.noteText;
        newElem.appendChild(heading);
        newElem.appendChild(date);
        newElem.appendChild(content);

        return newElem;
    }

    /**
    * Handles errors by displaying the message on screen
    * @param {Object} errMsg - error message returned from fetch call
    * @returns none
    */
    function handleError(errMsg) {
        id("err").textContent = errMsg;
    }

    init();

  })();