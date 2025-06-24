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
                        oldName: { type: "string" },
                        name: { type: "string" },
                        quantity: { type: "number" },
                        price: { type: "number" },
                    },
                    required: ["oldName"],
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
            const contextMessages = messages
                .slice(-6) // last 6 messages (user + bot)
                .map((msg) => ({
                    role: msg.sender === "user" ? "user" : "assistant",
                    content: msg.message,
                }));

            const finalMessages = [
                ...contextMessages,
                {
                    role: "user",
                    content: userMessage,
                },
            ];
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
                            Your name is BotMan.

                            Your job is to understand user requests and choose the most appropriate inventory-related tool to perform the action.
                            You have access to the following tools:
                            
                            - \`view_all_inventory\`: Use when the user asks to view the full list of inventory items.
                            - \`view_item\`: Use when the user asks about a specific item (e.g. "Show me details of the iPhone").
                            - \`add_item\`: Use when the user wants to add a new item with quantity and price.
                            - \`update_item\`: Use when the user wants to update an existing item's price and/or quantity or even its name, and take care to know which is the old and which the new.
                            - \`delete_item\`: Use when the user wants to remove an item from the inventory.
                            
                            Only call a tool if the user's message contains enough clear information to complete the action.
                            
                            If the request is ambiguous or missing data, respond with a message that politely asks for clarification.
                            
                            Important:
                            - Focus only on the most recent intent in the conversation.
                            - Ignore previously completed actions like "added item" or "deleted item" unless the user refers back to them.
                            - Extract numbers accurately (like quantity = 5, price = 1200).
                            - Assume price is in USD unless stated otherwise.
                            - Use the correct item name exactly as written by the user.
                            - Do NOT call any tool unless you're certain about all required parameters.
                            - try as possible to generate "finish_reason":"tool_calls" instead of "finish_reason":"stop",I don't want to see those staff after stopping:
                            =>  乳液<｜tool▁call▁begin｜>function<｜tool▁sep｜>add_item
                                json
                                {"name":"books","quantity":15,"price":13.2}
                            =>  Alice-Shot我需要将物品添加到库存中，但缺少数量信息。您提供价格为15美元，但未指明数量。请确认数量。
                            =>  涅槃<｜tool▁call▁begin｜>function<｜tool▁sep｜>add_item
                                json
                                {"name":"bags","quantity":8,"price":15}
                            they are rejected.

                            Keep replies short and helpful, like you're speaking to a store manager.
                            `.trim(),
                            //   You'll be provided with the last few messages at the messages stream, don't care for the previous messages to the current message unless
                        },
                        ...finalMessages,
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
            let res;
            switch (name) {
                case "view_all_inventory":
                    try {
                        res = await axios.get(
                            `${process.env.REACT_APP_BACKEND}inventory`,
                            config
                        );

                        if (res.data.length === 0) {
                            botMessage =
                                "You don't have any inventory at the moment.";
                        } else {
                            botMessage = res.data
                                .map(
                                    (item) =>
                                        `${item.name}: ${item.quantity} units at $${item.price}`
                                )
                                .join("\n");
                        }
                    } catch (error) {
                        botMessage =
                            error.response?.status === 500
                                ? "🚨 Server error while fetching inventory."
                                : "❌ Failed to retrieve your inventory.";
                    }
                    break;
                case "view_item":
                    try {
                        res = await axios.get(
                            `${process.env.REACT_APP_BACKEND}inventory/name/${args.name}`,
                            config
                        );
                        const item = res.data;
                        botMessage = `${item.name} - Quantity: ${item.quantity}, Price: $${item.price}`;
                    } catch (error) {
                        if (error.response?.status === 404) {
                            botMessage = `⚠️ No item named "${args.name}" found.`;
                        } else {
                            botMessage = "❌ Error retrieving the item.";
                        }
                    }
                    break;
                case "add_item":
                    try {
                        await axios.post(
                            `${process.env.REACT_APP_BACKEND}inventory`,
                            args,
                            config
                        );
                        botMessage = `✅ Added ${args.quantity} ${args.name} to inventory at $${args.price}.`;
                    } catch (error) {
                        if (error.response?.status === 400) {
                            const message =
                                error.response.data?.error || "Bad request.";
                            botMessage = `⚠️ Couldn't add item: ${message}`;
                        } else {
                            botMessage = "❌ Failed to add the item.";
                        }
                    }
                    break;
                case "update_item":
                    try {
                        // const getRes = await axios.get(
                        //     `${process.env.REACT_APP_BACKEND}inventory/name/${args.name}`,
                        //     config
                        // );
                        // const itemId = getRes.data._id;

                        await axios.put(
                            `${process.env.REACT_APP_BACKEND}inventory/name/${args.oldName}`,
                            args,
                            config
                        );
                        botMessage = `✅ Updated.`;
                    } catch (error) {
                        if (error.response?.status === 404) {
                            botMessage = `⚠️ Couldn't find "${args.name}" to update.`;
                        } else if (error.response?.status === 400) {
                            const msg =
                                error.response.data?.error || "Bad request.";
                            botMessage = `❌ Update failed: ${msg}`;
                        } else {
                            botMessage = "🚨 Unexpected error while updating.";
                        }
                    }
                    break;
                case "delete_item":
                    try {
                        await axios.delete(
                            `${process.env.REACT_APP_BACKEND}inventory/name/${args.name}`,
                            config
                        );
                        botMessage = `✅ Deleted ${args.name}.`;
                    } catch (error) {
                        if (error.response) {
                            const status = error.response.status;

                            if (status === 404) {
                                botMessage = `⚠️ I couldn't find an item named "${args.name}" to delete.`;
                            } else if (status === 400) {
                                botMessage = `❌ Invalid request. Please double-check the item name.`;
                            } else {
                                botMessage = `🚨 Something went wrong while deleting "${args.name}". Please try again later.`;
                            }
                        } else {
                            botMessage = `❌ No response from server. Check your internet connection.`;
                        }
                    }
                    break;
                default:
                    break;
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
