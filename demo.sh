#!/bin/bash
# VoiceForge AI - End-to-End Demo Script

set -e

echo "🎙️  VoiceForge AI - Demo Script"
echo "================================"

API_URL="http://localhost:8000/api/v1"

# 1. Health Check
echo -e "\n1️⃣  Checking API health..."
curl -s $API_URL/health | jq .

# 2. Register User
echo -e "\n2️⃣  Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@voiceforge.ai",
    "username": "demouser",
    "password": "demopassword123",
    "full_name": "Demo User"
  }')
echo $REGISTER_RESPONSE | jq .

# 3. Login
echo -e "\n3️⃣  Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo@voiceforge.ai&password=demopassword123")
echo $LOGIN_RESPONSE | jq .

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

# 4. Get Current User
echo -e "\n4️⃣  Getting user profile..."
curl -s "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 5. List System Voices
echo -e "\n5️⃣  Listing available voices..."
curl -s "$API_URL/voices/system" | jq '.items[:5]'

# 6. Create a Project
echo -e "\n6️⃣  Creating a project..."
PROJECT_RESPONSE=$(curl -s -X POST "$API_URL/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Project",
    "description": "Testing VoiceForge API",
    "language": "en"
  }')
echo $PROJECT_RESPONSE | jq .

PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.id')

# 7. Generate Speech
echo -e "\n7️⃣  Generating speech (this may take a moment)..."
GENERATION_RESPONSE=$(curl -s -X POST "$API_URL/generations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"Hello! This is a demonstration of VoiceForge AI text to speech capabilities.\",
    \"voice_id\": \"coqui_Craig Gutsy\",
    \"project_id\": \"$PROJECT_ID\",
    \"speed\": 1.0,
    \"pitch\": 1.0,
    \"emotion\": \"happy\",
    \"language\": \"en\",
    \"audio_format\": \"mp3\"
  }")
echo $GENERATION_RESPONSE | jq .

GENERATION_ID=$(echo $GENERATION_RESPONSE | jq -r '.id')

# 8. Check Generation Status
echo -e "\n8️⃣  Checking generation status..."
sleep 2
curl -s "$API_URL/generations/$GENERATION_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 9. List Recent Generations
echo -e "\n9️⃣  Listing recent generations..."
curl -s "$API_URL/generations?page=1" \
  -H "Authorization: Bearer $TOKEN" | jq '.items[:3]'

# 10. Batch Generation
echo -e "\n🔟  Batch generation..."
curl -s -X POST "$API_URL/generations/batch" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "texts": [
      "First sentence for batch processing.",
      "Second sentence with different content.",
      "Third and final sentence."
    ],
    "voice_id": "coqui_Craig Gutsy",
    "language": "en"
  }' | jq .

echo -e "\n✅ Demo completed successfully!"
echo "Visit http://localhost:3000 for the web interface"
echo "API documentation: http://localhost:8000/docs"
