"use strict";

var express = require("express");
var cors = require("cors");
var app = express();

app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});