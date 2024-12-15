// JavaScript functions to handle date navigation and rendering
let currentDateU = new Date();

populateU('test@mail.mcgill.ca')

//clear the upcoming container
function clearUpcoming() {
    const hours = document.querySelectorAll('div.u-hour');
    hours.forEach(cell => {
		cell.textContent = '';// Clear the content inside the <td>
    });
    const dates = document.querySelectorAll('th.u-date');
    dates.forEach(cell => {
		cell.innerHTML = '';// Clear the content inside <th>
    });
    const labels = document.querySelectorAll('div.u-label');
    labels.forEach(cell => {
		cell.innerHTML = '';// Clear the content inside <th>
    });
}

//sets the date and event info
function fill(id, month, day, hour, label) {
	// correct date
    const date = document.getElementById('u' + id.toString());
    date.innerHTML = month + "<br>" + day;
	//correct hour
    const h = document.getElementById('h' + id.toString());
    h.innerHTML = hour;
	//correct label
    const l = document.getElementById('l' + id.toString());
    l.innerHTML = label;
}

async function populateU(email) {
	clearUpcoming();
	try {
		const response = await fetch(`/populate?q=${email}`);
		if (response.ok) {
			console.log('upcoming Population successful');
		} else {
			console.error('upcoming Population failed:', response.statusText);
		}
		let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
		const result = await response.json();
		const times = result.times; //here we have the times
		const appointments = result.appointments; //here the labels
		let counter = 0;
		for (time of times) {
			let date = new Date(time);
			if (date.setHours(date.getHours() + 5) < currentDateU) {
				continue;//skip if event already passed
			}
			//parse the hour
			let pmFlag = false;
			//to offset the utc time
			//+5 since Montreal is UTC-5
			let h = date.getHours();
			if (h > 11) {
				pmFlag = true;
			}
			h = h % 12;
			if (h == 0) {
				//this means that h was equal to 12
				h = 12;
			}
			hour = h.toString() + ":00";
			//set am or pm
			if(pmFlag) {
				hour = hour + " PM";
			} else {
				hour = hour + " AM";
			}
			//get label
			let input = appointments[counter];
			//parse date
			let month = months[date.getMonth()]
			fill(counter, month, date.getDate().toString(), hour, input);
			counter++;
			if (counter > 3) {
				break;
			}
		}
	} catch (err) {
		console.log("Error during upcoming population", err);
	}
}
