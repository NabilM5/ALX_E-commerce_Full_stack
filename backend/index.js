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

// Middleware configuration
app.use(express.json()); // Parse incoming JSON requests
app.use(cors()); // Enable CORS for all routes (to allow requests from different origins)

// Connect to MongoDB database using Mongoose
mongoose.connect("mongodb+srv://nabilmouhamech:rbrulekGhWvgB5en@cluster0.xzbf5.mongodb.net/e-shooper")
    .then(() => console.log("Connected to MongoDB")) // Log successful connection
    .catch((error) => console.error("MongoDB connection error:", error)); // Handle connection errors


// Basic route to test if the API is running
app.get("/", (req, res) => {
    res.send("Express API is running"); // Respond with a message for the root route
})

// Configure Multer storage engine for handling file uploads
const storage = multer.diskStorage({
    destination: 'upload/images', // Set the destination folder for uploaded images
    // Define a custom filename for uploaded files
    filename:(req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
        // Example: "product_1678901234567.jpg"
    }
})

// Create an instance of Multer with the configured storage engine
const upload = multer({storage: storage})

// Serve static files from the "upload/images" directory
app.use('/images', express.static('upload/images'))

// Create an endpoint for uploading images, my field name is product
app.post('/upload', upload.single('product'), (req, res) => {
    // Handle the image upload and respond with the image URL
    res.json({
        success: 1, // Indicate success
        image_url: `http://localhost:${port}/images/${req.file.filename}` // Provide the image URL
    });
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
    try {
        const product = new Product({
            id: req.body.id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });
        
        await product.save();
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

// Start the server and listen on the specified port
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on port "+port); // Log successful server start
    }
    else
    {
        console.log("Error : "+error); // Log any errors during server startup
    }
})