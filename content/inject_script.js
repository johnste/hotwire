function bonk(text, ...expressions) {
  let functions = new Map();
  const serialized = expressions.map((exp) => {
    if (typeof exp === "function") {
      const func = {
        type: "function",
        id: uuidv4(),
      };
      functions.set(func.id, exp);
      return func;
    }
    return exp;
  });

  window.postMessage({
    type: "FROM_INJECTED_SCRIPT",
    item: [text, serialized],
  });

  if (bonk.messageListener) {
    window.removeEventListener("message", bonk.messageListener);
    bonk.messageListener = undefined;
  }

  bonk.messageListener = (event) => {
    if (event.data.type == "invocation") {
      const functionToInvoke = functions.get(event.data.functionId);
      functionToInvoke?.();
    }
  };

  window.addEventListener("message", bonk.messageListener);

  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }
}

Object.defineProperty(bonk, "messageListener", {
  value: undefined,
  writable: true,
});

Object.defineProperty(bonk, "html", {
  value(text, ...expressions) {
    return {
      type: "html",
      text,
      expressions,
    };
  },
});

Object.defineProperty(window, "bonk", {
  value: bonk,
});
