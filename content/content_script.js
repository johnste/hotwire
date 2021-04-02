function injectScript(path) {
  var s = document.createElement("script");
  s.src = chrome.runtime.getURL(path);
  s.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
}
console.log("afds", Date.now());
injectScript("content/inject_script.js");

window.addEventListener("message", (event) => {
  console.log("🐕🐕🐕🐕🐕🐕event", event);
  if (
    event.data?.type == "FROM_INJECTED_SCRIPT" &&
    typeof chrome.app.isInstalled !== "undefined"
  ) {
    chrome.runtime.sendMessage({ type: "render", item: event.data.item });
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );

  window.postMessage(message);
});
