import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { ChevronLeft, ChevronRight, MapPin, Home as HomeIcon, Users, Calendar, BookmarkPlus, Star } from 'lucide-react';
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
  imageUrls?: string[];
}

interface PostApiResponse {
  statusCode: number;
  message: string;
  count: number;
  currentPage: number;
  totalPages: number;
  data: Post[];
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

interface ImageApiResponse {
  statusCode: number;
  message: string;
  data: ImageData;
}

interface Category {
  id: number;
  name: string;
  icon: React.ReactNode;
}

// Hero Carousel Component
const HeroCarousel: React.FC = () => {
  // Replace these with your actual featured images
  const carouselImages = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    "https://images.unsplash.com/photo-1572120360610-d971b9d7767c",
    "https://i.pinimg.com/736x/ed/59/1a/ed591a8ed1a1450b2bf069e893312617.jpg",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914"
  ];


  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden shadow-lg mb-8">
      {/* Slide transition */}
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {carouselImages.map((imageUrl, index) => (
          <div key={index} className="min-w-full h-full relative">
            <img
              src={imageUrl}
              alt={`Featured property ${index + 1}`}
              className="w-full h-full object-cover"
              style={{ imageRendering: "auto" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-2">Tìm nơi ở phù hợp cho bạn</h2>
              <p className="text-white text-lg md:text-xl mb-6">Khám phá các căn hộ và tìm bạn cùng phòng phù hợp với bạn</p>
              <div className="flex flex-col md:flex-row gap-4 md:items-center">
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white rounded-full p-2 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white rounded-full p-2 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${currentIndex === index ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// ImageGallery component adapted for property cards
const ImageGallery: React.FC<{ images: string[], altText: string }> = ({ images, altText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback image if the array is empty
  if (!images || images.length === 0) {
    return (
      <img
        src="https://source.unsplash.com/random/400x320/?apartment"
        alt={altText}
        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
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
    <div className="relative h-full w-full group overflow-hidden">
      <img
        src={images[currentIndex]}
        alt={`${altText} - image ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://source.unsplash.com/random/400x320/?apartment';
        }}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
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

// Category Pills Component
const CategoryPills: React.FC = () => {
  const categories: Category[] = [
    { id: 1, name: "Căn hộ cho thuê", icon: <HomeIcon size={18} /> },
    { id: 2, name: "Tìm bạn cùng phòng", icon: <Users size={18} /> },
    { id: 3, name: "Khu vực trung tâm", icon: <MapPin size={18} /> },
    { id: 4, name: "Mới đăng", icon: <Calendar size={18} /> },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <span className="text-blue-600">{category.icon}</span>
          <span className="text-gray-700 font-medium">{category.name}</span>
        </button>
      ))}
    </div>
  );
};

// Enhanced PropertyCard component
const PropertyCard: React.FC<{ post: Post; isRoommate: boolean }> = ({ post, isRoommate }) => {
  const navigate = useNavigate();
  // const borderColor = isRoommate ? 'border-blue-500' : 'border-green-500';
  const cardClass = isRoommate ? 'hover:border-blue-300' : 'hover:border-green-300';
  // const badgeText = isRoommate ? 'Tìm bạn cùng phòng' : 'Cho thuê';

  const handleCardClick = () => {
    navigate(`/home/post/${post.postId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 ${cardClass} group`}
      onClick={handleCardClick}
    >

      {/* Image container with fixed height */}
      <div className="relative h-52 overflow-hidden">
        <ImageGallery
          images={post.imageUrls || []}
          altText={post.title}
        />
      </div>

      {/* Property information */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{post.title}</h3>
        </div>

        <div className="flex items-center mb-3 text-gray-600 text-sm">
          <MapPin size={14} className="mr-1" />
          <span className="line-clamp-1">{post.aptId || "Địa chỉ: Chưa có thông tin"}</span>
        </div>

        <div className="grid grid-cols-2 gap-y-2 mb-3 text-sm">
          <div className="flex items-center text-gray-600">
            <Users size={14} className="mr-1.5" />
            <span>{post.currentSlot}/{post.totalSlot} người</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar size={14} className="mr-1.5" />
            <span>Đăng: {formatDate(post.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <div className={`${isRoommate ? 'text-blue-600' : 'text-green-600'} font-semibold`}>
              {post.rentPrice.toLocaleString()} đ/tháng
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Call-to-Action Component
const CallToAction: React.FC = () => {
  return (
    <section className="my-12 bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
      <h2 className="text-3xl font-bold mb-4">Bạn có phòng cần cho thuê?</h2>
      <p className="mb-6 max-w-2xl mx-auto">Đăng tin ngay để tiếp cận hàng ngàn người đang tìm kiếm chỗ ở mỗi ngày. Miễn phí đăng tin, dễ dàng quản lý.</p>
      <div className="flex justify-center gap-4 flex-wrap">
        <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
          Tìm hiểu thêm
        </button>
      </div>
    </section>
  );
};

// Skeleton loader for property cards
const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      {/* Image skeleton */}
      <div className="h-52 bg-gray-200"></div>

      {/* Content skeleton */}
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>

        <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Home component
const Home: React.FC = () => {
  const [roommatePosts, setRoommatePosts] = useState<Post[]>([]);
  const [rentalPosts, setRentalPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
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
        const postResponse = await axios.get<PostApiResponse>(`${API_BASE_URL}/api/Post/GetAll`, {
          params: {
            page: 1,
            pageSize: 100000,
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
        // Simulate a more natural loading experience
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    };

    fetchPostsAndImages();
  }, []);

  // Show skeleton loaders when loading
  if (loading) {
    return (
      <div className="animate-fadeIn">
        <div className="container mx-auto px-4 py-8 max-w-[2000px]">
          {/* Hero skeleton */}
          <div className="w-full h-80 bg-gray-200 rounded-xl mb-8 animate-pulse"></div>

          {/* Category pills skeleton */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-full w-40 flex-shrink-0"></div>
            ))}
          </div>

          {/* Section skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Another section skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center mb-4">Lỗi kết nối</h2>
          <p className="text-center text-gray-700 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              onClick={() => window.location.reload()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }
  const handleCardClick1 = () => {
    navigate(`/home/all-posts`);
  };
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full pt-6">
        {/* Hero Carousel Section */}
        <HeroCarousel />

        {/* Category Pills */}
        <CategoryPills />

        {/* Tìm bạn cùng phòng Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-1 h-8 bg-blue-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold text-gray-800">Tìm bạn cùng phòng</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {roommatePosts.length > 0 ? (
              roommatePosts.slice(0, 4).map((post) => (
                <PropertyCard key={post.postId} post={post} isRoommate={true} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-gray-500 mb-4">
                  Không có bài đăng nào phù hợp cho mục "Tìm bạn cùng phòng".
                </p>
              </div>
            )}
          </div>

          {roommatePosts.length > 0 && (
            <div className="flex justify-center mt-8">
              <button
                className="border border-blue-500 text-blue-500 hover:bg-blue-50 px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                onClick={handleCardClick1}
              >
                <span>Xem tất cả</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>

        {/* Căn hộ cho thuê Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-1 h-8 bg-green-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold text-gray-800">Căn hộ cho thuê</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rentalPosts.length > 0 ? (
              rentalPosts.slice(0, 4).map((post) => (
                <PropertyCard key={post.postId} post={post} isRoommate={false} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-gray-500 mb-4">
                  Không có bài đăng nào phù hợp cho mục "Căn hộ cho thuê".
                </p>
                <button className="bg-green-500 text-white px-6 py-2.5 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 mx-auto">
                  <BookmarkPlus size={18} />
                  <span>Đăng tin ngay</span>
                </button>
              </div>
            )}
          </div>

          {rentalPosts.length > 0 && (
            <div className="flex justify-center mt-8">
              <button
                className="border border-green-500 text-green-500 hover:bg-green-50 px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                onClick={handleCardClick1}
              >
                <span>Xem tất cả</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>

        {/* Call to Action */}
        <CallToAction />

        {/* Stats section */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Vì sao chọn chúng tôi?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">10,000+</h3>
              <p className="text-gray-600">Người dùng hoạt động</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HomeIcon size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">5,000+</h3>
              <p className="text-gray-600">Bất động sản cho thuê</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={28} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">98%</h3>
              <p className="text-gray-600">Khách hàng hài lòng</p>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg transition-colors">
              Tìm hiểu thêm về chúng tôi
            </button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Câu hỏi thường gặp</h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Tôi đăng tin cho thuê phòng có mất phí không?",
                a: "Hiện tại, việc đăng tin cho thuê phòng trên nền tảng của chúng tôi hoàn toàn miễn phí. Bạn có thể đăng tin và quản lý bài đăng mà không phải trả bất kỳ chi phí nào."
              },
              {
                q: "Làm thế nào để tìm bạn cùng phòng phù hợp?",
                a: "Bạn có thể sử dụng tính năng lọc và tìm kiếm để tìm kiếm bạn cùng phòng phù hợp với tiêu chí của mình về giới tính, độ tuổi, thói quen sống và ngân sách..."
              },
              {
                q: "Tôi có thể liên hệ với người cho thuê như thế nào?",
                a: "Sau khi đăng nhập vào hệ thống, bạn có thể xem thông tin liên hệ của người cho thuê trên trang chi tiết của mỗi bài đăng, hoặc sử dụng hệ thống nhắn tin trực tiếp của chúng tôi."
              }
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <h3 className="font-medium text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-500">Không tìm thấy câu trả lời bạn đang tìm kiếm?</p>
            <button className="mt-2 text-blue-600 hover:underline">Liên hệ hỗ trợ</button>
          </div>
        </section>

        {/* App Download Section */}
        <section className="bg-gradient-to-r from-blue-500 to-blue-700 p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-6">
              <h2 className="text-3xl font-bold mb-3">Tải ứng dụng di động</h2>
              <p className="mb-6 max-w-md">Tìm kiếm và quản lý phòng thuê mọi lúc mọi nơi với ứng dụng di động tiện lợi của chúng tôi.</p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-black text-white rounded-lg px-4 py-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm4 9h-3v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H6c-.55 0-1-.45-1-1s.45-1 1-1h3V6c0-.55.45-1 1-1s1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1z" />
                  </svg>
                  <div>
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </button>
                <button className="bg-black text-white rounded-lg px-4 py-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0 8c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-bold">App Store</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;