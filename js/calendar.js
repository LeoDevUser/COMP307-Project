// JavaScript functions to handle date navigation and rendering
let currentDate = new Date();

function prevWeek() {
	currentDate.setDate(currentDate.getDate() - 7);
	clearCalendar();
	renderCalendar();
}

function nextWeek() {
	currentDate.setDate(currentDate.getDate() + 7);
	clearCalendar();
	renderCalendar();
}

function renderCalendar() {
	// Logic to calculate the dates for the current week
	// and render the calendar grid
	const monthYear = currentDate.toLocaleString('default', {
		month: 'long',
		year: 'numeric',
	});
	document.getElementById('current-month-year').textContent = monthYear;
	let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
		'Thurday', 'Friday', 'Saturday']
	let now = new Date(currentDate);
	if (currentDate.getDay != 0) {
		now.setDate(currentDate.getDate() - currentDate.getDay());
	} else {
		console.log(currentDate.getDate());
	}
	for(let i =0; i <7; i++) {
		let cur = new Date(now);
		cur.setDate(now.getDate() + i)
		let d = cur.toLocaleString('default', {
			day: 'numeric',
		});
		let dayIndex = cur.getDay();
		document.getElementById("day"+ dayIndex).innerText = days[dayIndex]+ " " + d;
	}
	//need to replace this with actual email of user's page
	//looks like token = localStorage.getItem(‘usertoken’);
	populate("test@mail.mcgill.ca");
}

function clearCalendar() {
    // Select all <td> elements in the document
    const cells = document.querySelectorAll('td:not(.u-td)');  // Only target <td> elements

    // Loop through each <td> and reset content and background color
    cells.forEach(cell => {
		cell.textContent = '';  // Clear the content inside the <td>
		cell.style.backgroundColor = '';  // Clear the background color
		//remove objectId for event_instance if there is one
		cell.removeAttribute('data');
    });
  }

//return boolean indicating if the date is in the current week
function inweek(date) {
	//start stores the start of the week
	let start = new Date(currentDate);
	if (currentDate.getDay() != 0) {
		start.setDate(currentDate.getDate() - currentDate.getDay());
	} else {
		console.log(currentDate.getDate());
	}
	let end = new Date(start);
	end.setDate(start.getDate() + 7);
	if (date < start || date > end) {
		return false;
	} else {
		return true;
	}
}

function populateColor(id, inputString, evi) {
    // List of possible colors
    const colors = ['#cbd4eb','#c0f4ae','#fafe92','#e8cae3','#c0a6fc'];
    
    const tds = document.getElementsByTagName('td:not(.u-td)');    
    
    // Create a set to track used colors
    const usedColors = new Set();
    
    // Check the current background colors and track the ones used
    for (let i = 0; i < tds.length; i++) {
        const bgColor = tds[i].style.backgroundColor;
        if (colors.includes(bgColor)) {
            usedColors.add(bgColor);
        }
    }

    // Find available colors
    const availableColors = colors.filter(color => !usedColors.has(color));

    // If there are available colors, choose a random one, otherwise choose any
    const colorToUse = availableColors.length > 0 ? availableColors[Math.floor(Math.random() * availableColors.length)] : colors[Math.floor(Math.random() * colors.length)];

    // Populate the <td> elements with the inputString and apply the chosen background color

    const element = document.getElementById(id);   
    
    element.style.backgroundColor=colorToUse;
    element.textContent=inputString;
	//objectinstanceid of event_instance stored as <td data=evi>
    element.setAttribute('data', evi);
}

async function populate() {
	try {
		const response1 = await fetch('/current_user');
		if (response1.ok) {
			console.log('user get success');
		} else {
			console.error('user get error :', response.statusText);
		}
		const user = await response1.json();
		console.log(user.email);
		const email = user.email;
		const response = await fetch(`/populate?q=${email}`);
		if (response.ok) {
			console.log('Population successful2');
		} else {
			console.error('Population failed2:', response.statusText);
		}
		const result = await response.json();
		const times = result.times; //here we have the times
		const appointments = result.appointments; //here the labels
		const evis = result.evis; //objid event_instance
		let counter = 0;
		for (time of times) {
			//parse the the Date and convert into the identifier
			date = new Date(time);
			//check if event within curent week
			if (!inweek(date)) {
				counter++;
				//skip the appointment since not in week
				continue;
			} else {
				let id;
				//to offset the utc time
				//+5 since Montreal is UTC-5
				let h = (date.getHours() + 5) % 12;
				if (h == 0) {
					//this means that h was equal to 12
					h = 12;
				}
				if (h < 10) {
					id = '0' + h.toString();
				} else {
					id = h.toString();
				}
				id = id + date.getDay().toString();
				let input = appointments[counter];
				let evi = evis[counter];
				populateColor(id, input, evi);
			}
		}
	} catch (err) {
		console.log("Error during population2", err);
	}
}

//render calendar
renderCalendar();
