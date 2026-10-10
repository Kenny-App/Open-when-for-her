// Get the letter name from the URL
const params = new URLSearchParams(window.location.search);
const letterId = Number(params.get("letterID"));
const letterImage = document.getElementById("open-letter-img");
const loadingScreen = document.getElementById("loading-screen");
// Fetch the JSON file
fetch("../json/openletter.json")
    .then(response => response.json())
    .then(data => {

        const letter = data[letterId];

        document.title = "Open when for her - " + (letter["page-title"] || "Letter");

        // Make sure the letter exists
        if (!letter) {
            console.error("Letter not found");
            return;
        }

        // Display the content
        document.getElementById("content-txt").textContent =
            letter.content;

        document.getElementById("letter-last-word").textContent =
            letter.LastWord;

        // Apply colors from JSON
        document.body.style.backgroundColor =
            letter.backgroundColor;

        document.body.style.color =
            letter.textColor;

        // Change heart/image if needed
        letterImage.src =
            `../assets/img/svg/${letter.title}.svg`;

            if (letterImage.complete && letterImage.naturalWidth > 0) {
                hideLoadingScreen();
            } else {
                letterImage.addEventListener("load", hideLoadingScreen, { once: true });
            }
        
    })
    .catch(error => {
        console.error("Error loading letter:", error);
    });

function hideLoadingScreen() {
    loadingScreen.style.display = "none";
}