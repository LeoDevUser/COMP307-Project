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


  function clearAllTableData() {
    // Select all <td> elements in the document
    const cells = document.querySelectorAll('td');  // Only target <td> elements
    
    // Loop through each <td> and reset content and background color
    cells.forEach(cell => {
      cell.textContent = '';  // Clear the content inside the <td>
      cell.style.backgroundColor = '';  // Clear the background color
    });
  }

function populateClassesOptions(professor) {
    // Get the select element
    const dropdown = document.getElementById("dropdown");
    
    // Loop through the professor's classes
    professor.classes.forEach((className, index) => {
        // Get the corresponding <option> element by ID
        const option = document.getElementById(`class${index + 1}`);
        
        // Set the option text to the class name
        option.textContent = className;
        
        // Make the option visible by changing the display style
        option.style.display = 'block';
    });
}
  
function getEventInstances() {
    // Select all <td> elements
    const tdElements = document.querySelectorAll('td');
    
    // Create an array to store objects containing both 'data' and text content
    const instances = [];
  
    // Iterate over each <td> element
    tdElements.forEach(td => {
        // Check if the <td> element has a 'data' attribute
        if (td.hasAttribute('data')) {
            // Push an object with 'data' attribute and text content
            instances.push({
                data: td.getAttribute('data'),
                text: td.textContent.trim().slice(0, -3) // trimming to remove any extra whitespace
            });
        }
    });
  
    // Return the array of instances
    return instances;
}

  
  

  // Function to handle item selection
function selectOption(option,professors) {

    const eventInstance = false;

    for (let i = 1; i <= 6; i++) {
        const option = document.getElementById(`class${i}`);
        option.style.display = 'none'; // Hide the option
    }

    if (/\d/.test(option)) {
        //if option is a class
        const dropdown = document.getElementById("dropdown");
        const class1 = document.getElementById(`class1`);
        
        // Set the option text to the class name
        class1.textContent = option;
    }else{
        //if option is a professor

        const professor_or_class = professors.find(prof => prof.name === option);
        const eventInstance = professors.find(instances => instances.name === option).event_instances;

        const search = document.getElementById(`search`);
        search.value = option;
        document.getElementById(`suggestions`).display='none';

        populateClassesOptions(professor_or_class);

}
populateOptions();
    

}

function populateOptions(){

    //get eent_instance-class pairs
    events_instances=getEventInstances();

    // const eid = event_instances.map(instance => instance.data);

    for (let i = 1; i <= 4; i++) {
        const option = document.getElementById(`option${i}`);
        option.style.visibility = 'hidden'; // Hide the option
        option.textContent = ""; 
        }

    let index = 0;

    events_instances.forEach(async (key_pair) => {
        const response = await fetch(`/findInstance?eid=${key_pair.data}`);
        const data = await response.json();


        const option = document.getElementById(`option${index + 1}`);
        index=index+1;
        
        // Set the option text to the class name
        option.textContent = data[0].date.split('T')[1].split('.')[0];

        // options.forEach(option => {
        //     if (option.textContent.trim() === "comp") {
        //       console.log(option.id);  // Log the id of the option that contains "comp"
        //     }
        //   });
        
        // Make the option visible by changing the display style
        option.style.visibility = 'visible';



        console.log(data);
        // Do something with data
      });

}

    
      

    


    






  




  