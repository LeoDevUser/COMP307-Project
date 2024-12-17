/* Alexandros Contomichalos 261039376*/


function populateRowWithColor(id, inputString) {
    // List of possible colors
    const colors = ['#cbd4eb','#c0f4ae','#fafe92','#e8cae3','#c0a6fc'];
    
    const tds = document.getElementsByTagName('td');    
    
    // Create a set to track used colors
    const usedColors = new Set();
    
    // Check the current background colors and track the ones used
    for (let i = 0; i < tds.length; i++) {
        const bgColor = tds[i].style.backgroundColor;
        if (colors.includes(bgColor)) {
            usedColors.add(bgColor);
        }
    }

    // Find available colors
    const availableColors = colors.filter(color => !usedColors.has(color));

    // If there are available colors, choose a random one, otherwise choose any
    const colorToUse = availableColors.length > 0 ? availableColors[Math.floor(Math.random() * availableColors.length)] : colors[Math.floor(Math.random() * colors.length)];

    // Populate the <td> elements with the inputString and apply the chosen background color

    const element = document.getElementById(id);   
    
    element.style.backgroundColor=colorToUse;
    element.textContent=inputString;
}
