const DEFAULT_POMODORO = 25;

let page = document.getElementById("buttonDiv");
const pomodoro = document.getElementById("pomodoro");
let selectedClassName = "current";
const presetButtonColors = ["#3aa757", "#e8453c", "#f9bb2d", "#0B4C5F", "#4688f1"];

pomodoro.addEventListener("change", handlePomodoro);

// Reacts to a button click by marking the selected button and saving
// the selection
async function handleButtonClick(event) {
  // Remove styling from the previously selected color

  //if (!tasks) chrome.storage.sync.set({ tasks: [] });

  let current = event.target.parentElement.querySelector(
    `.${selectedClassName}`
  );
  if (current && current !== event.target) {
    current.classList.remove(selectedClassName);
  }

  // Mark the button as selected
  let bgcolor = event.target.dataset.bgcolor;
  event.target.classList.add(selectedClassName);
  await chrome.storage.sync.set({ bgcolor });
}

async function handlePomodoro(event, value) {
  console.log(event, event.target.value);
  await chrome.storage.sync.set({ pomodoro: +event.target.value || DEFAULT_POMODORO });
}

// Add a button to the page for each supplied color
function constructOptions(buttonColors) {
  chrome.storage.sync.get("bgcolor", (data) => {
    let currentColor = data.bgcolor;

    // For each color we were provided…
    for (let buttonColor of buttonColors) {
      // …create a button with that color…
      let button = document.createElement("button");
      button.dataset.bgcolor = buttonColor;
      button.style.backgroundColor = buttonColor;

      // …mark the currently selected color…
      if (buttonColor === currentColor) {
        button.classList.add(selectedClassName);
      }

      // …and register a listener for when that button is clicked
      button.addEventListener("click", handleButtonClick);
      page.appendChild(button);
    }
  });
}

// Initialize the page by constructing the color options
constructOptions(presetButtonColors);