// Author Leonardo Martinez 261082940
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
	populate();
}

function clearCalendar() {
    const cells = document.querySelectorAll('td:not(.u-td)');
    cells.forEach(cell => {
		cell.textContent = '';
		cell.style.backgroundColor = '';
		cell.removeAttribute('data');
    });
  }

function inweek(date) {
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
    const colors = ['#cbd4eb','#c0f4ae','#fafe92','#e8cae3','#c0a6fc'];
    
    const tds = document.getElementsByTagName('td:not(.u-td)');    
    
    const usedColors = new Set();
    
    for (let i = 0; i < tds.length; i++) {
        const bgColor = tds[i].style.backgroundColor;
        if (colors.includes(bgColor)) {
            usedColors.add(bgColor);
        }
    }

    const availableColors = colors.filter(color => !usedColors.has(color));

    const colorToUse = availableColors.length > 0 ? availableColors[Math.floor(Math.random() * availableColors.length)] : colors[Math.floor(Math.random() * colors.length)];


    const element = document.getElementById(id);   
    
    element.style.backgroundColor=colorToUse;
    element.textContent=inputString;
	//objectinstanceid of event_instance stored as <td data=evi>
    element.setAttribute('data', evi);
}

async function populate() {
	try {
		const response1 = await fetch('/current_user');
		if (!response1.ok) {
			console.error('user get error :', response.statusText);
		}
		const user = await response1.json();
		let email = user.email;
		if (email === undefined) {
			console.log("no user email");
			return;
		}
		const response = await fetch(`/populate?q=${email}`);
		if (!response.ok) {
			console.error('Calendar Population failed:', response.statusText);
		}
		const result = await response.json();
		const times = result.times;
		const appointments = result.appointments;
		const evis = result.evis;
		let counter = 0;
		for (time of times) {
			date = new Date(time);
			if (!inweek(date)) {
				counter++;
				continue;
			} else {
				let id;
				//to offset the utc time
				//+5 since Montreal is UTC-5
				let h = (date.getHours() + 5) % 12;
				if (h == 0) {
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
