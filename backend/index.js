// Import necessary modules
const port = 4000; // Define the port for the server
const express = require('express'); // Import Express framework for building the API
const app = express(); // Create an Express application instance
const mongoose = require('mongoose'); // Import Mongoose library for working with MongoDB interaction
const jwt = require('jsonwebtoken'); // Import JSON Web Token for authentication
const multer = require('multer'); // Import Multer for handling file uploads
const path = require('path'); // Import Path module for working with file and directory paths (// Import Path for handling file paths)
const cors = require('cors'); // Import CORS for enabling cross-origin requests
const { type } = require('os');
const { lookupService } = require('dns');
const { error } = require('console');

// Middleware configuration
app.use(express.json()); // Parse incoming JSON requests
app.use(cors()); // Enable CORS for all routes (to allow requests from different origins)

// Connect to MongoDB database using Mongoose
mongoose.connect("mongodb+srv://nabilmouhamech:rbrulekGhWvgB5en@cluster0.xzbf5.mongodb.net/E-Shopper")
    .then(() => console.log("Connected to MongoDB")) // Log successful connection
    .catch((error) => console.error("MongoDB connection error:", error)) // Handle connection errors


// Basic route to test if the API is running
app.get("/", (req,res) => {
    res.send("Express API is running") // Respond with a message for the root route
})

// Configure Multer storage engine for handling file uploads
const storage = multer.diskStorage({
    destination: './upload/images', // Set the destination folder for uploaded images
    // Define a custom filename for uploaded files
    filename:(req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
        // Example: "product_1678901234567.jpg"
    }
})

// Create an instance of Multer with the configured storage engine
const upload = multer({storage:storage})

// Serve static files from the "upload/images" directory
app.use('/images',express.static('upload/images'))

// Create an endpoint for uploading images, my field name is product
app.post("/upload",upload.single('product'),(req,res)=>{
    // Handle the image upload and respond with the image URL
    res.json({
        success: 1, // Indicate success
        image_url: `http://localhost:${port}/images/${req.file.filename}` // Provide the image URL
    })
})

// Schema for Creating Products
const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required: true,
        unique: true,
    },
    name:{
        type:String,
        required: true,
    },
    image:{
        type:String,
        required: true,
    },
    category:{
        type:String,
        required: true,
    },
    new_price:{
        type: Number,
        required:true,
    },
    old_price:{
        type: Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    avilable:{
        type:Boolean,
        default:true,
    },
})

// Fixed endpoint for adding product
app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if(products.length>0)
    {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id = 1;
    }
    try {
        const product = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });
        console.log(product);
        await product.save();
        console.log("Saved")
        res.json({
            success: true,
            name: req.body.name,
        });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving product',
        });
    }
});

// Creating API For deleting Products
app.post('/removeproduct',async(req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })
})

//Creating API for getting all products
app.get('/allproducts', async (req,res)=>{
    let products = await Product.find({

    });
    console.log("All Products Fetched");
    res.send(products);
})

// Schema creating for User model

const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

// Creating Endpoint for registering the user
app.post('/signup', async (req, res) =>{
    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false, errors:"Existing user found with same email address"})
    }
    let cart ={};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }
    
    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
})

// creating endpoint for user login
app.post('/login', async(req, res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({success:true, token});
        }
        else{
            res.json({success:false, errors:"Wrong Password"});
        }
    }
    else{
        res.json({success:false, errors:"User not found"});
    }
})

// creating endpoint for user logout (newcollection data)
app.get('/newcollection', async(req, res) => {
    let products = await Product.find({});
    let newCollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newCollection);
})

// Creating endpoint for Popular in women section
app.get('/popularinwomen', async(req,res) =>{
    let products = await Product.find({category:"women"});
    let popular_in_women = products.slice(0,4);
    console.log("Popular in Women Fetched");
    res.send(popular_in_women);
})

// Start the server and listen on the specified port
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on port "+port) // Log successful server start
    }
    else
    {
        console.log("Error : "+error) // Log any errors during server startup
    }
})