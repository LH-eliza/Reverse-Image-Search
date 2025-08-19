# Reverse Image Detection

A comprehensive reverse image detection application that leverages Google Vision API, Google Custom Search API, and Tesseract.js for Optical Character Recognition (OCR). This project is designed to provide transparency and safety in online spaces by allowing users to verify image authenticity and detect potential manipulation.

## 🎯 Purpose

This project was created to allow people to easily access reverse image searching capabilities utilizing the features of Google Lens, but allows for full transparency. This project was created without malicious intent, it allows others to be safe within online spaces providing full transparency and safety.

## ✨ Features

- **Reverse Image Search**: Using Google Vision API for comprehensive image analysis
- **Web Search Integration**: Google Custom Search API for finding similar images online
- **OCR Text Detection**: Extract and analyze text from images using Tesseract.js
- **Metadata Analysis**: Extract and analyze image metadata and EXIF data
- **Stock Photo Detection**: Identify commonly used stock images
- **Facial Recognition**: Detect faces and identify potential impersonations
- **Modern Web Interface**: Beautiful, responsive UI with drag-and-drop functionality
- **Docker Support**: Containerized for easy deployment and scalability
- **RESTful API**: Clean API endpoints for integration with other applications

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Cloud Platform account (for API keys)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Reverse-Image-Search
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` and add your API keys:

   - `GOOGLE_VISION_API_KEY`: Get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - `GOOGLE_CUSTOM_SEARCH_API_KEY`: Get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - `GOOGLE_CUSTOM_SEARCH_ENGINE_ID`: Create at [Google Custom Search](https://cse.google.com/cse/)

4. **Start the application**

   ```bash
   npm start
   ```

5. **Access the application**
   - Web Interface: http://localhost:3000
   - API Health Check: http://localhost:3000/health

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Build and run with Docker Compose**

   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Web Interface: http://localhost:3000

### Using Docker directly

1. **Build the image**

   ```bash
   docker build -t reverse-image-detection .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 --env-file .env reverse-image-detection
   ```

## 📚 API Documentation

### Endpoints

#### POST `/api/search`

Standard image analysis endpoint.

**Request:**

- Content-Type: `multipart/form-data`
- Body: `image` field containing the image file

**Response:**

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "processingTime": 1500,
  "originalFilename": "image.jpg",
  "fileSize": 1024000,
  "services": {
    "googleVision": { ... },
    "googleCustomSearch": { ... },
    "ocr": { ... },
    "metadata": { ... },
    "stockPhoto": { ... },
    "facialRecognition": { ... }
  },
  "summary": {
    "overallRisk": "low",
    "confidence": 0.85,
    "keyFindings": [...],
    "recommendations": [...]
  }
}
```

#### POST `/api/search/enhanced`

Enhanced analysis with additional features.

#### GET `/health`

Service health check.

### Example Usage

```bash
# Using curl
curl -X POST \
  -F "image=@/path/to/image.jpg" \
  http://localhost:3000/api/search

# Using JavaScript
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/search', {
  method: 'POST',
  body: formData
});

const results = await response.json();
```

## 🔧 Configuration

### Environment Variables

| Variable                         | Description                  | Required | Default           |
| -------------------------------- | ---------------------------- | -------- | ----------------- |
| `NODE_ENV`                       | Environment mode             | No       | `development`     |
| `PORT`                           | Server port                  | No       | `3000`            |
| `GOOGLE_VISION_API_KEY`          | Google Vision API key        | Yes      | -                 |
| `GOOGLE_CUSTOM_SEARCH_API_KEY`   | Google Custom Search API key | Yes      | -                 |
| `GOOGLE_CUSTOM_SEARCH_ENGINE_ID` | Custom Search Engine ID      | Yes      | -                 |
| `MAX_REQUESTS_PER_MINUTE`        | Rate limiting                | No       | `60`              |
| `MAX_FILE_SIZE`                  | Max file size in bytes       | No       | `10485760` (10MB) |

### Google API Setup

1. **Google Vision API**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Vision API
   - Create credentials (API key)
   - Add the API key to your `.env` file

2. **Google Custom Search API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Custom Search API
   - Create credentials (API key)
   - Go to [Google Custom Search](https://cse.google.com/cse/)
   - Create a new search engine
   - Add the API key and Search Engine ID to your `.env` file

## 🏗️ Project Structure

```
Reverse-Image-Search/
├── public/                 # Static web files
│   ├── index.html         # Main web interface
│   ├── styles.css         # CSS styles
│   └── script.js          # Frontend JavaScript
├── services/              # Backend services
│   ├── google.js          # Google Vision API service
│   ├── googleCustomSearch.js # Google Custom Search service
│   ├── ocr.js             # OCR service
│   ├── metadata.js        # Metadata analysis service
│   ├── stockPhotoCheck.js # Stock photo detection
│   └── facialRecognition.js # Facial recognition service
├── uploads/               # Temporary file uploads
├── index.js               # Main server file
├── package.json           # Dependencies and scripts
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── .gitignore             # Git ignore rules
├── env.example            # Environment variables example
└── README.md              # This file
```

## 🔍 Analysis Features

### Google Vision Analysis

- Label detection for image content
- Web detection for similar images
- Face detection and analysis
- Text detection within images
- Object localization

### OCR Text Detection

- Extract text from images
- Support for multiple languages
- Confidence scoring
- Word-level analysis

### Facial Recognition

- Face detection and counting
- Age and gender estimation
- Impersonation risk assessment
- Facial feature analysis

### Metadata Analysis

- EXIF data extraction
- Image dimensions and format
- Camera information
- GPS location data (if available)
- Quality indicators

### Stock Photo Detection

- Professional image characteristics
- Metadata analysis
- Quality assessment
- Database cross-referencing

## 🛡️ Security & Privacy

- **No Image Storage**: Images are processed temporarily and deleted immediately
- **No Logging**: Analysis results are not stored or logged
- **API Key Security**: Environment variables for sensitive data
- **File Validation**: Strict file type and size validation
- **Rate Limiting**: Configurable request limits
- **CORS Support**: Configurable cross-origin requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## ⚠️ Disclaimer

This application is designed for legitimate use cases such as:

- Verifying image authenticity
- Detecting potential manipulation
- Identifying stock photos
- Ensuring online safety

Please use this tool responsibly and in accordance with applicable laws and regulations.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review the API documentation
3. Ensure your API keys are properly configured
4. Check the server logs for error messages

## 🔄 Updates

Stay updated with the latest features and improvements by:

- Watching the repository
- Checking the releases page
- Following the changelog

---

**Built with ❤️ for transparency and safety in online spaces.**
