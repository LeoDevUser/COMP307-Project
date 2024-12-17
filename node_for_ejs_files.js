const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const path = require('path');
const { userInfo } = require('os');
const app = express();
const MONGODB_URI = 'mongodb+srv://tempuser:BcRXLU3TTLOqxCWE@myschedule2024.lhqde.mongodb.net/?retryWrites=true&w=majority&appName=myschedule2024/test';

const hostname = '0.0.0.0';
const port = 3000;

//used to fetch user info for private pages
let userDeet = {
};

app.use(express.json())
app.use(cors())

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

//get current user
app.get('/current_user',  async (req, res) =>{
	return res.json(userDeet);
});


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

//START of api calls to populate
//db collections used in calls
const events = db.collection('events');
const userModel = db.collection('users');
const eventiModel = db.collection('event_instances');

//helpers
//takes ObjectId(event_instance)
//returns the date and event id
async function findEventInstances(eid) {
  try {
	const resp = await eventiModel.find({_id: new ObjectId(eid)}).toArray();
	return [resp[0].date, resp[0].eventid];
  } catch (err) {
	console.error(err);
  }
}

//takes ObjectId(event)
//returns the full event name
async function findEvent(evid) {
	try {
		const resp = await events.find({_id:  new ObjectId(evid)}).toArray();
		//console.log(resp[0]);
		//console.log(evid);
		return (resp[0].classs + " " + resp[0].label);
	} catch (err) {
		console.error(err);
	}
}
//to populate calendar by user email (default)
app.get('/populate', async (req, res) => {
	const mail = req.query.q;

	//takes user email
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

	//takes user email
	//returns the time and appointments for the user
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

//populate by event_instance
app.get('/populatebyeid', async (req, res) => {
	const eid = req.query.q
	
	//takes ObjectId(event_instance)
	//returns the time and appointments for the user
	//in json format {times: [Date]; appointments: [String], event_instance ObjectId (eid): [str]}
	async function getAppeid(eid) {
		let times = [];
		let appointments = [];
		let evis = [];
		let tmp;
		try {
			const instances = await findUserEvents(mail);
			tmp = await findEventInstances(eid);
			times.push(tmp[0]);
			var fullLabel = await findEvent(tmp[1]);
			appointments.push(fullLabel);
			//storing objectId for event_instance
			evis.push(eid);
			//console.log(appointments);
			return res.json({times: times, appointments: appointments, evis: evis});
		} catch (err) {
			console.error(err);
		}
	}

	try {
		await getAppEid(eid); 
	} catch (err) {
		console.error(err);
	}
});

// Function to find class instances based on class name
async function findClassInstances(class_name) {
  try {
    // Decode the class name to handle spaces or special characters
    const decodedClassName = decodeURIComponent(class_name);

    // Find all events that match the class name
    const eventsCursor = await events.find({
      classs: { $regex: decodedClassName, $options: 'i' }
    }).toArray();

    if (eventsCursor.length === 0) {
      return { error: 'No events found for the given class name' };  // Return error if no matching event
    }

    // Create an array to store all event instances (event_instaces)
    const allClassInstances = [];

    // Iterate over each event and extract its event instances (event_instaces)
    for (const event of eventsCursor) {
      const eventInstances = event.event_instances;



      if (eventInstances && eventInstances.length > 0) {
        // Push the full event instance details to the array
        allClassInstances.push({ eventId: event._id, eventInstances });
      } else {
        allClassInstances.push({ eventId: event._id, error: 'No event instances found' });
      }
    }

    // Return the array of all event instances for each event
    return allClassInstances;

  } catch (err) {
    console.error(err);
    return { error: 'Server error' };  // Return error in case of any server error
  }
}


// Function to fetch appointments based on event instance ID (eid)
async function getAppEid(eid) {
  let times = [];
  let appointments = [];
  let evis = [];

  try {
    // Get event instance details (replace with your method to fetch event instance)
    const instance = await findEventInstances(eid);  // Assuming you have this function
    if (!instance) return;  // If no instance found, return early

    // Push the time and appointments to the arrays
    times.push(instance[0]);  // Assuming instance has a date property
    const fullLabel = await findEvent(instance[1]);  // Assuming eventid exists in instance
    appointments.push(fullLabel);

    // Store the event_instance objectId (eid)
    evis.push(eid);

    // Return the results
    return { times, appointments, evis };
  } catch (err) {
    console.error(err);
  }
}

// Populate by class name
app.get('/populatebyclassname', async (req, res) => {
  const class_name = req.query.q;  // Get the class name from the query parameter

  try {
    // Find all class instances based on the class name
    const all_eid = await findClassInstances(class_name);

    if (!all_eid || all_eid.length === 0) {
      return res.json({ error: 'No class instances found' });
    }

    // Create arrays to hold the results
    const times = [];
    const appointments = [];
    const evis = [];

    

    // Process each eid in all_eid sequentially
    for (each_event of all_eid) {
      for (const eid of each_event.eventInstances) {
        // Call getAppEid function for each event instance ID
        const result =await getAppEid(eid);



        if (result) {
          times.push(...result.times);
          appointments.push(...result.appointments);
          evis.push(...result.evis);
        }

      }
      
    }


    // Return the results as a JSON response
    res.json({ times, appointments, evis });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});




//END of populate api calls



// searchbar START

// Helper function to get professors
async function getProfessors() {
  try {
    // Use Mongoose's model to query for professors (isProf: true)
    const userModel = db.collection('users');
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
        ((professor.firstName && professor.lastName) && (
          professor.firstName.match(new RegExp(searchQuery.split(' ')[0], 'i')) &&
          professor.lastName.match(new RegExp(searchQuery.split(' ')[1] || '', 'i'))
        )) ||
        ((professor.firstName && professor.lastName) && (
          professor.firstName.match(new RegExp(searchQuery.split(' ')[1], 'i')) &&
          professor.lastName.match(new RegExp(searchQuery.split(' ')[0] || '', 'i'))
        )) ||
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
  const class_name = req.query.class_name;


  const eventiModel = db.collection('event_instances');
  const userModel = db.collection('users');
  const user_email=userDeet.email;


  if (!eid) return res.status(400).json({ error: 'eid is required' });

  try {
    // Find the event instance by its ID
    const event = await eventiModel.find({ f_id: new ObjectId(eid) }).toArray();
    const user = await userModel.findOne({ email: user_email.trim() });
    
    if (!event) {
      return res.status(404).json({ error: 'Event instance not found' });
    }


    await eventiModel.updateOne(
      { _id: new ObjectId(eid) },
      {
        $inc: { cur_count: 1 },        // Increment the `cur_count` field by 1
        $push: { student_emails: userDeet.email }  // Push the email to `student_emails`
      }
    );


    await userModel.updateOne(
      { _id: user._id },  
      {
        $push: {
          event_instances: eid          // Push the `eid` to the `event_instances` array
        }
      }
    );
    

    // Return the updated event instance
    const updatedEvent = await eventiModel.findOne({ _id: new ObjectId(eid) });



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

    const classesCollection = db.collection('users');

    // retrieves classes associated with email
    const classes = await classesCollection.findOne({email: { $regex: searchQuery, $options: 'i' }},
       {projection: {"classes": 1, "_id": 0}});  

    res.json(classes); //returns classes

  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Beginning of Adding a new event and all of its instances
const eventsSchema = new mongoose.Schema({
  profEmail: { type: String },
  label: { type: String },
  classs: { type: String},
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
  time: {type: Number},
  cur_count: {type: Number},
  prof_email: {type : String},
  student_emails: [{type : String}],
  eventid: {type : String}
});

const eventsInstances = mongoose.model('event_instances', eventsInstancesSchema);

//Adds new events to database and returns the closest dated instance
app.get('/add', async (req, res) => {
  try {
    //console.log(req.url);
    //console.log("here");
    //retrieves all needed info for both repeat cases
    const repeat = req.query.repeats;
    const email = req.query.email;
    let start = req.query.start;
    const label = req.query.appointmentLabel;
    const compClass = req.query.class.split('_').join(' ');
    const time = req.query.time;
    const hours = req.query.hours;
    let temp = "temp"; //Stores closest dated instance that was just created
    let capacity = req.query.avaliblePositions;
    let curEvent = "temp"; //Needed to add instance values at end for user
	  
    //If unlimited then capacity is given -1 value
    if(capacity == "unlimited"){
      capacity = -1;
    } else{
      capacity = req.query.userInputAvaliblePositions;
    }

    //If only a single instance is needed
    if(repeat == "doesNotRepeat"){
      const curInstance = await eventsInstances.create({date: start,
        time: time,
        cur_count: 0, 
        prof_email: email,
        student_emails: [],
        eventid: "123"});
        //console.log(curInstance._id.toString());

        curEvent = await Events.create({
          profEmail: email,
          label: label,
          classs: compClass,
          start: start,
          end: start,
          time: time,
          hours: hours,
          repeats: -1,
          capacity: capacity,
          event_instances: [curInstance._id]
        });

	//Adds event id to instance
        curInstance.eventid = curEvent._id.toString();
        curInstance.save();

        temp = curInstance._id.toString();

    } else{ //repeating event
      //Creates date object dublicates of start/end to know when to break while loop
      const end = req.query.end;
      let dateEnd = new Date(end);
      let date = new Date(start);
      const day = date.getDay();

      curEvent = await Events.create({
        profEmail: email,
        label: label,
        classs: compClass,
        start: start,
        end: end,
        time: time,
        hours: hours,
        repeats: day,
        capacity: capacity,
        event_instances: []
      });

      while(date <= dateEnd){ //Loops until date is later than dateEnd

        let curInstance = await eventsInstances.create(
          {date: date,
          time: time,
          cur_count: 0, 
          prof_email: email,
          student_emails: [],
          eventid: curEvent._id.toString()
        });

        date.setDate(date.getDate() + 7); //Updates date to be the next week
        curEvent.event_instances.push(curInstance._id.toString()); //adds new instance id to event
      }

      curEvent.save();
      temp = curEvent.event_instances[0];
      
    }

    //Adds event_instances to user (the prof creating the new event)
    const classesCollection = db.collection('users');
    classesCollection.findOneAndUpdate(
        {email: email},
        { $push: {
          event_instances : { $each: curEvent.event_instances}
        }
      });
	  
    res.set('Content-Type', 'text/html');
    res.send(temp);
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Various database acceses needed by RSVP
//Retrieves instance with instance id
app.get('/retrieveInstance', async (req, res) => {
  try {
    const instanceID = req.query.q;

    const instanceCollection = db.collection('event_instances');
    var ObjectId = require('mongoose').Types.ObjectId; 
    if(!ObjectId.isValid(instanceID)){ //Checks if valid id else returns empty 
      return res.json([]);
    }
    const instance = await instanceCollection.findOne({_id: new ObjectId(instanceID)});
    //console.log(instance);

    res.json(instance); //returns instance

  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//retrieves event given event id
app.get('/retrieveEvent', async (req, res) => {
  try {
    const eventID = req.query.q;
	  
    const instanceCollection = db.collection('events');
    var ObjectId = require('mongoose').Types.ObjectId; 
    const event = await instanceCollection.findOne({_id: new ObjectId(eventID)});
    console.log(event);

    res.json(event); //returns event
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Various database acceses needed by RSVP
//Retrieves instance with instance id
app.get('/retrieveInstance', async (req, res) => {
  try {
    const instanceID = req.query.q;

    const instanceCollection = db.collection('event_instances');
    var ObjectId = require('mongoose').Types.ObjectId; 
    if(!ObjectId.isValid(instanceID)){ //Checks if valid id else returns empty 
      return res.json([]);
    }
    const instance = await instanceCollection.findOne({_id: new ObjectId(instanceID)});
    //console.log(instance);

    res.json(instance); //returns instance

  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//retrieves event given event id
app.get('/retrieveEvent', async (req, res) => {
  try {
    const eventID = req.query.q;
	  
    const instanceCollection = db.collection('events');
    var ObjectId = require('mongoose').Types.ObjectId; 
    const event = await instanceCollection.findOne({_id: new ObjectId(eventID)});
    console.log(event);

    res.json(event); //returns event
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//retrieves user given email
app.get('/retrieveUser', async (req, res) => {
  try {
    const userEmail = req.query.q;
    const userCollection = db.collection('users');
    const user = await userCollection.findOne({email: userEmail});
    console.log(user);

    res.json(user); //returns user
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Adds one to the cur_count for given instance id
app.get('/addCounter', async (req, res) => {
  try {
    const instanceID = req.query.q;

    const instanceCollection = db.collection('event_instances');
    var ObjectId = require('mongoose').Types.ObjectId; 
    //Finds instance and adds one to it
    instanceCollection.findOneAndUpdate(
      {_id: new ObjectId(instanceID)},
      { $inc: {
        cur_count: 1
      }});

    res.json([]);
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Returns instance, given date, time, and professor. Used for delete
app.get('/deleteInstance', async (req, res) => {
  try {
    const d = req.query.date;
    const t = Number(req.query.time);
    const u = req.query.user;
    dt = new Date(d);

    const ic = db.collection('event_instances');

    const deletedInstance = await ic.findOneAndDelete({date: dt, time: t, prof_email: u});
    //console.log(deletedInstance);
    if(deletedInstance == null){ //Checks if instance exisists
      return res.json(deletedInstance);
    }

    //Deletes instance from all user instance_array
    const uc = db.collection('users');
    uc.updateMany({event_instances: deletedInstance._id.toString()},
    {$pull: {
      event_instances : deletedInstance._id.toString()
      }}
    );
    
    res.json(deletedInstance);
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Deletes event if not repeated or instance array is empty
app.get('/deleteEvent', async (req, res) => {
  try {
    const i = req.query.iid; //Instance id
    const e = req.query.eid; //event id

    const ec = db.collection('events');

    var ObjectId = require('mongoose').Types.ObjectId; 

    let deleteEvent = await ec.findOne({_id: new ObjectId(e)});
    //console.log(deleteEvent);

    //Checks if it repeats
    if(deleteEvent.repeats == -1){
      ec.deleteOne({_id: new ObjectId(e)});
    } else{
      //Deletes instance from instance array
      await ec.updateOne({_id: new ObjectId(e)}, 
      {$pull : {event_instances: i}});
      //console.log(deleteEvent);
      deleteEvent = await ec.findOne({_id: new ObjectId(e)});

      //Checks if array is empty and if it is deletes event
      if(deleteEvent.event_instances[0] == null){
        ec.deleteOne({_id: new ObjectId(e)});
      }
    }

    res.json(deleteEvent);
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/getuserdetails', async (req, res) => {
  try {
    console.log("meow")
    const { firstName, lastName, email, isProf } = req.body
    console.log(firstName, lastName, email, isProf)
    userDeet = { firstName, lastName, email, isProf }
    res.json({result: "User received!"})
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/api', (req, res) => {
  console.log(userDeet)
  res.json(userDeet)
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

//route to dashboard (Student)
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

//route to dashboard (Student)
app.get('/pdashboard', (req, res) => {
  res.render('pdashboard');
});

//route to calendar
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

//route to rsvp page
app.get('/rsvp', function (req, res) {
  //Checks if rsvp has a sindle parameter else it won't load
  const param = req.query.p;
  if (!param) {
      return res.status(404).send('Page not found');
    }
  res.render('rsvp');
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
