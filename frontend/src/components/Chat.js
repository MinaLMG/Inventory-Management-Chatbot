import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { useState } from "react";
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
// import { CohereClient } from "cohere-ai";

export default function Chat() {
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
    { "action": "unknown" }

    don't return anything else, only a string starting with the opening brace of the dictionary "{"
    `;

    const [typing, setTyping] = useState(false);
    const [messages, setMessages] = useState([
        {
            message: "hello, i'm chat gpt",
            sender: "gpt",
            direction: "incoming",
        },
    ]);
    const handleSend = async (message) => {
        const newMessage = {
            message: message,
            sender: "user",
            direction: "outgoing",
        };
        const newMessages = [...messages, newMessage];
        setMessages(newMessages);
        setTyping(true);
        processMessages(newMessages);
    };
    async function applySuitableRequests(object) {
        switch (object.action) {
            case "view":
                await fetch(process.env.REACT_APP_BACKEND + "inventory", {
                    method: "GET",
                })
                    .then((data) => {
                        console.log("data is ", data);

                        return data.json();
                    })
                    .then((res) => {
                        console.log("res is ", res);
                    });

                break;

            default:
                break;
        }
    }
    async function processMessages(messages) {
        let apiMessages = messages.map((message) => {
            if (message.sender === "gpt") {
                return {
                    role: "assistant",
                    content: message.message,
                };
            } else if (message.sender === "user") {
                return {
                    role: "user",
                    content: message.message,
                };
            }
        });
        apiMessages = [
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
            ...apiMessages,
        ];
        console.log(process.env.REACT_APP_LLM_KEY);
        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + process.env.REACT_APP_LLM_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "meta-llama/llama-4-maverick:free",
                    messages: apiMessages,
                }),
            }
        )
            .then((data) => {
                console.log("data is ", data);

                return data.json();
            })
            .then((res) => {
                console.log(
                    "res is ",
                    JSON.parse(res.choices[0].message.content)
                );
                applySuitableRequests(
                    JSON.parse(res.choices[0].message.content)
                );
            });
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
        </div>
    );
}
