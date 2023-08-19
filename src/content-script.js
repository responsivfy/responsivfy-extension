chrome.runtime.onMessage.addListener((payload) => {
  window.postMessage({ source: "responsivfy-helper", ...payload });
});
