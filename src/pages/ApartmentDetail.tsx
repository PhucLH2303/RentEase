import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Card, 
  Carousel, 
  Descriptions, 
  Divider, 
  Typography, 
  Tag, 
  Space, 
  Button, 
  Rate, 
  Skeleton,
  Row,
  Col,
  message 
} from "antd";
import { 
  HomeOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined, 
  CalendarOutlined,
  AreaChartOutlined,
  TeamOutlined,
  TagsOutlined,
  InfoCircleOutlined,
  HeartOutlined,
  HeartFilled
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

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
  1: "Chung cư",
  2: "Nhà nguyên căn",
  3: "Nhà trọ",
  4: "Căn hộ dịch vụ"
};

const statusMap: Record<number, { text: string; color: string }> = {
  1: { text: "Đang cho thuê", color: "green" },
  2: { text: "Đã cho thuê", color: "orange" },
  3: { text: "Ngừng cho thuê", color: "red" }
};

const ApartmentDetailPage: React.FC = () => {
  const { aptId } = useParams<{ aptId: string }>();
  const [apartmentDetail, setApartmentDetail] = useState<ApartmentDetail | null>(null);
  const [apartmentImages, setApartmentImages] = useState<ApartmentImages | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchApartmentDetails = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      // Sửa lỗi: Kiểm tra aptId trước khi sử dụng
      if (!aptId) {
        message.error("Mã căn hộ không hợp lệ");
        setLoading(false);
        return;
      }
  
      try {
        // Fetch apartment details
        const detailResponse = await fetch(
          `https://renteasebe.io.vn/api/Apt/GetById?aptId=${aptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const detailData: ApiResponse<ApartmentDetail> = await detailResponse.json();
  
        // Fetch apartment images
        const imagesResponse = await fetch(
          `https://renteasebe.io.vn/api/AptImage/GetByAptId?aptId=${aptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const imagesData: ApiResponse<ApartmentImages> = await imagesResponse.json();
  
        if (detailData.statusCode === 200) {
          setApartmentDetail(detailData.data);
        } else {
          message.error("Không thể tải thông tin căn hộ");
        }
  
        if (imagesData.statusCode === 200) {
          setApartmentImages(imagesData.data);
        } else {
          message.error("Không thể tải hình ảnh căn hộ");
        }

        // Check if apartment is liked by current user
        await checkLikeStatus(aptId, token);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
  
    if (aptId) {
      fetchApartmentDetails();
    } else {
      message.error("Không tìm thấy mã căn hộ");
      setLoading(false);
    }
  }, [aptId]);
  
  // Function to check if user has liked this apartment
  const checkLikeStatus = async (aptId: string, token: string | null) => {
    try {
      // This is an example, you may need to implement the actual API endpoint
      // to check if an apartment is liked by the current user
      const response = await fetch(
        `https://renteasebe.io.vn/api/AccountLikedApt/Check-Like?aptId=${aptId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();
      if (data.statusCode === 200) {
        setIsLiked(data.data);
      }
    } catch (error) {
      console.error("Error checking like status:", error);
      // If the endpoint doesn't exist, we can default to not liked
      setIsLiked(false);
    }
  };

  const handleLikeApartment = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.warning("Vui lòng đăng nhập để lưu căn hộ yêu thích");
      return;
    }

    // Sửa lỗi: Kiểm tra aptId trước khi sử dụng
    if (!aptId) {
      message.error("Mã căn hộ không hợp lệ");
      return;
    }

    setLikeLoading(true);
    try {
      const response = await fetch(
        "https://renteasebe.io.vn/api/AccountLikedApt/Add-Like",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            aptId: aptId
          }),
        }
      );

      const data = await response.json();
      if (data.statusCode === 200) {
        setIsLiked(true);
        message.success("Đã thêm vào danh sách yêu thích");
      } else {
        message.error(data.message || "Không thể thêm vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Error liking apartment:", error);
      message.error("Đã xảy ra lỗi khi thêm vào yêu thích");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleUnlikeApartment = async () => {
    const token = localStorage.getItem("accessToken");
    
    // Sửa lỗi: Kiểm tra aptId trước khi sử dụng
    if (!token || !aptId) {
      token ? message.error("Mã căn hộ không hợp lệ") : message.warning("Vui lòng đăng nhập để thực hiện");
      return;
    }

    setLikeLoading(true);
    try {
      // This assumes there's an API endpoint to remove a liked apartment
      const response = await fetch(
        `https://renteasebe.io.vn/api/AccountLikedApt/Remove-Like?aptId=${aptId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.statusCode === 200) {
        setIsLiked(false);
        message.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        message.error(data.message || "Không thể xóa khỏi danh sách yêu thích");
      }
    } catch (error) {
      console.error("Error unliking apartment:", error);
      message.error("Đã xảy ra lỗi khi xóa khỏi yêu thích");
    } finally {
      setLikeLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const openMapsLink = () => {
    if (apartmentDetail?.addressLink) {
      window.open(apartmentDetail.addressLink, "_blank");
    }
  };

  const contactOwner = () => {
    if (apartmentDetail?.ownerPhone) {
      window.location.href = `tel:${apartmentDetail.ownerPhone}`;
    }
  };

  const emailOwner = () => {
    if (apartmentDetail?.ownerEmail) {
      window.location.href = `mailto:${apartmentDetail.ownerEmail}`;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton active avatar paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!apartmentDetail) {
    return (
      <div className="p-6 text-center">
        <Title level={3}>Không tìm thấy thông tin căn hộ</Title>
        <Button type="primary" onClick={() => window.history.back()}>Quay lại</Button>
      </div>
    );
  }

  const imageBaseUrl = "https://renteasebe.io.vn";

  return (
    <div className="container mx-auto p-4">
      <Card bordered={false} className="mb-6 shadow">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Title level={2}>{apartmentDetail.name}</Title>
            <Space className="mb-4">
              <Tag color={statusMap[apartmentDetail.aptStatusId]?.color || "blue"} icon={<TagsOutlined />}>
                {statusMap[apartmentDetail.aptStatusId]?.text || "Không xác định"}
              </Tag>
              <Tag color="blue" icon={<HomeOutlined />}>
                {categoryMap[apartmentDetail.aptCategoryId] || "Không xác định"}
              </Tag>
              <Tag icon={<CalendarOutlined />}>
                Đăng ngày: {formatDate(apartmentDetail.createdAt)}
              </Tag>
            </Space>
            <Paragraph>
              <Space>
                <EnvironmentOutlined />
                <Text>{apartmentDetail.address}</Text>
                <Button type="link" onClick={openMapsLink} size="small">
                  Xem bản đồ
                </Button>
              </Space>
            </Paragraph>
          </Col>
          <Col xs={24} md={8} className="text-right">
            <Space direction="vertical" size="middle" className="w-full">
              <Card className="bg-gray-50">
                <Title level={4}>Liên hệ chủ nhà</Title>
                <Paragraph>
                  <UserOutlined /> {apartmentDetail.ownerName}
                </Paragraph>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PhoneOutlined />} 
                    onClick={contactOwner}
                  >
                    Gọi điện
                  </Button>
                  <Button 
                    icon={<MailOutlined />} 
                    onClick={emailOwner}
                  >
                    Email
                  </Button>
                  <Button
                    type={isLiked ? "default" : "primary"}
                    danger={isLiked}
                    icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
                    onClick={isLiked ? handleUnlikeApartment : handleLikeApartment}
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
                      alt={`${apartmentDetail.name} - Hình ${image.id}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="h-96 bg-gray-200 flex items-center justify-center rounded">
                <Text type="secondary">Không có hình ảnh</Text>
              </div>
            )}

            <Divider orientation="left">Thông tin chi tiết</Divider>
            
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label={<><AreaChartOutlined /> Diện tích</>}>
                {apartmentDetail.area} m²
              </Descriptions.Item>
              <Descriptions.Item label={<><HomeOutlined /> Số phòng</>}>
                {apartmentDetail.numberOfRoom} phòng
              </Descriptions.Item>
              <Descriptions.Item label={<><TeamOutlined /> Số chỗ ở</>}>
                {apartmentDetail.numberOfSlot} chỗ
              </Descriptions.Item>
              <Descriptions.Item label={<><InfoCircleOutlined /> Loại căn hộ</>}>
                {categoryMap[apartmentDetail.aptCategoryId] || "Không xác định"}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Mô tả</Divider>
            <Paragraph>{apartmentDetail.note}</Paragraph>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} className="mb-6 shadow">
            <div className="flex justify-between items-center mb-2">
              <Title level={4} className="m-0">Đánh giá</Title>
              <Button
                type={isLiked ? "primary" : "default"}
                danger={isLiked}
                icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
                onClick={isLiked ? handleUnlikeApartment : handleLikeApartment}
                loading={likeLoading}
              >
                {isLiked ? "Đã thích" : "Yêu thích"}
              </Button>
            </div>
            <div className="flex items-center">
              <Rate disabled defaultValue={apartmentDetail.rating || 0} />
              <Text className="ml-2">{apartmentDetail.rating || 0}/5</Text>
            </div>
          </Card>

          <Card bordered={false} className="mb-6 shadow">
            <Title level={4}>Thông tin liên hệ</Title>
            <Descriptions column={1}>
              <Descriptions.Item label={<><UserOutlined /> Chủ nhà</>}>
                {apartmentDetail.ownerName}
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Điện thoại</>}>
                {apartmentDetail.ownerPhone}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {apartmentDetail.ownerEmail}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card bordered={false} className="shadow">
            <Space direction="vertical" className="w-full">
              <Button type="primary" block size="large" onClick={contactOwner}>
                Liên hệ ngay
              </Button>
              <Button 
                block 
                size="large" 
                icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
                onClick={isLiked ? handleUnlikeApartment : handleLikeApartment}
                loading={likeLoading}
                danger={isLiked}
                type={isLiked ? "default" : "primary"}
              >
                {isLiked ? "Đã lưu vào yêu thích" : "Lưu vào yêu thích"}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ApartmentDetailPage;