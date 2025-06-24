import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

import { useState, useEffect } from "react";
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import axios from "axios";

export default function Chat({ onLogout }) {
    const [typing, setTyping] = useState(false);
    const [messages, setMessages] = useState([{}]);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [userId, setUserID] = useState(localStorage.getItem("userId"));
    const fetchMessages = async () => {
        try {
            if (!token || !userId) return;

            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND}messages`,
                // userId=${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const loadedMessages = response.data.map((msg) => ({
                message: msg.content,
                sender: msg.sender,
                direction: msg.sender === "user" ? "outgoing" : "incoming",
            }));

            setMessages(loadedMessages);
        } catch (err) {
            console.error("Failed to load messages:", err);
        }
    };
    useEffect(() => {
        fetchMessages();
    }, []);
    const SYSTEM_PROMPT = `
    You are a backend interpreter for an inventory chatbot.
    Your job is to extract the intent and relevant fields from user commands.
    Return a JSON object in this format:

    {
      "action": "add" | "update" | "delete" | "view" | "info",
      "name": "item name",
      "quantity": number (optional),
      "price": number (optional)
    }

    If the user input is invalid or unclear, return:
    { "action": "other" }

    don't return anything else, only a string starting with the opening brace of the dictionary "{"
    `;

    const handleSend = async (message) => {
        const newMessage = {
            message: message,
            sender: "user",
            direction: "outgoing",
        };

        const newMessages = [...messages, newMessage];
        setMessages(newMessages); // Update UI immediately
        try {
            // Step 1: Save the message in the backend
            await axios.post(
                process.env.REACT_APP_BACKEND + "messages",
                {
                    sender: "user",
                    content: message,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchMessages();
        } catch (err) {
            console.error("Error sending or reloading messages:", err);
        }

        // Optional: trigger bot response logic
        setTyping(true);
        processMessages(newMessages);
    };

    async function applySuitableRequests(object) {
        switch (object.action) {
            case "view":
                let inventories = [];

                try {
                    const invRes = await axios.get(
                        `${process.env.REACT_APP_BACKEND}inventory`,

                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    inventories = invRes.data.map((inv) => ({
                        role: "user",
                        content: `we have an inventory ${inv.name} with a price ${inv.price} and quantity ${inv.quantity}`,
                    }));

                    inventories = [
                        {
                            role: "system",
                            content: `You are a helpful assistant that summarizes inventory data for non-technical users. 
                            You'll be given all of the inventory items from the database agent. At the end, summarize the entire inventory 
                            in a short, friendly way, like you're explaining it to a store owner. Group similar items together if possible.
                            Do not list raw data, just give a helpful overview. 
                            Don't tell the owner any unnecessary information.
                            You may receive only one or two messages, or even nothing—so don't ask for more inventory items.`,
                        },
                        ...inventories,
                    ];

                    const llmRes = await axios.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        {
                            // model: "meta-llama/llama-4-maverick:free",
                            model: "deepseek/deepseek-chat-v3-0324:free",
                            messages: inventories,
                        },
                        {
                            headers: {
                                Authorization:
                                    "Bearer " + process.env.REACT_APP_LLM_KEY,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    setMessages((prev) => [
                        ...prev,
                        {
                            message: llmRes.data.choices[0].message.content,
                            sender: "bot",
                            direction: "incoming",
                        },
                    ]);
                } catch (error) {
                    console.error("Error in view action:", error);
                }

                break;

            default:
                break;
        }
    }
    async function processMessages(messages) {
        let apiMessages = messages.map((message) =>
            message.sender === "bot"
                ? { role: "assistant", content: message.message }
                : { role: "user", content: message.message }
        );

        apiMessages = [
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
            ...apiMessages,
        ];

        try {
            const res = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    model: "deepseek/deepseek-chat-v3-0324:free",
                    messages: apiMessages,
                },
                {
                    headers: {
                        Authorization:
                            "Bearer " + process.env.REACT_APP_LLM_KEY,
                        "Content-Type": "application/json",
                    },
                }
            );

            const parsed = JSON.parse(res.data.choices[0].message.content);
            // const parsed = {
            //     action: "view",
            //     name: "",
            //     quantity: null,
            //     price: null,
            // };
            await applySuitableRequests(parsed);
        } catch (error) {
            console.error("Error processing LLM message:", error);
        }
    }

    return (
        <div
            style={{
                position: "relative",
                height: "800px",
                width: "700px",
                margin: "auto",
            }}
        >
            <MainContainer>
                <ChatContainer>
                    <MessageList
                        scrollBehavior="smooth"
                        typingIndicator={
                            typing ? (
                                <TypingIndicator content="Typing .." />
                            ) : null
                        }
                    >
                        {messages.map((msg, i) => (
                            <Message key={i} model={msg}></Message>
                        ))}
                    </MessageList>
                    <MessageInput
                        attachButton={false}
                        placeholder="type message here ..."
                        onSend={handleSend}
                    ></MessageInput>
                </ChatContainer>
            </MainContainer>
            <button onClick={onLogout}>Logout</button>
        </div>
    );
}
