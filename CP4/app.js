/**
 * CS 132
 * Name: Yunha Jo
 * Data: June 4, 2023
 * Following endpoints are supported with this API:
 * GET /
 * GET /titles
 * 
 * POST /addnote
 * POST /delete
 * POST / edit
 */

"use strict";

const express = require("express");
const multer = require("multer");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(multer().none());

let NOTELIST = [];
const CLIENT_ERR = 400;
const SERVER_ERR = 400;

app.use(express.static("public"));

/**
 * Returns notelist as a json object
 */
app.get("/", function (req, res, next) {
    res.json(NOTELIST);
})

/**
 * Returns the titles of the notes in the list as a string
 * Required GET parameters: none
 * Response type: text
 * Sends a 500 error if something goes wrong internally.
 * Sends a success message otherwise.
 */
app.get("/titles", function (req, res, next) {
    try {
        let titles = "";
        NOTELIST.forEach((note) => {
            let name = note.noteTitle.toString() + " / "
            titles += name
        })
        res.type("text");
        res.send(titles);
    }
    catch(err) {
        res.status(SERVER_ERR);
        err.message = "Error with server";
        next(err);
    }
})

/**
 * Adds a new item to the noteList, a list of notes.
 * Required POST parameters: none
 * Response type: json list
 * Sends a 400 error if note with title already exists.
 * Sends a 500 error if something goes wrong internally.
 * Sends a success message otherwise.
 */
app.post("/addnote", (req, res, next) => {
    const noteTitle = req.body.noteTitle;
    const noteText = req.body.noteText;
    const noteDate = req.body.noteDate;

    if (checkTitles(noteTitle) != null) {
        res.status(CLIENT_ERR);
        next(Error("Use a different title for the note"));
    }
    else {
        try{
            NOTELIST.push({
                noteTitle: noteTitle,
                noteDate: noteDate,
                noteText: noteText
            })
            res.json(NOTELIST);
        }
        catch(err) {
            res.status(SERVER_ERR);
            err.message = "Error with server";
            next(err);
        }
    }
})

/**
 * Modifies a new item to the noteList, a list of notes using the title given.
 * Required POST parameters: none
 * Response type: json list
 * Sends a 400 error if note with title does not exist.
 * Sends a 500 error if something goes wrong internally.
 * Sends a success message otherwise.
 */
app.post("/edit", (req, res, next) => {
    const noteTitle = req.body.noteTitle;
    const noteDate = req.body.noteDate;
    const noteText = req.body.noteText;

    if (checkTitles(noteTitle) == null) {
        res.status(CLIENT_ERR);
        next(Error("Note with the title does not exist"));
    }

    else{
        try {
            NOTELIST.forEach(note => {
                if (note.noteTitle == noteTitle) {
                    note.noteDate = noteDate;
                    note.noteText = noteText;
                }
            })
            res.json(NOTELIST);
            }
        catch(err) {
            res.status(SERVER_ERR);
            err.message = "Error with server";
            next(err);
        }
    }
})

/**
 * Deletes note from the list given title.
 * Required POST parameters: none
 * Response type: json list
 * Sends a 400 error if note with title does not exist.
 * Sends a 500 error if something goes wrong internally.
 * Sends a success message otherwise.
 */
app.post("/delete", (req, res, next) => {
    const noteTitle = req.body.noteTitle;

    if (checkTitles(noteTitle) == null) {
        res.status(CLIENT_ERR);
        next(Error("Note with the title does not exist"));
    }

    else {
        try {
            const newNote = NOTELIST.filter(note => note.noteTitle != noteTitle);
            NOTELIST = newNote;
            res.json(NOTELIST);
        }
        catch(err) {
            res.status(SERVER_ERR);
            err.message = "Error with server";
            next(err);
        }
    }
})

/**
 * Looks through the noteList to find note with the same title
 * as the given title.
 * Returns the name of the title if it exists, else returns null
 * @param {String} title - title of the note we are looking for
 * @return either a string or null depending on whether the given 
 * title exists or not
 */
function checkTitles(title) {
    let result = null;
    NOTELIST.forEach(note => {
        if (note.noteTitle == title) {
            result = note.noteTitle;
        }
    })
    return result;
}

/**
 * Handles errors by sending messages
 */
function handleError(err, req, res, next) {
    res.type("text");
    res.send(err.message);
}

app.use(handleError);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});