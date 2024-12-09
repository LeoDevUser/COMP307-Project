// Sample list of suggestions
const options = ["Apple", "Banana", "Orange", "Grape", "Mango", "Peach", "Pineapple", "Strawberry"];

function filterSuggestions() {
    const query = document.getElementById('search').value.toLowerCase();
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = ''; // Clear previous suggestions

    if (query.length === 0) {
        suggestions.style.display = 'none';
        return;
    }

    // Filter options based on the query
    const filteredOptions = options.filter(option => option.toLowerCase().includes(query));

    if (filteredOptions.length === 0) {
        suggestions.style.display = 'none';
        return;
    }

    // Display filtered suggestions
    suggestions.style.display = 'block';
    filteredOptions.forEach(option => {
        const item = document.createElement('div');
        item.classList.add('suggestion-item');
        item.textContent = option;
        item.onclick = () => selectOption(option);
        suggestions.appendChild(item);
    });
}

function selectOption(option) {
    document.getElementById('search').value = option;
    document.getElementById('suggestions').style.display = 'none';
}