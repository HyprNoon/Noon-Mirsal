const ELEMENTS = {
  "shade.enabled": { id: "shade-enabled", type: "checkbox" },
  "shade.dimMedia": { id: "shade-dim-media", type: "checkbox" },
  "shade.mediaBrightness": {
    id: "shade-media-brightness",
    type: "range",
    suffix: "%",
    display: "shade-media-brightness-value",
  },
  "palette.enabled": { id: "palette-enabled", type: "checkbox" },
  "palette.pollInterval": {
    id: "palette-poll-interval",
    type: "range",
    suffix: "s",
    display: "palette-poll-interval-value",
  },
};

function showStatus(msg) {
  const el = document.getElementById("status");
  el.textContent = msg;
  setTimeout(() => {
    el.textContent = "";
  }, 2000);
}

function saveSingle(key, meta) {
  const el = document.getElementById(meta.id);
  const value = meta.type === "checkbox" ? el.checked : parseInt(el.value);
  browser.storage.local.set({ [key]: value }).then(() => {
    browser.runtime.sendMessage({
      type: "settings_updated",
      settings: { [key]: value },
    });
    showStatus("saved");
  });
}

function load() {
  browser.storage.local.get(Object.keys(CONFIG_DEFAULTS)).then((stored) => {
    for (const [key, meta] of Object.entries(ELEMENTS)) {
      const el = document.getElementById(meta.id);
      const value = key in stored ? stored[key] : CONFIG_DEFAULTS[key];
      if (meta.type === "checkbox") {
        el.checked = value;
      } else {
        el.value = value;
        if (meta.display) {
          document.getElementById(meta.display).textContent =
            value + meta.suffix;
        }
      }
    }
  });
}

for (const [key, meta] of Object.entries(ELEMENTS)) {
  const el = document.getElementById(meta.id);
  if (meta.type === "range") {
    el.addEventListener("input", (e) => {
      if (meta.display) {
        document.getElementById(meta.display).textContent =
          e.target.value + meta.suffix;
      }
    });
  }
  el.addEventListener("change", () => saveSingle(key, meta));
}

load();
