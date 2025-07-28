const express = require('express');
const path = require('path'); 
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const checkoutRouter = require('./routes/checkout');
const ordersRouter = require('./routes/orders');

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
app.use('/', ordersRouter); 

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

// app.get("/orders",async (req, res) => {
//   const orders = await Product.find({}).limit(10);
//   res.render("orders", { title: "Home Page", message: "Welcome to the EJS-powered site!" });
// });

app.get("/collections", (req, res) => {
  res.render("collections", { title: "Home Page", message: "Welcome to the EJS-powered site!" });
});

const { ObjectId } = mongoose.Types;

const cartRoutes = require('./routes/cart');
app.use(cartRoutes); // Or app.use('/cart', cartRoutes);


// app.get("/product/:id", async (req, res) => {
//   const idParam = req.params.id;
//   let product;

//   // Try to parse as a number (for local JSON data)
//   const numericId = parseInt(idParam);

//   if (!isNaN(numericId)) {
//     // Search in bestsellers JSON by numeric id
//     product = bestsellers.products.find(p => p.id === numericId);
//   }

//   // If not found in JSON, check MongoDB
//   if (!product && ObjectId.isValid(idParam)) {
//     try {
//       product = await Product.findById(idParam).lean();
//     } catch (err) {
//       console.error("MongoDB query error:", err);
//     }
//   }

//   if (!product) {
//     return res.status(404).send("Product not found");
//   }

//   res.render("product", {
//     product,
//     title1: "Our Bestsellers",
//     title2: "Recommended",
//     products: bestsellers.products,
//   });
// });


app.get("/product/:id", async (req, res) => {
  const { ObjectId } = require("mongoose").Types;
  const idParam = req.params.id;
  let product;

  // Try to parse as a number (for local JSON data)
  const numericId = parseInt(idParam);
  if (!isNaN(numericId)) {
    product = bestsellers.products.find(p => p.id === numericId);
  }

  // If not found in JSON, check MongoDB
  if (!product && ObjectId.isValid(idParam)) {
    console.log("not found In beselleres");
    
    try {
      product = await Product.findById(idParam).lean();
    } catch (err) {
      console.error("MongoDB query error:", err);
    }
  }

  if (!product) {
    return res.status(404).send("Product not found");
  }

  // ✅ Handle default color + size + sku for first visit
  let defaultColor = null;
  let defaultSize = null;
  let defaultSku = null;
  // console.log("Product : ", product);
  
  if (product.variations?.length > 0) {
    // console.log("variationlenth not 0");
    
    const firstVariation = product.variations[0];
    console.log(firstVariation);
    
    defaultColor = {
      name: firstVariation.colorName,
      hex: firstVariation.colorHex,
    };

    if (firstVariation.sizeSkus?.length > 0) {
      console.log("sku length not 0");

      defaultSize = firstVariation.sizeSkus[0].size;
      defaultSku = firstVariation.sizeSkus[0].sku;

      console.log(defaultSize);
      console.log(defaultSku);
      
    }
  }

  // ✅ Pass to template
  res.render("product", {
    product,
    defaultColor,
    defaultSize,
    defaultSku,
    title1: "Our Bestsellers",
    title2: "Recommended",
    products: bestsellers.products,
  });
});


app.get("/cart", async (req, res) => {
  const userCart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
  const cartItems = (userCart && userCart.items) || [];
  console.log(req.user);
  console.log(userCart);

  
  res.render("cart", {
      title: "Your Cart",
      cartItems
  });
});

app.get("/checkout",async (req, res) => {
  const userCart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
  const cartItems = (userCart && userCart.items) || [];
  // console.log(cartItems);
  
  res.render("checkout", { cartItems });
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
