// Require necessary modules
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser=require('body-parser');
const qrcode = require('qrcode');
  const crypto = require('crypto');
  const MongoClient = require('mongodb').MongoClient;
  const ObjectId = require('mongodb').ObjectId;
// Create an instance of Express.js
const app = express();
app.set('view engine', 'ejs');
app.use( express.static( "public" ) );
app.use(bodyParser.urlencoded({ extended: true }));
// Without middleware


// Define database connection variables
mongoose.set('strictQuery',false);
const DB_URL = 'mongodb+srv://Ravi:mBexH4kkK4qYSMvm@cluster0.xmbv9up.mongodb.net/grievancedb';

// Connect to database
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
 const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database connected');
});



// Connect to MongoDB
// const mongoClient = new MongoClient(DB_URL, { useUnifiedTopology: true });
// mongoClient.connect((err, client) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   console.log('Connected to MongoDB');
//
//   const db = client.db();});
// Define database schema
const grievanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  description: { type: String, required: true },
  attachments: { type: String }
});
const userSchema = new mongoose.Schema({
  wardNo: String,
  streetName: String,
blockNo: String,
floorNo: String,
doorNo: String,
contactName: String,
contactNo: String,
buildingUsage: String,
propertyTaxNo: String,
waterTaxNo: String,
ebServiceNo: String,
rationCardNo: String,
Pin: String,
});

// Create a model for the user data
const User = mongoose.model('User', userSchema);
// Define database model
const Grievance = mongoose.model('Grievance', grievanceSchema);

// Define file upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });


// Define HTTP POST route for form submission
app.get('/', (req, res) => {
  res.render('auth');
});
app.get("/login",function(req,res){
  res.render("login");
});
app.get("/admin",function(req,res){
  res.render("admin");
});
app.get("/signup",function(req,res){
  res.render("signup");
});
app.get("/grievances",function(req,res){
  res.render("grievances");
});

app.post('/signup', (req, res) => {
function generatePIN() {
  const pin = crypto.randomBytes(2).toString('hex');
  return pin;
}
// Example usage:
const newPIN = generatePIN();
console.log(newPIN); // e.g. "3a9f"

const userData = {
wardNo: req.body.wardNo,
streetName: req.body.streetName,
blockNo: req.body.blockNo,
floorNo: req.body.floorNo,
doorNo: req.body.doorNo,
contactName: req.body.contactName,
contactNo: req.body.contactNo,
buildingUsage: req.body.buildingUsage,
propertyTaxNo: req.body.propertyTaxNo,
waterTaxNo: req.body.waterTaxNo,
ebServiceNo: req.body.ebServiceNo,
rationCardNo: req.body.rationCardNo,
Pin:newPIN,

}
const user = new User(userData);

user.save((err) => {
if (err) {
console.error(err);
res.status(500).send('Error saving user to database');
} else {
  db.collection('users').findOne({Pin:newPIN} , (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
  const data = "https://red-tender-gharial.cyclic.app/login";
  qrcode.toDataURL(data, (err, url) => {
    if (err) {
      console.error(err);
      return;
    }
    // Display the QR code image with the data URL
  res.render("signup_confirm",{
    pin:newPIN,
    url:url
  });
  });
  });
}
});


});
//downloading Qr--------------------------------------------------------------------------------
// Node.js endpoint to generate and return the image
app.get('/generate-image', function(req, res) {
  // Generate the image using your favorite library (e.g. canvas, sharp)
  const image = generateImage();

  // Set the content-disposition header to trigger a download
  res.set('Content-Disposition', `attachment; filename="my-image.png"`);

  // Set the content-type header to indicate the type of the response
  res.set('Content-Type', 'image/png');

  // Send the image as the response body
  res.send(image);
});

// HTML button to trigger the download


// JavaScript function to trigger the download
function downloadImage() {
  // Make a GET request to the endpoint
  fetch('/generate-image')
    .then(response => {
      // Trigger the download using the response headers
      const filename = response.headers.get('content-disposition').split('=')[1];
      response.blob().then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    });
}

//Getting the login values
app.post('/login', (req, res) => {
    const pin  = req.body.pin;
    console.log(pin);


    // Find the user with the given PIN number in the database
    db.collection('users').findOne({Pin:pin} , (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }

      if (!user) {
        return res.status(401).send('Invalid PIN number');
      }

      // Render the user details page with the user's information
      res.render('user-details', { user });
    });
  });
app.post("/admin",(req,res)=>{
  const user=req.body.username;
  const pass=req.body.password;

  if(user==="Ravi" && pass==="ravi1234"){
    try {
      const collection = db.collection('grievances');
  collection.find({}).toArray(function(err, grievances) {

    console.log(grievances);

      // db.collection('grievances').find({},(err,grievances)=>{
      //   if (err) {
      //     console.error(err);
      //     return res.status(500).send('Internal Server Error');
      //   }
        res.render('dashboard', { grievances });
       })

  } catch (err) {
    console.error(err);
  }
}
  else{
    alert("You have entered Wrong Administrator details.Failed to Login as Administrator.Please Try Again");
    res.render("admin.ejs",{msg})
  }
})
app.post("/grievances", upload.single('attachments'), function(req, res) {
  const grievance = new Grievance({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    description: req.body.description,
    attachments: req.file ? req.file.filename : null
  });

  grievance.save(function(err) {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving grievance');
    } else {
      res.send('Grievance registered successfully');
    }
  });
});


// Start the server
const PORT =  3000;
 app.listen(PORT, () => {
   console.log(`Server listening on port ${PORT}`);
 });
