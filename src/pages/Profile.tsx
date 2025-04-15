import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Drawer, List, Spin, Input, Button } from "antd";
import { SendOutlined, MessageOutlined } from "@ant-design/icons";

interface Post {
  postId: string;
  title: string;
  note: string;
  moveInDate: string;
  moveOutDate: string;
  totalSlot: number;
  currentSlot: number;
}

interface Conversation {
  id: string;
  accountId1: string;
  accountId2: string;
  createdAt: string;
}

interface Message {
  id: number;
  conversationId: string;
  senderId: string;
  content: string;
  sentAt: string;
  isSeen: boolean;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  count: number;
  currentPage: number;
  totalPages: number;
  data: T;
}

const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationNames, setConversationNames] = useState<Record<string, string>>({});
  const [isMessageDrawerVisible, setIsMessageDrawerVisible] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);

  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString && userString !== "undefined" ? JSON.parse(userString) : null;
  const accountId = user?.accountId;

  useEffect(() => {
    if (!token) {
      setError("Bạn cần đăng nhập để xem bài đăng!");
      setLoading(false);
      return;
    }

    if (!accountId) {
      setError("Không thể tải bài đăng: ID tài khoản không hợp lệ!");
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `https://renteasebe.io.vn/api/Post/GetByAccountId?accountId=${accountId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPosts(response.data.data as Post[]);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Lỗi khi tải dữ liệu bài đăng!");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token, accountId]);

  const showDrawer = async () => {
    setIsDrawerVisible(true);

    try {
      const response = await axios.get<{ data: Conversation[] }>(
        `https://renteasebe.io.vn/api/Conversation/GetByAccountId?accountId=${accountId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const convos: Conversation[] = response.data.data;

      // Group conversations by the other account ID and select the most recent one
      const latestConvosMap: Record<string, Conversation> = {};
      convos.forEach((conv) => {
        const otherId = conv.accountId1 === accountId ? conv.accountId2 : conv.accountId1;
        if (
          !latestConvosMap[otherId] ||
          new Date(conv.createdAt) > new Date(latestConvosMap[otherId].createdAt)
        ) {
          latestConvosMap[otherId] = conv;
        }
      });

      // Convert the map to an array of conversations
      const filteredConvos = Object.values(latestConvosMap);
      setConversations(filteredConvos);

      // Fetch names for the other account IDs
      const otherAccountIds = filteredConvos.map((conv) =>
        conv.accountId1 === accountId ? conv.accountId2 : conv.accountId1
      );

      const nameResults: Record<string, string> = {};
      await Promise.all(
        otherAccountIds.map(async (id: string) => {
          try {
            const res = await axios.get<{ data: { fullName: string } }>(
              `https://renteasebe.io.vn/api/Accounts/GetById?id=${id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            nameResults[id] = res.data.data?.fullName || "Không rõ";
          } catch {
            nameResults[id] = "Không rõ";
          }
        })
      );

      setConversationNames(nameResults);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách cuộc trò chuyện", err);
      setConversations([]);
      setConversationNames({});
    }
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  const fetchMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const response = await axios.get<ApiResponse<Message[]>>(
        `https://renteasebe.io.vn/api/Message/GetByConversationId?conversationId=${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.statusCode === 200) {
        setMessages(response.data.data);
      } else {
        console.error("Failed to fetch messages:", response.data.message);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const showMessageDrawer = async (conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsMessageDrawerVisible(true);
    await fetchMessages(conversationId);
  };

  const closeMessageDrawer = () => {
    setIsMessageDrawerVisible(false);
    setActiveConversationId(null);
    setMessages([]);
    setNewMessage("");
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    if (!activeConversationId) {
      console.error("No active conversation ID");
      return;
    }

    setSending(true);
    try {
      const response = await axios.post<ApiResponse<Message>>(
        "https://renteasebe.io.vn/api/Message",
        {
          conversationId: activeConversationId,
          content: newMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.statusCode === 200) {
        setNewMessage("");
        await fetchMessages(activeConversationId); // Refresh messages
      } else {
        console.error("Failed to send message:", response.data.message);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (posts.length === 0) return <p className="text-center text-gray-600">Không tìm thấy bài đăng nào.</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Bài đăng của tôi</h2>
        <Button
          type="primary"
          icon={<MessageOutlined />}
          onClick={showDrawer}
          size="large"
        >
          Chat
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.postId} className="bg-white border border-gray-200 p-4 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{post.title}</h3>
            <p className="text-gray-600 text-sm truncate"><strong>Ghi chú:</strong> {post.note}</p>
            <p className="text-gray-700"><strong>Ngày vào:</strong> {post.moveInDate}</p>
            <p className="text-gray-700"><strong>Ngày ra:</strong> {post.moveOutDate}</p>
            <p className="text-blue-600 font-semibold"><strong>Còn chỗ:</strong> {post.totalSlot - post.currentSlot} / {post.totalSlot}</p>
            <div className="mt-4 flex justify-between items-center">
              <Link to={`/home/profile/${post.postId}`} className="text-blue-600 hover:underline">
                Xem chi tiết →
              </Link>
              {accountId && (
                <Link
                  to={`/home/profile/edit/${post.postId}`}
                  className="text-green-600 text-sm font-medium hover:underline"
                >
                  Chỉnh sửa
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Conversations Drawer */}
      <Drawer
        title="Danh sách cuộc trò chuyện"
        placement="right"
        onClose={closeDrawer}
        open={isDrawerVisible}
        width={300}
      >
        {conversations.length === 0 ? (
          <p className="text-gray-600">Không có cuộc trò chuyện nào.</p>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const otherId = conv.accountId1 === accountId ? conv.accountId2 : conv.accountId1;
              const name = conversationNames[otherId] || "Đang tải...";
              return (
                <div
                  key={conv.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-blue-50 transition cursor-pointer"
                  onClick={() => showMessageDrawer(conv.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center text-blue-500">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Drawer>

      {/* Messages Drawer */}
      <Drawer
        title="Tin nhắn"
        placement="right"
        onClose={closeMessageDrawer}
        open={isMessageDrawerVisible}
        width={400}
      >
        <div style={{ height: "calc(100% - 60px)", display: "flex", flexDirection: "column" }}>
          {messagesLoading ? (
            <Spin tip="Đang tải tin nhắn..." />
          ) : messages.length === 0 ? (
            <p className="text-gray-600">Chưa có tin nhắn nào.</p>
          ) : (
            <List
              dataSource={messages}
              renderItem={(item: Message) => (
                <List.Item
                  style={{
                    justifyContent: item.senderId === accountId ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: item.senderId === accountId ? "#1890ff" : "#f0f0f0",
                      color: item.senderId === accountId ? "white" : "black",
                    }}
                  >
                    {item.content}
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: "Chưa có tin nhắn" }}
              style={{ flex: 1, overflowY: "auto" }}
            />
          )}
          <div style={{ display: "flex", gap: "8px", padding: "8px 0" }}>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              onPressEnter={handleSendMessage}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={sending}
            >
              Gửi
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default PostList;