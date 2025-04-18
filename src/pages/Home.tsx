import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Post {
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
  startPublic: string | null;
  endPublic: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  status: boolean;
  imageUrls?: string[]; // Changed from imageUrl to imageUrls to store multiple images
}

interface PostApiResponse {
  statusCode: number;
  message: string;
  count: number;
  currentPage: number;
  totalPages: number;
  data: Post[];
}

// Updated interface for the new image response structure
interface ImageData {
  aptId: string;
  images: {
    id: number;
    imageUrl: string;
    createAt: string;
    updateAt: string;
  }[];
}

interface ImageApiResponse {
  statusCode: number;
  message: string;
  data: ImageData;
}

// ImageGallery component adapted from ApartmentList.tsx
const ImageGallery: React.FC<{ images: string[], altText: string }> = ({ images, altText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback image if the array is empty
  if (!images || images.length === 0) {
    return (
      <img
        src="https://source.unsplash.com/random/400x320/?apartment"
        alt={altText}
        className="w-full h-full object-cover"
      />
    );
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prevIndex =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prevIndex =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative h-full w-full group">
      <img
        src={images[currentIndex]}
        alt={`${altText} - image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://source.unsplash.com/random/400x320/?apartment';
        }}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Card component for displaying each post with navigation
const PropertyCard: React.FC<{ post: Post; isRoommate: boolean }> = ({ post, isRoommate }) => {
  const navigate = useNavigate();
  const borderColor = isRoommate ? 'border-blue-500' : 'border-green-500';
  const titleColor = isRoommate ? 'text-blue-700' : 'text-green-700';

  const handleCardClick = () => {
    // Navigate to the post detail page
    navigate(`/home/post/${post.postId}`);
  };

  return (
    <div
      className={`bg-white border-l-4 ${borderColor} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer`}
      onClick={handleCardClick}
    >
      {/* Image container with fixed height */}
      <div className="relative h-48 overflow-hidden">
        <ImageGallery
          images={post.imageUrls || []}
          altText={post.title}
        />
        {/* Building name overlay */}
        <div className="absolute bottom-0 left-0 bg-black bg-opacity-60 text-white p-2 w-full">
          <h3 className={`font-bold ${titleColor}`}>{post.title}</h3>
          <p className="text-sm">{post.aptId}</p>
        </div>
      </div>

      {/* Property information */}
      <div className="p-4">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-gray-700">Địa chỉ: Chưa có thông tin</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Số phòng: {post.totalSlot}</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Sức chứa: {post.currentSlot}/{post.totalSlot} người</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-gray-600 text-sm">Ngày đăng: {new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
            Đang Cho Thuê
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-gray-800 font-bold text-lg">{post.rentPrice.toLocaleString()} VNĐ/tháng</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Máy lạnh</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Máy nước nóng</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Rèm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const [roommatePosts, setRoommatePosts] = useState<Post[]>([]);
  const [rentalPosts, setRentalPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = 'https://www.renteasebe.io.vn';

  useEffect(() => {
    const fetchPostsAndImages = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        console.log('Access Token:', accessToken);

        if (!accessToken) {
          setError('No access token found. Please log in.');
          setLoading(false);
          return;
        }

        // Fetch posts
        const postResponse = await axios.get<PostApiResponse>('https://www.renteasebe.io.vn/api/Post/GetAll', {
          params: {
            page: 1,
            pageSize: 10,
          },
          headers: {
            Accept: '*/*',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (postResponse.data.statusCode !== 200) {
          setError(`Failed to fetch posts: ${postResponse.data.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }

        // Filter posts
        const roommatePosts = postResponse.data.data.filter(
          (post) => post.status === true && post.postCategoryId === 2
        );
        const rentalPosts = postResponse.data.data.filter(
          (post) => post.status === true && post.postCategoryId === 1
        );

        // Fetch images for each post
        const fetchImages = async (posts: Post[]): Promise<Post[]> => {
          const updatedPosts = await Promise.all(
            posts.map(async (post) => {
              try {
                const imageResponse = await axios.get<ImageApiResponse>(
                  `${API_BASE_URL}/api/AptImage/GetByAptId`,
                  {
                    params: { aptId: post.aptId },
                    headers: {
                      Accept: '*/*',
                      Authorization: `Bearer ${accessToken}`,
                    },
                  }
                );

                if (
                  imageResponse.data.statusCode === 200 &&
                  imageResponse.data.data &&
                  imageResponse.data.data.images &&
                  imageResponse.data.data.images.length > 0
                ) {
                  // Process the new image structure
                  const imageUrls = imageResponse.data.data.images.map(img =>
                    `${API_BASE_URL}${img.imageUrl}`
                  );
                  return { ...post, imageUrls };
                }

                console.log(`No valid images found for aptId ${post.aptId}`);
                return { ...post, imageUrls: [] };
              } catch (imageErr) {
                console.error(`Failed to fetch images for aptId ${post.aptId}:`, imageErr);
                return { ...post, imageUrls: [] };
              }
            })
          );
          return updatedPosts;
        };

        // Fetch images for both sets of posts
        const updatedRoommatePosts = await fetchImages(roommatePosts);
        const updatedRentalPosts = await fetchImages(rentalPosts);

        setRoommatePosts(updatedRoommatePosts);
        setRentalPosts(updatedRentalPosts);
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error('API Error:', axiosError);

        if (axiosError.response) {
          const status = axiosError.response.status;
          if (status === 401) {
            setError('Unauthorized: Invalid or expired access token. Please log in again.');
          } else if (status === 404) {
            setError('API endpoint not found. Please check the API URL.');
          } else {
            setError(`Server error: ${axiosError.response.statusText || 'Unknown error'}`);
          }
        } else if (axiosError.request) {
          setError('Network error: Unable to reach the server. Please check your connection.');
        } else {
          setError(`Error: ${axiosError.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPostsAndImages();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center mb-2">Lỗi kết nối</h2>
          <p className="text-center text-gray-700">{error}</p>
          <button
            className="mt-4 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-12 bg-gray-50">
      {/* Tìm bạn cùng phòng Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Tìm bạn cùng phòng</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
            Xem tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roommatePosts.length > 0 ? (
            roommatePosts.map((post) => (
              <PropertyCard key={post.postId} post={post} isRoommate={true} />
            ))
          ) : (
            <div className="col-span-full py-10">
              <p className="text-center text-gray-500">
                Không có bài đăng nào phù hợp cho mục "Tìm bạn cùng phòng".
              </p>
              <button className="mt-4 mx-auto block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                Đăng tin ngay
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Căn hộ cho thuê Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-green-800">Căn hộ cho thuê</h1>
          <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
            Xem tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentalPosts.length > 0 ? (
            rentalPosts.map((post) => (
              <PropertyCard key={post.postId} post={post} isRoommate={false} />
            ))
          ) : (
            <div className="col-span-full py-10">
              <p className="text-center text-gray-500">
                Không có bài đăng nào phù hợp cho mục "Căn hộ cho thuê".
              </p>
              <button className="mt-4 mx-auto block bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors">
                Đăng tin ngay
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;