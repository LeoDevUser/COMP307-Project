// Function to initialize the search functionality
function filterSuggestions() {
    const suggestions = document.getElementById("suggestions");
    
    document.getElementById("search").addEventListener('input', async function(event) {
      const searchQuery = event.target.value;

  
      if (searchQuery) {
        const response = await fetch(`/search?q=${searchQuery}`);
        const results = await response.json();
        displayResults(results, "suggestions");
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
  function displayResults(comments, suggestionsContainerId) {
    const query = document.getElementById('search').value.toLowerCase();
    const suggestions = document.getElementById(suggestionsContainerId);
    suggestions.innerHTML = ''; // Clear previous suggestions


  
    if (query.length === 0) {
      suggestions.style.display = 'none'; // Hide suggestions if input is empty
      return;
    }


  
    // Filter and display only the first 5 results
    const filteredOptions = comments.filter(comment => 
        String(comment.ClassNumber).toLowerCase().includes(String(query).toLowerCase())
      );


  
    suggestions.style.display = 'block'; // Show suggestions
    filteredOptions.slice(0, 5).forEach(option => { 
      const item = document.createElement('div');
      item.classList.add('suggestion-item');
      item.textContent = option.ClassNumber; // Display only name
      item.onclick = () => selectOption(option); // Handle item selection
      suggestions.appendChild(item);
    });
  }
  

  // Function to handle item selection
function selectOption(option) {
    suggestions.style.display = 'none';

    document.getElementById('search').value = option.ClassNumber;

    option.OHtimes.forEach(function(time) {
        populateRowWithColor(time, option.ClassNumber);
    });
    

    console.log(option);  // Prints the entire selected option to the console
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
  
