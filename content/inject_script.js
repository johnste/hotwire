let functions = new Map();
function hotwire(render) {
  console.log(new Date().toTimeString(), "hotwire 🔌");
  let name = "Default";
  updateRender();

  if (hotwire.messageListener) {
    window.removeEventListener("message", hotwire.messageListener);
    hotwire.messageListener = undefined;
  }

  hotwire.messageListener = (event) => {
    // FIXME functions map grows all the time

    if (event.data.type == "invocation") {
      const functionToInvoke = functions.get(event.data.function.id);
      if (functionToInvoke) {
        functionToInvoke(event.data.simpleEvent, event.data.serializedEvent);
      } else {
        console.log(
          new Date().toTimeString(),
          `Could not invoke function ${event.data.function.name}`
        );
      }
      updateRender();
    }
  };

  window.addEventListener("message", hotwire.messageListener);

  function updateRender() {
    const { text, expressions } = render();
    const serializedExpressions = serializeExpressions(expressions);
    console.log(new Date().toTimeString(), "HW⚡️ inject_script push message", {
      text,
      expressions,
    });
    window.postMessage({
      type: "FROM_INJECTED_SCRIPT",
      name,
      args: [text, ...serializedExpressions],
    });
  }
}

Object.defineProperty(hotwire, "messageListener", {
  value: undefined,
  writable: true,
});

Object.defineProperty(hotwire, "html", {
  // Serialize nested html to be able to transmit it as messages
  value(text, ...expressions) {
    return {
      type: "html",
      text,
      expressions: serializeExpressions(expressions),
    };
  },
});

Object.defineProperty(window, "hotwire", {
  value: hotwire,
});

function serializeExpressions(expressions) {
  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }

  const serializedExpressions = expressions.map((exp) => {
    if (typeof exp === "function") {
      const message = {
        type: "function",
        function: {
          id: uuidv4(),
          name: exp.name,
        },
      };
      functions.set(message.function.id, exp);
      return message;
    }
    return exp;
  });

  return serializedExpressions;
}
