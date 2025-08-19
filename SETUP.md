# Production Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp env.example .env
```

Edit `.env` with your API keys:

- `GOOGLE_VISION_API_KEY` - Get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- `GOOGLE_CUSTOM_SEARCH_API_KEY` - Get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- `GOOGLE_CUSTOM_SEARCH_ENGINE_ID` - Create at [Google Custom Search](https://cse.google.com/cse/)

### 3. Start Application

**Development:**

```bash
npm start
```

**Production:**

```bash
NODE_ENV=production npm start
```

**Docker:**

```bash
docker-compose up -d
```

### 4. Access Application

- Web Interface: http://localhost:3000
- API Health: http://localhost:3000/health
- API Endpoint: http://localhost:3000/api/search

## API Usage

### Basic Analysis

```bash
curl -X POST -F "image=@image.jpg" http://localhost:3000/api/search
```

### Enhanced Analysis

```bash
curl -X POST -F "image=@image.jpg" http://localhost:3000/api/search/enhanced
```

## Features

- ✅ Reverse image search (Google Vision API)
- ✅ OCR text detection (Tesseract.js)
- ✅ Metadata analysis (EXIF, dimensions, etc.)
- ✅ Stock photo detection
- ✅ Facial recognition & impersonation detection
- ✅ Modern web interface
- ✅ Docker support
- ✅ RESTful API

## Security

- Images processed temporarily and deleted immediately
- No permanent storage of uploaded files
- Environment variables for sensitive data
- File type and size validation
- CORS enabled for cross-origin requests
