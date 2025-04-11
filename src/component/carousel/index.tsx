import React, { useState, useRef } from 'react';
import { Carousel, Tag, Button } from 'antd';
import { HeartOutlined, HeartFilled, RightOutlined, LeftOutlined } from '@ant-design/icons';
import type { CarouselRef } from 'antd/es/carousel';

interface Post {
    postId: string;
    title: string;
    rentPrice: number;
    note: string;
    totalSlot: number;
    currentSlot: number;
    approveStatusId: number;
    aptId: string;
}

interface FeaturedCarouselProps {
    posts: Post[];
    images: { [key: string]: string }; // Nhận images từ Home
    loading: boolean; // Nhận trạng thái loading từ Home
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ posts, images, loading }) => {
    const [favorites, setFavorites] = useState<Record<string, boolean>>({});
    const featuredPosts = posts.slice(0, 5); // Giới hạn 5 bài đăng
    const carouselRef = useRef<CarouselRef>(null);

    const toggleFavorite = (postId: string) => {
        setFavorites(prev => ({
            ...prev,
            [postId]: !prev[postId],
        }));
    };

    const getStatusColor = (statusId: number) => {
        switch (statusId) {
            case 1: return 'green';
            case 2: return 'blue';
            case 3: return 'orange';
            default: return 'default';
        }
    };

    const getStatusText = (statusId: number) => {
        switch (statusId) {
            case 1: return 'Còn trống';
            case 2: return 'Sắp có';
            case 3: return 'Đang hot';
            default: return 'Chưa xác định';
        }
    };
    const handleOnClick = (postId: string) => {
        navigate(`/home/post/${postId}`);
    };

    const next = () => carouselRef.current?.next();
    const previous = () => carouselRef.current?.prev();

    if (loading) {
        return <div className="text-center p-8">Loading featured properties...</div>;
    }

    return (
        <div className="featured-carousel relative mt-8 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-blue-800 flex items-center">
                <span className="bg-blue-600 w-2 h-8 mr-3 inline-block rounded"></span>
                Bất Động Sản Nổi Bật
            </h2>

            <Carousel
                ref={carouselRef}
                autoplay
                className="rounded-xl overflow-hidden shadow-xl"
                dots={{ className: "custom-dots" }}
            >
                {featuredPosts.map((post) => {
                    const postImage = images[post.aptId] || 'https://via.placeholder.com/400'; // Fallback image

                    return (
                        <div key={post.postId} className="relative">
                            <div className="relative h-96 overflow-hidden">
                                <img
                                    src={postImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                                <div className="absolute top-4 right-4 z-10">
                                    <Button
                                        shape="circle"
                                        onClick={() => toggleFavorite(post.postId)}
                                        className={`shadow-lg ${favorites[post.postId] ? "bg-red-50" : "bg-white"}`}
                                        icon={favorites[post.postId] ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                                    />
                                </div>

                                <div className="absolute top-4 left-4">
                                    <Tag color={getStatusColor(post.approveStatusId)} className="px-3 py-1 text-sm font-medium">
                                        {getStatusText(post.approveStatusId)}
                                    </Tag>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h3 className="text-2xl font-bold mb-2">{post.title}</h3>
                                    <p className="text-xl font-semibold mb-2">
                                        {post.rentPrice > 0 ? `${post.rentPrice.toLocaleString()} VNĐ/tháng` : "Liên hệ để biết giá"}
                                    </p>
                                    <p className="text-white/80 mb-4 line-clamp-2">{post.note}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                            Chỗ trống: {post.currentSlot}/{post.totalSlot}
                                        </span>
                                        <Button
                                            type="primary"
                                            className="bg-blue-600 hover:bg-blue-700"
                                            onClick={() => handleOnClick(post.postId)}
                                        >
                                            Xem chi tiết
                                        </Button>

                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Carousel>

            <Button
                className="absolute left-4 top-1/2 z-10 bg-white/70 hover:bg-white shadow-lg transform -translate-y-1/2"
                shape="circle"
                icon={<LeftOutlined />}
                onClick={previous}
            />
            <Button
                className="absolute right-4 top-1/2 z-10 bg-white/70 hover:bg-white shadow-lg transform -translate-y-1/2"
                shape="circle"
                icon={<RightOutlined />}
                onClick={next}
            />
        </div>
    );
};

export default FeaturedCarousel;
