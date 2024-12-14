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
