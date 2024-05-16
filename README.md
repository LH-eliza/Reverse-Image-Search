Reverse Image Detection Bot
This project is a reverse image detection bot that leverages the Google Vision API, Google Custom Search API, and Tesseract.js for Optical Character Recognition (OCR). The bot is Dockerized for easy deployment and scalability.

Features
Reverse image search using Google Vision API.
Comprehensive web search using Google Custom Search API.
Optical Character Recognition (OCR) using Tesseract.js.
Metadata analysis to retrieve image details.
Stock photo check to identify commonly used stock images.
Facial recognition for identifying potential impersonations.
Dockerized for consistent and portable environment.
Prerequisites
Node.js and npm installed.
Docker installed.
Google Cloud API key.
Google Custom Search Engine ID.
Getting Started
1. Clone the repository
sh
Copy code
git clone https://github.com/yourusername/reverse-image-bot.git
cd reverse-image-bot
2. Install dependencies
sh
Copy code
npm install
3. Set up environment variables
Create a .env file in the root directory and add your Google API key and Custom Search Engine ID.

env
Copy code
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CX=your_google_cx
4. Build and run with Docker
Build the Docker image:

sh
Copy code
docker build -t reverse-image-bot .
Run the Docker container:

sh
Copy code
docker run -p 3000:3000 reverse-image-bot
5. Test the Application
Use Postman or any other tool to send a POST request to http://localhost:3000/search with an image file as form-data.
