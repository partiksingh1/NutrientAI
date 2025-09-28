# Recommendation API Documentation

## Overview
The Recommendation API provides AI-powered nutrition advice and conversation management for the NutrientAI mobile app. The API uses the Prisma schema with proper relationships between User, Goal, Preferences, MealLog, Conversation, and Message models.

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get AI Recommendation
**POST** `/api/recommend/ai`

Sends a message to the AI nutrition assistant and receives a personalized response.

#### Request Body
```json
{
  "message": "What should I eat for breakfast?",
  "conversationId": 123  // Optional: Continue existing conversation
}
```

#### Response
```json
{
  "reply": "Based on your goals and preferences, here are some great breakfast options...",
  "conversationId": 123,
  "messageId": 456,
  "cached": false
}
```

#### Features
- **Personalized Context**: Uses user profile, goals, preferences, and meal history
- **Conversation Management**: Creates new conversations or continues existing ones
- **Caching**: Implements semantic caching for improved performance
- **Memory**: Maintains both short-term (database) and long-term (vector) memory
- **Mobile-Optimized**: Responses formatted for mobile UI with proper line breaks and emojis

### 2. Get User Conversations
**GET** `/api/recommend/conversations`

Retrieves all conversations for the authenticated user.

#### Response
```json
{
  "conversations": [
    {
      "id": 123,
      "title": "What should I eat for breakfast?",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:35:00Z",
      "messages": [
        {
          "content": "Based on your goals...",
          "senderRole": "AI",
          "createdAt": "2024-01-15T10:35:00Z"
        }
      ]
    }
  ]
}
```

### 3. Get Conversation Messages
**GET** `/api/recommend/conversations/:conversationId`

Retrieves all messages for a specific conversation.

#### Parameters
- `conversationId` (path): The ID of the conversation

#### Response
```json
{
  "conversation": {
    "id": 123,
    "title": "What should I eat for breakfast?",
    "messages": [
      {
        "id": 1,
        "senderRole": "USER",
        "content": "What should I eat for breakfast?",
        "createdAt": "2024-01-15T10:30:00Z",
        "metadata": {
          "timestamp": "2024-01-15T10:30:00Z"
        }
      },
      {
        "id": 2,
        "senderRole": "AI",
        "content": "Based on your goals...",
        "createdAt": "2024-01-15T10:30:05Z",
        "metadata": {
          "timestamp": "2024-01-15T10:30:05Z",
          "model": "nutrition-assistant",
          "cached": false
        }
      }
    ]
  }
}
```

### 4. Delete Conversation
**DELETE** `/api/recommend/conversations/:conversationId`

Deletes a specific conversation and all its messages.

#### Parameters
- `conversationId` (path): The ID of the conversation to delete

#### Response
```json
{
  "message": "Conversation deleted successfully"
}
```

## Data Models

### User Context
The AI assistant has access to:
- **User Profile**: Age, weight, height, gender, activity level
- **Goals**: Active dietary goals (muscle gain, fat loss, etc.)
- **Preferences**: Diet type, allergies, meal frequency
- **Meal History**: Today's logged meals with nutritional breakdown
- **Conversation History**: Recent and relevant past conversations

### Response Formatting
All AI responses are optimized for mobile display:
- Short, scannable paragraphs (2-3 lines max)
- Numbered lists (1. 2. 3.) or bullet points (-)
- **Bold** text for emphasis
- Strategic use of emojis (🍎 🥗 💪)
- Line breaks for readability

## Error Handling

### Common Error Responses
```json
// 400 Bad Request
{
  "error": "Missing userId or message"
}

// 401 Unauthorized
{
  "error": "User not authenticated"
}

// 404 Not Found
{
  "error": "User not found"
}

// 500 Internal Server Error
{
  "error": "Internal server error"
}
```

## Performance Features

### Caching
- **Semantic Caching**: Similar messages return cached responses
- **TTL**: 10-minute cache expiration
- **Hash-based Keys**: Efficient cache lookup

### Memory Management
- **Short-term Memory**: Recent conversation context from database
- **Long-term Memory**: Vector-based semantic search for relevant past conversations
- **Selective Storage**: Only meaningful conversations (>60 chars) are stored in vector memory

### Database Optimization
- **Selective Queries**: Only fetch required fields
- **Parallel Queries**: Multiple database calls executed concurrently
- **Proper Indexing**: Database indexes on userId and conversationId

## Implementation Notes

### Schema Relationships
- `User` → `Goal` (one-to-many)
- `User` → `Preferences` (one-to-one)
- `User` → `MealLog` (one-to-many)
- `User` → `Conversation` (one-to-many)
- `Conversation` → `Message` (one-to-many)

### Authentication Flow
1. JWT token extracted from Authorization header
2. Token verified and user ID extracted
3. User ID used for all database queries
4. Proper type conversion (Number) for Prisma queries

### AI Integration
- **LangChain**: LLM chain with custom prompt template
- **Retry Logic**: 2 attempts for LLM calls
- **Context Building**: Comprehensive user context for personalized responses
- **Vector Search**: Semantic similarity for relevant past conversations
