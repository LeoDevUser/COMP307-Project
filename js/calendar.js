// JavaScript functions to handle date navigation and rendering
let currentDate = new Date();

function prevWeek() {
currentDate.setDate(currentDate.getDate() - 7);
renderCalendar();
}

function nextWeek() {
currentDate.setDate(currentDate.getDate() + 7);
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
now.setDate(currentDate.getDate() - currentDate.getDay());
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
//render calendar
renderCalendar();

//handles the date form and re-renders the calendar accordingly
document.addEventListener('DOMContentLoaded', () => {
    const dateForm = document.querySelector('.date-header form');

    dateForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission

        const selectedDate = document.getElementById('week').value;
		currentDate = new Date(selectedDate);
        renderCalendar();
    });
});
