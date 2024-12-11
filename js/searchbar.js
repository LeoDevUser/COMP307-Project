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
    const filteredOptions = comments.filter(comment => comment.name.toLowerCase().includes(query));
    if (filteredOptions.length === 0) {
      suggestions.style.display = 'none'; // Hide if no results
      return;
    }
  
    suggestions.style.display = 'block'; // Show suggestions
    filteredOptions.slice(0, 5).forEach(option => { 
      const item = document.createElement('div');
      item.classList.add('suggestion-item');
      item.textContent = option.name; // Display only name
      item.onclick = () => selectOption(option); // Handle item selection
      suggestions.appendChild(item);
    });
  }
  