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
        name: "managerSelect",
        type: "list",
        message: "What would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    })
        .then(function (answer) {
            var selection = answer.managerSelect
            switch (selection) {
                case ("View Products for Sale"):
                    viewProducts();
                    break;
                case ("View Low Inventory"):
                    viewLowInventory();
                    break;
                case ("Add to Inventory"):
                    addInventory();
                    break;
                case ("Add New Product"):
                    addProduct();
                    break;
                default:
                    connection.end();
            };
        });
};

function viewProducts() {
    console.log("Available Items:\r\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("Item Number: " + res[i].id + " || Item Name: " + res[i].product_name + " || Department: " + res[i].department_name + " || Price: $" + res[i].price + " || In Stock: " + res[i].stock_quantity);
        }
        managerStart();
    });
};

function viewLowInventory() {
    console.log("Items With Low Inventory: \r\n");
    connection.query("SELECT * FROM products WHERE stock_quantity < 10", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            if (res.length === 0) {
                console.log("No low inventory at this time.")
            }
            else{
                console.log("Item Number: " + res[i].id + " || Item Name: " + res[i].product_name + " || Department: " + res[i].department_name + " || Price: $" + res[i].price + " || In Stock: " + res[i].stock_quantity);
            }
        }
        managerStart();
    });
};