# Kuber.AI - Financial Assistant Chatbot

This project is my AI Engineer assignment submission. The task was to replicate a simplified workflow of Kubera AI inside an application: when a user asks about gold investments (via text or voice), the system should answer their query and nudge them to invest in gold. If the user accepts, the app displays a sample gold investment page along with live gold prices.

## Features

- **Conversational AI Chat**: Engage in natural language conversations about financial topics like savings, debt management, and investments.
- **Voice-to-Text Input**: Utilize the browser's Web Speech API for hands-free interaction.
- **Text-to-Speech Output**: Listen to the AI's responses for a more accessible and engaging experience.
- **Integrated Investment Flow**: Smoothly transition from a conversation about gold to a dedicated screen to purchase 24k digital gold.
- **Transaction Receipts**: View a detailed, shareable receipt after a successful investment.
- **Responsive Design**: A clean, mobile-first interface that works across different screen sizes.

## Tech Stack

- **Frontend Framework**: React (with Hooks)
- **Language**: TypeScript (TSX)
- **AI Model Integration**: Google Gemini API (`@google/genai`)
- **Browser APIs**:
  - Web Speech API (`SpeechRecognition`) for voice input.
  - Speech Synthesis API (`SpeechSynthesisUtterance`) for voice output.
- **Module Loading**: ES Modules with `importmap` for dependency management without a build step.
- **Styling**: Inline CSS-in-JS within React components for scoped and dynamic styling.

## Project Structure

The application is a single-page app with the main logic contained in a few key files:

```
.
├── index.html       # The main HTML entry point with the importmap setup.
├── index.tsx        # The core React application, components, and logic.
├── metadata.json    # Application metadata.
└── README.md        # This file.
```

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- A modern web browser that supports the Web Speech API (e.g., Google Chrome, Microsoft Edge).
- A Google Gemini API Key. You can obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

This project is set up to run directly in the browser without a complex build process.

1.  **Clone the repository (or download the files):**
    ```bash
    git clone https://github.com/your-username/kuber-ai.git
    cd kuber-ai
    ```

2.  **Configure API Key:**
    The application is designed to use an environment variable `process.env.API_KEY`. For local development without a build tool, you will need to replace this placeholder directly in the code.

    - Open `index.tsx`.
    - Find the line:
      ```javascript
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      ```
    - Replace `process.env.API_KEY` with your actual Gemini API key string:
      ```javascript
      const ai = new GoogleGenAI({ apiKey: "YOUR_GEMINI_API_KEY" });
      ```
    > **Important**: Never commit your API key to a public repository. This method is for local testing only. In a production environment, use a secure method to provide the key.

3.  **Run a Local Server:**
    Because the app uses ES modules, you need to serve the files from a local web server. A simple way to do this is with the `serve` package.

    - Install `serve` globally if you don't have it:
      ```bash
      npm install -g serve
      ```
    - Run the server from the project's root directory:
      ```bash
      serve .
      ```
    - The server will start and give you a local address, typically `http://localhost:3000`.

4.  **Open the App:**
    Open your web browser and navigate to the local address provided by the server. You may need to grant the site microphone permissions when you first use the voice input feature.
