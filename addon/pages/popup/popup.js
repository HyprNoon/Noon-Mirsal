const faviconEl = document.getElementById("site-favicon");
const hostEl = document.getElementById("site-host");
const shadeToggle = document.getElementById("shade-toggle");
const shadeIcon = document.getElementById("shade-icon");
const shadeStatusIcon = document.getElementById("shade-status-icon");
const shadeStatusText = document.getElementById("shade-status-text");
const settingsBtn = document.getElementById("open-settings");

const TOGGLES = {
  "palette.enabled": document.getElementById("palette-enabled"),
  "shade.enabled": document.getElementById("shade-enabled"),
};

let _host = null;

function faviconUrl(host) {
  return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
}

function setShade(active) {
  if (active) {
    shadeToggle.classList.remove("off");
    shadeIcon.textContent = "contrast";
    shadeStatusIcon.classList.remove("off");
    shadeStatusIcon.textContent = "check_circle";
  } else {
    shadeToggle.classList.add("off");
    shadeIcon.textContent = "contrast";
    shadeStatusIcon.classList.add("off");
    shadeStatusIcon.textContent = "block";
  }
}

function load() {
  browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    try {
      _host = new URL(tab.url).hostname;
    } catch {
      _host = null;
    }

    if (
      !_host ||
      tab.url.startsWith("about:") ||
      tab.url.startsWith("moz-extension:")
    ) {
      hostEl.textContent = "No site";
      shadeToggle.disabled = true;
      faviconEl.style.display = "none";
    } else {
      hostEl.textContent = _host;
      faviconEl.src = faviconUrl(_host);
      faviconEl.onerror = () => {
        const fb = document.createElement("div");
        fb.className = "site-favicon-fallback";
        fb.textContent = _host[0];
        faviconEl.closest(".favicon-wrap").replaceChildren(fb);
      };
    }

    browser.storage.local
      .get([...Object.keys(CONFIG_DEFAULTS), "shade.whitelist"])
      .then((stored) => {
        const whitelist = stored["shade.whitelist"] ?? [];

        for (const [key, el] of Object.entries(TOGGLES)) {
          el.checked = stored[key] ?? CONFIG_DEFAULTS[key];
        }

        if (_host) {
          setShade(whitelist.includes(_host));
        }
      });
  });
}

shadeToggle.addEventListener("click", () => {
  if (!_host) return;
  browser.storage.local.get("shade.whitelist").then((stored) => {
    const wl = stored["shade.whitelist"] ?? [];
    const isWhitelisted = wl.includes(_host);
    const updated = isWhitelisted
      ? wl.filter((h) => h !== _host)
      : [...new Set([...wl, _host])];
    browser.storage.local.set({ "shade.whitelist": updated }).then(() => {
      browser.runtime.sendMessage({
        type: "whitelist_updated",
        whitelist: updated,
      });
      setShade(!isWhitelisted);
    });
  });
});

for (const [key, el] of Object.entries(TOGGLES)) {
  el.addEventListener("change", () => {
    const value = el.checked;
    browser.storage.local.set({ [key]: value }).then(() => {
      browser.runtime.sendMessage({
        type: "settings_updated",
        settings: { [key]: value },
      });
    });
  });
  const row = el.closest(".control-row");
  row.addEventListener("click", (e) => {
    if (e.target.closest(".toggle")) return;
    el.checked = !el.checked;
    el.dispatchEvent(new Event("change"));
  });
}

settingsBtn.addEventListener("click", () => {
  browser.runtime.openOptionsPage();
});

load();
