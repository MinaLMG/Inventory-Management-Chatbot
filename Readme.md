# 🧠 BotMan – Inventory Management Chatbot

Welcome to **BotMan**, a smart inventory management assistant built with React, Node.js, and MongoDB, integrated with OpenRouter AI for language processing.

> ✅ The chatbot is live at:  
> 🔗 **https://inventory-management-chatbot-7upj.vercel.app/**  
> ⚠️ Note: The live version has a limited API quota.

---

## 📦 Overview

BotMan helps you manage your inventory via natural language. Its main features include adding, viewing, updating, and deleting inventory items. It also supports general conversations when prompted, but inventory tasks are the focus.

**Stack used**:

-   Frontend: React
-   Backend: Node.js + Express
-   Database: MongoDB Atlas
-   LLM: OpenRouter AI

---

## ⚙️ Setup & Usage

### Clone the repo

```
git clone https://github.com/MinaLMG/Inventory-Management-Chatbot.git
cd Inventory-Management-Chatbot/Frontend
cd frontend
npm install
npm start
```

Create a .env in frontend/:
```
REACT_APP_BACKEND=https://inventory-management-chatbot-7upj.vercel.app/
REACT_APP_LLM_KEY=<your-llm-api-key>
```
Backend

```
cd backend
npm install
npm start
```

Create a .env in backend/:
```
MONGODB_URI=<your-mongodb-uri>
PORT=<your-port>
PASSWORD_HASH=<bcrypt-cost>
SECRET_KEY=<jwt-secret>
```
💡 You can skip local setup and use the live link above.

## 🏗️ Architecture

### Frontend

-   Login & registration pages
-   Chat interface where users communicate with BotMan

### Backend

-   Three main models: **User**, **Inventory**, **Message**
-   **Chat flow**:
    1. Frontend sends chat messages to the LLM
    2. If intent matches an inventory action → backend executes it and replies
    3. If unclear or general input → fallback to LLM response
-   **Authentication**: JWT-based
-   **Chat history**: Persisted via the `Message` model

---

## 🧾 Commands

### Supported Inventory Actions

-   View all inventory
-   View a specific item
-   Add an item
-   Update an item
-   Delete an item

### ✅ Successfully Tested User Inputs

-   "I want to know my inventory."
-   "Can you tell me about my inventory"
-   "Please add 8 bags to the inventory at price 15"
-   "What is my inventory now?"
-   "Add 6 nets each one with a cost 33.2"
-   "Show me the whole inventory again"
-   "Can you remove 'ball' item from inventory please?"
-   "Please update the price of bags to 20.4$"

> When commands are clear, BotMan performs the action based on the response of the LLM returned in tool_calls and replies using **frontend logic only**.  
> Ambiguous or conversational prompts are handled by the **LLM**.

---

## 🚀 Deployment

-   **Frontend**: Vercel
-   **Backend**: Vercel (serverless functions)
-   **Database**: MongoDB Atlas

### Deployment Flow

1. Push code to GitHub
2. Vercel builds both frontend and backend
3. Environment variables and CORS are configured
4. Backend connects to MongoDB Atlas using the connection URI
5. User interacts with live app at deployed URL

## 📘 Environment Variables Overview

### 🔧 Backend (`.env`)

-   `MONGODB_URI` – MongoDB connection string
-   `PORT` – Server port
-   `PASSWORD_HASH` – bcrypt salt rounds
-   `SECRET_KEY` – JWT secret

### ⚙️ Frontend (`.env`)

-   `REACT_APP_BACKEND` – API base URL (deployed or local)
-   `REACT_APP_LLM_KEY` – OpenRouter AI API key

---

## ✅ Next Steps

-   Expand the command list with edge‑case examples => that needs a smart LLM of course
-   Making it optional to have multiple cahts as one user
-   We may add to the site a part that is user-interactive without the need for an LLM to give the user more control far away from the LLMs(traditional websites)
