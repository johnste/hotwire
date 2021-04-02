let functions = new Map();
let bigfreakingguns;
console.log("xafs", Date.now());
function bonk(text, ...expressions) {
  console.log(
    "BONK 🐶🏏",
    text.map((t) => t.trim()),
    expressions
  );

  functions = new Map();
  const transformed = expressions.map((exp) => {
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

  console.log(...functions.values());
  window.postMessage({
    type: "FROM_INJECTED_SCRIPT",
    item: [text, transformed],
  });

  if (bigfreakingguns) {
    window.removeEventListener(bigfreakingguns);
    bigfreakingguns = undefined;
  }

  bigfreakingguns = (event) => {
    const fuckopop = functions.get(event.data.functionId);
    console.log(
      "👄💦event",
      event.data.type,
      functions.get(event.data.functionId),
      fuckopop
    );
    fuckopop?.();
  };

  window.addEventListener("message", bigfreakingguns);
}

window.bonk = bonk;

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}
