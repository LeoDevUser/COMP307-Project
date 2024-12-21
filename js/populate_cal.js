/* Alexandros Contomichalos 261039376*/

//populates cell based on id with inputString by randomly chosing one of the pre assigned colors
function populateRowWithColor(id, inputString) {

    const colors = ['#cbd4eb','#c0f4ae','#fafe92','#e8cae3','#c0a6fc'];
    
    const tds = document.getElementsByTagName('td');    
    
    const usedColors = new Set();
    
    for (let i = 0; i < tds.length; i++) {
        const bgColor = tds[i].style.backgroundColor;
        if (colors.includes(bgColor)) {
            usedColors.add(bgColor);
        }
    }

    const availableColors = colors.filter(color => !usedColors.has(color));

    const colorToUse = availableColors.length > 0 ? availableColors[Math.floor(Math.random() * availableColors.length)] : colors[Math.floor(Math.random() * colors.length)];

    const element = document.getElementById(id);   
    
    element.style.backgroundColor=colorToUse;
    element.textContent=inputString;
}
