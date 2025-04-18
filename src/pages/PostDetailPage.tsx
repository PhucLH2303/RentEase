import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Carousel,
  Descriptions,
  Divider,
  Typography,
  Tag,
  Space,
  Button,
  Skeleton,
  Row,
  Col,
  Avatar,
  message,
  List,
  Empty
} from "antd";
import {
  HomeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  TagsOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  HeartOutlined,
  HeartFilled,
  ArrowRightOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import ChatPopup from "../component/chat/index"; // Adjust path if needed

const { Title, Paragraph, Text } = Typography;

interface PostDetail {
  postId: string;
  postCategoryId: number;
  posterId: string;
  aptId: string;
  title: string;
  rentPrice: number;
  pilePrice: number | null;
  totalSlot: number;
  currentSlot: number;
  genderId: number;
  oldId: number;
  note: string;
  moveInDate: string;
  moveOutDate: string;
  approveStatusId: number;
  startPublic: string | null;
  endPublic: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  status: boolean;
}

interface PosterDetail {
  accountId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  genderId: number | null;
  oldId: number | null;
  avatarUrl: string | null;
  roleId: number;
  isVerify: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  status: boolean;
}

interface ApartmentDetail {
  aptId: string;
  posterId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  name: string;
  area: number;
  address: string;
  addressLink: string;
  provinceId: number;
  districtId: number;
  wardId: number;
  aptCategoryId: number;
  aptStatusId: number;
  numberOfRoom: number;
  numberOfSlot: number;
  approveStatusId: number;
  note: string;
  rating: number;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  status: boolean;
}

interface ApartmentImages {
  aptId: string;
  images: {
    id: number;
    imageUrl: string;
    createAt: string;
    updateAt: string;
  }[];
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  count: number;
  currentPage: number;
  totalPages: number;
  data: T;
}

const categoryMap: Record<number, string> = {
  1: "Phòng ở ghép",
  2: "Tìm người ở ghép",
  3: "Cho thuê phòng/căn hộ",
};

const genderMap: Record<number, { text: string; color: string }> = {
  1: { text: "Nam", color: "blue" },
  2: { text: "Nữ", color: "pink" },
  3: { text: "Không yêu cầu", color: "green" },
};

const ageMap: Record<number, string> = {
  1: "18-25",
  2: "26-35",
  3: "36-45",
  4: "46+",
};

const approveStatusMap: Record<number, { text: string; color: string }> = {
  1: { text: "Đã phê duyệt", color: "green" },
  2: { text: "Chờ phê duyệt", color: "orange" },
  3: { text: "Từ chối", color: "red" },
};

const aptCategoryMap: Record<number, string> = {
  1: "Chung cư",
  2: "Nhà nguyên căn",
  3: "Nhà trọ",
  4: "Căn hộ dịch vụ",
};

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  const [posterDetail, setPosterDetail] = useState<PosterDetail | null>(null);
  const [apartmentDetail, setApartmentDetail] = useState<ApartmentDetail | null>(null);
  const [apartmentImages, setApartmentImages] = useState<ApartmentImages | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  
  // New state for related roommate posts
  const [relatedPosts, setRelatedPosts] = useState<PostDetail[]>([]);
  const [relatedPostsLoading, setRelatedPostsLoading] = useState<boolean>(false);
  const [chatVisible, setChatVisible] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!postId) {
        message.error("Mã bài đăng không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        const postResponse = await fetch(
          `https://renteasebe.io.vn/api/Post/GetById?id=${postId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!postResponse.ok) {
          throw new Error(`Failed to fetch post details: ${postResponse.status}`);
        }

        const postData: ApiResponse<PostDetail> = await postResponse.json();

        if (postData.statusCode === 200) {
          setPostDetail(postData.data);

          if (postData.data.posterId) {
            const posterResponse = await fetch(
              `https://renteasebe.io.vn/api/Accounts/GetById?id=${postData.data.posterId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!posterResponse.ok) {
              throw new Error(`Failed to fetch poster details: ${posterResponse.status}`);
            }

            const posterData: ApiResponse<PosterDetail> = await posterResponse.json();

            if (posterData.statusCode === 200) {
              setPosterDetail(posterData.data);
            } else {
              message.error("Không thể tải thông tin người đăng");
            }
          }

          if (postData.data.aptId) {
            const aptResponse = await fetch(
              `https://renteasebe.io.vn/api/Apt/GetById?aptId=${postData.data.aptId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!aptResponse.ok) {
              throw new Error(`Failed to fetch apartment details: ${aptResponse.status}`);
            }

            const aptData: ApiResponse<ApartmentDetail> = await aptResponse.json();

            if (aptData.statusCode === 200) {
              setApartmentDetail(aptData.data);

              const imagesResponse = await fetch(
                `https://renteasebe.io.vn/api/AptImage/GetByAptId?aptId=${postData.data.aptId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!imagesResponse.ok) {
                throw new Error(`Failed to fetch apartment images: ${imagesResponse.status}`);
              }

              const imagesData: ApiResponse<ApartmentImages> = await imagesResponse.json();

              if (imagesData.statusCode === 200) {
                setApartmentImages(imagesData.data);
              } else {
                message.error("Không thể tải hình ảnh căn hộ");
              }
              
              // Fetch related roommate posts if the post category is 1 (shared room)
              if (postData.data.postCategoryId === 1) {
                fetchRelatedRoommatePosts(postData.data.aptId);
              }
            } else {
              message.error("Không thể tải thông tin căn hộ");
            }
          }
          
          // Check if post is liked by current user

          await checkLikeStatus(postId, token);
        } else {
          message.error("Không thể tải thông tin bài đăng");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostDetails();
    } else {
      message.error("Không tìm thấy mã bài đăng");
      setLoading(false);
    }
  }, [postId]);
  
  // New function to fetch related roommate posts
  const fetchRelatedRoommatePosts = async (aptId: string) => {
    setRelatedPostsLoading(true);
    const token = localStorage.getItem("accessToken");
    
    try {
      const response = await fetch(
        `https://renteasebe.io.vn/api/Post/GetByAptIdAndPostCategoryId?aptId=${aptId}&postCategoryId=2&status=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const data: ApiResponse<PostDetail[]> = await response.json();
      
      if (data.statusCode === 200) {
        setRelatedPosts(data.data);
      } else {
        console.error("Failed to fetch related posts:", data.message);
      }
    } catch (error) {
      console.error("Error fetching related roommate posts:", error);
    } finally {
      setRelatedPostsLoading(false);
    }
  };
  
  // Placeholder for checking like status - implement according to your API

  const checkLikeStatus = async (postId: string, token: string | null) => {
    if (!token) {
      setIsLiked(false);
      return;
    }

    try {
      const response = await fetch(
        `https://renteasebe.io.vn/api/AccountLikedPost/Check-Like?postId=${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to check like status: ${response.status}`);
      }

      const data = await response.json();
      if (data.statusCode === 200) {
        setIsLiked(data.data);
      } else {
        setIsLiked(false);
      }
    } catch (error) {
      console.error("Error checking like status:", error);
      setIsLiked(false);
    }
  };

  const handleLikePost = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.warning("Vui lòng đăng nhập để lưu bài đăng yêu thích");
      return;
    }

    if (!postId) {
      message.error("Mã bài đăng không hợp lệ");
      return;
    }

    setLikeLoading(true);
    try {
      const response = await fetch(
        "https://renteasebe.io.vn/api/AccountLikedPost/Add-Like",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            postId: postId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to like post: ${response.status}`);
      }

      const data = await response.json();
      if (data.statusCode === 200) {
        setIsLiked(true);
        message.success("Đã thêm vào danh sách yêu thích");
      } else {
        message.error(data.message || "Không thể thêm vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      message.error("Đã xảy ra lỗi khi thêm vào yêu thích");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleUnlikePost = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token || !postId) {
      token
        ? message.error("Mã bài đăng không hợp lệ")
        : message.warning("Vui lòng đăng nhập để thực hiện");
      return;
    }

    setLikeLoading(true);
    try {
      const response = await fetch(
        `https://renteasebe.io.vn/api/AccountLikedPost/Remove-Like?postId=${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to unlike post: ${response.status}`);
      }

      const data = await response.json();
      if (data.statusCode === 200) {
        setIsLiked(false);
        message.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        message.error(data.message || "Không thể xóa khỏi danh sách yêu thích");
      }
    } catch (error) {
      console.error("Error unliking post:", error);
      message.error("Đã xảy ra lỗi khi xóa khỏi yêu thích");
    } finally {
      setLikeLoading(false);
    }
  };

  // Handle navigation to another post
  const navigateToPost = (postId: string) => {
    navigate(`/home/post/${postId}`);
  }
  const chatDirectly = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.warning("Vui lòng đăng nhập để trò chuyện");
      return;
    }

    if (!postDetail?.posterId) {
      message.error("Không tìm thấy thông tin người đăng để trò chuyện");
      return;
    }

    setChatVisible(false); // Reset state
    setConversationId(null);

    try {
      let conversationId: string | null = null;
      const conversationsResponse = await fetch(
        `https://renteasebe.io.vn/api/Conversation/GetAll?page=1&pageSize=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!conversationsResponse.ok) {
        console.warn("Failed to fetch conversations:", conversationsResponse.status);
      } else {
        const conversationsData: ApiResponse<
          { id: string; accountId1: string; accountId2: string; createdAt: string }[]
        > = await conversationsResponse.json();
        console.log("GET /api/Conversation/GetAll response:", conversationsData);

        if (conversationsData.statusCode === 200 && conversationsData.data) {
          const matchingConversation = conversationsData.data.find(
            (conv) =>
              conv.accountId1 === postDetail.posterId || conv.accountId2 === postDetail.posterId
          );
          if (matchingConversation) {
            conversationId = matchingConversation.id;
          }
        }
      }

      if (!conversationId) {
        const createResponse = await fetch("https://renteasebe.io.vn/api/Conversation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            accountIdReceive: postDetail.posterId,
          }),
        });

        if (!createResponse.ok) {
          throw new Error(`Failed to create conversation: ${createResponse.status}`);
        }

        const createData: ApiResponse<string> = await createResponse.json();
        console.log("POST /api/Conversation response:", createData);

        if (createData.statusCode === 200 && createData.data) {
          conversationId = createData.data;
        } else {
          message.error("Không thể tạo cuộc trò chuyện mới");
          return;
        }
      }

      if (conversationId) {
        console.log("Setting chat state - conversationId:", conversationId, "chatVisible: true");
        setConversationId(conversationId);
        setChatVisible(true);
      } else {
        message.error("Không thể khởi tạo cuộc trò chuyện");
      }
    } catch (error) {
      console.error("Error in chatDirectly:", error);
      message.error("Đã xảy ra lỗi khi mở trò chuyện");
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatPrice = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " VND";
  };

  const openMapsLink = () => {
    if (apartmentDetail?.addressLink) {
      window.open(apartmentDetail.addressLink, "_blank");
    } else if (apartmentDetail?.address) {
      const encodedAddress = encodeURIComponent(apartmentDetail.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
    } else {
      message.warning("Không có thông tin địa chỉ");
    }
  };

  const contactPoster = () => {
    if (posterDetail?.phoneNumber) {
      window.location.href = `tel:${posterDetail.phoneNumber}`;
    } else {
      message.warning("Không có thông tin số điện thoại");
    }
  };

  const emailPoster = () => {
    if (posterDetail?.email) {
      window.location.href = `mailto:${posterDetail.email}`;
    } else {
      message.warning("Không có thông tin email");
    }
  };

  const viewApartmentDetails = () => {
    if (postDetail?.aptId) {
      navigate(`/home/apartment/${postDetail.aptId}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton active avatar paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!postDetail) {
    return (
      <div className="p-6 text-center">
        <Title level={3}>Không tìm thấy thông tin bài đăng</Title>
        <Button type="primary" onClick={() => window.history.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  const imageBaseUrl = "https://renteasebe.io.vn";

  // Function to render the vacancy status with colors
  const renderVacancyStatus = (total: number, current: number) => {
    const remaining = Math.max(0, total - current);
    let color = "green";
    
    if (remaining === 0) {
      color = "red";
    } else if (remaining <= 1) {
      color = "orange";
    }
    
    return (
      <Tag color={color}>
        {remaining > 0 ? `Còn ${remaining} chỗ trống` : "Đã đủ người"}
      </Tag>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card bordered={false} className="mb-6 shadow">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Title level={2}>{postDetail.title}</Title>
            <Space className="mb-4">
              <Tag color="blue" icon={<TagsOutlined />}>
                {categoryMap[postDetail.postCategoryId] || "Không xác định"}
              </Tag>
              <Tag color={genderMap[postDetail.genderId]?.color || "blue"} icon={<UserOutlined />}>
                {genderMap[postDetail.genderId]?.text || "Không xác định"}
              </Tag>
              <Tag icon={<CalendarOutlined />}>
                Đăng ngày: {formatDate(postDetail.createdAt)}
              </Tag>
              {/* <Tag color={approveStatusMap[postDetail.approveStatusId]?.color || "blue"}>
                {approveStatusMap[postDetail.approveStatusId]?.text || "Không xác định"}
              </Tag> */}
            </Space>
            {apartmentDetail && (
              <Paragraph>
                <Space>
                  <EnvironmentOutlined />
                  <Text>{apartmentDetail.address}</Text>
                  <Button type="link" onClick={openMapsLink} size="small">
                    Xem bản đồ
                  </Button>
                </Space>
              </Paragraph>
            )}
            {postDetail.rentPrice > 0 && (
              <Paragraph>
                <Space>
                  <DollarOutlined />
                  <Text strong className="text-lg text-green-600">
                    {formatPrice(postDetail.rentPrice)}
                  </Text>
                </Space>
              </Paragraph>
            )}
          </Col>
          <Col xs={24} md={8} className="text-right">
            <Space direction="vertical" size="middle" className="w-full">
              <Card className="bg-gray-50">
                <div className="flex items-center mb-4">
                  <Avatar
                    size={64}
                    icon={<UserOutlined />}
                    src={posterDetail?.avatarUrl ? `${imageBaseUrl}${posterDetail.avatarUrl}` : undefined}
                  />
                  <div className="ml-4 text-left">
                    <Title level={4} className="m-0">
                      {posterDetail?.fullName || "Người đăng"}
                    </Title>
                    <Text type="secondary">
                      Tham gia: {posterDetail ? formatDate(posterDetail.createdAt) : ""}
                    </Text>
                  </div>
                </div>
                <Space>
                  <Button type="primary" icon={<PhoneOutlined />} onClick={contactPoster}>
                    Gọi điện
                  </Button>
                  <Button icon={<MailOutlined />} onClick={emailPoster}>
                    Email
                  </Button>
                  <Button
                    type={isLiked ? "default" : "primary"}
                    danger={isLiked}
                    icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
                    onClick={isLiked ? handleUnlikePost : handleLikePost}
                    loading={likeLoading}
                  >
                    {isLiked ? "Đã thích" : "Yêu thích"}
                  </Button>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card bordered={false} className="mb-6 shadow">
            {apartmentImages && apartmentImages.images.length > 0 ? (
              <Carousel autoplay className="mb-4">
                {apartmentImages.images.map((image) => (
                  <div key={image.id} className="h-96">
                    <img
                      src={`${imageBaseUrl}${image.imageUrl}`}
                      alt={`Hình ${image.id}`}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/800x600?text=Không+tải+được+hình";
                      }}
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="h-96 bg-gray-200 flex items-center justify-center rounded">
                <Text type="secondary">Không có hình ảnh</Text>
              </div>
            )}

            <Divider orientation="left">Thông tin bài đăng</Divider>

            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label={<><TeamOutlined /> Tổng số chỗ</>}>
                {postDetail.totalSlot} chỗ
              </Descriptions.Item>
              <Descriptions.Item label={<><TeamOutlined /> Số chỗ đã có</>}>
                {postDetail.currentSlot} chỗ
              </Descriptions.Item>
              <Descriptions.Item label={<><TeamOutlined /> Số chỗ còn trống</>}>
                {Math.max(0, postDetail.totalSlot - postDetail.currentSlot)} chỗ
              </Descriptions.Item>
              <Descriptions.Item label={<><UserOutlined /> Giới tính</>}>
                {genderMap[postDetail.genderId]?.text || "Không yêu cầu"}
              </Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined /> Ngày dọn vào</>}>
                {formatDate(postDetail.moveInDate)}
              </Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined /> Ngày dọn ra</>}>
                {formatDate(postDetail.moveOutDate)}
              </Descriptions.Item>
              <Descriptions.Item label={<><InfoCircleOutlined /> Độ tuổi</>}>
                {ageMap[postDetail.oldId] || "Không yêu cầu"}
              </Descriptions.Item>
              {postDetail.rentPrice > 0 && (
                <Descriptions.Item label={<><DollarOutlined /> Giá thuê</>}>
                  {formatPrice(postDetail.rentPrice)}
                </Descriptions.Item>
              )}
              {postDetail.pilePrice && postDetail.pilePrice > 0 && (
                <Descriptions.Item label={<><DollarOutlined /> Giá đặt cọc</>}>
                  {formatPrice(postDetail.pilePrice)}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider orientation="left">Mô tả</Divider>
            <Paragraph>{postDetail.note || "Không có mô tả chi tiết"}</Paragraph>
          </Card>

          {apartmentDetail && (
            <Card bordered={false} className="mb-6 shadow">
              <div className="flex justify-between items-center mb-4">
                <Title level={3}>Thông tin căn hộ</Title>
                <Button type="primary" onClick={viewApartmentDetails}>
                  Xem chi tiết căn hộ
                </Button>
              </div>

              <Divider />

              <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={<><HomeOutlined /> Tên căn hộ</>}>
                  {apartmentDetail.name}
                </Descriptions.Item>
                <Descriptions.Item label={<><HomeOutlined /> Loại</>}>
                  {aptCategoryMap[apartmentDetail.aptCategoryId] || "Không xác định"}
                </Descriptions.Item>
                <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>}>
                  {apartmentDetail.address}
                </Descriptions.Item>
                <Descriptions.Item label={<><TeamOutlined /> Số phòng</>}>
                  {apartmentDetail.numberOfRoom} phòng
                </Descriptions.Item>
                <Descriptions.Item label={<><TeamOutlined /> Sức chứa</>}>
                  {apartmentDetail.numberOfSlot} người
                </Descriptions.Item>
                <Descriptions.Item label={<><InfoCircleOutlined /> Diện tích</>}>
                  {apartmentDetail.area} m²
                </Descriptions.Item>
              </Descriptions>

              {apartmentDetail.note && (
                <>
                  <Divider orientation="left">Mô tả căn hộ</Divider>
                  <Paragraph className="line-clamp-3">{apartmentDetail.note}</Paragraph>
                </>
              )}
            </Card>
          )}

          {/* New section for related roommate posts - only shown for postCategoryId === 1 */}
          {postDetail.postCategoryId === 1 && (
            <Card bordered={false} className="mb-6 shadow">
              <Title level={3}>Bài đăng tìm người ở ghép cùng căn hộ</Title>
              <Divider />
              
              {relatedPostsLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : relatedPosts.length > 0 ? (
                <List
                  dataSource={relatedPosts}
                  itemLayout="vertical"
                  renderItem={item => (
                    <List.Item 
                      key={item.postId}
                      actions={[
                        <Button 
                          type="primary" 
                          onClick={() => navigateToPost(item.postId)}
                          icon={<ArrowRightOutlined />}
                        >
                          Xem chi tiết
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div className="flex items-center justify-between">
                            <Text strong>{item.title}</Text>
                            {renderVacancyStatus(item.totalSlot, item.currentSlot)}
                          </div>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <Space size="middle">
                              <Tag color={genderMap[item.genderId]?.color || "blue"}>
                                <UserOutlined /> {genderMap[item.genderId]?.text || "Không yêu cầu"}
                              </Tag>
                              <Tag color="purple">
                                <InfoCircleOutlined /> {ageMap[item.oldId] || "Không yêu cầu"}
                              </Tag>
                              <Text>
                                <CalendarOutlined /> Dọn vào: {formatDate(item.moveInDate)}
                              </Text>
                            </Space>
                            <Text className="line-clamp-2">{item.note}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description="Không có bài đăng tìm người ở ghép cho căn hộ này"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          )}
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} className="mb-6 shadow">
            <Title level={4}>Thông tin liên hệ</Title>
            <Descriptions column={1}>
              <Descriptions.Item label={<><UserOutlined /> Người đăng</>}>
                {posterDetail?.fullName || "Không có thông tin"}
              </Descriptions.Item>
              {posterDetail?.phoneNumber && (
                <Descriptions.Item label={<><PhoneOutlined /> Điện thoại</>}>
                  {posterDetail.phoneNumber}
                </Descriptions.Item>
              )}
              {posterDetail?.email && (
                <Descriptions.Item label={<><MailOutlined /> Email</>}>
                  {posterDetail.email}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Space direction="vertical" className="w-full">
              <Button type="primary" block size="large" onClick={contactPoster}>
                Liên hệ ngay
              </Button>
              <Button
                type="primary"
                block
                size="large"
                icon={<MessageOutlined />}
                onClick={chatDirectly}
              >
                Trò chuyện trực tiếp
              </Button>
              <Button
                block
                size="large"
                icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
                onClick={isLiked ? handleUnlikePost : handleLikePost}
                loading={likeLoading}
                danger={isLiked}
                type={isLiked ? "default" : "primary"}
              >
                {isLiked ? "Đã lưu vào yêu thích" : "Lưu vào yêu thích"}
              </Button>
            </Space>
          </Card>

          <Card bordered={false} className="mb-6 shadow">
            <Title level={4}>Thông tin phân loại</Title>
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between">
                <Text>Loại bài đăng:</Text>
                <Tag color="blue">{categoryMap[postDetail.postCategoryId] || "Không xác định"}</Tag>
              </div>
              <div className="flex justify-between">
                <Text>Giới tính:</Text>
                <Tag color={genderMap[postDetail.genderId]?.color || "blue"}>
                  {genderMap[postDetail.genderId]?.text || "Không yêu cầu"}
                </Tag>
              </div>
              <div className="flex justify-between">
                <Text>Độ tuổi:</Text>
                <Tag color="purple">{ageMap[postDetail.oldId] || "Không yêu cầu"}</Tag>
              </div>
              <div className="flex justify-between">
                <Text>Trạng thái:</Text>
                <Tag color={approveStatusMap[postDetail.approveStatusId]?.color || "blue"}>
                  {approveStatusMap[postDetail.approveStatusId]?.text || "Không xác định"}
                </Tag>
              </div>
            </Space>
          </Card>

          {/* Show vacancy status for current post */}
          <Card bordered={false} className="mb-6 shadow">
            <Title level={4}>Tình trạng chỗ ở</Title>
            <div className="flex items-center justify-between">
              <div><Text>Tổng số chỗ:</Text>
                <Text strong>{postDetail.totalSlot}</Text>
              </div>
              <div>
                <Text>Đã có:</Text>
                <Text strong>{postDetail.currentSlot}</Text>
              </div>
              <div>
                <Text>Còn trống:</Text>
                <Text strong>{Math.max(0, postDetail.totalSlot - postDetail.currentSlot)}</Text>
              </div>
            </div>
            <div className="mt-4">
              {renderVacancyStatus(postDetail.totalSlot, postDetail.currentSlot)}
              <Text className="ml-2">
                {Math.max(0, postDetail.totalSlot - postDetail.currentSlot) > 0 
                  ? "Còn nhận thêm người" 
                  : "Đã đủ người"}
              </Text>
            </div>
          </Card>

          {apartmentDetail && (
            <Card bordered={false} className="shadow">
              <Button
                type="primary"
                block
                size="large"
                onClick={viewApartmentDetails}
                icon={<HomeOutlined />}
              >
                Xem chi tiết căn hộ
              </Button>
            </Card>
          )}
        </Col>
      </Row>

      <ChatPopup
        visible={chatVisible}
        onClose={() => {
          setChatVisible(false);
          setConversationId(null);
          console.log("ChatPopup closed");
        }}
        conversationId={conversationId}
      />
    </div>
  );
};
export default PostDetailPage;