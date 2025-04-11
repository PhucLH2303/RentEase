import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Button, Skeleton } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Carousel from "../component/carousel/index";
import CategoryShowcase from "../component/category";
import EnhancedPropertyGrid from "../component/grid";
import StatisticsAndTestimonials from "../component/review/index";
import axios from "axios";

const { Option } = Select;

interface Post {
  postId: string;
  postCategoryId: number;
  accountId: string;
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

interface Status {
  id: number;
  statusName: string;
  note: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  status: boolean | null;
}

interface Category {
  id: number;
  categoryName: string;
  note: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  status: boolean | null;
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

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [images, setImages] = useState<{ [key: string]: string }>({});
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [carouselLoading, setCarouselLoading] = useState<boolean>(true); // Loading cho Carousel
  const [gridLoading, setGridLoading] = useState<boolean>(true); // Loading cho Grid
  const [filters, setFilters] = useState<{
    location: string;
    duration: string;
    category: string | null;
    status: string | null;
  }>({
    location: "hcm",
    duration: "long",
    category: null,
    status: null,
  });
  const navigate = useNavigate();
  const API_BASE_URL = "https://renteasebe.io.vn";

  // Giai đoạn 1: Tải dữ liệu cho Carousel (ưu tiên đầu trang)
  useEffect(() => {
    const fetchCarouselData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/", { state: { from: "/home" } });
        return;
      }

      setCarouselLoading(true);

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Chỉ tải posts trước để hiển thị Carousel
        const postsResponse = await axios.get<{ data: Post[] }>(`${API_BASE_URL}/api/Post/GetAll`, { headers });
        const fetchedPosts = postsResponse.data.data || [];
        setPosts(fetchedPosts);

        // Tải hình ảnh cho posts
        const uniqueAptIds = Array.from(new Set(fetchedPosts.map(post => post.aptId)));
        const imagePromises = uniqueAptIds.map(aptId =>
          axios.get(`${API_BASE_URL}/api/AptImage/GetByAptId?aptId=${aptId}`, { headers }).catch(() => ({
            data: { data: { aptId, images: [] } },
          }))
        );
        const imageResponses = await Promise.all(imagePromises);
        const imageMap = imageResponses.reduce((acc, response) => {
          const imageData: ImageData = response.data.data;
          if (imageData?.images?.length > 0) {
            acc[imageData.aptId] = `${API_BASE_URL}${imageData.images[0].imageUrl}`;
          }
          return acc;
        }, {} as { [key: string]: string });

        setImages(imageMap);
      } catch (err) {
        console.error("Error loading carousel data:", err);
      } finally {
        setCarouselLoading(false);
      }
    };

    fetchCarouselData();
  }, [navigate]);

  // Giai đoạn 2: Tải dữ liệu cho phần còn lại (sau khi Carousel sẵn sàng)
  useEffect(() => {
    const fetchRemainingData = async () => {
      if (carouselLoading) return; // Chờ Carousel load xong

      const token = localStorage.getItem("accessToken");
      if (!token) return;

      setGridLoading(true);

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Tải statuses và categories
        const [statusResponse, categoryResponse] = await Promise.all([
          axios.get<{ data: Status[] }>(`${API_BASE_URL}/api/AptStatus/GetAll`, { headers }),
          axios.get<{ data: Category[] }>(`${API_BASE_URL}/api/AptCategory/GetAll`, { headers }),
        ]);

        setStatuses(statusResponse.data.data || []);
        setCategories(categoryResponse.data.data || []);
      } catch (err) {
        console.error("Error loading remaining data:", err);
      } finally {
        setGridLoading(false);
      }
    };

    fetchRemainingData();
  }, [carouselLoading, navigate]);

  const handleFilterChange = (key: string, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredPosts = posts.filter(post => (
    (!filters.category || post.postCategoryId === Number(filters.category)) &&
    (!filters.status || post.approveStatusId === Number(filters.status))
  ));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 mx-4">
      {/* Phần Carousel (đầu trang) */}
      {carouselLoading ? (
        <div className="p-8">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      ) : (
        <Carousel posts={posts} images={images} loading={carouselLoading} />
      )}

      {/* Phần CategoryShowcase */}
      {carouselLoading ? null : <CategoryShowcase categories={categories} />}

      {/* Phần Filter */}
      {gridLoading ? (
        <div className="flex justify-center items-center mt-8">
          <Skeleton.Input active style={{ width: "80%", height: "60px" }} />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-center bg-white shadow-xl p-6 rounded-xl mx-auto mt-8 w-11/12 max-w-5xl">
          <Select
            value={filters.location}
            className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-4"
            onChange={value => handleFilterChange("location", value)}
          >
            <Option value="hcm">Hồ Chí Minh</Option>
            <Option value="hn">Hà Nội</Option>
          </Select>
          <Select
            value={filters.duration}
            className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-4"
            onChange={value => handleFilterChange("duration", value)}
          >
            <Option value="short">Ngắn hạn</Option>
            <Option value="long">Dài hạn</Option>
          </Select>
          <Select
            placeholder="Loại căn hộ"
            className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-4"
            onChange={value => handleFilterChange("category", value)}
            allowClear
            value={filters.category}
          >
            {categories.map(cat => (
              <Option key={cat.id} value={cat.id.toString()}>{cat.note}</Option>
            ))}
          </Select>
          <Select
            placeholder="Trạng thái"
            className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-4"
            onChange={value => handleFilterChange("status", value)}
            allowClear
            value={filters.status}
          >
            {statuses.map(status => (
              <Option key={status.id} value={status.id.toString()}>{status.statusName}</Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            className="w-full md:w-auto h-10 bg-blue-600 hover:bg-blue-700"
          >
            Tìm kiếm
          </Button>
        </div>
      )}

      {/* Phần Grid */}
      {gridLoading ? (
        <div className="p-8">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      ) : (
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">🏡 Căn hộ cho thuê</h2>
          <EnhancedPropertyGrid posts={filteredPosts} categories={categories} images={images} />
        </div>
      )}

      {/* Phần StatisticsAndTestimonials */}
      {gridLoading ? (
        <div className="p-8">
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      ) : (
        <div className="p-8">
          <StatisticsAndTestimonials />
        </div>
      )}
    </div>
  );
};

export default Home;