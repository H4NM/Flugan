function handleMessage(request, sender, sendResponse) {
    document.querySelector("#shitTitles").innerHTML = request.titles.size;
    document.querySelector("#adAPlacements").innerHTML = request.ads;
    sendResponse({ response: "[+] Response from background script " + request.counter });
}

browser.runtime.onMessage.addListener(handleMessage);

browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      browser.tabs.sendMessage(tabs[0].id, { message: "getValues" }, (response) => {
        document.querySelector("#shitTitles").innerHTML = response.titles.size;
        document.querySelector("#adAPlacements").innerHTML = response.ads;
      });
    }
  });
  