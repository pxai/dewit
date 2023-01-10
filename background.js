chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.sync.get(['tasks']);
  tasks = result?.tasks || [];
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "popup") {
      port.onDisconnect.addListener(async function() {
          // popup was closed
         //await chrome.storage.sync.set({tasks});
      });
  }
});

chrome.alarms.onAlarm.addListener(() => {
  chrome.action.setBadgeText({ text: '' });
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/dewit128.png',
    title: 'Time to stop!',
    message: 'Did you finished?!',
    buttons: [
      { title: 'Keep it Flowing.' }
    ],
    priority: 0
  });
});

chrome.notifications.onButtonClicked.addListener(async () => {
  //const item = await chrome.storage.sync.get(['minutes']);
  chrome.action.setBadgeText({ text: 'ON' });
  chrome.alarms.create({ delayInMinutes: 20 });
});