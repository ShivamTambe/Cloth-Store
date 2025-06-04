const express = require('express');
const path = require('path'); 
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const fs = require('fs');

require('dotenv').config();
require('./config/passport');


const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, "public")));
// ✅ Required to parse JSON body
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


const db = mongoose.connection;

// Success
db.once('open', () => {
  console.log('✅ MongoDB connected successfully!');
});

// Error
db.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});


// Session
app.use(session({
  secret: process.env.GOOGLE_CLIENT_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', require('./routes/auth'));

app.use((req, res, next) => {
  res.locals.user = req.user || null; // `req.user` is set by Passport if logged in
  next();
});

const productsPath = path.join(__dirname, 'data', 'products.json');
const bestsellers = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
const Product = require("./models/Product");
const productRoutes = require("./routes/product");

app.use("/api/products", productRoutes);

app.get("/addProducts", (req, res) => {
  res.render("addproducts");
});

// Route for home page
app.get("/", (req, res) => {
  res.render("index", {
    bestsellersData: bestsellers // send as one object
  });
});

app.get("/orders", (req, res) => {
  res.render("orders", { title: "Home Page", message: "Welcome to the EJS-powered site!" });
});

app.get("/collections", (req, res) => {
  res.render("collections", { title: "Home Page", message: "Welcome to the EJS-powered site!" });
});


app.get("/product/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const product = bestsellers.products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).send("Product not found");
  }

  res.render("product", { product, title1: "Our Bestsellers",title2:"Recommeneded", products : bestsellers });
});

app.get("/cart", (req, res) => {
  res.render("cart", { title: "Home Page", message: "Welcome to the EJS-powered site!" });
});

app.get("/checkout", (req, res) => {
  res.render("checkout", { title: "Home Page", message: "Welcome to the EJS-powered site!" });
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
