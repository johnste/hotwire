listen("devtools", {
  callback(message) {
    if (message.type !== "inject" || !message.tabId) {
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: message.tabId },
      files: [message.scriptToInject],
    });
  },
});

var connections = {};
let messageListener;

listen("panel", {
  callback(message, panel) {
    switch (message.type) {
      case "init":
        connections[message.tabId] = panel;

        if (initialMessage) {
          panel.postMessage(initialMessage);
        }

        chrome.runtime.onMessage.removeListener(premature);

        messageListener = onMessage((message) => {
          return panel.postMessage(message);
        });
        break;
      case "invocation":
        console.log("invocatrion!", message);
        chrome.tabs.sendMessage(message.tabId, message);
    }
  },
  disconnect() {
    chrome.runtime.onMessage.removeListener(messageListener);
  },
});

let initialMessage = undefined;
const premature = onMessage((message) => {
  initialMessage = message;
});

// Listen util
function listen(source, { callback, disconnect, connect, debug } = {}) {
  try {
    console.log("⚡️" + source);
    chrome.runtime.onConnect.addListener(function (port) {
      if (port.name !== source) {
        return;
      }

      if (debug) console.log(`✅ connect to ${source}`);
      connect?.(port);

      // assign the listener function to a variable so we can remove it later
      var listener = function (message, sender, sendResponse) {
        if (debug) console.log(`💌 from ${source}`, message);
        callback(message, port);
      };

      // add the listener
      port.onMessage.addListener(listener);

      port.onDisconnect.addListener(function () {
        if (debug) console.log(`💔 from ${source}`);
        disconnect?.();
        port.onMessage.removeListener(listener);
      });
    });
  } catch (ex) {
    console.error(ex);
  }
}

// Other listen
function onMessage(callback) {
  function listener(message, sender, sendResponse) {
    console.log("onMessage!", message);
    if (message.type !== "render") {
      return;
    }

    callback?.({ ...message, tabId: sender.tab.id });

    sendResponse({
      response: "Message received",
    });
  }
  chrome.runtime.onMessage.addListener(listener);
  return listener;
}
