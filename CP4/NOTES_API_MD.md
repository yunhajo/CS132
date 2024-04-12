# CS132 Notes API Documentation
**Author:** Yunha Jo
**Date** 06/04/23

The Notes API support functionality for managing user-created notes

Clients can retrieve the current notes stored, or the title of the notes. They can also add,
delete, and edit existing notes using POST fetch calls

Summary of endpoints:
* GET /
* GET /titles
* POST /addnote
* POST /edit
* POST /delete

URL/URL Params
- / can be used to retrieve all notes on the website
- /titles can be used to get titles of all notes on the website
- /addnote can be used to add a note
- /edit can be used to edit data or content of existing note
- /delete can be used to delete an existing note

Method
- GET and POST

Data Params
- {
  body : {
    title : [string],
    date : [string],
    contents : [string]
  }
}
- ex:
{
  body : {
    title : "note1",
    date : "2023-06-04",
    contents : "Go shopping for groceries"
  }
}

Success Response
- Code 200
- Content: JSON object or text

Error Response
- Code 400: client side error
- Code 500: server side error

Sample Call
fetch(url, {                
                headers: {"Content-Type": "application/json",},
                method : "POST",
                body : JSON.stringify(
                    {noteTitle: "note1", 
                      noteDate: "2023-06-04",
                        noteText: "Go shopping for groceries"
                    ) 
            });