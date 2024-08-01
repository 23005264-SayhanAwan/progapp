// Import necessary packages
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const multer = require('multer');

const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,"public/images");
    },
    filename:(req,file,cb) => {
        cb(null,file.originalname)
    }
});
const upload = multer({storage:storage});

// Create an instance of the Express application
const app = express();
const port = 3000;

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'progapp'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Route to retrieve and display all meal plans
app.get('/mealplans', (req, res) => {
    const sql = 'SELECT * FROM mealplans';
    // Fetch data from MySQL
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving meal plans');
        }
        // Render the mealplans view with data
        res.render('mealplans', { mealplans: results });
    });
});

// Additional routes for other pages
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM mealplans';
    // Fetch data from MySQL
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving products');
        }
        // Render HTML page with data
        res.render('index', { mealplans: results });
    });
});

app.get('/contactus', (req, res) => {
    res.render('contactus');
});

app.get('/delivery', (req, res) => {
    res.render('delivery');
});

app.get('/aboutus', (req, res) => {
    res.render('aboutus');
});

app.get('/addmealplan', (req, res) => {
    res.render('addmealplan');
});

app.post('/addmealplan', (req, res) => {
    //Extract mealplan data from the request body
    const { plan_name, description, dietry_category, price } = req.body;
    const sql = 'INSERT INTO mealplans (plan_name, description, dietry_category, price) VALUES (?, ?, ?, ?)';
    //Insert the new mealplan into the database
    connection.query( sql , [plan_name, description, dietry_category, price ], (error, results) => {
        if (error) {
            // Hande any error that occurs during the database operation
            console.error("Error adding mealplan:", error);
            res.status(500).send('Error adding mealplan');
        } else {
            // Send a success response
            res.redirect('/mealplans');
        }
        });
    });

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

app.get('/deletemealplan/:id', (req, res) => {
    const meal_id = req.params.id;
    const sql = 'DELETE FROM mealplans WHERE meal_id = ?';
    connection.query(sql, [meal_id], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error deleting mealplan:", error);
            res.status(500).send('Error deleting mealplan');
        } else {
            // Send a success response
            res.redirect('/mealplans');
        }
    });
});  

app.post('/editmeals/:id', (req, res) => {
    const meal_id = req.params.id;
    // Extract product data from the request body
    const { plan_name, description, dietry_category, price } = req.body;

    const sql = 'UPDATE mealplans SET plan_name = ? , description = ?, dietry_category = ?, price = ? WHERE meal_id = ?';

    // Insert the new product into the database
    connection.query(sql, [plan_name, description, dietry_category, price, meal_id], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error updating mealplan:", error);
            res.status(500).send('Error updating mealplan');
        } else {
            // Send a success response
            res.redirect('/mealplans');
        }
    });
});

app.get('/editmeals/:id', (req, res) => {
    const meal_id = req.params.id;
    const sql = 'SELECT * FROM mealplans WHERE meal_id = ?';
    // Fetch data from MySQL based on the product ID
    connection.query(sql, [meal_id], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving mealplan by ID');
        }
        // Check if any product with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the product data
            res.render('editmeals', { mealplans: results[0] });
        } else {
            // If no product with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('mealplan not found');
        }
    });
});

app.get('/delivery', (req, res) => {
    res.render('delivery');
});

app.post('/delivery', (req, res) => {
    // Extract delivery address data from the request body
    const { unit_number, postalcode } = req.body;
    const sql = 'INSERT INTO deliveryadd (unit_number, postalcode) VALUES (?, ?)';
    // Insert the new delivery address into the database
    connection.query(sql, [unit_number, postalcode], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error adding delivery address:", error);
            res.status(500).send('Error adding delivery address');
        } else {
            // Send a success response
            res.redirect('/delivery');
        }
    });
});

app.get('/viewaddresses', (req, res) => {
    const sql = 'SELECT * FROM deliveryadd';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving delivery addresses');
        }
        res.render('viewaddresses', { addresses: results });
    });
});

app.get('/deleteaddress/:id', (req, res) => {
    const address_id = req.params.id;
    const sql = 'DELETE FROM deliveryadd WHERE delivery_id = ?';
    connection.query(sql, [address_id], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error('Error deleting address:', error);
            res.status(500).send('Error deleting address');
        } else {
            // Redirect to the view addresses page after deletion
            res.redirect('/viewaddresses');
        }
    });
});

app.get('/editaddress/:id', (req, res) => {
    const address_id = req.params.id;
    const sql = 'SELECT * FROM deliveryadd WHERE delivery_id = ?';
    connection.query(sql, [address_id], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving address for editing');
        }
        if (results.length > 0) {
            res.render('editaddress', { address: results[0] });
        } else {
            res.status(404).send('Address not found');
        }
    });
});

app.post('/editaddress/:id', (req, res) => {
    const address_id = req.params.id;
    const { unit_number, postalcode } = req.body;
    const sql = 'UPDATE deliveryadd SET unit_number = ?, postalcode = ? WHERE delivery_id = ?';
    connection.query(sql, [unit_number, postalcode, address_id], (error, results) => {
        if (error) {
            console.error('Error updating address:', error);
            res.status(500).send('Error updating address');
        } else {
            res.redirect('/viewaddresses');
        }
    });
});
