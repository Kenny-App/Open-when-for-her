// Get the letter name from the URL
const params = new URLSearchParams(window.location.search);
const letterId = Number(params.get("letterID"));


// Fetch the JSON file
fetch("../json/openletter.json")
    .then(response => response.json())
    .then(data => {

        const letter = data[letterId];

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
        document.getElementById("open-letter-img").src =
            `../assets/img/svg/${letter.title}.svg`;
    })
    .catch(error => {
        console.error("Error loading letter:", error);
    });