const NATIVE_HOST = "noon_mirsal";

function send(type, payload) {
  browser.runtime
    .sendNativeMessage(NATIVE_HOST, { type, payload })
    .then((response) => {
      if (!response) return;
      console.log("Mirsal: unhandled response:", response);
    })
    .catch((err) =>
      console.error("Mirsal: native message failed —", err.message),
    );
}
browser.browserAction.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});
Palette.init();
Shade.init();
Bookmarks.init();
