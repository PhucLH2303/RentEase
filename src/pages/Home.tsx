import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Button, Skeleton, notification, Empty } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Carousel from "../component/carousel/index";
import EnhancedPropertyGrid from "../component/grid";
import StatisticsAndTestimonials from "../component/review/index";
import axios from "axios";
import EnhancedPropertyGrid1 from "../component/findfriend";

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

// interface ImageData {
//   aptId: string;
//   images: {
//     id: number;
//     imageUrl: string;
//     createAt: string;
//     updateAt: string;
//   }[];
// }

// Mock data for statuses in case API fails
const FALLBACK_STATUSES: Status[] = [
  {
    id: 1,
    statusName: "Còn trống",
    note: "Còn trống",
    createdAt: "",
    updatedAt: null,
    deletedAt: null,
    status: true,
  },
  {
    id: 2,
    statusName: "Sắp có",
    note: "Sắp có",
    createdAt: "",
    updatedAt: null,
    deletedAt: null,
    status: true,
  },
  {
    id: 3,
    statusName: "Đang hot",
    note: "Đang hot",
    createdAt: "",
    updatedAt: null,
    deletedAt: null,
    status: true,
  },
];

// Mock data for categories in case API fails
const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 1,
    categoryName: "Phòng cho thuê",
    note: "Phòng cho thuê",
    createdAt: "",
    updatedAt: null,
    deletedAt: null,
    status: true,
  },
  {
    id: 2,
    categoryName: "Căn hộ",
    note: "Căn hộ",
    createdAt: "",
    updatedAt: null,
    deletedAt: null,
    status: true,
  },
];

// Placeholder image for missing images
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x300?text=No+Image";

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [images, setImages] = useState<{ [key: string]: string }>({});
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
  
  // Ensure consistent API base URL
  const API_BASE_URL = "https://renteasebe.io.vn";

  // Centralized API call function with error handling
  const fetchAPI = async (endpoint: string, headers: any) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      return { data: null };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/", { state: { from: "/home" } });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch posts
        const postsData = await fetchAPI("/api/Post/GetAll", headers);
        const fetchedPosts = postsData?.data || [];
        setPosts(fetchedPosts);

        // Fetch statuses - use fallback if API fails
        const statusData = await fetchAPI("/api/AptStatus/GetAll", headers);
        setStatuses(statusData?.data || FALLBACK_STATUSES);

        // Fetch categories - use fallback if API fails
        const categoryData = await fetchAPI("/api/AptCategory/GetAll", headers);
        setCategories(categoryData?.data || FALLBACK_CATEGORIES);

        // Fetch images with error handling for each post
        if (fetchedPosts.length > 0) {
          const imageMap: { [key: string]: string } = {};
          
          for (const post of fetchedPosts) {
            try {
              const imageData = await fetchAPI(`/api/AptImage/GetByAptId?aptId=${post.aptId}`, headers);
              
              if (imageData?.data?.images && imageData.data.images.length > 0) {
                // Ensure consistent URL format without www. prefix
                const imageUrl = imageData.data.images[0].imageUrl;
                imageMap[post.aptId] = `${API_BASE_URL}${imageUrl}`;
              } else {
                imageMap[post.aptId] = PLACEHOLDER_IMAGE;
              }
            } catch (error) {
              imageMap[post.aptId] = PLACEHOLDER_IMAGE;
            }
          }
          
          setImages(imageMap);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to load data: ${errorMessage}`);
        notification.error({
          message: "Error loading data",
          description: errorMessage,
          placement: "topRight",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleFilterChange = (key: string, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredPosts = posts.filter((post) => {
    return (
      (!filters.category || post.postCategoryId === Number(filters.category)) &&
      (!filters.status || post.approveStatusId === Number(filters.status))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 mx-4">
      {!loading && <Carousel posts={posts} />}

      <div className="flex flex-col md:flex-row items-center justify-center bg-white shadow-xl p-6 rounded-xl mx-auto mt-8 w-11/12 max-w-5xl transition-all duration-300 hover:shadow-2xl">
        <Select
          value={filters.location}
          className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-4"
          onChange={(value) => handleFilterChange("location", value)}
        >
          <Option value="hcm">Hồ Chí Minh</Option>
          <Option value="hn">Hà Nội</Option>
        </Select>
        <Select
          value={filters.duration}
          className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-4"
          onChange={(value) => handleFilterChange("duration", value)}
        >
          <Option value="short">Ngắn hạn</Option>
          <Option value="long">Dài hạn</Option>
        </Select>
        <Select
          placeholder="Loại căn hộ"
          className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-4"
          onChange={(value) => handleFilterChange("category", value)}
          allowClear
          value={filters.category}
        >
          {categories.map((cat) => (
            <Option key={cat.id} value={cat.id.toString()}>
              {cat.note}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Trạng thái"
          className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-4"
          onChange={(value) => handleFilterChange("status", value)}
          allowClear
          value={filters.status}
        >
          {statuses.map((status) => (
            <Option key={status.id} value={status.id.toString()}>
              {status.statusName}
            </Option>
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

      {/* Căn hộ cho thuê section */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🏡 Căn hộ cho thuê</h2>
        {loading ? (
          <Skeleton active className="w-full h-64" />
        ) : error ? (
          <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
            <p>{error}</p>
          </div>
        ) : filteredPosts.filter(post => post.status === true && post.postCategoryId === 2).length > 0 ? (
          <EnhancedPropertyGrid posts={filteredPosts} categories={categories} images={images} />
        ) : (
          <Empty description="Không có căn hộ cho thuê nào." />
        )}
      </div>

      {/* Tìm bạn cùng phòng section */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🏡 Tìm bạn cùng phòng</h2>
        {loading ? (
          <Skeleton active className="w-full h-64" />
        ) : error ? (
          <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
            <p>{error}</p>
          </div>
        ) : filteredPosts.filter(post => post.status === true && post.postCategoryId === 1).length > 0 ? (
          <EnhancedPropertyGrid1 posts={filteredPosts} categories={categories} images={images} />
        ) : (
          <Empty description="Không có bạn cùng phòng nào." />
        )}
      </div>

      {/* Statistics and testimonials section */}
      <div className="p-8">
        {loading ? (
          <Skeleton active className="w-full h-64" />
        ) : error ? (
          <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
            <p>{error}</p>
          </div>
        ) : (
          <StatisticsAndTestimonials />
        )}
      </div>
    </div>
  );
};

export default Home;