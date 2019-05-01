require('dotenv').config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});

connection.connect(function (err) {
    if (err) throw err;
    // console.log(connection.threadId)
    managerStart();
});

function managerStart() {
    inquirer.prompt({
    name: "buyOrExit",
    type: "list",
    message: "Would you like to purchase an item or exit?",
    choices: ["Purchase", "Exit"]
})
    .then(function (answer) {
        // based on their answer, either call the bid or the post functions
        if (answer.buyOrExit === "Purchase") {
            purchaseItems();
        } else {
            connection.end();
        }
    });
};