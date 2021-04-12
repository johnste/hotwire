let messageListener;

// Keep the latest sent message around before the panel has been created
let initialMessage = undefined;
const premountListener = createListener((message) => {
  console.log(new Date().toTimeString(), "HW⚡️ service_worker premount message", message);
  initialMessage = message;
});
chrome.runtime.onMessage.addListener(premountListener);

// Listen to events from devtool panel
listen("panel", {
  onMessage(message, panel) {
    switch (message.type) {
      case "init":
        if (initialMessage) {
          panel.postMessage(initialMessage);
        }

        messageListener = createListener((message) => {
          console.log(new Date().toTimeString(), "HW⚡️ service_worker premount message", message);
          return panel.postMessage(message);
        });

        chrome.runtime.onMessage.removeListener(premountListener);
        chrome.runtime.onMessage.addListener(messageListener);
        break;

      case "invocation":
        // Function was invoked in panel
        chrome.tabs.sendMessage(message.tabId, message);
        break;
    }
  },
  onDisconnect() {
    console.log(new Date().toTimeString(), "HW⚡️ service_worker disconnect panel");
    chrome.runtime.onMessage.removeListener(messageListener);
  },
});

// Listen util
function listen(source, { onMessage, onDisconnect, onConnect } = {}) {
  try {
    chrome.runtime.onConnect.addListener(function (port) {
      if (port.name !== source) {
        return;
      }
      console.log(new Date().toTimeString(), "HW⚡️ service_worker on connect");
      onConnect?.(port);

      // assign the listener function to a variable so we can remove it later
      var listener = function (message, sender, sendResponse) {
        console.log(new Date().toTimeString(), "HW⚡️ service_worker message from panel", message);
        onMessage?.(message, port);
      };

      // add the listener
      port.onMessage.addListener(listener);

      port.onDisconnect.addListener(function () {
        console.log(new Date().toTimeString(), "HW⚡️ service_worker on disconnect");
        onDisconnect?.();
        port.onMessage.removeListener(listener);
      });
    });
  } catch (ex) {
    console.error(ex);
  }
}

// Other listen
function createListener(callback) {
  function listener(message, sender, sendResponse) {
    console.log(
      new Date().toTimeString(),
      "HW⚡️ service_worker message from content_script",
      message
    );

    if (message.type !== "render") {
      return;
    }

    callback?.({ ...message, tabId: sender.tab.id });

    sendResponse({
      response: "Message received",
    });
  }

  return listener;
}
