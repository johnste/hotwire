import { html, render } from "../node_modules/lit-html/lit-html.js";

// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
  name: "panel",
});

backgroundPageConnection.postMessage({
  type: "init",
  tabId: chrome.devtools.inspectedWindow.tabId,
});

backgroundPageConnection.onMessage.addListener(({ tabId, name, args }) => {
  console.log(new Date().toTimeString(), "panel recieved message", name, tabId, { args });
  try {
    const [text, ...expressions] = args;

    // Convert serialized expressions ()
    render(html(text, ...convertExpressions(expressions, tabId)), document.querySelector("main"));
  } catch (ex) {
    const errorContainer = document.querySelector(".error");

    errorContainer.innerHTML = `
      ${ex.toString()}<br/>
      ${JSON.stringify(tabId, name, args, null, 2)}<br/>
      ${errorContainer.innerHTML}
    `;
  }
});

function convertExpressions(expressions, tabId) {
  console.log(new Date().toTimeString(), "Render!", tabId, expressions);

  if (!expressions) {
    return expressions;
  } else if (Array.isArray(expressions)) {
    return expressions.map((expression) => convertExpressions(expression, tabId));
  } else if (typeof expressions === "object") {
    if (expressions?.type == "html") {
      return html(expressions.text, ...convertExpressions(expressions.expressions, tabId));
    } else if (expressions?.type == "function") {
      return function (event) {
        const serializedEvent = serializeEvent(event);
        console.log(
          new Date().toTimeString(),
          `Invoke ${expressions.function.name}`,
          "HOOOYA",
          event,
          serializedEvent
        );

        if (event.type == "submit") {
          event.preventDefault();
        }

        const simpleEvent = createSimpleEvent(event);

        backgroundPageConnection.postMessage({
          type: "invocation",
          function: expressions.function,
          tabId,
          simpleEvent,
          serializedEvent,
        });
      };
    }
  }
  console.log(new Date().toTimeString(), "Render?", tabId, expressions);
  return expressions;
}

function serializeEvent(event) {
  return JSON.parse(stringify_object(event));
}

function stringify_object(object, depth = 0, max_depth = 2) {
  // change max_depth to see more levels, for a touch event, 2 is good
  if (depth > max_depth) return "Object";

  const obj = {};
  for (let key in object) {
    let value = object[key];
    if (typeof value === "function") {
      continue;
    } else if (value instanceof Node)
      // specify which properties you want to see from the node
      value = { id: value.id };
    else if (value instanceof Window) value = "Window";
    else if (value instanceof Object) value = stringify_object(value, depth + 1, max_depth);

    obj[key] = value;
  }

  return depth ? obj : JSON.stringify(obj);
}

function createSimpleEvent(event) {
  switch (event.type) {
    case "submit":
      const formData = new FormData(event.target);

      return {
        type: event.type,
        values: Object.fromEntries(formData.entries()),
      };
    default:
      return {
        type: event.type,
        name: event?.target?.name,
      };
  }
}
