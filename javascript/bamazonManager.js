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
        choices: ["View Products for Sale", "View Low Inventory", "Change Inventory", "Add New Product", "Exit"]
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
                case ("Change Inventory"):
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
    console.log("\r\nAvailable Items:\r\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("Item Number: " + res[i].id + " || Item Name: " + res[i].product_name + " || Department: " + res[i].department_name + " || Price: $" + res[i].price + " || In Stock: " + res[i].stock_quantity);
        }
        managerStart();
    });
};

function viewLowInventory() {
    console.log("\r\nItems With Low Inventory: \r\n");
    connection.query("SELECT * FROM products WHERE stock_quantity < 10", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            if (res.length === 0) {
                console.log("===========\r\nNo low inventory at this time.")
            }
            else {
                console.log("\r\nItem Number: " + res[i].id + " || Item Name: " + res[i].product_name + " || Department: " + res[i].department_name + " || Price: $" + res[i].price + " || In Stock: " + res[i].stock_quantity + "\r\n==========");
            }
        }
        managerStart();
    });
};

function addProduct() {
    inquirer.prompt([
        {
            name: "productName",
            type: "input",
            message: "Please enter the item name"
        },
        {
            name: "departmentName",
            type: "input",
            message: "Please enter the department name"
        },
        {
            name: "price",
            type: "input",
            message: "Please enter the item price",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "quantity",
            type: "input",
            message: "Please enter the item quatity",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (answer) {
        connection.query(
            "INSERT INTO products SET ?",
            {
                product_name: answer.productName,
                department_name: answer.departmentName,
                price: answer.price,
                stock_quantity: answer.quantity
            },
            function (err) {
                if (err) throw err;
                console.log("===========\r\nYou added Item: " + answer.productName + " Department: " + answer.departmentName + " Price: $" + answer.price + " Quantity: " + answer.quantity + "\r\n==========");
                managerStart();
            }
        );
    });
};

function addInventory() {
    console.log("\r\nAvailable Items:\r\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("Item Number: " + res[i].id + " || Item Name: " + res[i].product_name + " || Department: " + res[i].department_name + " || Price: $" + res[i].price + " || In Stock: " + res[i].stock_quantity);
        }
        inquirer.prompt([
            {
                name: "itemNumber",
                type: "input",
                message: "Please enter the item number for the item you wish to update",
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
                message: "Please enter the new item quantity",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function (answer) {
            var itemNum = answer.itemNumber;
            var newQuantity = parseInt(answer.itemQuantity);
            var itemIndex = itemNum - 1;
            var chosenItem = res[itemIndex];
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
                        console.log("===========\r\nYou have updated " + chosenItem.product_name + " quantity to " + newQuantity + "\r\n==========")
                        managerStart();
                    }
                );
            };
        });
    });
};