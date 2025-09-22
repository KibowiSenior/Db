# SQL to MariaDB 10.3 Converter

## Overview

This is a full-stack web application that converts MySQL SQL files to MariaDB 10.3 compatible format. The application provides an intuitive interface for uploading SQL files, analyzing compatibility issues, and downloading the converted output with detailed reporting on syntax changes and optimizations.

## Features

###  Data Conversion Capabilities
- **MySQL to MariaDB 10.3 Conversion**: Automatically converts MySQL syntax to MariaDB 10.3 compatible format
- **Collation Mapping**: Converts MySQL 8.0+ collations to MariaDB 10.3 compatible equivalents while preserving case sensitivity
- **Syntax Compatibility**: Handles incompatible functions, keywords, and SQL constructs
- **Auto-Fix Engine**: Automatically resolves common compatibility issues
- **Line-by-Line Analysis**: Precise error reporting with line number tracking

###  Analysis & Reporting
- **Detailed Issue Detection**: Categorized issue detection (syntax, compatibility, optimization)
- **Conversion Statistics**: Tracks total issues, auto-fixes, warnings, errors, and optimizations
- **Validation Reports**: Comprehensive reports on conversion results
- **Code Comparison**: Side-by-side comparison of original and converted SQL

###  Core Conversion Features
- **Case Sensitivity Preservation**: Maintains data integrity by properly mapping case-sensitive collations
- **Function Compatibility**: Converts incompatible MySQL functions to MariaDB equivalents
- **Engine Optimization**: Optimizes SQL output for better MariaDB 10.3 compatibility
- **Error Handling**: Graceful handling of conversion errors with detailed feedback

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling
- **Shadcn/ui** components built on Radix UI
- **TanStack Query** for state management and API calls
- **Wouter** for client-side routing
- **React Dropzone** for file upload functionality

### Backend  
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Multer** for file upload handling
- **Drizzle ORM** for database operations
- **PostgreSQL** (Neon Database) for data persistence
- **Express Session** with PostgreSQL backing

## Prerequisites

Before you start, make sure you have the following installed:
- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager

## Installation & Setup

### 1. Install Dependencies

First, install the TypeScript executor globally:

```bash
npm install tsx
```

Then install all project dependencies:

```bash
npm install
```

### 2. Database Setup (Optional)

If you want to use persistent storage instead of in-memory storage:

```bash
npm run db:push
```

This will push the database schema to your configured PostgreSQL database.

### 3. Environment Configuration

The application can run with in-memory storage for development, or you can configure a PostgreSQL database connection if needed.

## Starting the Application

### Development Mode

To start the application in development mode with hot reload:

```bash
npm run dev
```

This command:
- Sets `NODE_ENV=development`
- Runs `tsx server/index.ts`
- Starts both the Express backend and Vite frontend
- Enables hot reload for both client and server code
- Makes the app available at `http://localhost:5000`

### Production Build

To build the application for production:

```bash
npm install tsx
```

To start the production server:

```bash
npm run dev
```

## How It Works

### 1. File Upload
- Drag and drop SQL files or browse to select
- Supports `.sql` file format
- Real-time file validation

### 2. Analysis Process
The conversion engine processes your SQL file through several stages:

- **Syntax Analysis**: Identifies MySQL-specific syntax that needs conversion
- **Collation Mapping**: Converts MySQL 8.0+ collations to MariaDB 10.3 equivalents
- **Function Translation**: Replaces incompatible functions with MariaDB alternatives
- **Optimization**: Applies MariaDB-specific optimizations
- **Validation**: Ensures the converted SQL maintains data integrity

### 3. Issue Categories
- **Errors**: Critical compatibility issues that must be fixed
- **Warnings**: Potential issues that should be reviewed
- **Auto-fixes**: Issues automatically resolved by the converter
- **Optimizations**: Performance improvements applied

### 4. Results & Download
- View detailed conversion statistics
- Compare original vs converted code side-by-side
- Download the converted MariaDB-compatible SQL file
- Access detailed issue reports with line numbers

## Conversion Examples

### Collation Conversion
```sql
-- MySQL 8.0
CREATE TABLE users (
  name VARCHAR(255) COLLATE utf8mb4_0900_ai_ci
);

-- Converted to MariaDB 10.3
CREATE TABLE users (
  name VARCHAR(255) COLLATE utf8mb4_unicode_ci
);
```

### Case-Sensitive Preservation
```sql
-- MySQL 8.0 (case-sensitive)
CREATE TABLE products (
  code VARCHAR(50) COLLATE utf8mb4_0900_as_cs
);

-- Converted to MariaDB 10.3 (preserves case sensitivity)
CREATE TABLE products (
  code VARCHAR(50) COLLATE utf8mb4_bin
);
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/            # Utilities and converters
│   │   └── hooks/          # Custom React hooks
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage interface
├── shared/                 # Shared types and schemas
└── package.json           # Project configuration
```

### Common Issues
1. **Port already in use**: The application runs on port 5000 by default. Make sure no other application is using this port.
2. **TypeScript errors**: Run `npm run check` to identify and fix type issues.
3. **Database connection**: If using persistent storage, ensure your PostgreSQL database is running and accessible.
4. **File upload issues**: Ensure uploaded files are valid SQL format and not corrupted.

## Development Notes

- The application uses in-memory storage by default for development
- Hot reload is enabled for both frontend and backend code
- Vite handles the frontend build process
- Express serves both API routes and static assets
- TypeScript compilation is handled by `tsx` for development
