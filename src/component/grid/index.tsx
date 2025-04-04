import React from 'react';
import { Card, Tag, Button, Tooltip, Badge } from 'antd';
import {
    HeartOutlined,
    UserOutlined,
    CalendarOutlined,
    InfoCircleOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import type { BadgeProps } from 'antd';

interface Post {
    postId: string;
    title: string;
    rentPrice: number;
    note: string;
    totalSlot: number;
    currentSlot: number;
    moveInDate: string;
    approveStatusId: number;
    postCategoryId: number;
    aptId: string; // Ensure aptId is included
}

interface Category {
    id: number;
    categoryName: string;
    note: string;
}

interface EnhancedPropertyGridProps {
    posts: Post[];
    categories: Category[];
    images?: { [key: string]: string };
}

const EnhancedPropertyGrid: React.FC<EnhancedPropertyGridProps> = ({ posts, categories, images = {} }) => {
    const getCategoryName = (categoryId: number): string => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.note : 'Chưa phân loại';
    };

    const getStatusBadge = (statusId: number): { color: BadgeProps['color']; text: string } => {
        switch (statusId) {
            case 1: return { color: 'green', text: 'Còn trống' };
            case 2: return { color: 'blue', text: 'Sắp có' };
            case 3: return { color: 'orange', text: 'Đang hot' };
            default: return { color: 'default', text: 'Chưa xác định' };
        }
    };

    return (
        <div className="enhanced-property-grid">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => {
                    const statusBadge = getStatusBadge(post.approveStatusId);
                    const postImage = images[post.aptId] ||
                        `https://source.unsplash.com/random/800x600/?apartment,${post.postId}`;

                    return (
                        <Badge.Ribbon
                            text={statusBadge.text}
                            color={statusBadge.color}
                            key={post.postId}
                        >
                            <Card
                                hoverable
                                className="overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-xl border-0"
                                cover={
                                    <div className="relative group h-56 overflow-hidden">
                                        <img
                                            alt={post.title}
                                            src={postImage}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://source.unsplash.com/random/800x600/?apartment,${post.postId}`;
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <Button
                                            shape="circle"
                                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                                            icon={<HeartOutlined />}
                                        />
                                        <div className="absolute bottom-0 left-0 p-3 bg-blue-600 text-white font-bold">
                                            {post.rentPrice > 0
                                                ? `${post.rentPrice.toLocaleString()} VNĐ/tháng`
                                                : "Liên hệ giá"
                                            }
                                        </div>
                                    </div>
                                }
                                actions={[
                                    <Button type="link" icon={<InfoCircleOutlined />} className="text-blue-600">
                                        Chi tiết
                                    </Button>
                                ]}
                                bodyStyle={{ padding: '16px' }}
                            >
                                <div>
                                    <Tag color="blue" className="mb-2">
                                        {getCategoryName(post.postCategoryId)}
                                    </Tag>
                                    <h3 className="text-lg font-bold mb-2 line-clamp-1">{post.title}</h3>
                                    <div className="space-y-2 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <EnvironmentOutlined className="text-gray-400" />
                                            <Tooltip title="Khu vực">
                                                <span>Quận 2, Hồ Chí Minh</span>
                                            </Tooltip>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <UserOutlined className="text-gray-400" />
                                            <Tooltip title="Số chỗ trống">
                                                <span>{post.currentSlot}/{post.totalSlot} chỗ trống</span>
                                            </Tooltip>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CalendarOutlined className="text-gray-400" />
                                            <Tooltip title="Ngày nhận phòng">
                                                <span>{new Date(post.moveInDate).toLocaleDateString('vi-VN')}</span>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-gray-500 line-clamp-2 text-sm">
                                        {post.note}
                                    </p>
                                </div>
                            </Card>
                        </Badge.Ribbon>
                    );
                })}
            </div>
        </div>
    );
};

export default EnhancedPropertyGrid;