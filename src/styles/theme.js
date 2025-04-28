// src/styles/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1A2B4C", // Dark Blue
    },
    secondary: {
      main: "#E6007E", // Light Green
    },
    background: {
      default: "#F5F5F5", // Light Gray background
      paper: "#FFFFFF", // White for paper elements
    },
  },
  typography: {
    h1: {
      fontSize: "1.75rem",
      fontWeight: "bold",
    },
    // Add other typography variants if needed
  },
  components: {
    // Default props or style overrides for MUI components
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 12px", // Adjust cell padding
          fontSize: "0.875rem",
        },
        head: {
          fontWeight: "bold",
          backgroundColor: "#E8F5E9", // Lighter green for header
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          maxHeight: "calc(100vh - 200px)", // Example height constraint
          overflowY: "auto", // Make table body scrollable if needed
        },
      },
    },
  },
});

export default theme;
