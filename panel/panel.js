import { html, render } from "../node_modules/lit-html/lit-html.js";

// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
  name: "panel",
});

backgroundPageConnection.postMessage({
  type: "init",
  tabId: chrome.devtools.inspectedWindow.tabId,
});

backgroundPageConnection.onMessage.addListener((message) => {
  console.log("panel recieved message", message, typeof html, typeof render);

  const text = message.item[0];
  const expressions = message.item[1].map((exp) => {
    console.log("another middle aged rule", exp);
    if (
      !Array.isArray(exp) &&
      typeof exp === "object" &&
      exp?.type == "function"
    ) {
      return function (event) {
        backgroundPageConnection.postMessage({
          type: "invocation",
          functionId: exp.id,
          tabId: message.tabId,
        });
      };
    } else if (
      !Array.isArray(exp) &&
      typeof x === "object" &&
      x?.type == "html"
    ) {
      return html(exp.text, ...exp.expressions);
    } else if (Array.isArray(exp)) {
      return exp.map((x) => {
        if (typeof x === "object" && x?.type == "html") {
          return html(x.text, ...x.expressions);
        }
        return x;
      });
    }
    return exp;
  });

  try {
    render(html(text, ...expressions), document.querySelector("main"));
  } catch (ex) {
    document.querySelector(".error").innerHTML =
      ex.toString() +
      "<br/>" +
      JSON.stringify(message, null, 2) +
      "<br/>" +
      document.querySelector(".error").innerHTML;
  }
});
