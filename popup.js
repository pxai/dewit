populateTasks().then(() => { console.log('loaded')})
chrome.runtime.connect({ name: "popup" }); 
const gold = new Audio(chrome.runtime.getURL("sounds/gold.mp3"));
const cock = new Audio(chrome.runtime.getURL("sounds/cock.mp3"));
const shot = new Audio(chrome.runtime.getURL("sounds/shot.mp3"));
const load = new Audio(chrome.runtime.getURL("sounds/load.mp3"));

async function addTaskToStorage(task) {
    const result = await chrome.storage.sync.get(['tasks'])

    let tasks = result?.tasks || [];

    tasks.push(task)
    await chrome.storage.sync.set({'tasks': tasks})
    load.play();
}

async function removeTaskFromStorage(id) {
    const result = await chrome.storage.sync.get(['tasks'])

    let tasks = result?.tasks || [];

    const filteredTask = tasks.filter(task => task.id != id)

    await chrome.storage.sync.remove('tasks');
    await chrome.storage.sync.set({'tasks': filteredTask})
    shot.play();
}

async function updateTaskStatusFromStorage(id, completed) {
    const result = await chrome.storage.sync.get(['tasks']);
    let tasks = result?.tasks || [];

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id == id) {
            tasks[i].completed = completed;
            if (completed) gold.play();
            break;
        }
    }
    await chrome.storage.sync.set({'tasks': tasks})
}

let addTaskInput = document.getElementById("addTaskInput");
const dewItTasks = document.getElementById("dewItTasks");
const pomodoroButton = document.getElementById("pomodoroButton");

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

pomodoroButton.addEventListener("click", function(event) {
    cock.play();
    clearAlarm();
    createAlarm();
})

async function populateTasks () {
    const result = await chrome.storage.sync.get(['tasks'])
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
        await updateTaskStatusFromStorage(div.id, div.classList.contains("dewItDone"))
            //div.remove();
    })
    return div;
}

function randomId () {
    return Date.now() * Math.random() * 10000;
}

function createAlarm() {
    chrome.action.setBadgeText({text: 'ON'});
    chrome.alarms.create({delayInMinutes: 20});
    window.close();
}
  
function clearAlarm() {
    chrome.action.setBadgeText({text: ''});
    chrome.alarms.clearAll();
    window.close();
}