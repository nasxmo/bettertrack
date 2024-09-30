// Wrap the entire code in an async IIFE for cleaner organization
(async function () {
  const contentDiv = document.getElementById("content");
  const paginationDiv = document.getElementById("pagination");
  const exportButton = document.getElementById("export");
  const alertElement = document.getElementById("alert");
  const itemsPerPage = 10;
  let currentPage = 1;
  let allJobDetails = [];

  // Combine event listeners
  document.addEventListener("DOMContentLoaded", initializePopup);

  // Use async/await for better readability
  async function loadJobDetails() {
    try {
      const result = await chrome.storage.local.get(["jobDetails"]);
      allJobDetails = result.jobDetails || [];
      await displayJobDetails(currentPage);
    } catch (error) {
      console.error("Error loading job details:", error);
      showAlert("Error loading job details. Please try again.");
    }
  }

  function showAlert(message, isError = false) {
    alertElement.textContent = message;
    alertElement.classList.remove("hidden", "bg-green-400", "bg-red-400");
    alertElement.classList.add(isError ? "bg-red-400" : "bg-green-400");
    alertElement.classList.remove("hidden");
    setTimeout(() => alertElement.classList.add("hidden"), 3000);
  }

  async function displayJobDetails(page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const jobsToDisplay = allJobDetails.slice(startIndex, endIndex);

    contentDiv.innerHTML = jobsToDisplay.length
      ? generateTableHTML(jobsToDisplay)
      : "<p>No tracked jobs found. Start tracking jobs to see them here!</p>";

    updatePagination();
  }

  function generateTableHTML(jobs) {
    const headers = [
      "Job Title",
      "Company",
      "Location",
      "Industry",
      "Work Type",
      "Salary Range",
      "Date",
      "Time",
      "Job Link",
    ];

    return `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 table-fixed">
          <thead class="bg-gray-50">
            <tr>
              ${headers
                .map(
                  (header) =>
                    `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${header}</th>`
                )
                .join("")}
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${jobs
              .map(
                (job) => `
              <tr>
                <td class="px-4 py-2 whitespace-nowrap">${
                  job.jobTitle || "N/A"
                }</td>
                <td class="px-4 py-2 whitespace-nowrap">${
                  job.companyName || "N/A"
                }</td>
                <td class="px-4 py-2 whitespace-nowrap">${
                  job.location || "N/A"
                }</td>
                <td class="px-4 py-2 whitespace-nowrap">${
                  job.industry || "N/A"
                }</td>
                <td class="px-4 py-2 whitespace-nowrap">${
                  job.workType || "N/A"
                }</td>
                <td class="px-4 py-2 whitespace-nowrap">${
                  job.salaryRange || "N/A"
                }</td>
                <td class="px-4 py-2 whitespace-nowrap">${
                  job.scrapeDate || "N/A"
                }</td>
                <td class="px-4 py-2 whitespace-nowrap">${
                  job.scrapeTime || "N/A"
                }</td>
                <td class="px-4 py-2 whitespace-nowrap">${
                  job.jobLink
                    ? `<a href="${job.jobLink}" target="_blank" class="text-blue-500 hover:underline">Link</a>`
                    : "N/A"
                }</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function updatePagination() {
    const totalPages = Math.ceil(allJobDetails.length / itemsPerPage);
    paginationDiv.innerHTML = `
      <div class="flex justify-center space-x-2">
        ${Array.from({ length: totalPages }, (_, i) => i + 1)
          .map(
            (i) => `
          <button class="page-btn px-3 py-1 rounded-md text-sm font-medium ${
            i === currentPage
              ? "bg-blue-500 text-white"
              : "bg-white text-blue-500 hover:bg-blue-100"
          }" data-page="${i}">${i}</button>
        `
          )
          .join("")}
      </div>
    `;
  }

  async function handleExport() {
    if (allJobDetails.length === 0) {
      showAlert("No job details to export.", true);
      return;
    }

    const csvContent = generateCSVContent(allJobDetails);
    downloadCSV(csvContent);

    try {
      await chrome.storage.local.remove(["jobDetails", "trackedJobs"]);
      allJobDetails = [];
      await displayJobDetails(1);
      showAlert("Data exported and storage cleared.");
    } catch (error) {
      console.error("Error clearing data:", error);
      showAlert("Error clearing data. Please try again.", true);
    }
  }

  function generateCSVContent(jobDetails) {
    const headerMapping = {
      "Job Title": "jobTitle",
      Company: "companyName",
      Location: "location",
      Industry: "industry",
      "Work Type": "workType",
      "Salary Range": "salaryRange",
      Date: "scrapeDate",
      Time: "scrapeTime",
      "Job Link": "jobLink",
    };

    const headers = Object.keys(headerMapping);

    const rows = jobDetails.map((job) =>
      headers.map((header) => {
        const propertyName = headerMapping[header];
        return job[propertyName] || "";
      })
    );

    return [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
  }

  function downloadCSV(csvContent) {
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "job_tracking_details.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function initializePopup() {
    await loadJobDetails();
    exportButton.addEventListener("click", handleExport);
    paginationDiv.addEventListener("click", handlePaginationClick);
  }

  function handlePaginationClick(event) {
    if (event.target.classList.contains("page-btn")) {
      currentPage = parseInt(event.target.getAttribute("data-page"));
      displayJobDetails(currentPage);
    }
  }

  // Add listener for real-time updates
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "jobDetailsUpdated") {
      loadJobDetails();
    }
  });
})();
