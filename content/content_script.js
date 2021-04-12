function injectScript(path) {
  var script = document.createElement("script");
  script.src = chrome.runtime.getURL(path);
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

injectScript("content/inject_script.js");

window.addEventListener("message", ({ data }) => {
  console.log(new Date().toTimeString(), "HW⚡️ content_script receive message", data);
  // Messages from page
  if (data?.type == "FROM_INJECTED_SCRIPT" && typeof chrome.app.isInstalled !== "undefined") {
    chrome.runtime.sendMessage({
      type: "render",
      name: data.name,
      args: data.args,
    });
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(
    new Date().toTimeString(),
    "HW⚡️ content_script forwarding message from somewhere to tab?",
    sender.tab
  );
  // If message is from extension, forward it to injected script
  if (!sender.tab) {
    window.postMessage(message);
  }
});
