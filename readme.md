# VizCoAssist

VizCoAssist is a powerful codebase analysis and architecture visualization tool that helps developers understand codebases through automated summaries and architecture diagrams.

## Features

- **Codebase Analysis**: Upload and analyze codebases to understand their structure and functionality
- **Code Summarization**: Generate concise summaries of individual files and the entire codebase
- **Architecture Visualization**: Create high-level and low-level architecture diagrams
- **Multi-format Support**: Generate diagrams in Mermaid and PlantUML formats
- **Session Management**: Support for concurrent sessions and asynchronous processing
- **Multiple File Formats**: Support for various file formats including source code, PDFs, and documents

## System Requirements

- Python 3.9+
- Chrome/Chromium browser (for rendering Mermaid diagrams)
- Java Runtime Environment (for PlantUML, if used)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/VizCoAssist.git
   cd VizCoAssist
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on the provided example:
   ```bash
   cp .env.example .env
   ```

5. Edit the `.env` file to configure your environment:
   - Set API keys for OpenAI and Anthropic (optional)
   - Configure LLM URL (default uses Ollama's local API)
   - Set desired diagram type and other preferences

## Running the Application

Start the FastAPI server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

For automatic API documentation, visit `http://localhost:8000/docs`.

## API Endpoints

### Upload Codebase
```
POST /upload
```
Upload a ZIP file containing your codebase. Returns a session ID for subsequent operations.

### Generate Architecture
```
POST /sessions/{session_id}/generatearchitecture?diagram_type=mermaid
```
Analyze the codebase and generate architecture diagrams. Supports `mermaid` and `plantuml` formats.

### Get Codebase Summary
```
GET /sessions/{session_id}/summary
```
Retrieve the summary of the entire codebase.

### Get File Summary
```
GET /sessions/{session_id}/filesummary?file_path=path/to/file.py
```
Retrieve the summary of a specific file in the codebase.

### Get Processed Files
```
GET /sessions/{session_id}/getfilesaccessed
```
Get a list of all files that have been processed in the session.

### Get Session Status
```
GET /sessions/{session_id}/status
```
Check the current status of a session.

## Directory Structure

```
VizCoAssist/
├── app/                 # Main application package
│   ├── main.py          # FastAPI application 
│   ├── config.py        # Configuration
│   ├── utils/           # Utility functions
│   ├── services/        # Core services
│   ├── readers/         # File readers
│   └── renderers/       # Diagram renderers
├── data/                # Data storage
│   ├── uploads/         # Uploaded ZIP files
│   ├── sessions/        # Session data
│   ├── output/          # Generated diagrams
│   └── cache/           # Cache data
├── tests/               # Test files
├── requirements.txt     # Project dependencies
└── .env.example         # Environment variables example
```

## Using Local LLM with Ollama

By default, VizCoAssist is configured to use [Ollama](https://ollama.ai/) as a local LLM provider. To set this up:

1. Install Ollama from [ollama.ai](https://ollama.ai/)
2. Run the Ollama server
3. Pull the models:
   ```bash
   ollama pull llama3.2:latest
   ```

## Using OpenAI or Anthropic

To use OpenAI or Anthropic for diagram generation:

1. Set your API keys in the `.env` file:
   ```
   OPENAI_API_KEY=sk-your-openai-key
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
   ```

## License

MIT License