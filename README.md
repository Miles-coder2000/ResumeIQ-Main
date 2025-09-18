# ResuméIQ - AI Resume Analyzer

An intelligent resume analysis platform built with React Router v7, TypeScript, and Puter.js that provides AI-powered feedback and ATS scoring for job seekers.

## Overview

ResuméIQ is a comprehensive resume analysis tool that leverages AI to help job seekers improve their resumes. The application provides detailed feedback on resume structure, content, tone, and ATS compatibility, all wrapped in a modern, user-friendly interface.

## Features

### 🔐 Serverless Authentication
- Browser-based authentication using Puter.js
- No backend setup required
- Secure user sessions and data management

### 📄 Resume Management
- PDF upload and storage
- Automatic PDF to image conversion for preview
- Persistent resume storage in the cloud

### 🤖 AI-Powered Analysis
- Claude 3.5 Sonnet integration for intelligent resume review
- Custom feedback based on job descriptions
- ATS (Applicant Tracking System) scoring
- Detailed improvement suggestions

### 📊 Comprehensive Scoring
- Overall resume score (0-100)
- Category-specific ratings:
  - Tone & Style
  - Content Quality  
  - Document Structure
  - Skills Assessment
- Visual score indicators and progress gauges

### 💼 Job-Specific Feedback
- Tailored analysis based on company and role
- Job description matching
- Industry-specific recommendations

### 📱 Modern UI/UX
- Fully responsive design
- Clean, intuitive interface
- Animated components and smooth transitions
- Gradient designs and modern styling

## Tech Stack

### Frontend Framework
- **React 19** - Latest React with concurrent features
- **React Router v7** - Advanced routing with SSR support
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server

### Styling & Design
- **Tailwind CSS 4** - Utility-first CSS framework
- **Custom CSS animations** - Smooth transitions and effects
- **Responsive grid layouts** - Mobile-first design approach

### Backend & Services
- **Puter.js** - Serverless cloud platform integration
- **Puter.com** - Cloud storage, auth, and AI services
- **Claude 3.5 Sonnet** - AI analysis and feedback generation

### State Management
- **Zustand** - Lightweight state management
- **Custom hooks** - Puter.js integration layer

### PDF Processing
- **PDF.js** - Client-side PDF rendering and conversion
- **Canvas API** - High-quality PDF to image conversion

## Project Structure

```
├── app/
│   ├── components/           # Reusable UI components
│   │   ├── ATS.tsx          # ATS score display
│   │   ├── Accordion.tsx    # Expandable content sections
│   │   ├── Details.tsx      # Detailed feedback breakdown
│   │   ├── FileUploader.tsx # Drag-and-drop file upload
│   │   ├── Navbar.tsx       # Navigation component
│   │   ├── ResumeCard.tsx   # Resume preview cards
│   │   ├── ScoreCircle.tsx  # Circular progress indicators
│   │   ├── ScoreGauge.tsx   # Semi-circular score display
│   │   └── Summary.tsx      # Score overview section
│   ├── lib/                 # Utility libraries
│   │   ├── puter.ts        # Puter.js integration store
│   │   ├── pdf2img.ts      # PDF conversion utilities
│   │   └── utils.ts        # Helper functions
│   ├── routes/             # Application pages
│   │   ├── home.tsx        # Dashboard with resume list
│   │   ├── auth.tsx        # Authentication page
│   │   ├── upload.tsx      # Resume upload and analysis
│   │   ├── resume.tsx      # Detailed resume review
│   │   └── wipe.tsx        # Data management utility
│   └── app.css            # Global styles and utilities
├── constants/
│   └── index.ts           # AI prompt templates and data
├── public/                # Static assets
│   ├── icons/            # SVG icons
│   ├── images/           # Background images and graphics
│   └── pdf.worker.min.mjs # PDF.js worker
├── Dockerfile            # Multi-stage Docker build
└── package.json         # Dependencies and scripts
```

## Getting Started

### Prerequisites

- **Node.js 20+** - Runtime environment
- **npm** - Package manager
- **Modern browser** - Chrome, Firefox, Safari, Edge

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ai-resume-analyzer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open application**:
   Navigate to [http://localhost:5173](http://localhost:5173)

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t resumeiq .

# Run container
docker run -p 3000:3000 resumeiq
```

## Usage Guide

### 1. Authentication
- Navigate to the auth page
- Sign in using Puter.js authentication
- No registration required - uses existing cloud identity

### 2. Upload Resume
- Click "Upload Resume" from the dashboard
- Fill in job details (optional but recommended):
  - Company name
  - Job title
  - Job description
- Drag and drop PDF file or click to browse
- Click "Analyze Resume" to start processing

### 3. Review Results
- View overall score and category breakdowns
- Examine ATS compatibility rating
- Read detailed improvement suggestions
- Click on sections to expand detailed feedback

### 4. Manage Resumes
- View all analyzed resumes on the dashboard
- Click any resume card to review feedback
- Resumes are stored securely in your cloud account

## Key Components

### Puter.js Integration (`app/lib/puter.ts`)

The core integration layer providing:

```typescript
interface PuterStore {
  auth: AuthService;      // User authentication
  fs: FileSystemService;  // Cloud file storage
  ai: AIService;         // Claude AI integration
  kv: KeyValueStore;     // Resume metadata storage
}
```

### AI Analysis Pipeline

1. **File Upload** - PDF stored in Puter cloud storage
2. **Image Conversion** - PDF converted to preview image
3. **AI Processing** - Resume analyzed by Claude 3.5 Sonnet
4. **Feedback Generation** - Structured feedback with scores
5. **Data Storage** - Results saved to key-value store

### Feedback Structure

```typescript
interface Feedback {
  overallScore: number;
  ATS: { score: number; tips: Tip[] };
  toneAndStyle: { score: number; tips: DetailedTip[] };
  content: { score: number; tips: DetailedTip[] };
  structure: { score: number; tips: DetailedTip[] };
  skills: { score: number; tips: DetailedTip[] };
}
```

## Configuration

### Environment Setup

The application uses Puter.js which handles configuration automatically. No environment variables needed for basic functionality.

### Customizing AI Prompts

Edit `constants/index.ts` to modify:
- AI response format
- Analysis criteria
- Scoring methodology
- Feedback categories

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- Functional components with hooks
- Tailwind CSS for styling
- ESLint and TypeScript for code quality

### Component Architecture
- Reusable UI components in `/components`
- Page components in `/routes`
- Business logic in custom hooks
- State management with Zustand

### Performance Optimizations
- Lazy loading for PDF processing
- Image optimization for previews
- Efficient state updates
- Minimal re-renders with proper dependencies

## Deployment

### Vercel (Recommended)
1. Connect repository to Vercel
2. Deploy with default React Router v7 settings
3. No additional configuration required

### Other Platforms
- **Netlify**: Compatible with SSR settings
- **Railway**: Docker deployment supported
- **DigitalOcean**: App platform ready

## API Integration

### Puter.js Services Used

- **Authentication**: `puter.auth.*`
- **File Storage**: `puter.fs.*`
- **AI Chat**: `puter.ai.chat()`
- **Key-Value Store**: `puter.kv.*`

### AI Model Configuration

```typescript
const feedback = await puter.ai.chat(
  prompt,
  { model: "claude-3-7-sonnet" }
);
```

## Troubleshooting

### Common Issues

**PDF Worker Error**:
- Ensure `pdf.worker.min.mjs` is in `/public`
- Check browser console for worker loading issues

**Authentication Problems**:
- Clear browser cache and cookies
- Verify Puter.js script loading
- Check network connectivity

**Upload Failures**:
- Verify PDF file is under 20MB
- Check file format (PDF only)
- Ensure stable internet connection

**AI Analysis Errors**:
- Check console for API errors
- Verify file upload completed successfully
- Retry analysis if needed

## Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes with proper TypeScript types
4. Test across different screen sizes
5. Submit pull request with detailed description

### Code Standards
- Follow existing component patterns
- Add TypeScript interfaces for new data structures
- Include proper error handling
- Test responsive design
- Document complex logic

## Future Enhancements

### Planned Features
- **Multiple file formats** - Support for DOCX, TXT
- **Resume templates** - AI-suggested improvements with templates
- **Batch analysis** - Process multiple resumes at once
- **Export functionality** - Download improved resume versions
- **Comparison tools** - Side-by-side resume analysis

### Technical Improvements
- **Offline support** - PWA capabilities
- **Performance optimization** - Faster PDF processing
- **Enhanced analytics** - Detailed scoring metrics
- **Integration APIs** - Connect with job boards

## License

This project is part of the Stratix I.T Company Project. Check the repository for specific licensing terms.

## Live Demo

- **For live demo of this project please visit:** https://resumeiq1.vercel.app 

---

Built with ❤️ for job seekers everywhere. Empower your career with AI-driven resume insights.

