function injectScript(path) {
  var s = document.createElement("script");
  s.src = chrome.runtime.getURL(path);
  s.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
}

injectScript("content/inject_script.js");

window.addEventListener("message", (event) => {
  // Messages from page
  if (
    event.data?.type == "FROM_INJECTED_SCRIPT" &&
    typeof chrome.app.isInstalled !== "undefined"
  ) {
    chrome.runtime.sendMessage({ type: "render", item: event.data.item });
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // If message is from extension, forward it to injected script
  if (!sender.tab) {
    window.postMessage(message);
  }
});
