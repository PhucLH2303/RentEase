import React from "react";
import { Card, Badge, Tooltip, Tag } from "antd";
import { UserOutlined, HomeOutlined, DollarOutlined, CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

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

interface Category {
  id: number;
  categoryName: string;
  note: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  status: boolean | null;
}

interface PropertyGridProps {
  posts: Post[];
  categories: Category[];
  images: { [key: string]: string };
}

const EnhancedPropertyGrid: React.FC<PropertyGridProps> = ({ posts, categories, images }) => {
  const navigate = useNavigate();

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.note : "Unknown";
  };

  const formatPrice = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " VND";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const calculateAvailableSlots = (total: number, current: number): number => {
    return Math.max(0, total - current);
  };

  // Updated to navigate to post detail page instead of apartment detail
  const handleCardClick = (postId: string) => {
    navigate(`/home/post/${postId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts
        .filter((post) => post.status === true && post.postCategoryId === 1)
        .map((post) => (
          <Card
            key={post.postId}
            hoverable
            className="overflow-hidden transition-all duration-300 hover:shadow-lg"
            cover={
              <div className="h-48 overflow-hidden relative">
                <img
                  alt={post.title}
                  src={images[post.aptId]}
                  className="w-full h-full object-cover"
                />
                <Badge.Ribbon
                  text={getCategoryName(post.postCategoryId)}
                  color="blue"
                  className="z-10"
                />
              </div>
            }
            onClick={() => handleCardClick(post.postId)}
          >
            <div className="h-36">
              <h3 className="text-lg font-bold mb-2 truncate">{post.title}</h3>
              <div className="flex items-center mb-2">
                <DollarOutlined className="mr-2 text-green-600" />
                <span className="font-semibold">{formatPrice(post.rentPrice)}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Tooltip title="Còn trống">
                  <Tag color="green" icon={<UserOutlined />}>
                    {calculateAvailableSlots(post.totalSlot, post.currentSlot)} / {post.totalSlot} chỗ
                  </Tag>
                </Tooltip>
                <Tooltip title="Loại phòng">
                  <Tag color="blue" icon={<HomeOutlined />}>
                    {getCategoryName(post.postCategoryId)}
                  </Tag>
                </Tooltip>
                <Tooltip title="Ngày đăng">
                  <Tag color="purple" icon={<CalendarOutlined />}>
                    {formatDate(post.createdAt)}
                  </Tag>
                </Tooltip>
              </div>
              <p className="text-gray-500 text-sm line-clamp-2">{post.note}</p>
            </div>
          </Card>
        ))}
    </div>
  );

};

export default EnhancedPropertyGrid;