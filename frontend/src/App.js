import "./App.css";
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
function App() {
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
    };
    return (
        <div className="App-header">
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
                            placeholder="type message here ..."
                            onSend={handleSend}
                        ></MessageInput>
                    </ChatContainer>
                </MainContainer>
            </div>
        </div>
    );
}

export default App;
