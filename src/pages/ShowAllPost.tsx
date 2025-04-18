import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { ChevronLeft, ChevronRight, MapPin, Home as HomeIcon, Users, Calendar, Heart, Star } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

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

interface ImageApiResponse {
    statusCode: number;
    message: string;
    data: {
        aptId: string;
        images: {
            id: number;
            imageUrl: string;
            createAt: string;
            updateAt: string;
        }[];
    };
}

interface LocationState {
    type: 'roommate' | 'rental';
}

// ImageGallery component for property cards
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

            {/* Favorite button overlay */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    // Add favorite logic here
                }}
                className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
                aria-label="Add to favorites"
            >
                <Heart size={16} className="text-red-500" />
            </button>
        </div>
    );
};

// PropertyCard component
const PropertyCard: React.FC<{ post: Post; isRoommate: boolean }> = ({ post, isRoommate }) => {
    const navigate = useNavigate();
    const cardClass = isRoommate ? 'hover:border-blue-300' : 'hover:border-green-300';

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
                    <div className="flex items-center text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <span className="ml-1 text-sm font-medium">4.8</span>
                    </div>
                </div>

                <div className="flex items-center mb-3 text-gray-600 text-sm">
                    <MapPin size={14} className="mr-1" />
                    <span className="line-clamp-1">{post.aptId || "Địa chỉ: Chưa có thông tin"}</span>
                </div>

                <div className="grid grid-cols-2 gap-y-2 mb-3 text-sm">
                    <div className="flex items-center text-gray-600">
                        <HomeIcon size={14} className="mr-1.5" />
                        <span>Số phòng: {post.totalSlot}</span>
                    </div>
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
            </div>
        </div>
    );
};

// Main ShowAllPost component
const ShowAllPost: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState;
    const postType = state?.type || 'rental'; // Default to rental if not specified

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const API_BASE_URL = 'https://www.renteasebe.io.vn';

    const textColor = postType === 'roommate' ? 'text-blue-600' : 'text-green-600';
    const categoryId = postType === 'roommate' ? 2 : 1;

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage, postType]);

    const fetchPosts = async (page: number) => {
        try {
            setLoading(true);
            const accessToken = localStorage.getItem('accessToken');

            if (!accessToken) {
                setError('No access token found. Please log in.');
                setLoading(false);
                return;
            }

            // Fetch posts with pagination
            const postResponse = await axios.get<PostApiResponse>(`${API_BASE_URL}/api/Post/GetAll`, {
                params: {
                    page: page,
                    pageSize: 12, // Show more posts per page
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

            // Set total pages for pagination
            setTotalPages(postResponse.data.totalPages);

            // Filter posts by category
            const filteredPosts = postResponse.data.data.filter(
                (post) => post.status === true && post.postCategoryId === categoryId
            );

            // Fetch images for each post
            const postsWithImages = await Promise.all(
                filteredPosts.map(async (post) => {
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
                            const imageUrls = imageResponse.data.data.images.map(img =>
                                `${API_BASE_URL}${img.imageUrl}`
                            );
                            return { ...post, imageUrls };
                        }

                        return { ...post, imageUrls: [] };
                    } catch (imageErr) {
                        console.error(`Failed to fetch images for aptId ${post.aptId}:`, imageErr);
                        return { ...post, imageUrls: [] };
                    }
                })
            );

            setPosts(postsWithImages);
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
            setTimeout(() => {
                setLoading(false);
            }, 800);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Toggle between roommate and rental posts
    const togglePostType = (type: 'roommate' | 'rental') => {
        navigate('/home/all-posts', { state: { type } });
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => navigate('/home')}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Go back"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </div>

                    <div className="flex justify-center mb-8 space-x-4">
                        <button
                            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${postType === 'roommate' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            onClick={() => togglePostType('roommate')}
                        >
                            Tìm bạn cùng phòng
                        </button>
                        <button
                            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${postType === 'rental' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            onClick={() => togglePostType('rental')}
                        >
                            Căn hộ cho thuê
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <PropertyCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => navigate('/home')}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Go back"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <div className="text-red-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold mb-4">Lỗi kết nối</h2>
                        <p className="text-gray-700 mb-6">{error}</p>
                        <button
                            className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mx-auto"
                            onClick={() => fetchPosts(currentPage)}
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

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header with back button */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate('/home')}
                        className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Go back"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>

                {/* Toggle buttons */}
                <div className="flex justify-center mb-8 space-x-4">
                    <button
                        className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${postType === 'roommate' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        onClick={() => togglePostType('roommate')}
                    >
                        Tìm bạn cùng phòng
                    </button>
                    <button
                        className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${postType === 'rental' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        onClick={() => togglePostType('rental')}
                    >
                        Căn hộ cho thuê
                    </button>
                </div>

                {/* Results count */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`font-medium ${textColor}`}>
                        Hiển thị {posts.length} kết quả
                    </h2>
                </div>

                {/* Results grid */}
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {posts.map((post) => (
                            <PropertyCard
                                key={post.postId}
                                post={post}
                                isRoommate={postType === 'roommate'}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <p className="text-gray-500 mb-4">
                            Không có bài đăng nào phù hợp cho mục.
                        </p>
                        <button
                            onClick={() => navigate('/home')}
                            className={`bg-${postType === 'roommate' ? 'blue' : 'green'}-500 text-white px-6 py-2.5 rounded-lg hover:bg-${postType === 'roommate' ? 'blue' : 'green'}-600 transition-colors flex items-center gap-2 mx-auto`}
                        >
                            <ChevronLeft size={18} />
                            <span>Quay lại trang chủ</span>
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-full ${currentPage === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Logic to show pagination numbers properly
                                let pageNumber;
                                if (totalPages <= 5) {
                                    pageNumber = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNumber = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNumber = totalPages - 4 + i;
                                } else {
                                    pageNumber = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentPage === pageNumber
                                            ? `bg-${postType === 'roommate' ? 'blue' : 'green'}-100 text-${postType === 'roommate' ? 'blue' : 'green'}-700 font-medium`
                                            : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-full ${currentPage === totalPages
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                aria-label="Next page"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShowAllPost;