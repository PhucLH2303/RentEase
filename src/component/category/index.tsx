import React from 'react';
import { Card, Row, Col } from 'antd';
import {
    HomeOutlined,
    BuildOutlined,
    ShopOutlined,
    TeamOutlined
} from '@ant-design/icons';

interface CategoryProps {
    categories: Array<{
        id: number;
        categoryName: string;
        note: string;
    }>;
}

const CategoryShowcase: React.FC<CategoryProps> = ({ categories }) => {
    // Danh sách icon tương ứng với các danh mục
    const categoryIcons = [
        <HomeOutlined style={{ fontSize: 36, color: '#1890ff' }} />,
        <BuildOutlined style={{ fontSize: 36, color: '#52c41a' }} />,
        <ShopOutlined style={{ fontSize: 36, color: '#fa8c16' }} />,
        <TeamOutlined style={{ fontSize: 36, color: '#722ed1' }} />
    ];

    // Danh sách màu nền cho các danh mục
    const categoryBackgrounds = [
        '#f0f5ff', // Light blue
        '#e6fffb', // Light green
        '#fff7e6', // Light orange
        '#f9e6ff'  // Light purple
    ];

    return (
        <div className="category-showcase my-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 relative pl-4 border-l-4 border-blue-600">
                Khám Phá Theo Danh Mục
            </h2>

            <Row gutter={[24, 24]}>
                {categories.slice(0, 4).map((category, index) => (
                    <Col xs={24} sm={12} md={6} key={category.id}>
                        <Card
                            hoverable
                            className="h-64 overflow-hidden rounded-lg border-0 shadow-md transition-all duration-300 hover:shadow-xl relative"
                            bodyStyle={{ padding: 0 }}
                        >
                            <div className="absolute inset-0"
                                style={{
                                    backgroundColor: categoryBackgrounds[index % categoryBackgrounds.length],
                                    transition: 'background-color 0.5s ease',
                                }}
                            >
                                {/* Background color without the image */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30"></div>
                            </div>

                            <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6 text-center">
                                <div className="mb-4">
                                    {categoryIcons[index % categoryIcons.length]}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{category.categoryName}</h3>
                                <p className="text-white/80 line-clamp-3">{category.note}</p>

                                {/* <button className="mt-4 bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 transition-colors duration-300 rounded-full px-6 py-1 text-sm font-medium">
                                    Xem tất cả
                                </button> */}
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default CategoryShowcase;
