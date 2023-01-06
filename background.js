const initialTasks = [];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('tasks', (values) => {
    console.log("loaded tasks> ", values)
    if (!values.tasks) chrome.storage.local.set({ tasks: initialTasks });
  });

  //chrome.storage.local.set({ color });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});