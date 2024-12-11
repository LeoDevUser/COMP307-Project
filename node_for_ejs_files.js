const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const MONGODB_URI = 'mongodb+srv://tempuser:BcRXLU3TTLOqxCWE@myschedule2024.lhqde.mongodb.net/?retryWrites=true&w=majority&appName=myschedule2024/sample_mflix';

const hostname = '0.0.0.0';
const port = 3000;

//connect to mongoose
mongoose.connect(MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	dbName: 'sample_mflix'
});


//get default connection
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection erro:'));
db.once('open', () => {
	console.log('Connected to MongoDB successfully!');
});

const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

//create model
const Comment = mongoose.model('Comment', commentSchema);


// searchbar start
app.get('/search', async (req, res) => {
  try {
    // Retrieve the search query from the request
    const searchQuery = req.query.q;

    // If no query is provided, return empty array
    if (!searchQuery) {
      return res.json([]);
    }

    // Access the 'classes' collection from the database
    const classesCollection = db.collection('classes');

    // Find classes that match the search query in fields like 'ClassName' or 'ClassNumber'
    const classes = await classesCollection.find({
      $or: [
        { ClassName: { $regex: searchQuery, $options: 'i' } },  // Search in ClassName
        { ClassNumber: { $regex: searchQuery, $options: 'i' } }, // Search in ClassNumber
      ]
    }).toArray();  // Convert the result to an array

    // Return the found classes as JSON
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});



//search bar end

async function findComments() {
  try {
    const comments = await Comment.find({ date: { $gt: new Date('2003-01-01') } });
    console.log('Comments after 2003:', comments);
  } catch (err) {
    console.error(err);
  }
}
findComments();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'css' and 'images' directories
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'images')));

//serve scripts
app.use('/js', express.static(path.join(__dirname, 'js')));

//React application
app.use('/schedule', express.static(path.join(__dirname, 'react', 'schedule')));

// Route to serve the landing page with template included
app.get('/landing.html', (req, res) => {
  // Render the landing page using EJS
  res.render('landing');  // This will render 'views/landing.ejs' and include 'template.ejs'
});

// Default route to server landing page
app.get('/', (req, res) => {
  res.render('landing');
});

//route to dashboard, for now it is dashboard for a generic user
//will later make the request handle specific users with security
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

//route to calendar page, will be used as template in 
//pages needing to display a calendar will later adjust 
//get for security
app.get('/calendar', (req, res) => {
  res.render('calendar');
});

//route to upcoming appointments page, will be used
//in user dashboard page
app.get('/upcoming', (req, res) => {
  res.render('upcoming');
});

//Loads professor's schedule builder
app.get('/schedule', function (req, res) {
  res.sendFile(path.join(__dirname, 'react','schedule', 'index.html'));
});


app.get('/booking', (req, res) => {
  res.render('booking');
});

// 404 for any other route
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start the server
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
