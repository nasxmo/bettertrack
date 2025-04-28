// src/App.jsx
import React from "react";
import SidePanel from "./pages/SidePanel";
import Layout from "./components/Layout"; // Import Layout

function App() {
  // The export handler logic now resides within SidePanel,
  // but if Layout needed to trigger something *in* SidePanel,
  // we would pass a function down. For simplicity, we can
  // keep the export logic tied closely to the data it manages (in SidePanel).
  // However, if Layout needs the handler, lift the state/handler up or use Context API.

  // Let's adjust Layout to accept the handleExport function directly from SidePanel
  // This requires lifting the handleExport function, or passing it up.
  // A simpler approach for now: SidePanel renders everything including the Layout.
  // Let's refactor SidePanel to use the Layout component.

  // Refactoring: SidePanel will use Layout internally.
  // So App.jsx becomes very simple.

  return <SidePanel />;
}

export default App;
