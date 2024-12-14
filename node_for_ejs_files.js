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

// Helper function to get professors
async function getProfessors() {
  try {
    // Use Mongoose's model to query for professors (isProf: true)
    const userModel = db.collection('users2');
    const professors = await userModel.find({ isProf: true }).toArray();;
    return professors;
  } catch (err) {
    console.error("Error fetching professors:", err);
    throw err;
  }
}


app.get('/searchbar', async (req, res) => {

  try {
    // Retrieve the search query from the request
    const searchQuery = req.query.q;

    // If no query is provided, return empty array
    if (!searchQuery) {
      return res.json([]);
    }
    // Get all professors (isProf: true) using the previously defined logic
    const professors = await getProfessors();

    // Filter the professors array based on the search query (name, email, or classes_array)
    const filteredProfessors = professors.filter(professor => {

      return (
        (professor.name && professor.name.match(new RegExp(searchQuery, 'i'))) ||
        (professor.classes && professor.classes.some(classItem => classItem.match(new RegExp(searchQuery, 'i'))))
      );  
    });


    // Return the filtered professors
    res.json(filteredProfessors);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});



//returns the full event instance
app.get('/findInstance', async (req, res) => {
  const eid = req.query.eid;
  const eventiModel = db.collection('event_instances');

  if (!eid) return res.status(400).json({ error: 'eid is required' });

  try {
    const resp = await eventiModel.find({ _id: new ObjectId(eid) }).toArray();
    return res.json(resp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

//register for instance

app.get('/registerForInstance', async (req, res) => {
  const eid = req.query.eid;
  const eventiModel = db.collection('event_instances');

  if (!eid) return res.status(400).json({ error: 'eid is required' });

  try {
    // Find the event instance by its ID
    const event = await eventiModel.find({ f_id: new ObjectId(eid) }).toArray();
    if (!event) {
      return res.status(404).json({ error: 'Event instance not found' });
    }



    // token = localStorage.getItem('usertoken');  //THIS EMAIL STUFF MIGHT BE CAUSING ERRORS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Userdetails = jwtDecode(token).email;
  

    // Update the event instance:
    // - Increment the `cur_count` by 1
    // - Push the string to the `student_emails` array
    console.log("event1");

    await eventiModel.updateOne(
      { _id: new ObjectId(eid) },
      {
        $inc: { cur_count: 1 },        // Increment the `cur_count` field by 1
        $push: { student_emails: "123" }  // Push the string "123" to `student_emails`
      }
    );

    // Return the updated event instance
    const updatedEvent = await eventiModel.findOne({ _id: new ObjectId(eid) });

    console.log("event2");


    return res.json(updatedEvent);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});


//search bar end

//retrieves list of classes, takes email
app.get('/retrieveClasses', async (req, res) => {
  try {
    // retrieves email sent with req
    const searchQuery = req.query.q;

    // If no query is provided, return empty array
    if (!searchQuery) {
      return res.json([]);
    }

    const classesCollection = db.collection('users2');

    // retrieves classes associated with email
    const classes = await classesCollection.findOne({email: { $regex: searchQuery, $options: 'i' }},
       {projection: {"classes": 1, "_id": 0}});  

    console.log(classes);
    res.json(classes); //returns classes

  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

const eventsSchema = new mongoose.Schema({
  profEmail: { type: String },
  label: { type: String },
  class: { type: String},
  start: {type : Date},
  end: {type : Date},
  time: {type : Number},
  hours: {type: Number},
  repeats: {type: Number},
  capacity: {type: Number},
  event_instances: [{type: String}]
});

const Events = mongoose.model('events', eventsSchema);

const eventsInstancesSchema = new mongoose.Schema({
  date: { type: Date},
  cur_count: {type: Number},
  student_emails: [{type : String}],
  eventid: {type : String}
});

const eventsInstances = mongoose.model('event_instances', eventsInstancesSchema);

//Adds new events to database
app.get('/add', async (req, res) => {
  try {
    console.log(req.url);
    const repeat = req.query.repeats;
    const email = req.query.email;
    let start = req.query.start;
    const label = req.query.appointmentLabel;
    const compClass = req.query.class.split('_').join(' ');
    const time = req.query.time;
    const hours = req.query.hours;
    let capacity = req.query.avaliblePositions;
    //If unlimited then capacity is given -1 value
    if(capacity == "unlimited"){
      capacity = -1;
    } else{
      capacity = req.query.userInputAvaliblePositions;
    }

    //If only a single instance is needed
    if(repeat == "doesNotRepeat"){
      //Creates instance
      const curInstance = await eventsInstances.create({date: start,
        cur_count: 0, 
        student_emails: [],
        eventid: "123"});
        console.log(curInstance._id.toString());

       //Creates event 
        const curEvent = await Events.create({
          profEmail: email,
          label: label,
          class: compClass,
          start: start,
          end: start,
          time: time,
          hours: hours,
          repeats: -1,
          capacity: capacity,
          event_instances: [curInstance._id]});
      
          //Adds event id to instance
          curInstance.eventid = curEvent._id.toString();
          curInstance.save();


    } else{ //repeating event
      //Creates date object dublicates of start/end to know when to break while loop
      const end = req.query.end;
      let dateEnd = new Date(end);
      let date = new Date(start);
      const day = date.getDay();

      //Creates new event
      const curEvent = await Events.create({
        profEmail: email,
        label: label,
        class: compClass,
        start: start,
        end: end,
        time: time,
        hours: hours,
        repeats: day,
        capacity: capacity,
        event_instances: []
      });

      while(date < dateEnd){

        //Creates new instance
        let curInstance = await eventsInstances.create(
          {date: date,
          cur_count: 0, 
          student_emails: [],
          eventid: curEvent._id.toString()
        });

        date.setDate(date.getDate() + 7); //Updated date to be the next week
        curEvent.event_instances.push(curInstance._id.toString()); //adds new instance id to eveny
        curEvent.save();
      }
    }
    
    res.render('delete'); //temp relocation
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});


// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'css' and 'images' directories
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'images')));

//serve scripts
app.use('/js', express.static(path.join(__dirname, 'js')));

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

//route to professor's event adder
app.get('/schedule', function (req, res) {
  res.render('schedule');
});

//route to professor's event deleter
app.get('/delete', function (req, res) {
  res.render('delete');
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
