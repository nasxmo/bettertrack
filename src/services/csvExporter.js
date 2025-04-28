// src/services/csvExporter.js

export function generateCSVContent(jobDetails) {
  if (!jobDetails || jobDetails.length === 0) {
    return "";
  }

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
  const headerRow = headers.join(",");

  const rows = jobDetails.map((job) =>
    headers
      .map((header) => {
        const propertyName = headerMapping[header];
        const value = job[propertyName] || "";
        // Escape double quotes and wrap in double quotes
        const escapedValue = String(value).replace(/"/g, '""');
        return `"${escapedValue}"`;
      })
      .join(",")
  );

  // Add BOM for Excel compatibility with UTF-8
  const BOM = "\uFEFF";
  return [BOM + headerRow, ...rows].join("\n");
}

export function downloadCSV(csvContent, filename = "job_tracking_details.csv") {
  if (!csvContent) return;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
