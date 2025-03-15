import type { FileType } from "@/types/file"

// This is a mock implementation for the client-side
// In a real application, this would call the API
export async function fetchFileTree(): Promise<FileType[]> {
  try {
    const response = await fetch("/api/files")
    if (!response.ok) {
      throw new Error("Failed to fetch file tree")
    }
    const data = await response.json()
    return data.files
  } catch (error) {
    console.error("Error fetching file tree:", error)
    throw error
  }
}

// This is a mock service that simulates fetching file content
// In a real application, this would make API calls to a backend

const fileContents: Record<string, string> = {
  "/README.md": `# Project Documentation

Welcome to the project documentation. This README provides an overview of the project and how to get started.

## Overview

This project is a Markdown documentation viewer that allows you to browse and view Markdown files in a user-friendly interface.

## Features

- File tree navigation
- Markdown rendering
- Tabbed interface
- Search functionality

## Getting Started

To get started with this project, follow these steps:

1. Clone the repository
2. Install dependencies
3. Run the development server

\`\`\`bash
npm install
npm run dev
\`\`\`

## Contributing

Please read the [CONTRIBUTING.md](/CONTRIBUTING.md) file for details on our code of conduct and the process for submitting pull requests.
`,

  "/CONTRIBUTING.md": `# Contributing Guidelines

Thank you for considering contributing to our project! This document outlines the process for contributing to this project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Submit a pull request

## Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update the documentation as necessary
3. Include tests for your changes
4. Your pull request will be reviewed by maintainers

## Development Setup

\`\`\`bash
# Clone your fork
git clone https://github.com/yourusername/project.git

# Add the original repository as a remote
git remote add upstream https://github.com/original/project.git

# Create a new branch
git checkout -b feature/your-feature-name
\`\`\`

Thank you for your contributions!
`,

  "/documentation/getting-started.md": `# Getting Started

This guide will help you get started with the project.

## Installation

First, install the project dependencies:

\`\`\`bash
npm install
\`\`\`

## Configuration

Create a \`.env.local\` file in the root of your project with the following variables:

\`\`\`
NEXT_PUBLIC_API_URL=https://api.example.com
\`\`\`

## Running the Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at [http://localhost:3000](http://localhost:3000).

## Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Next Steps

Once you have the project running, you can:

1. Explore the documentation
2. Try out the features
3. Make changes and see them in real-time

![Development Process](https://via.placeholder.com/800x400?text=Development+Process)

For more information, check out the [API Reference](api-reference.md).
`,

  "/documentation/api-reference.md": `# API Reference

This document provides details about the API endpoints available in the project.

## Authentication

All API requests require authentication using an API key. Include the API key in the \`Authorization\` header of your requests:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Endpoints

### GET /api/files

Returns the file structure.

#### Response

\`\`\`json
{
  "files": [
    {
      "id": "1",
      "name": "docs",
      "type": "folder",
      "children": [...]
    }
  ]
}
\`\`\`

### GET /api/file?path=file-path

Returns the content of a specific file.

#### Response

\`\`\`json
{
  "content": "# File Content\\n\\nThis is the content of the file."
}
\`\`\`

## Error Handling

The API returns standard HTTP status codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

Error responses include a message explaining the error:

\`\`\`json
{
  "error": "File not found"
}
\`\`\`
`,

  "/documentation/guides/installation.md": `# Installation Guide

This guide provides detailed instructions for installing the project in different environments.

## Prerequisites

Before installing, ensure you have the following:

- Node.js 14.x or higher
- npm 7.x or higher
- Git

## Basic Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/example/project.git
cd project
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Create a configuration file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Edit the configuration file with your settings.

5. Start the development server:

\`\`\`bash
npm run dev
\`\`\`

## Docker Installation

You can also run the project using Docker:

\`\`\`bash
# Build the Docker image
docker build -t project .

# Run the container
docker run -p 3000:3000 project
\`\`\`

## Troubleshooting

If you encounter any issues during installation, try the following:

1. Clear npm cache:

\`\`\`bash
npm cache clean --force
\`\`\`

2. Delete node_modules and reinstall:

\`\`\`bash
rm -rf node_modules
npm install
\`\`\`

3. Check for Node.js version compatibility:

\`\`\`bash
node -v
\`\`\`

If you continue to experience issues, please [open an issue](https://github.com/example/project/issues) on GitHub.
`,

  "/documentation/guides/configuration.md": `# Configuration Guide

This guide explains how to configure the project for different environments and use cases.

## Environment Variables

The project uses environment variables for configuration. Create a \`.env.local\` file in the root directory with the following variables:

\`\`\`
# API Configuration
NEXT_PUBLIC_API_URL=https://api.example.com
API_KEY=your_api_key

# Authentication
AUTH_SECRET=your_auth_secret
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
FEATURE_ADVANCED_SEARCH=true
FEATURE_DARK_MODE=true
\`\`\`

## Configuration Files

In addition to environment variables, the project uses several configuration files:

### next.config.js

This file contains Next.js-specific configuration:

\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com', 'example.com'],
  },
  // Add other Next.js configuration options here
}

module.exports = nextConfig
\`\`\`

### tailwind.config.js

This file contains Tailwind CSS configuration:

\`\`\`javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Add custom theme configuration here
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
\`\`\`

## Production Configuration

For production environments, additional configuration is recommended:

1. Set \`NODE_ENV=production\`
2. Configure proper CORS settings
3. Set up rate limiting
4. Enable caching

## Development Configuration

For development, you may want to:

1. Enable detailed logging
2. Disable caching
3. Use mock data instead of real API calls

## Testing Configuration

For testing environments:

1. Use a separate database
2. Mock external services
3. Set \`NODE_ENV=test\`
`,

  "/examples/basic-usage.md": `# Basic Usage

This guide demonstrates the basic usage of the application.

## Viewing Files

To view a file, simply click on it in the file explorer. The file content will be displayed in the main area.

## Navigating Folders

Click on a folder to expand or collapse it. You can navigate through the directory structure to find the files you want to view.

## Using Tabs

The application supports multiple tabs, allowing you to have several files open at once:

1. Click on a file in the explorer to open it in a new tab
2. Click on a tab to switch to that file
3. Click the X on a tab to close it

## Example: Viewing Documentation

Here's a simple example of how to view the project documentation:

1. Open the file explorer
2. Navigate to the "Documentation" folder
3. Click on "getting-started.md"
4. Read the getting started guide

## Example: Comparing Files

You can open multiple files to compare their contents:

1. Open "installation.md"
2. Open "configuration.md"
3. Switch between the tabs to compare the content

## Keyboard Shortcuts

The application supports several keyboard shortcuts:

- Ctrl+P: Open the file search
- Ctrl+Tab: Switch between tabs
- Ctrl+W: Close the current tab

## Next Steps

Once you're familiar with the basic usage, you can explore the [Advanced Features](advanced-features.md) to learn more about what the application can do.
`,

  "/examples/advanced-features.md": `# Advanced Features

This guide covers the advanced features of the application.

## Search Functionality

The application includes a powerful search feature:

1. Click on the search bar in the top-right corner
2. Type your search query
3. Press Enter to search
4. Click on a search result to open the file

## Markdown Features

The application supports various Markdown features:

### Syntax Highlighting

Code blocks with language identifiers will have syntax highlighting:

\`\`\`javascript
function hello() {
  console.log('Hello, world!');
}
\`\`\`

### Tables

You can create tables using the standard Markdown syntax:

| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

### Task Lists

You can create task lists:

- [x] Completed task
- [ ] Incomplete task

## Project Selection

You can switch between different projects:

1. Click on the project selector in the top-left corner
2. Select a project from the dropdown
3. The file explorer will update to show the files for the selected project

## Customization

The application can be customized in several ways:

### Theme

You can switch between light and dark themes:

1. Click on the settings icon
2. Select "Theme"
3. Choose "Light" or "Dark"

### Font Size

You can adjust the font size:

1. Click on the settings icon
2. Select "Font Size"
3. Choose a size from the dropdown

## Integration with External Tools

The application can integrate with various external tools:

### Git Integration

You can view Git information for files:

1. Right-click on a file
2. Select "View Git History"
3. See the commit history for the file

### Export Options

You can export files in different formats:

1. Right-click on a file
2. Select "Export As"
3. Choose a format (PDF, HTML, etc.)

## Advanced Configuration

For advanced users, the application can be configured through a configuration file. See the [Configuration Guide](/documentation/guides/configuration.md) for more information.
`,
}

export async function fetchFileContent(path: string): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Check if we have content for this path
  if (fileContents[path]) {
    return fileContents[path]
  }

  // If not, return a placeholder
  return `# ${path.split("/").pop()}

This is a placeholder content for ${path}.

The actual content for this file has not been created yet.
`
}

