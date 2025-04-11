import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Button, Skeleton, notification } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Carousel from "../component/carousel/index";
import CategoryShowcase from "../component/category";
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
  const API_BASE_URL = "https://renteasebe.io.vn";

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
        const baseUrl = API_BASE_URL;

        // Fetch posts
        const postsResponse = await axios.get<{ data: Post[] }>(`${baseUrl}/api/Post/GetAll`, { headers });
        const fetchedPosts = postsResponse.data.data || [];
        setPosts(fetchedPosts);

        // Fetch statuses
        const statusResponse = await axios.get<{ data: Status[] }>(`${baseUrl}/api/AptStatus/GetAll`, { headers });
        setStatuses(statusResponse.data.data || []);

        // Fetch categories
        const categoryResponse = await axios.get<{ data: Category[] }>(`${baseUrl}/api/AptCategory/GetAll`, { headers });
        setCategories(categoryResponse.data.data || []);

        // Fetch images using aptId from posts
        const imagePromises = fetchedPosts.map(post =>
          axios.get(`${baseUrl}/api/AptImage/GetByAptId?aptId=${post.aptId}`, { headers })
            .catch(error => {
              console.error(`Failed to fetch image for aptId ${post.aptId}:`, error.response?.status);
              return { data: { data: { aptId: post.aptId, images: [] } } };
            })
        );

        const imageResponses = await Promise.all(imagePromises);
        const imageMap = imageResponses.reduce((acc, response) => {
          const imageData: ImageData = response.data.data;
          if (imageData && imageData.images && imageData.images.length > 0) {
            acc[imageData.aptId] = `${baseUrl}${imageData.images[0].imageUrl}`;
          }
          return acc;
        }, {} as { [key: string]: string });

        setImages(imageMap);

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
      <Carousel posts={posts} />
      <CategoryShowcase categories={categories} />

      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Skeleton active className="w-full h-full max-w-5xl rounded-xl" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      ) : (
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
      )}

      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Skeleton active className="w-full h-full max-w-5xl rounded-xl" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      ) : (
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">🏡 Căn hộ cho thuê</h2>
          <EnhancedPropertyGrid posts={filteredPosts} categories={categories} images={images} />
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Skeleton active className="w-full h-full max-w-5xl rounded-xl" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      ) : (
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">🏡 TÌm bạn cùng phòng</h2>
          <EnhancedPropertyGrid1 posts={filteredPosts} categories={categories} images={images} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Skeleton active className="w-full h-full max-w-5xl rounded-xl" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600">
          <p>{error}</p>
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


