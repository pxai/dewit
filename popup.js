populateTasks()

function addTaskToStorage(task) {
    chrome.storage.local.get('tasks', async ({ tasks }) => {
      tasks.push(task)
      await chrome.storage.local.set({'tasks': tasks})
    });
}

function removeTaskFromStorage(id) {
    chrome.storage.local.get('tasks', async ({ tasks }) => {
        const filteredTask = tasks.filter(task => task.id != id)
        chrome.storage.local.remove("tasks", function (){
            console.log("Key1 has been removed");
        });
        alert('Removing: ' + id +","+ tasks.length+","+ filteredTask.length)
        const objData = {};
        objData['tasks'] = filteredTask;  
        await chrome.storage.local.set(objData).then(() => { alert("Removed " + filteredTask.length)})
    });
}

function updateTaskStatusFromStorage(id, completed) {
    chrome.storage.local.get('tasks', async ({ tasks }) => {
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].id == id) {
                tasks[i].completed = completed;
                break;
            }
        }
        await chrome.storage.local.set({'tasks': tasks})
    });
}

let addTaskInput = document.getElementById("addTaskInput");
const dewItTasks = document.getElementById("dewItTasks");

addTaskInput.addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    const tasks = addTaskInput.value.split(",")
    tasks.forEach(async task => {
        const taskDiv = createTask(task.trim(), randomId());
        dewItTasks.append(taskDiv)
        addTaskToStorage({id: taskDiv.id, name: task, completed: false})
        console.log('Adding a task: ',task)
    })
    
    addTaskInput.value = '';
  }
})

function populateTasks () {
    chrome.storage.local.get('tasks', ({ tasks }) => {
        alert('Populating: ' + tasks.length)
        tasks.forEach(task => {
            const taskDiv = createTask(task.name, task.id, task.completed);
            dewItTasks.append(taskDiv)
        })
      });
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
        alert('About to remove' +","+  button.id)
        removeTaskFromStorage(button.id)
        div.remove();
    })
    div.appendChild(button);
    div.addEventListener("click", async () => {
        div.classList.toggle("dewItDone");
        updateTaskStatusFromStorage(div.id, div.classList.contains("dewItDone"))
            //div.remove();
    })
    return div;
}

function randomId () {
    return Date.now() * Math.random() * 10000;
}