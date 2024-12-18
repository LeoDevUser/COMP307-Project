// Author: Leonardo Martinez 261082940
// JavaScript functions to handle date navigation and rendering in upcoming appointments feature
let currentDateU = new Date();

populateU();

function clearUpcoming() {
    const hours = document.querySelectorAll('div.u-hour');
    hours.forEach(cell => {
		cell.textContent = '';
	});
    const dates = document.querySelectorAll('th.u-date');
    dates.forEach(cell => {
		cell.innerHTML = '';
    });
    const labels = document.querySelectorAll('div.u-label');
    labels.forEach(cell => {
		cell.innerHTML = '';
    });
}

function fill(id, month, day, hour, label) {
    const date = document.getElementById('u' + id.toString());
    date.innerHTML = month + "<br>" + day;
    const h = document.getElementById('h' + id.toString());
    h.innerHTML = hour;
    const l = document.getElementById('l' + id.toString());
    l.innerHTML = label;
}

async function populateU() {
	clearUpcoming();
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
			console.error('upcoming Population failed:', response.statusText);
		}
		let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
		const result = await response.json();
		let times = result.times;
		let appointments = result.appointments;
		let counter = 0;
		let data = times.map((time, index) => ({ time, string: appointments[index] }));
		//sort times from soonest to latest
		data.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
		times = data.map(item => item.time);
		appointments = data.map(item => item.string);
		for (time of times) {
			let date = new Date(time);
			if (date.setHours(date.getHours() + 5) < currentDateU) {
				continue;
			}
			let pmFlag = false;
			let h = date.getHours();
			if (h > 11) {
				pmFlag = true;
			}
			h = h % 12;
			if (h == 0) {
				h = 12;
			}
			hour = h.toString() + ":00";
			if(pmFlag) {
				hour = hour + " PM";
			} else {
				hour = hour + " AM";
			}
			let input = appointments[counter];
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
