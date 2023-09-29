let quiet = false;

chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.sync.get(['tasks', 'bgcolor', 'fgcolor', 'quiet']);
  quiet = result?.quiet || false;
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

chrome.alarms.onAlarm.addListener(async () => {
  chrome.action.setBadgeText({ text: '' });
  await playSound();
  // chrome.notifications.create({
  //   type: 'basic',
  //   iconUrl: 'images/dewit32.png',
  //   title: 'Time to stop!',
  //   message: 'Did you finished?!',
  //   buttons: [
  //     { title: 'Keep it Flowing.' }
  //   ],
  //   priority: 0
  // });

});

chrome.notifications.onButtonClicked.addListener(async () => {
  //const item = await chrome.storage.sync.get(['minutes']);
  console.log('Button clicked!');
});

async function playSound(source = 'sounds/end.mp3', volume = 1) {
  if (quiet) return;
  await createOffscreen();
  await chrome.runtime.sendMessage({ play: { source, volume } });
}

// Create the offscreen document if it doesn't already exist
async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'testing' // details for using the API
  });
}