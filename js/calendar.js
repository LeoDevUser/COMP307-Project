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
}

function clearCalendar() {
    // Select all <td> elements in the document
    const cells = document.querySelectorAll('td:not(.u-td)');  // Only target <td> elements

    // Loop through each <td> and reset content and background color
    cells.forEach(cell => {
		cell.textContent = '';  // Clear the content inside the <td>
		cell.style.backgroundColor = '';  // Clear the background color
    });
  }

//render calendar
renderCalendar();

//handles the date form and re-renders the calendar accordingly
document.addEventListener('DOMContentLoaded', () => {
    const dateForm = document.querySelector('.date-header form');

    dateForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission

        const selectedDate = document.getElementById('week').value;
		//handling timezone since Date() constructor
		//auto converts to UTC, but montreal is UTC-5
		currentDate = new Date(selectedDate + 'T12:00:00Z');
		currentDate.setHours(0, 0, 0, 0);
        renderCalendar();
    });
});
