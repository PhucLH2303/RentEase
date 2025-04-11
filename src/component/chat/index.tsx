import React, { useState, useEffect } from "react";
import { Drawer, Input, Button, message, List, Spin } from "antd";
import { SendOutlined } from "@ant-design/icons";

interface Message {
    id: number;
    conversationId: string;
    senderId: string;
    content: string;
    sentAt: string;
    isSeen: boolean;
}

interface Conversation {
    id: string;
    accountId1: string;
    accountId2: string;
    createdAt: string;
}

interface ApiResponse<T> {
    statusCode: number;
    message: string;
    count: number;
    currentPage: number;
    totalPages: number;
    data: T;
}

interface ChatPopupProps {
    visible: boolean;
    onClose: () => void;
    conversationId: string | null; // Updated to allow null
}

const ChatPopup: React.FC<ChatPopupProps> = ({ visible, onClose, conversationId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [sending, setSending] = useState<boolean>(false);
    const [accountId2, setAccountId2] = useState<string | null>(null);

    const token = localStorage.getItem("accessToken");
    const userString = localStorage.getItem("user");
    const user = userString && userString !== "undefined" ? JSON.parse(userString) : null;
    const accountId = user?.accountId;

    useEffect(() => {
        if (visible && conversationId && token) {
            fetchConversationDetails();
            fetchMessages();
        } else if (visible && !conversationId) {
            message.error("Không có ID cuộc trò chuyện để tải tin nhắn");
        }
    }, [visible, conversationId, token]);

    const fetchConversationDetails = async () => {
        if (!conversationId) return; // Additional safeguard

        try {
            const response = await fetch(
                `https://renteasebe.io.vn/api/Conversation/GetById?id=${conversationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data: ApiResponse<Conversation> = await response.json();
            console.log("GET /api/Conversation/GetById response:", data);
            if (data.statusCode === 200) {
                const conversation = data.data;
                const otherAccountId =
                    conversation.accountId1 === accountId
                        ? conversation.accountId2
                        : conversation.accountId1;
                setAccountId2(otherAccountId);
            } else {
                message.error("Không thể tải thông tin cuộc trò chuyện");
            }
        } catch (error) {
            console.error("Error fetching conversation details:", error);
            message.error("Đã xảy ra lỗi khi tải thông tin cuộc trò chuyện");
        }
    };

    const fetchMessages = async () => {
        if (!conversationId) return; // Additional safeguard

        setLoading(true);
        try {
            const response = await fetch(
                `https://renteasebe.io.vn/api/Message/GetByConversationId?conversationId=${conversationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data: ApiResponse<Message[]> = await response.json();
            console.log("GET /api/Message/GetByConversationId response:", data);
            if (data.statusCode === 200) {
                setMessages(data.data);
            } else {
                message.error("Không thể tải tin nhắn");
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            message.error("Đã xảy ra lỗi khi tải tin nhắn");
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) {
            message.warning("Vui lòng nhập tin nhắn");
            return;
        }

        if (!conversationId) {
            message.error("Không có ID cuộc trò chuyện để gửi tin nhắn");
            return;
        }

        setSending(true);
        try {
            const response = await fetch("https://renteasebe.io.vn/api/Message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    conversationId: conversationId,
                    content: newMessage,
                }),
            });
            const data: ApiResponse<Message> = await response.json();
            console.log("POST /api/Message response:", data);
            if (data.statusCode === 200) {
                setNewMessage("");
                await fetchMessages(); // Refresh messages after sending
            } else {
                message.error(data.message || "Không thể gửi tin nhắn");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            message.error("Đã xảy ra lỗi khi gửi tin nhắn");
        } finally {
            setSending(false);
        }
    };

    return (
        <Drawer
            title="Tin nhắn"
            placement="right"
            onClose={onClose}
            open={visible}
            width={400}
            zIndex={1000}
        >
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {loading ? (
                    <Spin tip="Đang tải cuộc trò chuyện..." />
                ) : (
                    <>
                        <List
                            dataSource={messages}
                            renderItem={(item: Message) => (
                                <List.Item
                                    style={{
                                        justifyContent:
                                            item.senderId === accountId ? "flex-end" : "flex-start",
                                        padding: "4px 8px",
                                    }}
                                >
                                    <div
                                        style={{
                                            maxWidth: "70%",
                                            padding: "6px 10px",
                                            borderRadius: "12px",
                                            background:
                                                item.senderId === accountId
                                                    ? "#1890ff"
                                                    : item.senderId === accountId2
                                                        ? "white"
                                                        : "#f0f0f0",
                                            color: item.senderId === accountId ? "white" : "black",
                                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                                        }}
                                    >
                                        {item.content}
                                    </div>
                                </List.Item>
                            )}
                            locale={{ emptyText: "Chưa có tin nhắn" }}
                            style={{ flex: 1, overflowY: "auto" }}
                        />
                        <div style={{ display: "flex", gap: "8px", padding: "8px 0", alignItems: "center" }}>
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                onPressEnter={handleSendMessage}
                                style={{
                                    borderRadius: "20px",
                                    padding: "6px 12px",
                                }}
                            />
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<SendOutlined />}
                                onClick={handleSendMessage}
                                loading={sending}
                                style={{
                                    background: "#1890ff",
                                    borderColor: "#1890ff",
                                    width: "36px",
                                    height: "36px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
        </Drawer>
    );
};

export default ChatPopup;