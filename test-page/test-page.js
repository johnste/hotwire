import { body, div, label } from "./node_modules/skruv/html.js";
import { createState } from "./node_modules/skruv/state.js";
import { renderNode } from "./node_modules/skruv/vDOM.js";
import { globalStyle, lightStyle, darkStyle } from "./styles.js";

const sub = createState({
  features: [
    {
      name: "Dark mode",
      enabled: JSON.parse(localStorage.getItem("dark-mode")),
    },
  ],
  delay: 0,
});

(async () => {
  for await (const state of sub) {
    renderNode(
      body(
        {},
        globalStyle,
        state.enabled ? darkStyle : lightStyle,
        label({}, state.enabled ? "🌚 Dark mode" : "🌞 Light mode"),
        div({}, state.text)
      ),
      document.body
    );
  }
})();

setTimeout(() => {
  window?.hotwire?.(() => {
    return hotwire.html`          
        <style>
          body {
            padding: 5em;
          }
          main {
            padding: 1em;
            background-color: #fee;
            color: #323;
          }
          h1, h2, h3, h4, h5 {
            margin: 0 0 1em 0;
            padding: 0;
          }
          .content {
            display: flex;
            align-items: top;
            justify-content: flex-start;            
          }
          .content > * {
            margin-left: 1em;              
          }
        </style> 
        <main>
        <h2>Features</h2>
        <div class="content">
          <div class="list">
            ${sub.features.map(
              (item) => hotwire.html`                          
                  <label><input name="${item.name}" type="checkbox" @click=${toggle(
                item
              )} .checked="${item.enabled}" /><strong>${
                item.name
              }</strong></label>                                             
                `
            )}          
          </div>
          <div>
              hello
          </div>
        </div>
        </main>        
      `;
  });
}, 100);

function toggle(item) {
  return function onToggle(event) {
    console.log(new Date().toTimeString(), "change item", item, event);
    item.enabled = !item.enabled;

    if (item.name === "Dark mode") {
      localStorage.setItem("dark-mode", JSON.stringify(item.enabled));
    }
  };
}
