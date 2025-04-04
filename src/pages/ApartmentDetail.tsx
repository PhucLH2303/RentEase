import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  Carousel, 
  Descriptions, 
  Button,  
  Avatar, 
  Divider, 
  Row, 
  Col,
  Modal,
  Rate,
  Tabs,
  notification,
  Skeleton,
  Result
} from "antd";
import {
  HomeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MessageOutlined,
  HeartOutlined,
  CalendarOutlined,
  WifiOutlined,
  SafetyOutlined,
  CarOutlined,
  KeyOutlined,
  UserOutlined,
  FieldTimeOutlined,
  AreaChartOutlined,
  BankOutlined,
  TeamOutlined
} from "@ant-design/icons";
import axios from "axios";

const { TabPane } = Tabs;

interface ApartmentData {
  aptId: string;
  posterId: string;
  ownerName: string;
  ownerPhone: string | null;
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

interface ImageData {
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

const ApartmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [apartment, setApartment] = useState<ApartmentData | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const API_BASE_URL = "https://renteasebe.io.vn";

  useEffect(() => {
    const fetchApartmentData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/", { state: { from: `/apartment/${id}` } });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const baseUrl = API_BASE_URL;

        // Fetch apartment details
        const apartmentResponse = await axios.get<ApiResponse<ApartmentData>>(
          `${baseUrl}/api/Apt/GetById?aptId=${id}`,
          { headers }
        );
        
        setApartment(apartmentResponse.data.data);

        // Fetch apartment images
        try {
          const imagesResponse = await axios.get<ApiResponse<ImageData>>(
            `${baseUrl}/api/AptImage/GetByAptId?aptId=${id}`,
            { headers }
          );
          
          const imageData = imagesResponse.data.data;
          if (imageData && imageData.images && imageData.images.length > 0) {
            const imageUrls = imageData.images.map(img => `${baseUrl}${img.imageUrl}`);
            setImages(imageUrls);
          } else {
            // Default images if no images available
            setImages([
              "https://noithatmanhhe.vn/media/29426/decor-phong-tro-12m2-dep-tien-nghi.jpg",
              "https://www.tapdoantrananh.com.vn/uploads/files/2020/11/09/nha-tro-gac-lung-dep-8.jpg"
            ]);
          }
        } catch (imgError) {
          console.error("Failed to fetch apartment images:", imgError);
          setImages([
            "https://noithatmanhhe.vn/media/29426/decor-phong-tro-12m2-dep-tien-nghi.jpg",
            "https://www.tapdoantrananh.com.vn/uploads/files/2020/11/09/nha-tro-gac-lung-dep-8.jpg"
          ]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to load apartment data: ${errorMessage}`);
        notification.error({
          message: "Error loading apartment data",
          description: errorMessage,
          placement: "topRight",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApartmentData();
    }
  }, [id, navigate]);

  const showPhoneNumber = () => {
    setIsPhoneVisible(true);
  };

  const showImageModal = (image: string) => {
    setSelectedImage(image);
    setIsModalVisible(true);
  };

  // Mock amenities and rules since they're not in the API response
  const amenities = [
    { icon: <WifiOutlined />, name: "Internet tốc độ cao" },
    { icon: <SafetyOutlined />, name: "An ninh 24/7" },
    { icon: <CarOutlined />, name: "Chỗ để xe" },
    { icon: <KeyOutlined />, name: "Khóa cửa từ" },
  ];

  const rules = [
    "Không hút thuốc trong nhà",
    "Không nuôi thú cưng",
    "Không tổ chức tiệc tùng",
    "Giờ giới nghiêm: 23:00",
  ];

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Skeleton active />
        <Skeleton.Image style={{ width: '100%', height: '400px' }} />
        <Skeleton active />
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Result
          status="error"
          title="Không thể tải thông tin căn hộ"
          subTitle={error || "Không tìm thấy dữ liệu căn hộ."}
          extra={
            <Button type="primary" onClick={() => navigate('/home')}>
              Về trang chủ
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Title and Basic Info */}
          <Card className="mb-6">
            <h1 className="text-2xl font-bold mb-4">{apartment.name}</h1>
            <div className="flex items-center gap-4 mb-2">
              <Rate disabled defaultValue={apartment.rating || 4.5} className="text-sm" />
              <span className="text-gray-500">(Đánh giá)</span>
            </div>
            <p className="text-gray-600">
              <EnvironmentOutlined className="mr-2" />
              {apartment.address}
              {apartment.addressLink && (
                <a 
                  href={apartment.addressLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  (Xem bản đồ)
                </a>
              )}
            </p>
          </Card>

          {/* Image Carousel */}
          <Card className="mb-6">
            {images.length > 0 ? (
              <Carousel autoplay>
                {images.map((image, index) => (
                  <div key={index} onClick={() => showImageModal(image)} className="cursor-pointer">
                    <div style={{ height: '400px', background: '#364d79' }}>
                      <img
                        src={image}
                        alt={`Apartment view ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                ))}
              </Carousel>
            ) : (
              <div style={{ height: '400px', background: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p>Không có hình ảnh</p>
              </div>
            )}
          </Card>

          {/* Detailed Information Tabs */}
          <Card>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Tổng quan" key="1">
                <Descriptions column={{ xs: 1, md: 2 }} className="mb-4">
                  <Descriptions.Item label="ID căn hộ">{apartment.aptId}</Descriptions.Item>
                  <Descriptions.Item label="Diện tích">
                    <AreaChartOutlined className="mr-2" />{apartment.area}m²
                  </Descriptions.Item>
                  <Descriptions.Item label="Số phòng">
                    <HomeOutlined className="mr-2" />{apartment.numberOfRoom} phòng
                  </Descriptions.Item>
                  <Descriptions.Item label="Số chỗ ở">
                    <TeamOutlined className="mr-2" />{apartment.numberOfSlot} chỗ
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại căn hộ">
                    <BankOutlined className="mr-2" />Loại {apartment.aptCategoryId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày đăng ký">
                    {formatDate(apartment.createdAt)}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <h3 className="font-semibold mb-4">Mô tả chi tiết</h3>
                <p className="whitespace-pre-line">{apartment.note}</p>

                <Divider />

                <h3 className="font-semibold mb-4">Tiện ích</h3>
                <Row gutter={[16, 16]}>
                  {amenities.map((amenity, index) => (
                    <Col span={12} key={index}>
                      <div className="flex items-center gap-2">
                        {amenity.icon}
                        <span>{amenity.name}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </TabPane>

              <TabPane tab="Nội quy" key="2">
                <ul className="list-disc pl-4">
                  {rules.map((rule, index) => (
                    <li key={index} className="mb-2">{rule}</li>
                  ))}
                </ul>
              </TabPane>

              <TabPane tab="Vị trí" key="3">
                <h3 className="font-semibold mb-4">Thông tin vị trí</h3>
                <p className="mb-2">
                  <EnvironmentOutlined className="mr-2" />
                  {apartment.address}
                </p>
                {apartment.addressLink && (
                  <div className="mt-4">
                    <Button type="primary" href={apartment.addressLink} target="_blank">
                      Xem trên Google Maps
                    </Button>
                  </div>
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        {/* Contact Information */}
        <Col xs={24} lg={8}>
          <Card className="sticky top-6">
            <div className="flex items-center mb-6">
              <Avatar size={64} icon={<UserOutlined />} />
              <div className="ml-4">
                <h3 className="font-semibold">{apartment.ownerName}</h3>
                <div className="text-gray-500 text-sm">
                  <div>
                    <UserOutlined className="mr-2" />
                    Email: {apartment.ownerEmail}
                  </div>
                  <div>
                    <FieldTimeOutlined className="mr-2" />
                    Đăng ký: {formatDate(apartment.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                type="primary" 
                icon={<PhoneOutlined />} 
                block
                onClick={showPhoneNumber}
                disabled={!apartment.ownerPhone}
              >
                {isPhoneVisible && apartment.ownerPhone 
                  ? apartment.ownerPhone 
                  : "Xem số điện thoại"}
              </Button>
              <Button icon={<MessageOutlined />} block>
                Nhắn tin
              </Button>
              <Button icon={<CalendarOutlined />} block>
                Đặt lịch xem nhà
              </Button>
              <Button icon={<HeartOutlined />} block>
                Lưu tin
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Image Modal */}
      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedImage && (
          <img
            src={selectedImage}
            alt="Apartment large view"
            style={{ width: '100%', height: 'auto' }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ApartmentDetail;