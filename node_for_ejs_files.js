const express = require('express');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const path = require('path');
const app = express();
const MONGODB_URI = 'mongodb+srv://tempuser:BcRXLU3TTLOqxCWE@myschedule2024.lhqde.mongodb.net/?retryWrites=true&w=majority&appName=myschedule2024/test';

const hostname = '0.0.0.0';
const port = 3000;

mongoose.connect(MONGODB_URI, {
  dbName: 'test'
})
.then(() => {
    console.log("Connected to Database")
})
.catch((err) => {
    console.error("Error Encountered connecting to database", err)
});

//get default connection
const db = mongoose.connection;

// Helper function to get professors
async function getProfessors() {
  try {
    // Use Mongoose's model to query for professors (isProf: true)
    const professors = await userModel.find({ isProf: true });
    return professors;
  } catch (err) {
    console.error("Error fetching professors:", err);
    throw err;
  }
}

//to populate calendar
app.get('/populate', async (req, res) => {
	const mail = req.query.q;
    const events = db.collection('events');
    const userModel = db.collection('users2');
    const eventiModel = db.collection('event_instances');

	//get user's event_instances
	async function findUserEvents(mail) {
	  try {
		const resp = await userModel.find({email: mail}).toArray();
		//console.log(resp[0].event_instances);
		return resp[0].event_instances;
	  } catch (err) {
		console.error(err);
	  }
	}

	//returns the date and event id
	async function findEventInstances(eid) {
	  try {
		const resp = await eventiModel.find({_id: new ObjectId(eid)}).toArray();
		//console.log(resp[0]);
		return [resp[0].date, resp[0].eventid];
	  } catch (err) {
		console.error(err);
	  }
	}

	//returns the full event name
	async function findEvent(evid) {
		try {
			const resp = await events.find({_id:  new ObjectId(evid)}).toArray();
			//console.log(resp[0]);
			return (resp[0].classs + " " + resp[0].label);
		} catch (err) {
			console.error(err);
		}
	}

	//returns the tim and appointments for the user
	//in json format {times: [Date]; appointments: [String], event_instance ObjectId (eid): [str]}
	async function getAppointments(mail) {
		let times = [];
		let appointments = [];
		let evis = [];
		let tmp;
		try {
			const instances = await findUserEvents(mail);
			for (const e of instances) {
				tmp = await findEventInstances(e);
				times.push(tmp[0]);
				var fullLabel = await findEvent(tmp[1]);
				appointments.push(fullLabel);
				//storing objectId for event_instance
				evis.push(e);
			}
			//console.log(appointments);
			return res.json({times: times, appointments: appointments, evis: evis});
		} catch (err) {
			console.error(err);
		}
	}

	try {
		await getAppointments(mail); 
	} catch (err) {
		console.error(err);
	}
});

// searchbar start
app.get('/search', async (req, res) => {
  try {
    // retrieve the search query from the request
    const searchquery = req.query.q;

    // if no query is provided, return empty array
    if (!searchquery) {
      return res.json([]);
    }

// get all professors (isprof: true) using the previously defined logic
    const professors = await getprofessors();
// filter the professors array based on the search query (name, email, or classes_array)
    const filteredprofessors = professors.filter(professor => {
		return (
			(professor.name && professor.name.match(new RegExp(searchQuery, 'i'))) ||
			(professor.classes && professor.classes.some(classItem => classItem.match(new RegExp(searchQuery, 'i'))))
		);  
	});

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//search bar end

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
