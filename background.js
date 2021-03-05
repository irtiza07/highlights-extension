//Decide which screen to show depending on logged in status
chrome.cookies.get(
  { url: "https://d1pku3rzmw8swc.cloudfront.net", name: "user_id" },
  function (cookie) {
    if (!cookie) {
      chrome.browserAction.setPopup({ popup: "logged_out.html" });
    } else {
      chrome.browserAction.setPopup({ popup: "popup.html" });
    }
  }
);

chrome.cookies.onChanged.addListener((changeInfo) => {
  //This happens when cookie is cleared (so user signed out)
  if (
    changeInfo.removed &&
    changeInfo.cause === "expired_overwrite" &&
    changeInfo.cookie.domain === "d1pku3rzmw8swc.cloudfront.net" &&
    changeInfo.cookie.name === "user_id"
  ) {
    chrome.browserAction.setPopup({ popup: "logged_out.html" });
  }

  //This happens when cookie is set (so user is signed in)
  if (
    !changeInfo.removed &&
    changeInfo.cause === "explicit" &&
    changeInfo.cookie.domain === "d1pku3rzmw8swc.cloudfront.net" &&
    changeInfo.cookie.name === "user_id"
  ) {
    chrome.browserAction.setPopup({ popup: "popup.html" });
  }
});
