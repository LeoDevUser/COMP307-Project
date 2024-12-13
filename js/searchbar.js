// Function to initialize the search functionality
function filterSuggestions() {
    const suggestions = document.getElementById("suggestions");

    
    document.getElementById("search").addEventListener('input', async function(event) {
      const searchQuery = event.target.value;
      if (searchQuery) {
        const response = await fetch(`/searchbar?q=${searchQuery}`);
        const professors = await response.json();

        displayResults(professors, "suggestions");
          } else {
        suggestions.innerHTML = ''; // Clear results if input is empty
      }
    });
  
    // Close suggestions when clicking outside of the suggestions container
    document.addEventListener('click', function(event) {
      if (!suggestions.contains(event.target) && event.target !== document.getElementById('search')) {
        suggestions.style.display = 'none'; // Hide suggestions
      }
    });
  }

  window.onload = function() {
    document.getElementById('search').value = '';  // Clear the search bar on page load
  }
  
  // Function to display search results
  function displayResults(professors, suggestionsContainerId) {
    const query = document.getElementById('search').value.toLowerCase();
    const suggestions = document.getElementById(suggestionsContainerId);
    suggestions.innerHTML = ''; // Clear previous suggestions
    if (query.length === 0) {
      suggestions.style.display = 'none'; // Hide suggestions if input is empty
      return;
    }
    // Filter and display only the first 5 results
    const filteredProfessors = professors.filter(professor =>
        professor.name.toLowerCase().includes(query.toLowerCase()) ||
        professor.email.toLowerCase().includes(query.toLowerCase())
      ).map(professor => professor.name);

      const filteredClasses = professors.filter(professor =>
        professor.classes.some(classItem => 
          classItem.toLowerCase().includes(query.toLowerCase())
        )
      ).flatMap(professor => 
        professor.classes.filter(classItem => 
          classItem.toLowerCase().includes(query.toLowerCase())
        )
      );

    const filteredOptions = [...filteredProfessors, ...filteredClasses];



  
    suggestions.style.display = 'block'; // Show suggestions
    filteredOptions.slice(0, 5).forEach(option => {
        const item = document.createElement('div');
        item.classList.add('suggestion-item');
        item.textContent = option; // Directly display the option (either professor name or class name)
    
        item.onclick = () => selectOption(option,professors); // Handle item selection
        suggestions.appendChild(item);
      });
  }
  
  

  // Function to handle item selection
function selectOption(option,professors) {

    console.log("rf");

    const professor_or_class = professors.find(prof => prof.name === option);

    suggestions.style.display = 'none';

    if (professor) {
        //if it is a professor
        console.log("Found professor:", professor);
        document.getElementById('search').value = professor_or_class.ClassNumber;
      } else {
        //if it is a class
        console.log("Professor not found.");
        document.getElementById('search').value = professor_or_class.ClassNumber;
      }



    

    option.OHtimes.forEach(function(time) {
        populateRowWithColor(time, option.ClassNumber);
    });
    

    console.log(getProfessor(option));  // Prints the entire selected option to the console
    // If you want to print it in a more readable way, you can use JSON.stringify with indentation
    console.log(JSON.stringify(option, null, 2)); 
  }



function clearAllTableData() {
    // Select all <td> elements in the document
    const cells = document.querySelectorAll('td');  // Only target <td> elements
    
    // Loop through each <td> and reset content and background color
    cells.forEach(cell => {
      cell.textContent = '';  // Clear the content inside the <td>
      cell.style.backgroundColor = '';  // Clear the background color
    });
  }
  