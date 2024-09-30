chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

const platforms = [
  {
    id: "jobstreet",
    title: "Review from JobStreet",
    url: 'https://www.google.com/search?q=site:my.jobstreet.com "%s" "review"',
  },
  {
    id: "indeed",
    title: "Review from Indeed",
    url: 'https://www.google.com/search?q=site:malaysia.indeed.com "%s" "review"',
  },
  {
    id: "glassdoor",
    title: "Review from Glassdoor",
    url: 'https://www.google.com/search?q=site:glassdoor.com "%s" "review"',
  },
  {
    id: "gmb",
    title: "Review from Google My Business",
    url: 'https://www.google.com/search?q=site:business.google.com "%s" "review"',
  },
];

chrome.runtime.onInstalled.addListener(() => {
  platforms.forEach((platform) => {
    chrome.contextMenus.create({
      id: platform.id,
      title: platform.title,
      contexts: ["selection"],
      documentUrlPatterns: [
        "*://*.jobstreet.com/*",
        "*://*.jobstreet.com.my/*",
      ],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const platform = platforms.find((p) => p.id === info.menuItemId);
  if (platform) {
    const companyName = encodeURIComponent(info.selectionText);
    const url = platform.url.replace("%s", companyName);

    chrome.windows.create(
      {
        url: url,
        type: "popup",
        width: 800,
        height: 600,
      },
      (window) => {
        if (chrome.runtime.lastError) {
          console.error("Error creating window:", chrome.runtime.lastError);
        }
      }
    );
  }
});
