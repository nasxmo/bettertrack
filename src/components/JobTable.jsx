// src/components/JobTable.jsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  Typography,
  Box,
} from "@mui/material";

const headers = [
  "Job Title",
  "Company",
  "Location",
  "Industry",
  "Work Type",
  "Salary Range",
  "Date",
  "Time",
  "Link",
];

function JobTable({ jobs }) {
  if (!jobs || jobs.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1">
          No tracked jobs found. Start tracking now
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
      {" "}
      {/* Added overflowX */}
      <Table stickyHeader aria-label="tracked jobs table" size="small">
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map((job, index) => (
            <TableRow
              key={`${job.jobTitle}-${job.companyName}-${index}`} // More robust key
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{ whiteSpace: "nowrap" }}
              >
                {job.jobTitle || "N/A"}
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {job.companyName || "N/A"}
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {job.location || "N/A"}
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {job.industry || "N/A"}
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {job.workType || "N/A"}
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {job.salaryRange || "N/A"}
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {job.scrapeDate || "N/A"}
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {job.scrapeTime || "N/A"}
              </TableCell>
              <TableCell>
                {job.jobLink ? (
                  <Link
                    href={job.jobLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                  >
                    View
                  </Link>
                ) : (
                  "N/A"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default JobTable;
