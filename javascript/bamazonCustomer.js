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
    listItems();
});

function start() {
    inquirer.prompt({
        name: "buyOrExit",
        type: "list",
        message: "Would you like to purchase an item or exit?",
        choices: ["Purchase", "Exit"]
    })
        .then(function (answer) {
            if (answer.buyOrExit === "Purchase") {
                purchaseItems();
            } else {
                connection.end();
            }
        });
};

function listItems() {
    console.log("\r\nAvailable Items:\r\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("Item Number: " + res[i].id + " || Item Name: " + res[i].product_name + " || Department: " + res[i].department_name + " || Price: $" + res[i].price + " || In Stock: " + res[i].stock_quantity);
        }
        start();
    });
};

function purchaseItems() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "itemNumber",
                type: "input",
                message: "What is the item number for the product you wish to purchase?",
                validate: function (value) {
                    if ((isNaN(value) === false) && (value <= res.length)) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "itemQuantity",
                type: "input",
                message: "How many would you like to purchase?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function (answer) {
            var itemNum = answer.itemNumber;
            var quantity = parseInt(answer.itemQuantity);
            var itemIndex = itemNum - 1;
            var chosenItem = res[itemIndex];
            var newQuantity = (chosenItem.stock_quantity - quantity);
            if (newQuantity >= 0) {
                query = connection.query("UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: newQuantity
                        },
                        {
                            id: itemNum
                        }
                    ],
                    function (err) {
                        if (err) throw err;
                        console.log("===========\r\nYou have ordered " + quantity + " " + chosenItem.product_name + ". Your total is $" + (chosenItem.price * quantity) + ". \r\nThank you for shopping with us.\r\n==========")
                        listItems();
                    }
                );
            }
            else {
                console.log("==========\r\nSorry, we do not have enough product left in stock to complete this order, please update your order quantity.\r\n==========")
                listItems();
            }
        });
    });
};
