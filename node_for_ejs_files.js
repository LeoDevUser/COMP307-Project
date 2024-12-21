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

app.get('/request', (req, res) => {
  res.render('request');
});

app.get('/viewRequests', (req, res) => {
  res.render('viewRequests');
});


app.get('/booking', (req, res) => {
  res.render('booking');
});

// Start the server
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

app.get('/current_user',  async (req, res) =>{
	return res.json(userDeet);
});

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
		return (resp[0].classs + " " + resp[0].label);
	} catch (err) {
		console.error(err);
	}
}
//to populate calendar by user email (default)
app.get('/populate', async (req, res) => {
	const mail = req.query.q;

	async function findUserEvents(mail) {
	  try {
		const resp = await userModel.find({email: mail}).toArray();
		return resp[0].event_instances;
	  } catch (err) {
		console.error(err);
	  }
	}

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
    const decodedClassName = decodeURIComponent(class_name);

    const eventsCursor = await events.find({
      classs: { $regex: decodedClassName, $options: 'i' }
    }).toArray();

    if (eventsCursor.length === 0) {
      return { error: 'No events found for the given class name' }; 
    }

    const allClassInstances = [];

    for (const event of eventsCursor) {
      const eventInstances = event.event_instances;



      if (eventInstances && eventInstances.length > 0) {

        allClassInstances.push({ eventId: event._id, eventInstances });
      } else {
        allClassInstances.push({ eventId: event._id, error: 'No event instances found' });
      }
    }

    return allClassInstances;

  } catch (err) {
    console.error(err);
    return { error: 'Server error' };  
  }
}


// Function to fetch appointments based on event instance ID (eid)
async function getAppEid(eid) {
  let times = [];
  let appointments = [];
  let evis = [];

  try {
    const instance = await findEventInstances(eid);  
    if (!instance) return;  

    // Push the time and appointments to the arrays
    times.push(instance[0]);  
    const fullLabel = await findEvent(instance[1]);  
    appointments.push(fullLabel);

    evis.push(eid);

    return { times, appointments, evis };
  } catch (err) {
    console.error(err);
  }
}

// Populate by class name
app.get('/populatebyclassname', async (req, res) => {
  const class_name = req.query.q;  

  try {
    const all_eid = await findClassInstances(class_name);

    if (!all_eid || all_eid.length === 0) {
      return res.json({ error: 'No class instances found' });
    }
    const times = [];
    const appointments = [];
    const evis = [];

    if (all_eid && typeof all_eid[Symbol.iterator] === 'function') {
      
      for (each_event of all_eid) {
        for (const eid of each_event.eventInstances) {
          const result =await getAppEid(eid);

          if (result) {
            times.push(...result.times);
            appointments.push(...result.appointments);
            evis.push(...result.evis);
          }

        }
        
      }
    }


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
    const searchQuery = req.query.q;

    if (!searchQuery) {
      return res.json([]);
    }
    const professors = await getProfessors();
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

//registers a user for instance using the instanceid
app.get('/registerForInstance', async (req, res) => {
  const eid = req.query.eid;
  const class_name = req.query.class_name;


  const eventiModel = db.collection('event_instances');
  const userModel = db.collection('users');
  const user_email=userDeet.email;


  if (!eid) return res.status(400).json({ error: 'eid is required' });

  try {
    const event_instance = await eventiModel.find({ _id: new ObjectId(eid) }).toArray();
    const user = await userModel.findOne({ email: user_email.trim() });
    const event = await events.find({_id:  new ObjectId(event_instance[0].eventid)}).toArray();
    
    if (!event || !event_instance) {
      return res.status(404).json({ error: 'Event or instance not found' });
    }

    if (event_instance[0].student_emails.includes(user_email)) {
      return res.json({ registered: true });
    }
    
    if (event[0].capacity<=event_instance[0].cur_count && event[0].capacity!=-1){
      return res.json({ isfull: true });
    }

    //updates event instance info with student email, updates cur_count
    await eventiModel.updateOne(
      { _id: new ObjectId(eid) },
      {
        $inc: { cur_count: 1 },        
        $push: { student_emails: userDeet.email }  
      }
    );

    //updates user by adding the event_instance id
    await userModel.updateOne(
      { _id: user._id },  
      {
        $push: {
          event_instances: eid          
        }
      }
    );
    

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

    const searchQuery = req.query.q;


    if (!searchQuery) {
      return res.json([]);
    }

    const classesCollection = db.collection('users');


    const classes = await classesCollection.findOne({email: { $regex: searchQuery, $options: 'i' }},
       {projection: {"classes": 1, "_id": 0}});  

    res.json(classes); 

  } catch (err) { 
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
    let curEvent = "temp"; //Holds event to add instance values at end to user
	  
    //If unlimited then capacity is given -1 value
    if(capacity == "unlimited"){
      capacity = -1;
    } else{
      capacity = req.query.userInputAvaliblePositions;
    }

    //If only a single instance is needed
    if(repeat == "doesNotRepeat"){
      //Adds time with no timezone to date
      let dateWithTime = new Date(start);
      dateWithTime.setUTCHours(whatTime(time));
	    
      const curInstance = await eventsInstances.create({
	date: dateWithTime,
        time: time,
        cur_count: 0, 
        prof_email: email,
        student_emails: [],
        eventid: "123"});

        curEvent = await Events.create({
          profEmail: email,
          label: label,
          classs: compClass,
          start: dateWithTime,
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
      //Adds time to date
      let dateWithTime = new Date(start);
      dateWithTime.setUTCHours(whatTime(time));

      curEvent = await Events.create({
        profEmail: email,
        label: label,
        classs: compClass,
        start: dateWithTime,
        end: end,
        time: time,
        hours: hours,
        repeats: day,
        capacity: capacity,
        event_instances: []
      });

      while(date <= dateEnd){ //Loops until date is later than dateEnd
      dateWithTime = new Date(date);
      dateWithTime.setUTCHours(whatTime(time));
	      
        let curInstance = await eventsInstances.create(
          {date: dateWithTime,
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
    const curUser = userModel.findOneAndUpdate(
        {email: email},
        { $push: {
          event_instances : { $each: curEvent.event_instances}
        }, $addToSet: { classes : compClass }
        }
      );
	  
    res.set('Content-Type', 'text/html');
    res.send(temp);
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Converts time to 24-hour time
function whatTime(time){
  switch(time){
      case "1":
          return 13;
      case "2":
          return 14;
      case "3":
          return 15;
      case "4":
          return 16;
      case "5":
          return 17;
      case "6":
          return 18;
      case "7":
          return 19;
      default:
          return Number(time);
  }

}

//End of add

//Various database acceses needed by RSVP
//Retrieves instance with instance id
app.get('/retrieveInstance', async (req, res) => {
  try {
    const instanceID = req.query.q;

    var ObjectId = require('mongoose').Types.ObjectId; 
    if(!ObjectId.isValid(instanceID)){ //Checks if valid id else returns empty 
      return res.json([]);
    }
    const instance = await eventiModel.findOne({_id: new ObjectId(instanceID)});

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
	  
    var ObjectId = require('mongoose').Types.ObjectId; 
    const event = await events.findOne({_id: new ObjectId(eventID)});

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

    var ObjectId = require('mongoose').Types.ObjectId; 
    if(!ObjectId.isValid(instanceID)){ //Checks if valid id else returns empty 
      return res.json([]);
    }
    const instance = await eventiModel.findOne({_id: new ObjectId(instanceID)});

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
	  
    var ObjectId = require('mongoose').Types.ObjectId; 
    const event = await events.findOne({_id: new ObjectId(eventID)});

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
    const user = await userModel.findOne({email: userEmail});

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

    var ObjectId = require('mongoose').Types.ObjectId; 
    //Finds instance and adds one to it
    eventiModel.findOneAndUpdate(
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
    let sd = new Date(d); //Start date at time 0:00:00
    let fd = new Date(d); //End date 
    fd.setDate(fd.getDate() + 1);

    //finds instance with date between sd and fd
    const deletedInstance = await eventiModel.findOneAndDelete({date: {$gte: sd, $lt: fd}, time: t, prof_email: u});
    if(deletedInstance == null){ //Checks if instance exisists
      return res.json(deletedInstance);
    }

    //Deletes instance from all user instance_array
    userModel.updateMany({event_instances: deletedInstance._id.toString()},
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

    var ObjectId = require('mongoose').Types.ObjectId; 
    let deleteEvent = await events.findOne({_id: new ObjectId(e)});

    //Checks if it repeats
    if(deleteEvent.repeats == -1){
      events.deleteOne({_id: new ObjectId(e)});
    } else{
      //Deletes instance from instance array
      await events.updateOne({_id: new ObjectId(e)}, 
      {$pull : {event_instances: i}});
      deleteEvent = await events.findOne({_id: new ObjectId(e)});

      //Checks if array is empty and if it is deletes event
      if(deleteEvent.event_instances[0] == null){
        events.deleteOne({_id: new ObjectId(e)});
      }
    }

    res.json(deleteEvent);
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Creates request schema
const requestSchema = new mongoose.Schema({
  date: { type: Date},
  time: {type: Number},
  prof_email: {type : String},
  student_email: {type : String},
  classs: {type : String},
  reason: {type : String}
});

const requests = mongoose.model('requests', requestSchema);

//creates a request and returns it
app.get('/createRequest', async (req, res) => {
  try {
    const newRequest = await requests.create({
      date: req.query.start,
      time: req.query.time,
      prof_email: req.query.profEmail,
      student_email: req.query.user,
      classs: req.query.class,
      reason: req.query.reason
    });

    res.json(newRequest); //returns request
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//returns all requests for a certain professor
app.get('/findAllRequests', async (req, res) => {
  try {
    const profEmail = req.query.pEmail;

    const allRequests = await requests.find({prof_email : { $regex : `^${profEmail}$`, $options: 'i'}});

    res.json(allRequests); //returns user
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//returns one requests for a request id
app.get('/findOneRequests', async (req, res) => {
  try {
    var ObjectId = require('mongoose').Types.ObjectId; 

    const oneRequest = await requests.findOne({_id : new ObjectId(req.query.q)});
	  
    res.json(oneRequest); //returns user
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Deletes a request (Professor rejected it)
app.get('/deleteRequest', async (req, res) => {
  try {
    var ObjectId = require('mongoose').Types.ObjectId; 

    const oneRequest = await requests.deleteOne({_id : new ObjectId(req.query.q)});

    res.json(oneRequest);
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Deletes request and adds the student who made the request into the accepted request instance (Professor accepted request)
app.get('/specialDeleteRequest', async (req, res) => {
  try {
    var ObjectId = require('mongoose').Types.ObjectId; 

    const oneRequest = await requests.findOneAndDelete({_id : new ObjectId(req.query.q)});

    const curinstance = await eventsInstances.findOneAndUpdate({_id : new ObjectId(req.query.i)},
    {$push: {
      student_emails : oneRequest.student_email}, 
      $inc: { cur_count: 1 }
    });

    const u = await userModel.findOneAndUpdate({email : oneRequest.student_email},
      {$push: {
        event_instances : oneRequest._id.toString()
      }});

    res.json(oneRequest); //returns user
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

//Get details from JWT
app.post('/getuserdetails', async (req, res) => {
  try {
    const { firstName, lastName, email, isProf } = req.body
    userDeet = { firstName, lastName, email, isProf }
    res.json({result: "User received!"})
  } catch (err) { //error
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/api', (req, res) => {
  res.json(userDeet)
});

// 404 for any other route
app.use((req, res) => {
  res.status(404).send('Page not found');
});
