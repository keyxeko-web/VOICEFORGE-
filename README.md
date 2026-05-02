# VoiceForge AI - Professional Text-to-Speech Platform

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://react.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> Transform text into natural, emotional speech with AI-powered voice synthesis. Clone voices, generate audio in 30+ languages.

![VoiceForge AI Dashboard](docs/screenshot.png)

## Features

- **Multi-Engine TTS**: Coqui TTS (XTTS v2), Piper TTS, Google Cloud, Azure Speech, AWS Polly
- **Voice Cloning**: Clone any voice from 1-5 minutes of audio samples
- **30+ Languages**: English, Vietnamese, Japanese, Korean, Chinese, French, German, Spanish, and more
- **Emotion Control**: Neutral, happy, sad, angry, excited, whisper, shouting
- **SSML Support**: Advanced speech markup for fine-grained control
- **Real-time Streaming**: Play audio while generating
- **Batch Processing**: Generate multiple audio files simultaneously
- **Voice Library**: Save, categorize, and manage custom voices
- **Projects**: Organize audio generations into project folders
- **REST API**: Full API with Swagger/OpenAPI documentation
- **Webhook Support**: Get notified when generation completes

## Architecture

```
voiceforge/
├── backend/                 # Python FastAPI Backend
│   ├── app/
│   │   ├── api/v1/          # API Routes (Auth, Voices, Generations, Projects)
│   │   ├── core/            # Config, Database, Security, Exceptions
│   │   ├── models/          # SQLAlchemy ORM Models
│   │   ├── schemas/         # Pydantic Validation Schemas
│   │   ├── services/        # TTS Engines & Audio Processing
│   │   │   ├── tts_base.py
│   │   │   ├── coqui_engine.py
│   │   │   ├── piper_engine.py
│   │   │   ├── google_engine.py
│   │   │   ├── azure_engine.py
│   │   │   ├── aws_engine.py
│   │   │   ├── engine_manager.py
│   │   │   └── audio_processor.py
│   │   └── tasks/           # Celery Background Tasks
│   ├── tests/               # Unit Tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                # Next.js + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── app/             # Next.js App Router Pages
│   │   ├── components/ui/   # shadcn/ui Components
│   │   ├── services/        # API Client
│   │   ├── store/           # Zustand State Management
│   │   └── types/           # TypeScript Types
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Full Stack Orchestration
└── README.md
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/your-org/voiceforge.git
cd voiceforge

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
# MinIO Console: http://localhost:9001 (minioadmin / minioadmin123)
```

### Option 2: Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install TTS engines (optional)
pip install TTS  # Coqui TTS
# Download Piper models to ./models/piper/

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Start Celery worker (in another terminal)
celery -A app.tasks.tts_tasks worker --loglevel=info
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

## API Documentation

### Authentication

```bash
# Register
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "username": "user123",
  "password": "securepassword"
}

# Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}
# Returns: { access_token, refresh_token, token_type, expires_in }
```

### Text-to-Speech

```bash
# Generate speech
POST /api/v1/generations
Authorization: Bearer <token>
{
  "text": "Hello, this is a test of VoiceForge AI.",
  "voice_id": "coqui_Craig Gutsy",
  "speed": 1.0,
  "pitch": 1.0,
  "volume": 1.0,
  "emotion": "happy",
  "language": "en",
  "audio_format": "mp3"
}

# Batch generation
POST /api/v1/generations/batch
{
  "texts": ["Text 1", "Text 2", "Text 3"],
  "voice_id": "coqui_Craig Gutsy",
  "language": "en"
}

# List generations
GET /api/v1/generations?page=1&status=completed

# Stream audio
GET /api/v1/generations/{id}/audio
```

### Voice Management

```bash
# List voices
GET /api/v1/voices?language=en&voice_type=system

# List system voices from all engines
GET /api/v1/voices/system

# Clone voice
POST /api/v1/voices/{id}/clone
Content-Type: multipart/form-data
{
  "name": "My Custom Voice",
  "language": "en",
  "sample_files": [audio_file.wav]
}
```

### Projects

```bash
# Create project
POST /api/v1/projects
{
  "name": "Audiobook Chapter 1",
  "description": "First chapter of my audiobook",
  "language": "en",
  "default_voice_id": "..."
}

# List projects
GET /api/v1/projects
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `STORAGE_TYPE` | Storage backend (local/s3/minio) | `local` |
| `SECRET_KEY` | JWT signing key | - |
| `GOOGLE_APPLICATION_CREDENTIALS` | Google Cloud credentials path | - |
| `AZURE_SPEECH_KEY` | Azure Speech API key | - |
| `AWS_ACCESS_KEY_ID` | AWS access key | - |

### Voice Cloning Setup

1. **Coqui TTS (Recommended)**:
   ```bash
   pip install TTS
   # Models auto-download on first use
   ```

2. **Piper TTS**:
   ```bash
   # Download models
   mkdir -p models/piper
   wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx
   wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json
   ```

## TTS Engine Comparison

| Engine | Speed | Quality | Voice Clone | Languages | Streaming |
|--------|-------|---------|-------------|-----------|-----------|
| Coqui XTTS v2 | Medium | Excellent | Yes | 17+ | No |
| Piper | Fast | Good | No | 30+ | Yes |
| Google Cloud | Fast | Excellent | No | 40+ | Yes |
| Azure Speech | Fast | Excellent | No | 140+ | Yes |
| AWS Polly | Fast | Good | No | 30+ | Yes |

## Performance Targets

- **Audio Generation**: < 3 seconds for text < 500 words
- **Concurrent Requests**: Horizontal scaling via multiple workers
- **Audio Quality**: 44.1kHz, 192kbps MP3 or lossless WAV
- **MOS Score Target**: > 4.0/5.0

## Security

- JWT token authentication with refresh tokens
- Rate limiting (60 req/min for free tier)
- Input sanitization and file upload validation
- HTTPS/TLS in production
- CORS configuration
- Optional audio watermarking

## Testing

```bash
# Run backend tests
cd backend
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html
```

## Deployment

### AWS

```bash
# Use ECS/Fargate for containers
# RDS for PostgreSQL
# ElastiCache for Redis
# S3 for audio storage
# CloudFront for CDN
```

### GCP

```bash
# Cloud Run for backend
# Cloud SQL for PostgreSQL
# Memorystore for Redis
# Cloud Storage for audio files
```

### Azure

```bash
# Container Instances / AKS
# Azure Database for PostgreSQL
# Azure Cache for Redis
# Azure Blob Storage
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- Documentation: [docs.voiceforge.ai](https://docs.voiceforge.ai)
- API Reference: [api.voiceforge.ai](https://api.voiceforge.ai)
- Issues: [GitHub Issues](https://github.com/your-org/voiceforge/issues)
- Email: support@voiceforge.ai

---

Built with ❤️ using FastAPI, React, and AI.
