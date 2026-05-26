const Downloads = (() => {
  let _send = null;
  let _enabled = true;
  let _blacklist = [];

  function getHost(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  async function onCreated(downloadItem) {
    if (!_enabled) return;
    if (downloadItem.url.startsWith("blob:")) return;
    if (downloadItem.fileSize > 0 && downloadItem.fileSize < 524288) return;

    const host = getHost(downloadItem.url);
    if (_blacklist.includes(host)) return;

    await browser.downloads.cancel(downloadItem.id);
    await browser.downloads.erase({ id: downloadItem.id });

    recordHistory(host);

    _send(
      "downloads.add",
      JSON.stringify({
        id: String(downloadItem.id),
        url: downloadItem.url,
        filename: downloadItem.filename.split(/[\\/]/).pop(),
        mime: downloadItem.mime,
        fileSize: downloadItem.fileSize,
        referrer: downloadItem.referrer,
        headers: { Referer: downloadItem.referrer },
      }),
    );
  }

  async function recordHistory(host) {
    const stored = await browser.storage.local.get("downloads.history");
    const history = stored["downloads.history"] ?? {};
    history[host] = (history[host] ?? 0) + 1;
    browser.storage.local.set({ "downloads.history": history });
  }

  function applyConfig(cfg) {
    _enabled = cfg["downloads.enabled"] ?? _enabled;
    _blacklist = cfg["downloads.blacklist"] ?? [];
  }

  function init(send) {
    _send = send;
    browser.storage.local
      .get([...Object.keys(CONFIG_DEFAULTS), "downloads.blacklist"])
      .then((stored) =>
        applyConfig(Object.assign({}, CONFIG_DEFAULTS, stored)),
      );
    browser.downloads.onCreated.addListener(onCreated);
    browser.runtime.onMessage.addListener((msg) => {
      if (msg.type === "settings_updated") applyConfig(msg.settings);
      if (msg.type === "blacklist_updated") _blacklist = msg.blacklist ?? [];
    });
  }

  function destroy() {
    browser.downloads.onCreated.removeListener(onCreated);
    _send = null;
  }

  return { init, destroy };
})();
