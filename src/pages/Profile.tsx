import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  Drawer, 
  List, 
  Spin, 
  Input, 
  Button, 
  Radio, 
  Badge, 
  Modal, 
  Card, 
  message,
  Empty 
} from "antd";
import { 
  SendOutlined, 
  MessageOutlined, 
  NotificationOutlined,
  ShoppingCartOutlined,
  PlusCircleOutlined
} from "@ant-design/icons";

interface Post {
  postId: string;
  title: string;
  note: string;
  moveInDate: string;
  moveOutDate: string;
  totalSlot: number;
  currentSlot: number;
  aptId: string;
  status: boolean;
}

interface AptImage {
  aptId: string;
  images: {
    id: number;
    imageUrl: string;
    createAt: string;
    updateAt: string;
  }[];
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

interface UserAccount {
  accountId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  genderId: number | null;
  oldId: number | null;
  avatarUrl: string | null;
  roleId: number;
  publicPostTimes: number;
  isVerify: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  status: boolean;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  count: number;
  currentPage: number;
  totalPages: number;
  data: T;
}

interface Package {
  id: string;
  name: string;
  note: string;
  times: number;
  days: number;
  amount: number;
  postCategoryId: number;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  status: null | boolean;
}

interface PaymentLink {
  orderRes: {
    orderId: string;
    orderTypeId: string;
    orderCode: string;
    postId: string | null;
    senderId: string;
    totalAmount: number;
    note: string;
    createdAt: string;
    paidAt: string | null;
    cancelledAt: string | null;
    paymentStatusId: number;
  };
  payosRes: {
    code: string;
    desc: string;
    data: {
      bin: string;
      accountNumber: string;
      accountName: string;
      amount: number;
      description: string;
      orderCode: number;
      currency: string;
      paymentLinkId: string;
      status: string;
      checkoutUrl: string;
      qrCode: string;
    };
    signature: string;
  };
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
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [aptImages, setAptImages] = useState<Record<string, string[]>>({});
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [loadingAccount, setLoadingAccount] = useState<boolean>(true);
  const [isPurchaseModalVisible, setIsPurchaseModalVisible] = useState<boolean>(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [creatingPayment, setCreatingPayment] = useState<boolean>(false);
  const [noPosts, setNoPosts] = useState<boolean>(false);

  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString && userString !== "undefined" ? JSON.parse(userString) : null;
  const accountId = user?.accountId;

  useEffect(() => {
    if (!token) {
      setError("Bạn cần đăng nhập để xem bài đăng!");
      setLoading(false);
      setLoadingAccount(false);
      return;
    }

    if (!accountId) {
      setError("Không thể tải bài đăng: ID tài khoản không hợp lệ!");
      setLoading(false);
      setLoadingAccount(false);
      return;
    }

    const fetchUserAccount = async () => {
      try {
        const response = await axios.get<ApiResponse<UserAccount>>(
          `https://renteasebe.io.vn/api/Accounts/GetById?id=${accountId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.statusCode === 200) {
          setUserAccount(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching user account info:", err);
      } finally {
        setLoadingAccount(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `https://renteasebe.io.vn/api/Post/GetByAccountId?accountId=${accountId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.statusCode === 404|| response.data.statusCode === 500) {
          // Handle the 404 case specifically - no posts found
          setNoPosts(true);
          setPosts([]);
        } else if (response.data.statusCode === 200 && response.data.data) {
          const fetchedPosts = response.data.data as Post[];
          setPosts(fetchedPosts);
          
          // Fetch images for each post
          fetchedPosts.forEach(post => {
            if (post.aptId) {
              fetchAptImages(post.aptId);
            }
          });
        } else {
          setPosts([]);
        }
      } catch (err: any) {
        console.error("Error fetching posts:", err);
        if (err.response && err.response.status === 404) {
          setNoPosts(true);
        } else {
          setError("Lỗi khi tải dữ liệu bài đăng!");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserAccount();
    fetchPosts();
  }, [token, accountId]);

  const fetchAptImages = async (aptId: string) => {
    try {
      const response = await axios.get<ApiResponse<AptImage>>(
        `https://renteasebe.io.vn/api/AptImage/GetByAptId?aptId=${aptId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.statusCode === 200 && response.data.data.images?.length > 0) {
        setAptImages(prev => ({
          ...prev,
          [aptId]: response.data.data.images.map(img => `https://renteasebe.io.vn${img.imageUrl}`)
        }));
      }
    } catch (err) {
      console.error(`Error fetching images for apt ${aptId}:`, err);
    }
  };

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

  // Function to show purchase modal and fetch packages
  const showPurchaseModal = async () => {
    setIsPurchaseModalVisible(true);
    setLoadingPackages(true);
    
    try {
      const response = await axios.get<ApiResponse<Package[]>>(
        "https://renteasebe.io.vn/api/OrderType/GetAll",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.statusCode === 200) {
        // Filter packages with postCategoryId == 1
        const filteredPackages = response.data.data.filter(pkg => pkg.postCategoryId === 1);
        // Sort packages by amount (price)
        filteredPackages.sort((a, b) => a.amount - b.amount);
        setPackages(filteredPackages);
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      message.error("Không thể tải danh sách gói đăng bài");
    } finally {
      setLoadingPackages(false);
    }
  };

  const closePurchaseModal = () => {
    setIsPurchaseModalVisible(false);
    setSelectedPackage(null);
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const createPaymentLink = async () => {
    if (!selectedPackage) {
      message.warning("Vui lòng chọn một gói đăng bài");
      return;
    }

    setCreatingPayment(true);
    try {
      const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
      
      const response = await axios.post<ApiResponse<PaymentLink>>(
        "https://renteasebe.io.vn/api/Payment/Create-Payment-Link",
        {
          orderTypeId: selectedPackage,
          note: `Pay:${selectedPkg?.name}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.statusCode === 200) {
        const checkoutUrl = response.data.data.payosRes.data.checkoutUrl;
        // Open the checkout URL in a new tab
        window.open(checkoutUrl, "_blank");
        closePurchaseModal();
        message.success("Đang chuyển đến trang thanh toán");
      } else {
        message.error("Không thể tạo link thanh toán");
      }
    } catch (err) {
      console.error("Error creating payment link:", err);
      message.error("Lỗi khi tạo liên kết thanh toán");
    } finally {
      setCreatingPayment(false);
    }
  };

  // Navigate to create post page
  const navigateToCreatePost = () => {
    window.location.href = "/home/post/create";
  };

  // Filter posts by status
  const filteredPosts = posts.filter((post) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active") return post.status === true;
    if (filterStatus === "archive") return post.status === false;
    return true;
  });

  const handleFilterChange = (e: any) => {
    setFilterStatus(e.target.value);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) return <p className="text-center text-gray-600">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Bài đăng của tôi</h2>
        <div className="flex items-center gap-4">
          {loadingAccount ? (
            <Spin size="small" />
          ) : userAccount && userAccount.roleId === 2 && (
            <>
              <Badge count={userAccount.publicPostTimes} overflowCount={99} color="#52c41a">
                <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-200">
                  <NotificationOutlined className="mr-1" />
                  <span>Lần đăng khả dụng</span>
                </div>
              </Badge>
              <Button 
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={showPurchaseModal}
                style={{ background: "#13c2c2", borderColor: "#13c2c2" }}
              >
                Mua thêm lượt
              </Button>
            </>
          )}
          <Button
            type="primary"
            icon={<MessageOutlined />}
            onClick={showDrawer}
            size="large"
          >
            Chat
          </Button>
        </div>
      </div>

      {/* Show filter only if we have posts */}
      {!noPosts && posts.length > 0 && (
        <div className="mb-4">
          <Radio.Group value={filterStatus} onChange={handleFilterChange} buttonStyle="solid">
            <Radio.Button value="all">Tất cả</Radio.Button>
            <Radio.Button value="active">Đang hoạt động</Radio.Button>
            <Radio.Button value="archive">Đã lưu trữ</Radio.Button>
          </Radio.Group>
        </div>
      )}

      {noPosts || posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Empty 
            description={
              <span className="text-gray-500 text-lg">
                Bạn chưa có bài đăng nào
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <div className="mt-8">
            {userAccount && userAccount.roleId === 2 && userAccount.publicPostTimes > 0 ? (
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusCircleOutlined />} 
                onClick={navigateToCreatePost}
              >
                Tạo bài đăng mới
              </Button>
            ) : userAccount && userAccount.roleId === 2 ? (
              <div className="space-y-4">
                <p className="text-yellow-600">Bạn đã hết lượt đăng bài, hãy mua thêm để tiếp tục!</p>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ShoppingCartOutlined />} 
                  onClick={showPurchaseModal}
                  style={{ background: "#13c2c2", borderColor: "#13c2c2" }}
                >
                  Mua lượt đăng bài
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">Hãy liên hệ với quản trị viên để được hỗ trợ</p>
            )}
          </div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-600 mt-4">Không có bài đăng nào phù hợp với bộ lọc.</p>
          {userAccount && userAccount.roleId === 2 && userAccount.publicPostTimes > 0 && (
            <Button 
              type="primary" 
              className="mt-4"
              icon={<PlusCircleOutlined />} 
              onClick={navigateToCreatePost}
            >
              Tạo bài đăng mới
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div 
              key={post.postId} 
              className={`bg-white border ${post.status ? 'border-green-300' : 'border-amber-300'} p-4 rounded-xl shadow-md hover:shadow-lg transition`}
            >
              {/* Image section */}
              <div className="mb-3 aspect-video rounded-lg overflow-hidden bg-gray-100">
                {aptImages[post.aptId] && aptImages[post.aptId].length > 0 ? (
                  <img 
                    src={aptImages[post.aptId][0]} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Không có ảnh
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{post.title}</h3>
                {post.status ? (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Đang hoạt động</span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">Đã lưu trữ</span>
                )}
              </div>
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
      )}

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

      {/* Purchase Modal */}
      <Modal
        title="Mua thêm lượt đăng bài"
        open={isPurchaseModalVisible}
        onCancel={closePurchaseModal}
        footer={[
          <Button key="cancel" onClick={closePurchaseModal}>
            Hủy
          </Button>,
          <Button 
            key="pay" 
            type="primary" 
            onClick={createPaymentLink} 
            loading={creatingPayment}
            disabled={!selectedPackage}
          >
            Tiến hành thanh toán
          </Button>
        ]}
        width={700}
      >
        {loadingPackages ? (
          <div className="text-center py-8">
            <Spin tip="Đang tải danh sách gói..." />
          </div>
        ) : (
          <>
            <p className="mb-4">Chọn gói đăng bài phù hợp với nhu cầu của bạn:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`cursor-pointer transition-all ${selectedPackage === pkg.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}
                  onClick={() => handlePackageSelect(pkg.id)}
                  style={{ 
                    borderWidth: selectedPackage === pkg.id ? '2px' : '1px',
                  }}
                  hoverable
                >
                  <div className="text-center">
                    <h3 className="text-lg font-bold">{pkg.name}</h3>
                    <p className="text-gray-500">{pkg.note}</p>
                    <div className="my-3">
                      <p className="text-blue-600 font-bold text-2xl">{formatPrice(pkg.amount)}</p>
                      <p className="text-green-600">{pkg.times} lượt đăng</p>
                      <p className="text-gray-500">Hiệu lực: {pkg.days} ngày</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PostList;