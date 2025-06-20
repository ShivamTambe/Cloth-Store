const express = require('express');
const path = require('path'); 
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const checkoutRouter = require('./routes/checkout');

const MongoStore = require('connect-mongo');
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
app.use(express.urlencoded({ extended: true }));
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
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL
  })
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(async (req, res, next) => {
  res.locals.user = req.user || null;

  if (req.user) {    
    try {
      const orderCount = await Cart.countDocuments({ userId: new mongoose.Types.ObjectId(req.user._id) });
      res.locals.orderCount = orderCount;

    } catch (err) {
      console.error('Error fetching order count:', err);
      res.locals.orderCount = 0;
    }
  } else {
    res.locals.orderCount = 0;
  }
  try {
    const topProducts = await Product.find({}).limit(10);
    res.locals.topProducts = topProducts; // this makes it available in EJS
    next();
  } catch (err) {
    console.error('Error fetching global products:', err);
    res.locals.topProducts = [];
    next();
  }
});

app.use('/auth', require('./routes/auth'));

app.use('/', checkoutRouter);  // or '/api' based on your setup

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
    bestsellersData: bestsellers// send as one object
  });
});

app.get("/orders", (req, res) => {
  res.render("orders", { title: "Home Page", message: "Welcome to the EJS-powered site!" });
});

app.get("/collections", (req, res) => {
  res.render("collections", { title: "Home Page", message: "Welcome to the EJS-powered site!" });
});

const { ObjectId } = mongoose.Types;

const cartRoutes = require('./routes/cart');
app.use(cartRoutes); // Or app.use('/cart', cartRoutes);


app.get("/product/:id", async (req, res) => {
  const idParam = req.params.id;
  let product;

  // Try to parse as a number (for local JSON data)
  const numericId = parseInt(idParam);

  if (!isNaN(numericId)) {
    // Search in bestsellers JSON by numeric id
    product = bestsellers.products.find(p => p.id === numericId);
  }

  // If not found in JSON, check MongoDB
  if (!product && ObjectId.isValid(idParam)) {
    try {
      product = await Product.findById(idParam).lean();
    } catch (err) {
      console.error("MongoDB query error:", err);
    }
  }

  if (!product) {
    return res.status(404).send("Product not found");
  }

  res.render("product", {
    product,
    title1: "Our Bestsellers",
    title2: "Recommended",
    products: bestsellers.products,
  });
});


app.get("/cart", async (req, res) => {
  console.log(req.user);
  const userCart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
  const cartItems = (userCart && userCart.items) || [];
  
  res.render("cart", {
      title: "Your Cart",
      cartItems
  });
});

app.get("/checkout", (req, res) => {
  res.render("checkout", { title: "Home Page", message: "Welcome to the EJS-powered site!" });
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
