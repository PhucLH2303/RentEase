import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Button, Skeleton, notification, Empty } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Carousel from "../component/carousel/index";
import EnhancedPropertyGrid from "../component/grid";
import StatisticsAndTestimonials from "../component/review/index";
import axios from "axios";
import EnhancedPropertyGrid1 from "../component/findfriend";
import provincesData from "../assets/data.json";

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

// Updated Province interface to match actual data structure
interface Ward {
  Id: string;
  Name: string;
  Level?: string;
}

interface District {
  Id: string;
  Name: string;
  Wards: Ward[];
}

interface Province {
  Id: string;
  Name: string;
  Districts: District[];
}

interface Apartment {
  aptId: string;
  provinceId: number;
  [key: string]: string | number | boolean | null; // Restrict to specific types
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  count: number;
  currentPage: number;
  totalPages: number;
  data: T;
}

// Mock data for statuses
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

// Mock data for categories
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

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x300?text=No+Image";

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [images, setImages] = useState<{ [key: string]: string }>({});
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    provinceId: string | null;
    category: string | null;
    status: string | null;
  }>({
    provinceId: null,
    category: null,
    status: null,
  });
  const navigate = useNavigate();
  const API_BASE_URL = "https://renteasebe.io.vn";

  const fetchAPI = async <T,>(
    endpoint: string,
    headers: { Authorization: string }
  ): Promise<ApiResponse<T> | null> => {
    try {
      const response = await axios.get<ApiResponse<T>>(`${API_BASE_URL}${endpoint}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        navigate("/", { state: { from: "/home" } });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch posts
        const postsData = await fetchAPI<Post[]>("/api/Post/GetAll", headers);
        const fetchedPosts = postsData?.data || [];
        setPosts(fetchedPosts);

        // Fetch apartments to get provinceId
        const aptData = await fetchAPI<Apartment[]>("/api/Apt/GetAll", headers);
        const fetchedApartments = aptData?.data || [];
        setApartments(fetchedApartments);

        // Fetch statuses
        const statusData = await fetchAPI<Status[]>("/api/AptStatus/GetAll", headers);
        setStatuses(statusData?.data || FALLBACK_STATUSES);

        // Fetch categories
        const categoryData = await fetchAPI<Category[]>("/api/AptCategory/GetAll", headers);
        setCategories(categoryData?.data || FALLBACK_CATEGORIES);

        // Fetch images for all posts in a single request (if API supports batch fetching)
        if (fetchedPosts.length > 0) {
          const imageMap: { [key: string]: string } = {};
          const imagePromises = fetchedPosts.map((post) =>
            fetchAPI<ImageData>(`/api/AptImage/GetByAptId?aptId=${post.aptId}`, headers).then((imageData) => {
              if (imageData?.data?.images && imageData.data.images.length > 0) {
                imageMap[post.aptId] = `${API_BASE_URL}${imageData.data.images[0].imageUrl}`;
              } else {
                imageMap[post.aptId] = PLACEHOLDER_IMAGE;
              }
            })
          );
          await Promise.all(imagePromises);
          setImages(imageMap);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Không thể tải dữ liệu: ${errorMessage}`);
        notification.error({
          message: "Lỗi tải dữ liệu",
          description: errorMessage,
          placement: "topRight",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleFilterChange = (key: keyof typeof filters, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredPosts = posts.filter((post) => {
    const apt = apartments.find((a) => a.aptId === post.aptId);
    return (
      (!filters.category || post.postCategoryId === Number(filters.category)) &&
      (!filters.status || post.approveStatusId === Number(filters.status)) &&
      (!filters.provinceId || (apt && apt.provinceId.toString() === filters.provinceId))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 mx-4">
      {/* Carousel Section */}
      {!loading && <Carousel posts={filteredPosts} images={images} />}

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-center bg-white shadow-xl p-6 rounded-xl mx-auto mt-8 w-11/12 max-w-5xl transition-all duration-300 hover:shadow-2xl">
        <Select
          placeholder="Chọn tỉnh/thành phố"
          className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-4"
          onChange={(value) => handleFilterChange("provinceId", value)}
          allowClear
          value={filters.provinceId}
        >
          {(provincesData as Province[]).map((province) => (
            <Option key={province.Id} value={province.Id}>
              {province.Name}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Loại căn hộ"
          className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-4"
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
          className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-4"
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

      {/* Apartment Rental Section */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🏡 Căn hộ cho thuê</h2>
        {loading ? (
          <Skeleton active className="w-full h-64" />
        ) : error ? (
          <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
            <p>{error}</p>
          </div>
        ) : filteredPosts.filter((post) => post.status === true && post.postCategoryId === 2).length > 0 ? (
          <EnhancedPropertyGrid
            posts={filteredPosts.filter((post) => post.postCategoryId === 2)}
            categories={categories}
            images={images}
          />
        ) : (
          <Empty description="Không có căn hộ cho thuê nào." />
        )}
      </div>

      {/* Find Roommate Section */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🏡 Tìm bạn cùng phòng</h2>
        {loading ? (
          <Skeleton active className="w-full h-64" />
        ) : error ? (
          <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
            <p>{error}</p>
          </div>
        ) : filteredPosts.filter((post) => post.status === true && post.postCategoryId === 1).length > 0 ? (
          <EnhancedPropertyGrid1
            posts={filteredPosts.filter((post) => post.postCategoryId === 1)}
            categories={categories}
            images={images}
          />
        ) : (
          <Empty description="Không có bạn cùng phòng nào." />
        )}
      </div>

      {/* Statistics and Testimonials Section */}
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