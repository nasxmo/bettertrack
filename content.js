function getJobDetails() {
  const selectors = {
    jobTitle: 'h1[data-automation="job-detail-title"]',
    location: 'span[data-automation="job-detail-location"]',
    industry: 'span[data-automation="job-detail-classifications"]',
    workType: 'span[data-automation="job-detail-work-type"]',
    salaryRange: 'span[data-automation="job-detail-salary"]',
    companyName: 'span[data-automation="advertiser-name"]',
  };

  const details = {};
  for (const [key, selector] of Object.entries(selectors)) {
    const element = document.querySelector(selector);
    details[key] = element ? element.innerText.trim() : "N/A";
  }

  details.jobLink = window.location.href;

  // Add scrape date and time
  const now = new Date();
  details.scrapeDate = now.toLocaleDateString();
  details.scrapeTime = now.toLocaleTimeString();

  return details;
}

// Function to inject the "Track" button
function injectTrackButton() {
  const jobDetailsPage = document.querySelector(
    '[data-automation="job-detail-apply"]'
  );
  if (!jobDetailsPage) return;

  const existingTrackButton = document.getElementById("bettertrack-button");
  if (existingTrackButton) return;

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.position = "absolute";
  buttonContainer.style.left = "298px";

  const trackButton = document.createElement("button");
  trackButton.id = "bettertrack-button";
  trackButton.textContent = "Track";
  trackButton.style.padding = "13px 20px";
  trackButton.style.fontSize = "17px";
  trackButton.style.fontWeight = "bold";
  trackButton.style.backgroundColor = "#A594F9";
  trackButton.style.color = "white";
  trackButton.style.border = "none";
  trackButton.style.borderRadius = "5px";
  trackButton.style.cursor = "pointer";

  buttonContainer.appendChild(trackButton);
  jobDetailsPage.insertBefore(buttonContainer, jobDetailsPage.firstChild);

  trackButton.addEventListener("click", handleTrackButtonClick);
  checkTrackedStatus();
}

async function handleTrackButtonClick() {
  const jobDetails = getJobDetails();

  try {
    const result = await chrome.storage.local.get([
      "jobDetails",
      "trackedJobs",
    ]);
    let allJobDetails = result.jobDetails || [];
    let trackedJobs = result.trackedJobs || {};
    const jobKey = `${jobDetails.jobTitle}_${jobDetails.companyName}`;

    if (trackedJobs[jobKey]) {
      showAlert("This job has already been tracked.");
      return;
    }

    allJobDetails.unshift(jobDetails);
    if (allJobDetails.length > 10) {
      allJobDetails = allJobDetails.slice(0, 10);
    }
    trackedJobs[jobKey] = true;

    await chrome.storage.local.set({
      jobDetails: allJobDetails,
      trackedJobs: trackedJobs,
    });
    showAlert("Job tracked successfully!");
    updateTrackButton(true);
    chrome.runtime.sendMessage({ action: "jobDetailsUpdated" });
  } catch (error) {
    console.error("Error saving job details:", error);
    showAlert("Failed to track job. Please try again.");
  }
}

// show alert message
function showAlert(message) {
  const alertElement = document.createElement("div");
  alertElement.textContent = message;
  alertElement.style.position = "fixed";
  alertElement.style.top = "20px";
  alertElement.style.left = "50%";
  alertElement.style.transform = "translateX(-50%)";
  alertElement.style.padding = "10px 20px";
  alertElement.style.backgroundColor = "#333";
  alertElement.style.color = "#fff";
  alertElement.style.borderRadius = "5px";
  alertElement.style.zIndex = "9999";

  document.body.appendChild(alertElement);

  setTimeout(() => {
    alertElement.remove();
  }, 3000);
}

function updateTrackButton(isTracked) {
  const trackButton = document.getElementById("bettertrack-button");
  if (trackButton) {
    trackButton.disabled = isTracked;
    trackButton.textContent = isTracked ? "Tracked" : "Track";
    trackButton.style.backgroundColor = isTracked ? "#CDC1FF" : "#A594F9";
  }
}

// Add this function to check if the current job is already tracked
function checkTrackedStatus() {
  const jobDetails = getJobDetails();
  const jobKey = `${jobDetails.jobTitle}_${jobDetails.companyName}`;

  chrome.storage.local.get(["trackedJobs"], function (result) {
    const trackedJobs = result.trackedJobs || {};
    updateTrackButton(!!trackedJobs[jobKey]);
  });
}

// Function to check for job details wrapper and inject button
function checkAndInjectButton() {
  const jobDetailsWrapper = document.querySelector(
    '[data-automation="splitViewJobDetailsWrapper"]'
  );
  if (jobDetailsWrapper) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const jobDetailsPage = jobDetailsWrapper.querySelector(
            '[data-automation="jobDetailsPage"]'
          );
          if (jobDetailsPage) {
            injectTrackButton();
            observer.disconnect();
            break;
          }
        }
      }
    });
    observer.observe(jobDetailsWrapper, { childList: true, subtree: true });
  } else {
    injectTrackButton();
  }
}

// Main execution
function init() {
  checkAndInjectButton();
}

// Check if the current URL matches the pattern
const urlPattern = /https:\/\/my\.jobstreet\.com\/.*/;
if (urlPattern.test(window.location.href)) {
  init();

  // Run on URL changes
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      init();
    }
  }).observe(document, { subtree: true, childList: true });
}
