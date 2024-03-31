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

const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

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

// Schema declare--------------------------------------------------------------------------------------------------
const grievanceSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Street_Name: { type: String },
  Phone: { type: String , required: true},
  Ward_No: { type: String , required: true},
  Complaint_Type: { type: String , required: true},
  description: { type: String, required: true },
  submissionDate: { type: Date, default: Date.now },
  // attachments: { type: Buffer }
});
const userSchema = new mongoose.Schema({
  wardNo: String,
  streetName: String,
doorNo: String,
contactName: String,
contactNo: String,
buildingUsage: String,
ebServiceNo: String,
rationCardNo: String,
Pin: String,
});

// Create a model for the user data----------------------------------------------------------------------------
const User = mongoose.model('User', userSchema);
// Define database model
const Grievance = mongoose.model('Grievance', grievanceSchema);

// Define file upload configuration
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });
// const upload = multer({ storage: storage });


// Define HTTP GET -------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.render('auth');
});
app.get("/first",function(req,res){
  res.render("first");
});
app.get("/ward",function(req,res){
  res.render("ward");
});
app.get("/wardNo/:ward",function(req,res){
  const ward=req.params.ward;
  res.render("login",{ward});

});
app.get("/admin",function(req,res){
  res.render("admin");
});
// app.get("/dashboard",function(req,res){
//   Grievance.find().then(grievances => {
// res.render('dashboard', { grievances });
// }).catch(error => {
// console.error(error);
// });
// })

app.get("/signup",function(req,res){
  res.render("signup");
});
app.get("/about",function(req,res){
  res.render("about");
});
app.get("/features",function(req,res){
  res.render("features");
});
// app.get("/grievances",function(req,res){
//  const wardNo=req.query.wardNo;
//
//   res.render("grievances",{wardNo});
// });
// Define HTTP POST route for form submission---------------------------------------------------------------------
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
doorNo: req.body.doorNo,
contactName: req.body.contactName,
contactNo: req.body.contactNo,
buildingUsage: req.body.buildingUsage,
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


// HTML button to trigger the download


// JavaScript function to trigger the download


//Getting the login values---------------------------------------------------------------------------------------
app.post('/login', (req, res) => {
    const pin  = req.body.pin;
    const wardNo= req.body.ward;
    console.log(wardNo);
    console.log(pin);


    // Find the user with the given PIN number in the database
    db.collection('users').findOne({Pin:pin,wardNo:wardNo } , (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }

      if (!user) {
        return res.status(401).send('Invalid PIN number');
      }

      // Render the user details page with the user's information
      res.render('grievances', { user });
    });
  });
  //Admin post------------------------------------------------------------------------------------------------------------------
app.post("/admin",(req,res)=>{
  const user=req.body.username;
  const pass=req.body.password;

  if(user==="Ravi" && pass==="ravi1234"){

      Grievance.find().then(grievances => {
  res.render('dashboard', { grievances });
}).catch(error => {
  console.error(error);
});

}

})
// Grievance post-------------------------------------------------------------------------------------------------------------------------
app.post("/grievances",  function(req, res) {

  const grievance = new Grievance({
    Name: req.body.name,
    Street_Name: req.body.streetName,
    Phone: req.body.phone,
    Ward_No: req.body.wardNo,
    Complaint_Type:req.body.complaint,
    description: req.body.description,
    // attachments: req.file.buffer
  });

  grievance.save(function(err) {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving grievance');
    } else {
      res.render('grievance-reg');
    }
  });
});
//====================================
app.post("/track",function(req,res){
  const name=req.body.name;
  const wardNo=req.body.wardNo;
  const phone =req.body.phone;
  Grievance.find({ Name: name, Ward_No: wardNo, Phone: phone }, (err, grievances) => {
        if (err) {
            console.error('Error fetching grievances:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('track.ejs', { grievances });
        }
    });
})
//====================================
//Resolve grievance

app.post('/resolve-grievance', (req, res) => {
    const grievanceId = req.body.grievanceId;
    console.log(grievanceId);
    // Delete the grievance from MongoDB based on the grievance ID
    Grievance.findByIdAndDelete(grievanceId, (err, deletedGrievance) => {
        if (err) {
            console.error('Error resolving grievance:', err);
            res.status(500).send('Internal Server Error');
        } else {
            // Send a response indicating success
            res.status(200).send('Grievance resolved successfully');
            // res.redirect('/dashboard');
        }
    });
});


// Start the server---------------------------------------------------------------------------------------------------------
const PORT =  3000;
 app.listen(PORT, () => {
   console.log(`Server listening on port ${PORT}`);
 });
