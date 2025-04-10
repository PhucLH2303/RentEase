import React, { useEffect, useState } from "react";
import { 
  Card, 
  List, 
  Typography, 
  Tag, 
  Space, 
  Button, 
  Rate, 
  Skeleton, 
  Empty, 
  message,
  Spin,
  Row,
  Col,
  Pagination,
  Divider,
  Carousel
} from "antd";
import { 
    HomeOutlined, 
    HeartFilled,  
    EnvironmentOutlined, 
    CalendarOutlined,
    TeamOutlined,
    AreaChartOutlined,
    InfoCircleOutlined,
    LeftOutlined,
    RightOutlined,
    EditOutlined
  } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

// Interface cho API response
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  count: number;
  currentPage: number;
  totalPages: number;
  data: T;
}

// Interface cho thông tin căn hộ yêu thích
interface LikedApartment {
  id: number;
  accountId: string;
  aptId: string;
  createAt: string;
}

// Interface cho thông tin chi tiết căn hộ
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

// Interface cho hình ảnh căn hộ
interface ApartmentImage {
  id: number;
  imageUrl: string;
  createAt: string;
  updateAt: string;
}

// Interface cho API response của hình ảnh
interface ApartmentImagesResponse {
  aptId: string;
  images: ApartmentImage[];
}

// Interface cho căn hộ đã kết hợp thông tin
interface FavoriteApartment extends LikedApartment {
  details: ApartmentDetail | null;
  images: ApartmentImage[];
  loading: boolean;
  imageLoading: boolean;
}

// Maps cho loại và trạng thái căn hộ
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

const FavoriteApartmentsPage: React.FC = () => {
  const [favoriteApartments, setFavoriteApartments] = useState<FavoriteApartment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const navigate = useNavigate();

  // Fetch danh sách căn hộ yêu thích
  useEffect(() => {
    const fetchFavoriteApartments = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        message.warning("Vui lòng đăng nhập để xem danh sách yêu thích");
        navigate("/");
        return;
      }

      try {
        // Try POST method first
        const response = await fetch(
          "https://renteasebe.io.vn/api/AccountLikedApt/GetByAccountId",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              page: currentPage,
              pageSize: pageSize
            })
          }
        );
        
        // If not successful, try alternative approach
        if (!response.ok) {
          console.warn("POST request failed, trying alternative method...");
          
          // Try GET method with query parameters as fallback
          const getResponse = await fetch(
            `https://renteasebe.io.vn/api/AccountLikedApt/GetByAccountId?page=${currentPage}&pageSize=${pageSize}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`
              }
            }
          );
          
          if (!getResponse.ok) {
            throw new Error(`API returned status ${getResponse.status}`);
          }
          
          const responseText = await getResponse.text();
          if (!responseText) {
            throw new Error("Empty response received from server");
          }
          
          const data: ApiResponse<LikedApartment[]> = JSON.parse(responseText);
          processApiResponse(data);
        } else {
          // Process response if POST was successful
          const responseText = await response.text();
          if (!responseText) {
            throw new Error("Empty response received from server");
          }
          
          const data: ApiResponse<LikedApartment[]> = JSON.parse(responseText);
          processApiResponse(data);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        message.error("Đã xảy ra lỗi khi tải danh sách yêu thích");
        setLoading(false);
      }
    };
    
    // Helper function to process API response
    const processApiResponse = (data: ApiResponse<LikedApartment[]>) => {
      if (data.statusCode === 200) {
        // Loại bỏ các bản ghi trùng lặp bằng aptId
        const uniqueApts = Array.from(
          new Map(data.data.map(item => [item.aptId, item])).values()
        );
        
        setTotalItems(data.count);
        
        // Khởi tạo với thông tin ban đầu
        const initialFavorites: FavoriteApartment[] = uniqueApts.map(apt => ({
          ...apt,
          details: null,
          images: [],
          loading: true,
          imageLoading: true
        }));
        
        setFavoriteApartments(initialFavorites);
        
        // Fetch thông tin chi tiết cho từng căn hộ
        for (const apt of uniqueApts) {
          fetchApartmentDetails(apt.aptId);
        }
        
        // Check if there are no apartments in the response
        if (data.data.length === 0) {
          setLoading(false);
        }
      } else {
        message.error(data.message || "Không thể tải danh sách yêu thích");
        setLoading(false);
      }
    };

    fetchFavoriteApartments();
  }, [currentPage, pageSize, navigate]);

  // Fetch thông tin chi tiết cho từng căn hộ
  const fetchApartmentDetails = async (aptId: string) => {
    const token = localStorage.getItem("accessToken");
    
    try {
      // Use GET method with query parameter as shown in your example
      const response = await fetch(
        `https://renteasebe.io.vn/api/Apt/GetById?aptId=${aptId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Empty response received from server");
      }
      
      const data: ApiResponse<ApartmentDetail> = JSON.parse(responseText);
      
      if (data.statusCode === 200) {
        // Cập nhật thông tin chi tiết cho căn hộ tương ứng
        setFavoriteApartments(prev => 
          prev.map(apt => 
            apt.aptId === aptId 
              ? { ...apt, details: data.data, loading: false } 
              : apt
          )
        );
        
        // Fetch hình ảnh cho căn hộ này
        fetchApartmentImages(aptId);
      } else {
        setFavoriteApartments(prev => 
          prev.map(apt => 
            apt.aptId === aptId 
              ? { ...apt, loading: false, imageLoading: false } 
              : apt
          )
        );
      }
    } catch (error) {
      console.error(`Error fetching details for apartment ${aptId}:`, error);
      setFavoriteApartments(prev => 
        prev.map(apt => 
          apt.aptId === aptId 
            ? { ...apt, loading: false, imageLoading: false } 
            : apt
        )
      );
    }
  };
  
  // Fetch hình ảnh cho từng căn hộ
  const fetchApartmentImages = async (aptId: string) => {
    const token = localStorage.getItem("accessToken");
    
    try {
      const response = await fetch(
        `https://renteasebe.io.vn/api/AptImage/GetByAptId?aptId=${aptId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Image API returned status ${response.status}`);
      }
      
      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Empty response received from image server");
      }
      
      const data: ApiResponse<ApartmentImagesResponse> = JSON.parse(responseText);
      
      if (data.statusCode === 200 && data.data.images.length > 0) {
        // Cập nhật hình ảnh cho căn hộ tương ứng
        setFavoriteApartments(prev => 
          prev.map(apt => 
            apt.aptId === aptId 
              ? { ...apt, images: data.data.images, imageLoading: false } 
              : apt
          )
        );
      } else {
        setFavoriteApartments(prev => 
          prev.map(apt => 
            apt.aptId === aptId 
              ? { ...apt, imageLoading: false } 
              : apt
          )
        );
      }
    } catch (error) {
      console.error(`Error fetching images for apartment ${aptId}:`, error);
      setFavoriteApartments(prev => 
        prev.map(apt => 
          apt.aptId === aptId 
            ? { ...apt, imageLoading: false } 
            : apt
        )
      );
    }
    
    // Check if all apartments have finished loading
    // to ensure state has been updated
    setTimeout(() => checkAllApartmentsLoaded(), 100);
  };
  
  // Helper function to check if all apartments have finished loading
  const checkAllApartmentsLoaded = () => {
    setFavoriteApartments(prevApartments => {
      const allLoaded = prevApartments.every(apt => !apt.loading && !apt.imageLoading);
      if (allLoaded) {
        setLoading(false);
      }
      return prevApartments;
    });
  };

  // Xử lý xóa căn hộ khỏi danh sách yêu thích
  const handleRemoveFavorite = async (aptId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.warning("Vui lòng đăng nhập để thực hiện");
      return;
    }

    try {
      // Try first with DELETE and query parameter
      const response = await fetch(
        `https://renteasebe.io.vn/api/AccountLikedApt/Remove-Like?aptId=${aptId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      // If not successful, try alternative approach with body
      if (!response.ok) {
        console.warn("DELETE with query parameter failed, trying with request body...");
        
        const altResponse = await fetch(
          "https://renteasebe.io.vn/api/AccountLikedApt/Remove-Like",
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ aptId })
          }
        );
        
        if (!altResponse.ok) {
          throw new Error(`API returned status ${altResponse.status}`);
        }
        
        const responseText = await altResponse.text();
        if (!responseText) {
          throw new Error("Empty response received from server");
        }
        
        const data = JSON.parse(responseText);
        processRemoveResponse(data);
      } else {
        // Process response if first attempt was successful
        const responseText = await response.text();
        if (!responseText) {
          throw new Error("Empty response received from server");
        }
        
        const data = JSON.parse(responseText);
        processRemoveResponse(data);
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      message.error("Đã xảy ra lỗi khi xóa khỏi yêu thích");
    }
    
    // Helper function to process remove response
    function processRemoveResponse(data: any) {
      if (data.statusCode === 200) {
        message.success("Đã xóa khỏi danh sách yêu thích");
        
        // Cập nhật danh sách
        setFavoriteApartments(prev => prev.filter(apt => apt.aptId !== aptId));
        setTotalItems(prev => prev - 1);
      } else {
        message.error(data.message || "Không thể xóa khỏi danh sách yêu thích");
      }
    }
  };

  // Format ngày tháng
  const formatDate = (dateString: string): string => {
    if (dateString === "0001-01-01T00:00:00") return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Render hình ảnh căn hộ
  const renderApartmentImage = (apartment: FavoriteApartment) => {
    if (apartment.loading || apartment.imageLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Spin />
        </div>
      );
    }
    
    // Nếu có hình ảnh, hiển thị hình đầu tiên
    if (apartment.images && apartment.images.length > 0) {
      return (
        <div style={{ height: '100%', position: 'relative' }}>
          {apartment.images.length > 1 ? (
            <Carousel arrows prevArrow={<LeftOutlined />} nextArrow={<RightOutlined />}>
              {apartment.images.map((image, index) => (
                <div key={index}>
                  <img
                    alt={`${apartment.details?.name || "Căn hộ"} - Ảnh ${index + 1}`}
                    src={`https://renteasebe.io.vn${image.imageUrl}`}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <img
              alt={apartment.details?.name || "Căn hộ"}
              src={`https://renteasebe.io.vn${apartment.images[0].imageUrl}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          
          <Button 
            danger
            type="primary"
            icon={<HeartFilled />}
            shape="circle"
            size="large"
            onClick={(e) => handleRemoveFavorite(apartment.aptId, e)}
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}
          />
           <Button
      type="primary"
      style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
      icon={<EditOutlined />}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate('/home/create-post', { state: { aptId: apartment.aptId } });
      }}
    >
      Tạo bài đăng
    </Button>
        </div>
      );
    }
    
    // Nếu không có hình ảnh, hiển thị hình placeholder
    return (
      <div style={{ height: '100%', position: 'relative' }}>
        <img
          alt={apartment.details?.name || "Căn hộ"}
          src={`https://renteasebe.io.vn/api/placeholder/apartment/${apartment.aptId}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Button 
          danger
          type="primary"
          icon={<HeartFilled />}
          shape="circle"
          size="large"
          onClick={(e) => handleRemoveFavorite(apartment.aptId, e)}
          style={{ position: 'absolute', top: 10, right: 10 }}
        />
         <Button
      type="primary"
      style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
      icon={<EditOutlined />}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate('/home/create-post', { state: { aptId: apartment.aptId } });
      }}
    >
      Tạo bài đăng
    </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card bordered={false} className="mb-6 shadow">
        <Title level={2}>
          <HeartFilled style={{ color: "#ff4d4f", marginRight: 12 }} />
          Danh sách căn hộ yêu thích
        </Title>
        <Paragraph>
          Những căn hộ bạn đã lưu để tham khảo sau này.
        </Paragraph>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <Spin size="large" />
          <Paragraph className="mt-4">Đang tải danh sách căn hộ yêu thích...</Paragraph>
        </div>
      ) : favoriteApartments.length > 0 ? (
        <>
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
            dataSource={favoriteApartments}
            renderItem={(item) => (
              <List.Item>
                <Link to={`/home/apartment/${item.aptId}`} style={{ display: 'block', width: '100%' }}>
                  <Card
                    hoverable
                    className="shadow-sm"
                    cover={
                      <div style={{ height: 200, background: '#f5f5f5', position: 'relative' }}>
                        {renderApartmentImage(item)}
                      </div>
                    }
                  >
                    {item.loading ? (
                      <Skeleton active avatar={false} paragraph={{ rows: 3 }} />
                    ) : item.details ? (
                      <>
                        <Title level={4} ellipsis={{ rows: 1 }}>{item.details.name}</Title>
                        
                        <Space wrap className="mb-2">
                          <Tag color={statusMap[item.details.aptStatusId]?.color || "blue"}>
                            {statusMap[item.details.aptStatusId]?.text || "Không xác định"}
                          </Tag>
                          <Tag color="blue" icon={<HomeOutlined />}>
                            {categoryMap[item.details.aptCategoryId] || "Không xác định"}
                          </Tag>
                        </Space>
                        
                        <Paragraph ellipsis={{ rows: 1 }}>
                          <Space>
                            <EnvironmentOutlined />
                            <Text>{item.details.address}</Text>
                          </Space>
                        </Paragraph>
                        
                        <Row gutter={8} className="mt-2">
                          <Col span={8}>
                            <Paragraph className="text-center">
                              <AreaChartOutlined className="block mx-auto" />
                              <Text strong>{item.details.area} m²</Text>
                            </Paragraph>
                          </Col>
                          <Col span={8}>
                            <Paragraph className="text-center">
                              <HomeOutlined className="block mx-auto" />
                              <Text strong>{item.details.numberOfRoom} phòng</Text>
                            </Paragraph>
                          </Col>
                          <Col span={8}>
                            <Paragraph className="text-center">
                              <TeamOutlined className="block mx-auto" />
                              <Text strong>{item.details.numberOfSlot} chỗ</Text>
                            </Paragraph>
                          </Col>
                        </Row>
                        
                        <Divider className="my-2" />
                        
                        <Row justify="space-between" align="middle">
                          <Col>
                            <Rate disabled value={item.details.rating || 0} style={{ fontSize: 14 }} />
                          </Col>
                          <Col>
                            <Text type="secondary">
                              <CalendarOutlined className="mr-1" />
                              {formatDate(item.details.createdAt)}
                            </Text>
                          </Col>
                        </Row>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <InfoCircleOutlined style={{ fontSize: 24 }} />
                        <Paragraph className="mt-2">
                          Không thể tải thông tin căn hộ
                        </Paragraph>
                      </div>
                    )}
                  </Card>
                </Link>
              </List.Item>
            )}
          />
          
          <div className="text-center mt-6">
            <Pagination
              current={currentPage}
              total={totalItems}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <Card bordered={false} className="text-center py-8">
          <Empty
            description={
              <Paragraph>
                Bạn chưa có căn hộ nào trong danh sách yêu thích
              </Paragraph>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate("/apartments")}>
              Tìm kiếm căn hộ ngay
            </Button>
          </Empty>
        </Card>
      )}
    </div>
  );
};

export default FavoriteApartmentsPage;