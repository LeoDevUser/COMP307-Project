let email_global = "";
let class_global = "";
let currentDate = new Date();

// Function to initialize the search functionality
function filterSuggestions() {
  const suggestions = document.getElementById("suggestions");
  
  document.getElementById("search").addEventListener('input', async function(event) {
    const searchQuery = event.target.value;
    if (searchQuery) {
      const response = await fetch(`/searchbar?q=${searchQuery}`);
      const professors = await response.json();
      displayResults(professors, suggestions);
    } else {
      suggestions.innerHTML = '';  // Clear results if input is empty
    }
  });

  document.addEventListener('click', function(event) {
    if (!suggestions.contains(event.target) && event.target !== document.getElementById('search')) {
      suggestions.style.display = 'none';  // Hide suggestions
    }
  });
}

window.onload = function() {
  document.getElementById('search').value = '';  // Clear the search bar on page load
}

// Function to display search results
function displayResults(professors, suggestions) {
  const query = document.getElementById('search').value.toLowerCase();
  suggestions.innerHTML = '';  // Clear previous suggestions
  
  if (!query) return suggestions.style.display = 'none';  // Hide suggestions if input is empty

  const filteredProfessors = professors.filter(professor =>
    professor.name.toLowerCase().includes(query) || professor.email.toLowerCase().includes(query)
  ).map(professor => professor.name);

  const filteredClasses = professors.filter(professor =>
    professor.classes.some(classItem => classItem.toLowerCase().includes(query))
  ).flatMap(professor => professor.classes.filter(classItem => classItem.toLowerCase().includes(query)));

  const filteredOptions = [...filteredProfessors, ...filteredClasses].slice(0, 5);
  
  suggestions.style.display = 'block';  // Show suggestions
  filteredOptions.forEach(option => {
    const item = document.createElement('div');
    item.classList.add('suggestion-item');
    item.textContent = option;
    item.onclick = () => selectOption(option, professors);
    suggestions.appendChild(item);
  });
}

// Function to clear all table data
function clearAllTableData() {
  document.querySelectorAll('td').forEach(cell => {
    cell.textContent = '';  // Clear content
    cell.style.backgroundColor = '';  // Clear background color
  });
}

// Function to populate class options for a professor
function populateClassesOptions(professor) {
  professor.classes.forEach((className, index) => {
    const option = document.getElementById(`class${index + 1}`);
    option.textContent = className;
    option.style.display = 'block';
  });
}

// Function to handle item selection
async function selectOption(option, professors) {
  const suggestions = document.getElementById("suggestions");
  for (let i = 1; i <= 6; i++) {
    document.getElementById(`class${i}`).style.display = 'none';  // Hide all class options
  }

  if (/\d/.test(option)) {  // If the option is a class
    document.getElementById("class1").textContent = option;
    document.getElementById("class1").style.display = 'block';
    class_global = option;
    populatebyClassName(option);
    suggestions.style.display = 'none';

  } else {  // If the option is a professor
    const professor = professors.find(p => p.name === option);
    email_global = professor.email;
    class_global = '';
    populateClassesOptions(professor);
    clearAllTableData();
    document.getElementById('search').value = option;
    suggestions.style.display = 'none';
    populate(professor.email);
  }
}

// Function to find and populate data for a specific time slot and class
async function findCellInstance(start_time, end_time, day, class_string) {
  let start_hour = start_time.split(":")[0];
  start_hour = (start_hour > 12) ? start_hour - 12 : start_hour;

  const result = `${start_hour}${day}`;
  const cell = document.getElementById(result);
  
  if (!cell.textContent.trim() || !cell.textContent.includes(class_string)) {
    alert("Invalid time or class. Please provide a valid input.");
    return;
  }

  const response = await fetch(`/registerForInstance?eid=${cell.getAttribute("data")}`);
  if (!response.ok) return alert('Failed to register');

  alert('Success!');
}

// Function to log form data and register class
function logFormData() {
  const classDropdown = document.getElementById('dropdown').value;
  const dayDropdown = document.getElementById('day').value;
  const startTime = document.getElementById('start-time').value;
  const endTime = document.getElementById('end-time').value;

  if (!classDropdown || !dayDropdown || !startTime || !endTime) {
    alert("Please fill out all required fields!");
    return;
  }

  findCellInstance(startTime, endTime, dayDropdown, classDropdown);
  document.querySelectorAll('#dropdown, #day, #start-time, #end-time').forEach(input => input.value = '');
}

// Event listener for form submission
document.querySelector('.button_class').addEventListener('click', event => {
  event.preventDefault();
  logFormData();
});

// Function to populate calendar based on class name
async function populatebyClassName(name) {
  try {
    const response = await fetch(`/populatebyclassname?q=${name}`);
    if (!response.ok) throw new Error('Population failed');
    
    const { times, appointments, evis } = await response.json();
    times.forEach((time, index) => {
      const date = new Date(time);
      if (!inweek(date)) return;
      
      const h = (date.getHours() + 5) % 12 || 12;
      const id = `${h < 10 ? '0' : ''}${h}${date.getDay()}`;
      populateColor(id, appointments[index], evis[index]);
    });
  } catch (err) {
    console.log("Error during population:", err);
  }
}

// Function to populate calendar based on email
async function populate(email) {
  try {
    const response = await fetch(`/populate?q=${email}`);
    if (!response.ok) throw new Error('Population failed');
    
    const { times, appointments, evis } = await response.json();
    times.forEach((time, index) => {
      const date = new Date(time);
      if (!inweek(date)) return;
      
      const h = (date.getHours() + 5) % 12 || 12;
      const id = `${h < 10 ? '0' : ''}${h}${date.getDay()}`;
      populateColor(id, appointments[index], evis[index]);
    });
  } catch (err) {
    console.log("Error during population:", err);
  }
}

// Function to check if a date is within the current week
function inweek(date) {
  const start = new Date(currentDate);
  start.setDate(currentDate.getDate() - currentDate.getDay());
  
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  
  return date >= start && date <= end;
}

// Function to populate cell color for the schedule
function populateColor(id, inputString, evi) {
  const colors = ['#cbd4eb', '#c0f4ae', '#fafe92', '#e8cae3', '#c0a6fc'];
  const availableColors = colors.filter(color => !Array.from(document.querySelectorAll('td')).some(cell => cell.style.backgroundColor === color));
  const colorToUse = availableColors.length ? availableColors[Math.floor(Math.random() * availableColors.length)] : colors[Math.floor(Math.random() * colors.length)];

  const element = document.getElementById(id);
  element.style.backgroundColor = colorToUse;
  element.textContent = inputString;
  element.setAttribute('data', evi);
}

// Function to render the calendar
function renderCalendar() {
  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  document.getElementById('current-month-year').textContent = monthYear;
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let now = new Date(currentDate);
  now.setDate(currentDate.getDate() - currentDate.getDay());

  for (let i = 0; i < 7; i++) {
    const cur = new Date(now);
    cur.setDate(now.getDate() + i);
    document.getElementById(`day${cur.getDay()}`).innerText = `${days[cur.getDay()]} ${cur.getDate()}`;
  }

  if (email_global.trim() || class_global.trim()) populate("test@mail.mcgill.ca");
}

// Function to clear the calendar
function clearCalendar() {
  document.querySelectorAll('td:not(.u-td)').forEach(cell => {
    cell.textContent = '';  // Clear content
    cell.style.backgroundColor = '';  // Clear background color
    cell.removeAttribute('data');  // Remove event data
  });
}

// Functions to navigate weeks in the calendar
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

renderCalendar();  // Initial render
