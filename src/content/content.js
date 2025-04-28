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

// show alert message
function showAlert(message, isError = false) {
  const alertElement = document.createElement("div");
  alertElement.textContent = message;
  alertElement.style.position = "fixed";
  alertElement.style.top = "20px";
  alertElement.style.left = "50%";
  alertElement.style.transform = "translateX(-50%)";
  alertElement.style.padding = "10px 20px";
  alertElement.style.backgroundColor = isError ? "#D32F2F" : "#4CAF50"; // Red for error, Green for success
  alertElement.style.color = "#fff";
  alertElement.style.borderRadius = "5px";
  alertElement.style.zIndex = "9999";
  alertElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)"; // Add some shadow
  alertElement.style.transition = "opacity 0.5s ease-out"; // Smooth fade out

  document.body.appendChild(alertElement);

  setTimeout(() => {
    alertElement.style.opacity = "0"; // Start fade out
    setTimeout(() => {
      alertElement.remove(); // Remove after fading
    }, 500); // Match transition duration
  }, 3000); // Start fade out after 3 seconds
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
  trackButton.style.backgroundColor = "#AB84BE";
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
  // Check if APIs are available before proceeding
  if (
    typeof chrome === "undefined" ||
    !chrome.storage ||
    !chrome.storage.local ||
    !chrome.runtime
  ) {
    console.error("Chrome APIs not available in handleTrackButtonClick.");
    showAlert("Error: Extension features unavailable. Please reload.", true);
    return;
  }

  const jobDetails = getJobDetails();

  try {
    // Use Promise-based wrapper for cleaner error handling with async/await
    const getStorage = (keys) =>
      new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve(result);
        });
      });

    const setStorage = (items) =>
      new Promise((resolve, reject) => {
        chrome.storage.local.set(items, () => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve();
        });
      });

    const result = await getStorage(["jobDetails", "trackedJobs"]);

    let allJobDetails = result.jobDetails || [];
    let trackedJobs = result.trackedJobs || {};
    const jobKey = `${jobDetails.jobTitle}_${jobDetails.companyName}`;

    if (trackedJobs[jobKey]) {
      showAlert("This job has already been tracked.");
      return;
    }

    allJobDetails.unshift(jobDetails);
    // No need to limit here, popup handles display limit
    // if (allJobDetails.length > 10) {
    //   allJobDetails = allJobDetails.slice(0, 10);
    // }
    trackedJobs[jobKey] = true;

    await setStorage({
      jobDetails: allJobDetails,
      trackedJobs: trackedJobs,
    });

    showAlert("Job tracked successfully!"); // This call is fine now
    updateTrackButton(true);
    chrome.runtime.sendMessage({ action: "jobDetailsUpdated" });
  } catch (error) {
    console.error("Error saving job details:", error.message || error);
    showAlert("Failed to track job. Please try again.", true);
  }
}

// Add this function to check if the current job is already tracked
function checkTrackedStatus() {
  // Check if APIs are available
  if (
    typeof chrome === "undefined" ||
    !chrome.storage ||
    !chrome.storage.local ||
    !chrome.runtime
  ) {
    console.warn("Chrome storage API not available yet in checkTrackedStatus.");
    // Optional: Disable button or wait/retry, but guarding is often sufficient
    // updateTrackButton(false); // Ensure button isn't stuck in 'Tracked' if check fails
    return;
  }

  const jobDetails = getJobDetails();
  const jobKey = `${jobDetails.jobTitle}_${jobDetails.companyName}`;

  chrome.storage.local.get(["trackedJobs"], function (result) {
    // Crucial: Check for runtime errors within the callback
    if (chrome.runtime.lastError) {
      console.error(
        "Error getting trackedJobs in checkTrackedStatus:",
        chrome.runtime.lastError.message
      );
      // Optionally update button state to reflect error or uncertainty
      // updateTrackButton(false); // Reset to 'Track' if status unknown
      return;
    }
    // Proceed only if no error
    const trackedJobs = result.trackedJobs || {};
    updateTrackButton(!!trackedJobs[jobKey]);
  });
}

// Function to check for job details wrapper and inject button
function checkAndInjectButton() {
  const jobDetailsWrapper = document.querySelector(
    '[data-automation="splitViewJobDetailsWrapper"]'
  );

  // Function to attempt injection
  const attemptInject = () => {
    const jobDetailsPage =
      document.querySelector(
        '[data-automation="jobDetailsPage"]' // Check within wrapper if it exists
      ) || document.querySelector('[data-automation="job-detail-apply"]'); // Fallback check

    if (jobDetailsPage) {
      injectTrackButton(); // injectTrackButton now contains checkTrackedStatus
      return true; // Injection successful
    }
    return false; // Not found yet
  };

  if (jobDetailsWrapper) {
    // If wrapper exists, observe it more specifically
    if (attemptInject()) return; // Try immediately first

    const observer = new MutationObserver((mutations, obs) => {
      if (attemptInject()) {
        obs.disconnect(); // Stop observing once injected
      }
    });
    observer.observe(jobDetailsWrapper, { childList: true, subtree: true });
  } else {
    // Fallback if wrapper isn't found initially (might appear later or be different layout)
    // Try injecting directly, maybe the apply button exists without the wrapper
    if (attemptInject()) return;

    // If still not found, observe the whole document body, but less efficient
    const observer = new MutationObserver((mutations, obs) => {
      if (attemptInject()) {
        obs.disconnect();
      }
    });
    // Observe body changes - might catch late-loading elements
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Main execution
function init() {
  // Use requestIdleCallback or setTimeout to slightly delay the initial check
  // This gives the browser more time to set up the extension environment
  // requestIdleCallback is generally preferred if available
  if (window.requestIdleCallback) {
    requestIdleCallback(checkAndInjectButton, { timeout: 2000 }); // Timeout ensures it runs eventually
  } else {
    setTimeout(checkAndInjectButton, 100); // Fallback to simple timeout
  }
}

// Check if the current URL matches the pattern
const urlPattern = /https:\/\/my\.jobstreet\.com\/.*/;
if (urlPattern.test(window.location.href)) {
  // Don't run init immediately on script load, wait for DOM ready or idle
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // DOM is already ready or interactive
    init();
  }

  // Run on URL changes (SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log("URL changed, re-initializing button injection.");
      // Re-run init logic on navigation
      init();
    }
    // Observe changes that might affect where the button should be placed
  }).observe(document, { subtree: true, childList: true }); // Observe document for URL changes usually requires observing higher up
}
