chrome.devtools.panels.create(
  "My Panel",
  "MyPanelIcon.png",
  "panel/panel.html",
  function (panel) {
    // code invoked on panel creation
    console.log("devtools.js Panel created");
  }
);

// DevTools page -- devtools.js
// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
  name: "devtools",
});

backgroundPageConnection.onMessage.addListener(function (message) {
  // Handle responses from the background page, if any
});
