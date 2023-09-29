init().then(() => { console.log('loaded')})
chrome.runtime.connect({ name: "popup" });
const gold = new Audio(chrome.runtime.getURL("sounds/gold.mp3"));
const cock = new Audio(chrome.runtime.getURL("sounds/cock.mp3"));
const shot = new Audio(chrome.runtime.getURL("sounds/shot.mp3"));
const load = new Audio(chrome.runtime.getURL("sounds/load.mp3"));
const start = new Audio(chrome.runtime.getURL("sounds/start.mp3"));
const end = new Audio(chrome.runtime.getURL("sounds/end.mp3"));

let addTaskInput = document.getElementById("addTaskInput");
const dewItTasks = document.getElementById("dewItTasks");
const pomodoroButton = document.getElementById("pomodoroButton");
const settingsButton = document.getElementById("settingsButton");
const aboutButton = document.getElementById("aboutButton");
const dewIt = document.getElementById("dewIt");

const deleteAllButton = document.getElementById("deleteAllButton");
const confirmDeletion = document.getElementById("confirmDeletion");
const confirmDeletionYes = document.getElementById("confirmDeletionYes");
const confirmDeletionNo = document.getElementById("confirmDeletionNo");

const delayInMinutes = 25;
let quiet = false;


deleteAllButton.addEventListener("click", async function(event) {
    confirmDeletion.style.display = confirmDeletion.style.display == '' || confirmDeletion.style.display == "none" ? "block" : "none";
})

confirmDeletionYes.addEventListener("click", async function(event) {
    await removeAllTaskFromStorage();
    confirmDeletion.style.display = "none";
})

confirmDeletionNo.addEventListener("click", async function(event) {
    confirmDeletion.style.display = "none";
})

function setColor(fgcolor = '#F8ECE0', bgcolor = '#0B4C5F') {
    dewIt.style.backgroundColor = bgcolor;
    dewIt.style.color = fgcolor;
    addTaskInput.style.backgroundColor = fgcolor;
    addTaskInput.style.color = bgcolor;
    addTaskInput.style.setProperty("--c", bgcolor);
}

function play(sound) {
    if (quiet) return;
    new Audio(chrome.runtime.getURL(`sounds/${sound}.mp3`)).play();
}

function playThenClose (sound) {
    if (quiet) return;
    const audio = new Audio(chrome.runtime.getURL(`sounds/${sound}.mp3`));
    audio.play();
    audio.addEventListener('ended', function() {
        // Your logic when the audio stops playing
        console.log('Audio stopped playing');
        window.close()
      });
}

async function addTaskToStorage(task) {
    const result = await chrome.storage.sync.get(['tasks'])

    let tasks = result?.tasks || [];

    tasks.push(task)
    await chrome.storage.sync.set({'tasks': tasks})
    play("load");
}

async function removeAllTaskFromStorage() {
    dewItTasks.innerHTML = '';
    await chrome.storage.sync.remove('tasks');
    await chrome.storage.sync.set({'tasks': []})
    play("shot");
}

async function removeTaskFromStorage(id) {
    const result = await chrome.storage.sync.get(['tasks'])

    let tasks = result?.tasks || [];

    const filteredTask = tasks.filter(task => task.id != id)

    await chrome.storage.sync.remove('tasks');
    await chrome.storage.sync.set({'tasks': filteredTask})
    play("shot");
}

async function updateTaskStatusFromStorage(id, completed) {
    const result = await chrome.storage.sync.get(['tasks']);
    let tasks = result?.tasks || [];

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id == id) {
            tasks[i].completed = completed;
            if (completed) play("gold");
            break;
        }
    }
    await chrome.storage.sync.set({'tasks': tasks})
}

addTaskInput.addEventListener("keyup", async function(event) {
  if (event.key === "Enter") {
    const task = addTaskInput.value
    const tasks = addTaskInput.value.split(",")
    tasks.forEach(async task => {
        const taskDiv = createTask(task.trim(), randomId());
        dewItTasks.append(taskDiv)
        await addTaskToStorage({id: taskDiv.id, name: task, completed: false})
    })

    addTaskInput.value = '';
  }
})

pomodoroButton.addEventListener("click", async function(event) {
    playThenClose("start");
    clearAlarm();
    await createAlarm();
})

settingsButton.addEventListener("click", async function(event) {
    chrome.runtime.openOptionsPage()
})

aboutButton.addEventListener("click", async function(event) {
    chrome.tabs.create({ url: 'https://chrome.google.com/webstore/detail/dkkkaiblielgknkjnokdimjehhbdebnh/preview?hl=es&authuser=0' });
})

async function init () {
    const result = await chrome.storage.sync.get(['tasks', 'bgcolor', 'fgcolor', 'quiet'])
    setColor(result.fgcolor, result.bgcolor);
    quiet = result.quiet;
    console.log("data:" , result);
    let tasks = result?.tasks || [];
    tasks.forEach(task => {
        const taskDiv = createTask(task.name, task.id, task.completed);
        dewItTasks.append(taskDiv)
    })
}

function createTask(text, id, completed = false) {
    let div = document.createElement("div")
    div.id = id;
    div.innerHTML = `<div class='dewItTaskText'>${text}</div>`;
    if (completed) div.classList.toggle("dewItDone");
    let button = document.createElement("div")
    button.classList.add('removeButton')
    button.id = div.id;
    button.innerHTML = "x";

    button.addEventListener("click", async () => {
        await removeTaskFromStorage(button.id)
        div.remove();
    })
    div.appendChild(button);
    div.addEventListener("click", async () => {
        div.classList.toggle("dewItDone");
        if (!div.classList.contains("dewItDone")) play("load");
        await updateTaskStatusFromStorage(div.id, div.classList.contains("dewItDone"))
            //div.remove();
    })
    return div;
}

function randomId () {
    return Date.now() * Math.random() * 10000;
}

async function createAlarm() {
    chrome.action.setBadgeText({text: 'ON'});
    const result = await chrome.storage.sync.get(['pomodoro']);
    window.alert("Pomodoro started! " + result.pomodoro + " minutes");
    chrome.alarms.create({delayInMinutes: result.pomodoro || delayInMinutes});
    //window.close();
}

function clearAlarm() {
    chrome.action.setBadgeText({text: ''});
    chrome.alarms.clearAll();
    //window.close();
}

