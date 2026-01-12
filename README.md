
# 🧠 QMind - RAG AI Agent

> An event-driven AI Chatbot that "thinks" before it speaks. Features a custom RAG knowledge base, asynchronous job queues, and sub-second inference using Groq.

![AI Model](https://img.shields.io/badge/Model-Llama_3-blue?style=for-the-badge&logo=meta)
![Queue](https://img.shields.io/badge/Queue-BullMQ-red?style=for-the-badge&logo=redis)
![Speed](https://img.shields.io/badge/Inference-Groq_LPU-orange?style=for-the-badge&logo=fastapi)

---

## ⚡ System Architecture

Unlike standard chatbots that just hit an API, QMind uses a **Production-Grade Architecture**:

1.  **RAG Engine (Retrieval Augmented Generation):**
    * Uses **Redis** to store a custom "Knowledge Base" (documents/business data).
    * Before answering, the system scans Redis for relevant context and injects it into the System Prompt.
    * *Result:* The AI answers questions about *your* specific data, not just general knowledge.

2.  **Asynchronous Processing (BullMQ):**
    * Heavy AI requests are offloaded to a **Redis Queue** (`ai-queue`).
    * A dedicated worker processes requests in the background, preventing server blocking under high load.

3.  **Real-Time Streaming:**
    * **Socket.io** pushes the AI response chunk-by-chunk to the React frontend for a seamless "typing" experience.

---

## 🛠 Tech Stack

* **Brain:** Llama-3 (via Groq SDK)
* **Backend:** Node.js, Express
* **Orchestration:** BullMQ (Redis Queues)
* **Memory/Context:** Redis (RAG Storage)
* **Real-Time:** Socket.io
* **Frontend:** React, TailwindCSS, Lucide

---

## 🔌 Core Services

### 1. AI Service (`aiService.js`)
Handles the RAG logic. It retrieves relevant docs from Redis, constructs the prompt with context, and calls the Groq API.

### 2. Queue Service (`queueService.js`)
Decouples the request from the execution.
```javascript
// Example: Adding a job to the queue
export const addAIJob = async (jobData) => {
  const job = await aiQueue.add('process-ai-request', jobData);
  return job.id;
};

```

### 3. Ingestion Service (`ingestionService.js`)

Allows users to "feed" the AI new documents. These are stored in Redis and become immediately queryable by the RAG engine.

---

## 💻 Local Setup

1. **Clone & Install**
```bash
git clone [https://github.com/ImAryanPandey/QMind-AI.git](https://github.com/ImAryanPandey/QMind-AI.git)
cd backend && npm install
cd ../frontend && npm install

```


2. **Redis Setup**
Ensure you have a Redis instance running (Docker or Local).
```bash
docker run -d -p 6379:6379 redis

```


3. **Environment Variables (.env)**
```env
PORT=5000
GROQ_API_KEY=gsk_...
REDIS_HOST=localhost
REDIS_PORT=6379

```


4. **Run System**
```bash
# Terminal 1 (Backend + Worker)
npm run dev

# Terminal 2 (Frontend)
npm run dev

```



---

<div align="center">
<sub>Designed by <a href="https://github.com/ImAryanPandey">Aryan Pandey</a></sub>
</div>

