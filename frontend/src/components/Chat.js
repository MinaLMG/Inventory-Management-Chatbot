import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Chat2({ onLogout }) {
    const [typing, setTyping] = useState(false);
    const [messages, setMessages] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [userId, setUserId] = useState(localStorage.getItem("userId"));
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
    const addNewMessage = async (message) => {
        try {
            await axios.post(
                process.env.REACT_APP_BACKEND + "messages",
                {
                    sender: message.sender,
                    content: message.message,
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
    };
    const tools = [
        {
            type: "function",
            function: {
                name: "view_all_inventory",
                description: "Get a list of all inventory items",
                parameters: {
                    type: "object",
                    properties: {},
                    required: [],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "view_item",
                description: "Get details about a specific item",
                parameters: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                    },
                    required: ["name"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "add_item",
                description: "Add a new item",
                parameters: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        quantity: { type: "number" },
                        price: { type: "number" },
                    },
                    required: ["name", "quantity", "price"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "update_item",
                description: "Update item quantity or price",
                parameters: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        quantity: { type: "number" },
                        price: { type: "number" },
                    },
                    required: ["name"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "delete_item",
                description: "Delete an item",
                parameters: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                    },
                    required: ["name"],
                },
            },
        },
    ];

    const handleSend = async (userMessage) => {
        const newMessage = {
            message: userMessage,
            sender: "user",
            direction: "outgoing",
        };
        await addNewMessage(newMessage);
        // const updatedMessages = [...messages, newMessage];
        // setMessages(updatedMessages);
        setTyping(true);
        await processLLMToolCall(userMessage);
    };

    async function processLLMToolCall(userMessage) {
        try {
            const response = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    model: "deepseek/deepseek-chat-v3-0324:free",

                    // model: "meta-llama/llama-4-maverick:free",
                    messages: [
                        {
                            role: "system",
                            content: `
                            You are an intelligent assistant for managing a store's inventory system.
                            
                            Your job is to understand user requests and choose the most appropriate inventory-related tool to perform the action.
                            You have access to the following tools:
                            
                            - \`view_all_inventory\`: Use when the user asks to view the full list of inventory items.
                            - \`view_item\`: Use when the user asks about a specific item (e.g. "Show me details of the iPhone").
                            - \`add_item\`: Use when the user wants to add a new item with quantity and price.
                            - \`update_item\`: Use when the user wants to update an existing item's price and/or quantity.
                            - \`delete_item\`: Use when the user wants to remove an item from the inventory.
                            
                            Only call a tool if the user's message contains enough clear information to complete the action.
                            
                            If the request is ambiguous or missing data, respond with a message that politely asks for clarification.
                            
                            Important:
                            - Extract numbers accurately (like quantity = 5, price = 1200).
                            - Assume price is in USD unless stated otherwise.
                            - Use the correct item name exactly as written by the user.
                            - Do NOT call any tool unless you're certain about all required parameters.
                            
                            Keep replies short and helpful, like you're speaking to a store manager.
                            `.trim(),
                            //   You'll be provided with the last few messages at the messages stream, don't care for the previous messages to the current message unless
                        },
                        { role: "user", content: userMessage },
                    ],
                    tools: tools,
                    tool_choice: "auto",
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.REACT_APP_LLM_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const choice = response.data.choices[0];

            if (choice.finish_reason === "tool_calls") {
                const toolCall = choice.message.tool_calls[0];
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments);
                await executeTool(toolName, toolArgs);
            } else {
                const reply = choice.message.content;
                await addNewMessage({
                    message: reply,
                    sender: "bot",
                    direction: "incoming",
                });
                // setMessages((prev) => [
                //     ...prev,
                //     {
                //         message: reply,
                //         sender: "bot",
                //         direction: "incoming",
                //     },
                // ]);
            }
        } catch (err) {
            console.error("LLM Error:", err);
        }
        setTyping(false);
    }

    async function executeTool(name, args) {
        let botMessage = "";

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (name === "view_all_inventory") {
                const res = await axios.get(
                    `${process.env.REACT_APP_BACKEND}inventory`,
                    config
                );
                if (res.data.length == 0) {
                    botMessage = "You don't have any inventory at the moment";
                } else {
                    botMessage = res.data
                        .map(
                            (item) =>
                                `${item.name}: ${item.quantity} units at $${item.price}`
                        )
                        .join("\n");
                }
            } else if (name === "view_item") {
                const res = await axios.get(
                    `${process.env.REACT_APP_BACKEND}inventory/${args.name}`,
                    config
                );
                const item = res.data;
                botMessage = `${item.name} - Quantity: ${item.quantity}, Price: $${item.price}`;
            } else if (name === "add_item") {
                await axios.post(
                    `${process.env.REACT_APP_BACKEND}inventory`,
                    args,
                    config
                );
                botMessage = `Added ${args.name} to inventory.`;
            } else if (name === "update_item") {
                await axios.put(
                    `${process.env.REACT_APP_BACKEND}inventory/${args.name}`,
                    args,
                    config
                );
                botMessage = `Updated ${args.name}.`;
            } else if (name === "delete_item") {
                await axios.delete(
                    `${process.env.REACT_APP_BACKEND}inventory/${args.name}`,
                    config
                );
                botMessage = `Deleted ${args.name}.`;
            }
            await addNewMessage({
                message: botMessage,
                sender: "bot",
                direction: "incoming",
            });

            // setMessages((prev) => [
            //     ...prev,
            //     {
            //         message: botMessage,
            //         sender: "bot",
            //         direction: "incoming",
            //     },
            // ]);
        } catch (err) {
            console.error(`Tool '${name}' failed:`, err);
            setMessages((prev) => [
                ...prev,
                {
                    message: `Error performing '${name}' action.`,
                    sender: "bot",
                    direction: "incoming",
                },
            ]);
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
                                <TypingIndicator content="Typing..." />
                            ) : null
                        }
                    >
                        {messages.map((msg, i) => (
                            <Message key={i} model={msg} />
                        ))}
                    </MessageList>
                    <MessageInput
                        attachButton={false}
                        placeholder="Type message here..."
                        onSend={handleSend}
                    />
                </ChatContainer>
            </MainContainer>
            <button onClick={onLogout}>Logout</button>
        </div>
    );
}
