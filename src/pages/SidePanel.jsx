// src/pages/SidePanel.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Box, Pagination, CircularProgress, Typography } from "@mui/material";
import JobTable from "../components/JobTable";
import AlertMessage from "../components/AlertMessage";
import { generateCSVContent, downloadCSV } from "../services/csvExporter";
import Layout from "../components/Layout";
// Optional: import useChromeStorage from '../hooks/useChromeStorage';

const ITEMS_PER_PAGE = 10;

function SidePanel() {
  const [allJobDetails, setAllJobDetails] = useState([]);
  const [trackedJobsMap, setTrackedJobsMap] = useState({}); // Keep track of keys for export clear
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // --- Data Loading ---
  const loadJobData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await chrome.storage.local.get([
        "jobDetails",
        "trackedJobs",
      ]);
      setAllJobDetails(result.jobDetails || []);
      setTrackedJobsMap(result.trackedJobs || {});
      // Reset to page 1 if current page becomes invalid after data load/clear
      const totalPages = Math.ceil(
        (result.jobDetails?.length || 0) / ITEMS_PER_PAGE
      );
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      } else if (totalPages === 0) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error loading job details from storage:", error);
      handleShowAlert("Error loading tracked jobs.", "error");
      setAllJobDetails([]);
      setTrackedJobsMap({});
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]); // Add currentPage dependency to potentially reset page number

  useEffect(() => {
    loadJobData(); // Initial load

    // Listener for updates from content script
    const messageListener = (request, sender, sendResponse) => {
      if (request.action === "jobDetailsUpdated") {
        loadJobData(); // Reload data when content script signals an update
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup listener on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [loadJobData]); // Depend on the memoized loadJobData

  // --- Alert Handling ---
  const handleShowAlert = (message, severity = "success") => {
    setAlertInfo({ open: true, message, severity });
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertInfo({ ...alertInfo, open: false });
  };

  // --- Pagination ---
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const totalPages = Math.ceil(allJobDetails.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const jobsToDisplay = allJobDetails.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // --- Export ---
  const handleExport = async () => {
    if (allJobDetails.length === 0) {
      handleShowAlert("No job details to export.", "warning");
      return;
    }

    const csvContent = generateCSVContent(allJobDetails);
    if (csvContent) {
      downloadCSV(csvContent);
      try {
        // Clear storage after successful download
        await chrome.storage.local.remove(["jobDetails", "trackedJobs"]);
        setAllJobDetails([]); // Update state immediately
        setTrackedJobsMap({});
        setCurrentPage(1); // Reset to page 1
        handleShowAlert(
          "Data exported and storage cleared successfully.",
          "success"
        );
      } catch (error) {
        console.error("Error clearing storage:", error);
        handleShowAlert("Data exported, but failed to clear storage.", "error");
      }
    } else {
      handleShowAlert("Failed to generate CSV content.", "error");
    }
  };

  // --- Rendering ---
  return (
    <Layout onExport={handleExport}>
      {" "}
      {/* Pass export handler to Layout */}
      {/* Alert Snackbar needs to be outside the main scrollable content usually */}
      <AlertMessage
        open={alertInfo.open}
        message={alertInfo.message}
        severity={alertInfo.severity}
        onClose={handleCloseAlert}
      />
      {/* Main Content Area - passed as children to Layout */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {" "}
        {/* Allow content to take space */}
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {" "}
            {/* Make this inner box scroll */}
            <JobTable jobs={jobsToDisplay} />
          </Box>
        )}
        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 1,
              mt: "auto",
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            {" "}
            {/* Push pagination down */}
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="small"
            />
          </Box>
        )}
      </Box>
    </Layout>
  );
}

export default SidePanel;
