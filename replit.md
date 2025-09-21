# SQL to MariaDB 10.3 Converter

## Overview
This is a full-stack web application that converts MySQL SQL files to MariaDB 10.3 compatible format. The application provides an intuitive interface for uploading SQL files, analyzing compatibility issues, and downloading the converted output with detailed reporting on syntax changes and optimizations.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **File Handling**: React Dropzone for drag-and-drop file uploads

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with file upload capabilities using Multer
- **Development**: Hot reload with Vite integration for seamless development experience
- **Error Handling**: Centralized error middleware with structured error responses

### Data Storage Solutions
- **Primary Database**: PostgreSQL configured through Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage implementation for development/testing
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Database Schema Design
The application uses a structured approach to track conversion jobs and their associated metadata:

- **Conversion Jobs**: Central entity tracking file uploads, processing status, and conversion results
- **Conversion Issues**: Detailed logging of syntax incompatibilities, warnings, and auto-fixes
- **Conversion Statistics**: Aggregated metrics on conversion success rates and issue types
- **User Management**: Basic user authentication and session management

### SQL Conversion Engine
- **Core Logic**: Custom MySQL to MariaDB 10.3 conversion algorithms
- **Issue Tracking**: Categorized issue detection (syntax, compatibility, optimization)
- **Auto-Fix Capabilities**: Automatic resolution of common compatibility issues
- **Line-by-Line Analysis**: Precise error reporting with line number tracking

### Authentication & Security
- **Session Management**: Server-side sessions with PostgreSQL storage
- **File Upload Security**: File size limits and content validation
- **CORS Configuration**: Configured for development and production environments

## External Dependencies

### Database & ORM
- **Drizzle ORM**: Type-safe database operations and schema management
- **Neon Database**: Serverless PostgreSQL hosting
- **connect-pg-simple**: PostgreSQL session store for Express

### Frontend Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form validation with Zod schema integration
- **Wouter**: Lightweight routing solution
- **React Dropzone**: File upload with drag-and-drop support

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint/Prettier**: Code quality and formatting
- **Replit Plugins**: Development environment integration

### Build & Deployment
- **esbuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **Node.js**: Production runtime environment