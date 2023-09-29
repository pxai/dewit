const DEFAULT_POMODORO = 25;

let page = document.getElementById("buttonDiv");
const pomodoro = document.getElementById("pomodoro");
const fgColor = document.getElementById("fgColor");
const bgColor = document.getElementById("bgColor");
const quietCheckbox = document.getElementById("quiet");
const saveButton = document.getElementById("save");
fgColor.addEventListener("input", (event) => setFGColor(event.target.value));
bgColor.addEventListener("input", (event) => setBGColor(event.target.value));
quietCheckbox.addEventListener("change", (event) => toggleQuiet(event.target.checked));
saveButton.addEventListener("click", saveOptions);
let quiet = false;
let pomodoroValue = DEFAULT_POMODORO;

function updateColors (fgColor, bgColor) {
  document.body.style.color = fgColor;
  document.body.style.backgroundColor = bgColor;
}

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

}

async function setFGColor (color) {
  console.log("Setting color: ", color)

  updateColors(fgColor.value, bgColor.value);
}

async function setBGColor (color) {
  console.log("Setting color: ", color)
  updateColors(fgColor.value, bgColor.value);
}

async function toggleQuiet (value) {
  console.log("Setting quiet: ", value)
  quiet = value;
}

async function handlePomodoro(event, value) {
  console.log(event, event.target.value);
  pomodoroValue = +event.target.value || DEFAULT_POMODORO;
}

// Add a button to the page for each supplied color
function constructOptions(buttonColors) {
  chrome.storage.sync.get(['bgcolor', 'fgcolor', 'quiet'], (data) => {
    let currentColor = data.bgcolor;
    quiet = data.quiet || false;
    updateColors(data.fgcolor, data.bgcolor)
    fgColor.value = data.fgcolor;
    bgColor.value = data.bgcolor;
  })
}

async function saveOptions () {
  await chrome.storage.sync.set({ bgcolor: bgColor.value, fgcolor: fgColor.value, quiet });
  await chrome.storage.sync.set({ pomodoro: pomodoroValue });
  console.log("Changes saved!!")
}

// Initialize the page by constructing the color options
constructOptions(presetButtonColors);