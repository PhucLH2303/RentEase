import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Card, 
  Carousel, 
  Descriptions, 
  Button, 
  Tag, 
  Avatar, 
  Divider, 
  Row, 
  Col,
  Modal,
  Rate,
  Tabs
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
  FieldTimeOutlined
} from "@ant-design/icons";

const { TabPane } = Tabs;

interface ApartmentDetailProps {
  id?: string;
}

const ApartmentDetail: React.FC<ApartmentDetailProps> = () => {
  const { id } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);

  // Mock data - in a real app, this would come from an API based on the id
  const apartmentData = {
    id,
    title: "Căn hộ Sunrise City Central - Căn góc view đẹp",
    price: "4.5 triệu/tháng",
    deposit: "9 triệu",
    area: "22m²",
    address: "123 Nguyễn Hữu Thọ, Quận 7, TP.HCM",
    description: `Căn hộ nằm tại vị trí đắc địa của quận 7, thuộc tòa nhà Sunrise City Central. 
    Căn hộ được thiết kế theo phong cách hiện đại, đầy đủ nội thất cao cấp, view đẹp nhìn ra thành phố.
    
    Căn hộ bao gồm:
    - 1 phòng ngủ riêng biệt
    - 1 phòng khách rộng rãi
    - 1 nhà bếp đầy đủ thiết bị
    - 1 nhà vệ sinh hiện đại`,
    amenities: [
      { icon: <WifiOutlined />, name: "Internet tốc độ cao" },
      { icon: <SafetyOutlined />, name: "An ninh 24/7" },
      { icon: <CarOutlined />, name: "Chỗ để xe" },
      { icon: <KeyOutlined />, name: "Khóa cửa từ" },
    ],
    utilities: [
      "Máy lạnh",
      "Tủ lạnh",
      "Máy giặt",
      "Ban công",
      "Bếp điện từ",
      "Tủ quần áo",
      "Giường ngủ",
      "Bàn làm việc",
    ],
    rules: [
      "Không hút thuốc trong nhà",
      "Không nuôi thú cưng",
      "Không tổ chức tiệc tùng",
      "Giờ giới nghiêm: 23:00",
    ],
    owner: {
      name: "Nguyễn Văn A",
      phone: "0123456789",
      responseRate: "98%",
      responseTime: "Thường trả lời trong vòng 1 giờ",
      avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
      joinDate: "Tháng 3 2023",
    },
    images: [
      "https://noithatmanhhe.vn/media/29426/decor-phong-tro-12m2-dep-tien-nghi.jpg",
      "https://www.tapdoantrananh.com.vn/uploads/files/2020/11/09/nha-tro-gac-lung-dep-8.jpg",
      "https://th.bing.com/th/id/R.bad8ae59c46fa3c8b5dc0b50ef15f4eb?rik=fk9d%2bJHKy5zM1Q&pid=ImgRaw&r=0",
      "https://th.bing.com/th/id/OIP.SS9x8l2YIpN6MgT2L6qSjwHaFj?rs=1&pid=ImgDetMain",
    ],
    rating: 4.8,
    reviews: 24,
    location: {
      district: "Quận 7",
      nearby: [
        "Cách RMIT 500m",
        "Cách Crescent Mall 1km",
        "Cách Phú Mỹ Hưng 1.5km",
      ]
    },
  };

  const showPhoneNumber = () => {
    setIsPhoneVisible(true);
  };

  const showImageModal = () => {
    setIsModalVisible(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Title and Basic Info */}
          <Card className="mb-6">
            <h1 className="text-2xl font-bold mb-4">{apartmentData.title}</h1>
            <div className="flex items-center gap-4 mb-2">
              <Rate disabled defaultValue={apartmentData.rating} className="text-sm" />
              <span className="text-gray-500">({apartmentData.reviews} đánh giá)</span>
            </div>
            <p className="text-gray-600">
              <EnvironmentOutlined className="mr-2" />
              {apartmentData.address}
            </p>
          </Card>

          {/* Image Carousel */}
          <Card className="mb-6">
            <Carousel autoplay>
              {apartmentData.images.map((image, index) => (
                <div key={index} onClick={showImageModal} className="cursor-pointer">
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
          </Card>

          {/* Detailed Information Tabs */}
          <Card>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Tổng quan" key="1">
                <Descriptions column={1} className="mb-4">
                  <Descriptions.Item label="Giá thuê">
                    <span className="text-xl font-bold text-blue-600">{apartmentData.price}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền cọc">{apartmentData.deposit}</Descriptions.Item>
                  <Descriptions.Item label="Diện tích">
                    <HomeOutlined className="mr-2" />{apartmentData.area}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <h3 className="font-semibold mb-4">Mô tả chi tiết</h3>
                <p className="whitespace-pre-line">{apartmentData.description}</p>

                <Divider />

                <h3 className="font-semibold mb-4">Tiện ích</h3>
                <Row gutter={[16, 16]}>
                  {apartmentData.amenities.map((amenity, index) => (
                    <Col span={12} key={index}>
                      <div className="flex items-center gap-2">
                        {amenity.icon}
                        <span>{amenity.name}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </TabPane>

              <TabPane tab="Nội thất" key="2">
                <div className="grid grid-cols-2 gap-4">
                  {apartmentData.utilities.map((utility, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Tag color="blue">{utility}</Tag>
                    </div>
                  ))}
                </div>
              </TabPane>

              <TabPane tab="Nội quy" key="3">
                <ul className="list-disc pl-4">
                  {apartmentData.rules.map((rule, index) => (
                    <li key={index} className="mb-2">{rule}</li>
                  ))}
                </ul>
              </TabPane>

              <TabPane tab="Vị trí" key="4">
                <h3 className="font-semibold mb-4">{apartmentData.location.district}</h3>
                <ul className="list-disc pl-4">
                  {apartmentData.location.nearby.map((place, index) => (
                    <li key={index} className="mb-2">{place}</li>
                  ))}
                </ul>
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        {/* Contact Information */}
        <Col xs={24} lg={8}>
          <Card className="sticky top-6">
            <div className="flex items-center mb-6">
              <Avatar size={64} src={apartmentData.owner.avatar} />
              <div className="ml-4">
                <h3 className="font-semibold">{apartmentData.owner.name}</h3>
                <div className="text-gray-500 text-sm">
                  <div>
                    <UserOutlined className="mr-2" />
                    Tham gia: {apartmentData.owner.joinDate}
                  </div>
                  <div>
                    <FieldTimeOutlined className="mr-2" />
                    {apartmentData.owner.responseTime}
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
              >
                {isPhoneVisible ? apartmentData.owner.phone : "Xem số điện thoại"}
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
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <img
          src={apartmentData.images[0]}
          alt="Apartment large view"
          style={{ width: '100%', height: 'auto' }}
        />
      </Modal>
    </div>
  );
};

export default ApartmentDetail;