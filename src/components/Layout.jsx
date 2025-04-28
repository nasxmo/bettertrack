// src/components/Layout.jsx
import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

function Layout({ onExport, children }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" color="primary">
        <Toolbar variant="dense">
          {" "}
          {/* Use dense toolbar for less height */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BetterTrack
          </Typography>
          <Button
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={onExport}
            size="small"
          >
            Export & Clear
          </Button>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth={false}
        sx={{
          flexGrow: 1,
          py: 2,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Content area will grow and potentially scroll */}
        {children}
      </Container>
    </Box>
  );
}

export default Layout;
