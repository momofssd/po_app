<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gemini PO Extractor

An intelligent Purchase Order (PO) extraction system powered by Google's Gemini AI. This application automates the process of extracting structured data from PO images or PDFs and converting them into a standardized format for business processing.

## 🚀 Key Features

- **AI-Powered Extraction**: Utilizes Google Gemini (`gemini-3-flash-preview`) to accurately extract PO details from images.
- **Automated Unit Conversion**:
  - Automatically converts weight from LBS to KG.
  - Standardizes "Tons" to "TO".
  - Defaults all other units to KG for consistency.
- **Multi-Page Support**: Process multiple pages or images in a single batch.
- **Real-time Queue Management**: View and manage extraction results in an interactive dashboard.
- **Customer Matching**: Intelligence to match extracted data with existing customer records.
- **Full-Stack Architecture**: React frontend with Vite, Express backend, and MongoDB for data persistence.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express 5
- **Database**: MongoDB
- **AI**: Google Gemini Pro (via `@google/genai`)
- **Authentication**: JWT-based secure access

## 📋 Prerequisites

- **Node.js**: v18 or later
- **MongoDB**: A running instance (local or Atlas)
- **Gemini API Key**: Obtain from [Google AI Studio](https://aistudio.google.com/)

## ⚙️ Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/momofssd/po_app.git
   cd PO_Reader
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

## 🚀 Running the Application

### Development Mode

Run both the frontend and backend in development mode:

1. **Start the Backend Server**:

   ```bash
   npm run server
   ```

   The backend will run on port 3001 (or your specified PORT).

2. **Start the Frontend**:
   ```bash
   npm run dev
   ```
   The Vite dev server will typically run on `http://localhost:5173`.

### Production Build

1. **Build the frontend**:
   ```bash
   npm run build
   ```
2. **Start the combined server**:
   ```bash
   npm start
   ```
   The Express server will serve the static files from `dist` and handle API requests.

## 📂 Project Structure

- `backend/`: Express server logic, routes, and database configuration.
- `components/`: React UI components (Dashboard, ResultsTable, FileUpload, etc.).
- `services/`: API integration services (Gemini, Auth, Customers).
- `hooks/`: Custom React hooks for business logic.
- `types.ts`: TypeScript interfaces and type definitions.

## 📄 License

[Include License Type Here, e.g., MIT]

---

_Built with ❤️ using Google Gemini AI_
