let recentHighlightId;
let user_id;

function saveHighlight(user_id, highlightedText) {
  chrome.tabs.query({ active: true }, (tabs) => {
    let activeTab = tabs[0];
    const newHighlight = {
      userId: user_id,
      text: highlightedText,
      tag: "undefined",
      sourceTitle: activeTab.title,
      sourcePicture: activeTab.favIconUrl,
      sourceURL: activeTab.url,
    };
    fetch("https://iu8i1yjyu0.execute-api.us-east-1.amazonaws.com/highlights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newHighlight),
    })
      .then((response) => response.json())
      .then((result) => {
        const lastElementIndex = result["highlights"].length - 1;
        recentHighlightId = result["highlights"][lastElementIndex]["_id"];
      });
  });
}

function processHighlight() {
  if (chrome.tabs) {
    chrome.tabs.executeScript(
      null,
      {
        code: "window.getSelection().toString();",
      },
      function (selection) {
        const highlightedText = selection[0];
        if (highlightedText === "") {
          console.log("Nothing highlighted");
          return;
        }
        chrome.cookies.get(
          { url: "https://d1pku3rzmw8swc.cloudfront.net", name: "user_id" },
          function (cookie) {
            if (!cookie) {
              console.log("Couldn't find cookie containing user_id");
              return;
            }
            user_id = cookie.value;
            //Save highlight for given user
            saveHighlight(user_id, highlightedText);
          }
        );
      }
    );
  }
}

function updateHighlight() {
  fetch(
    "https://iu8i1yjyu0.execute-api.us-east-1.amazonaws.com/highlights/update_highlight",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        highlightId: recentHighlightId,
        tag: document.getElementsByName("tagInput")[0].value,
      }),
    }
  )
    .then((response) => response.json())
    .then(() => window.close());
}

//This gets triggered whenever someone clicks the extension icon
processHighlight();

const tagInput = document.getElementsByName("tagInput")[0];
if (tagInput) {
  tagInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      updateHighlight();
    }
  });
}

const ctaElement = document.getElementsByName("cta")[0];
if (ctaElement) {
  ctaElement.addEventListener("click", () => {
    updateHighlight();
  });
}
