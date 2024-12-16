import React, { useState, useRef, useEffect } from "react";
import { SendHorizonal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your farming assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await axios.post("http://localhost:5003/api/chat", {
        message: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.message },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble responding right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Inline styles for farming theme
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 4rem)",
      backgroundColor: "#e6f7e6", // Light green background
      fontFamily: "'Arial', sans-serif", // Simple, readable font
    },
    header: {
      padding: "1rem",
      borderBottom: "1px solid #ccc",
      backgroundColor: "#4a7c2a", // Dark green header
      color: "white",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "bold",
    },
    subtitle: {
      fontSize: "0.9rem",
      color: "#d1e7dd", // Light greenish text
    },
    scrollArea: {
      flex: 1,
      padding: "1rem",
      overflowY: "auto",
    },
    messageContainer: {
      display: "flex",
      gap: "0.5rem",
      marginBottom: "1rem",
    },
    userMessage: {
      backgroundColor: "#4a7c2a", // Dark green for user messages
      color: "white",
      borderRadius: "8px",
      padding: "0.5rem 1rem",
      maxWidth: "80%",
    },
    assistantMessage: {
      backgroundColor: "#f0f0f0", // Light gray for assistant messages
      color: "#333",
      borderRadius: "8px",
      padding: "0.5rem 1rem",
      maxWidth: "80%",
    },
    inputContainer: {
      padding: "1rem",
      borderTop: "1px solid #ccc",
      backgroundColor: "white",
    },
    input: {
      flex: 1,
      padding: "0.5rem",
      borderRadius: "4px",
      border: "1px solid #ccc",
      marginRight: "0.5rem",
    },
    button: {
      backgroundColor: "#4a7c2a", // Dark green button
      color: "white",
      border: "none",
      borderRadius: "4px",
      padding: "0.5rem 1rem",
      cursor: "pointer",
      transition: "background-color 0.3s",
    },
    buttonDisabled: {
      backgroundColor: "#ccc", color: "white",
      cursor: "not-allowed",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Farming Assistant</h1>
        <p style={styles.subtitle}>
          Ask questions about crops, farming techniques, and more
        </p>
      </div>

      <ScrollArea style={styles.scrollArea}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              style={styles.messageContainer}
              className={message.role === "user" ? "justify-end" : "justify-start"}
            >
              {message.role === "assistant" && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gray-900 text-white">
                    AI
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                style={message.role === "user" ? styles.userMessage : styles.assistantMessage}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gray-200">U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div style={styles.inputContainer}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about farming, crops, or agricultural practices..."
            style={styles.input}
            disabled={isLoading}
          />
          <Button type="submit" style={isLoading ? styles.buttonDisabled : styles.button} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;







//....

