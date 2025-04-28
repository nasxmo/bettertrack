# BetterTrack (React Chrome Extension)

BetterTrack is a Chrome Extension designed to streamline the job application process on JobStreet Malaysia (my.jobstreet.com). It allows users to easily track job applications, view them in a convenient side panel, export the data, and quickly look up company reviews. Built with React, Vite, and Material UI for a modern user experience.

## Features

*   **One-Click Job Tracking:** Adds a "Track" button directly to JobStreet job detail pages.
*   **Duplicate Prevention:** Prevents tracking the same job (based on title and company) multiple times.
*   **Side Panel Job List:** View all tracked jobs in the Chrome side panel.
    *   Displays key details: Job Title, Company, Location, Industry, Work Type, Salary, Date/Time Tracked.
    *   Includes a direct link back to the original JobStreet posting.
    *   Pagination for managing a large list of tracked jobs.
*   **Data Export:** Export all tracked job details to a CSV file with a single click. Exporting automatically clears the tracked data from extension storage.
*   **Context Menu for Reviews:** Right-click on selected text (intended for company names) on JobStreet pages to quickly search for reviews on:
    *   JobStreet (via Google Search)
    *   Indeed Malaysia (via Google Search)
    *   Glassdoor (via Google Search)
    *   Google My Business (via Google Search)
*   **Real-time Updates:** The side panel updates automatically when a new job is tracked.
*   **Modern UI:** Clean and responsive interface built with Material UI.

## Tech Stack

*   **Frontend:** React, Material UI
*   **Build Tool:** Vite
*   **Core Logic:** JavaScript (ES6+)
*   **Browser APIs:** Chrome Extension APIs (Storage, Context Menus, Side Panel, Scripting, Runtime)

## Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [pnpm](https://www.pnpm.io/)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/bettertrack.git # Replace with your repo URL
    cd bettertrack
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Building for Production

To build the extension for loading into Chrome, run:

```bash
npm run build
```
