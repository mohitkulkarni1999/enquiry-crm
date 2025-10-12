# Enquiry CRM

A modern, single-page React application for managing customer enquiries with a clean Tailwind CSS interface.

## Features

- **Create Enquiries**: Add new customer enquiries with comprehensive form validation
- **View & Edit**: View detailed enquiry information and edit existing records
- **Search & Filter**: Real-time search and filtering by status and priority
- **Dashboard Stats**: Visual overview of enquiry statistics
- **Local Storage**: Data persistence using browser local storage
- **Responsive Design**: Mobile-friendly interface with modern UI components

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd "enquiry crm"
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Creating an Enquiry
1. Click the "New Enquiry" button in the header
2. Fill out the form with customer details:
   - **Name** (required)
   - **Email** (required)
   - **Phone** (optional)
   - **Company** (optional)
   - **Subject** (required)
   - **Message** (required)
   - **Status** (New, In Progress, Resolved, Closed)
   - **Priority** (Low, Medium, High)
3. Click "Create Enquiry" to save

### Managing Enquiries
- **Search**: Use the search bar to find enquiries by name, email, company, or subject
- **Filter**: Filter by status or priority using the dropdown menus
- **View**: Click the eye icon to view full enquiry details
- **Edit**: Click the edit icon to modify an enquiry
- **Delete**: Click the trash icon to remove an enquiry (with confirmation)

### Dashboard
The dashboard shows:
- Total number of enquiries
- Count of enquiries in progress
- Count of resolved enquiries
- Count of high-priority enquiries

## Data Storage

All enquiry data is stored in your browser's local storage, so your data persists between sessions on the same device and browser.

## Project Structure

```
enquiry-crm/
├── public/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind CSS imports
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── vite.config.js       # Vite configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

This project is open source and available under the MIT License.
