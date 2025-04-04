import React from 'react';
import { Row, Col, Card, Avatar, Rate, Divider, Statistic } from 'antd';
import {
    UserOutlined,
    HomeOutlined,
    CheckCircleOutlined,
    SmileOutlined
} from '@ant-design/icons';

// Dữ liệu testimonial mẫu
const testimonials = [
    {
        id: 1,
        name: 'Nguyễn Văn A',
        avatar: null,
        rating: 5,
        comment: 'Tôi đã tìm được căn hộ ưng ý chỉ sau 3 ngày tìm kiếm trên website. Giao diện dễ sử dụng và nhiều lựa chọn phù hợp.',
        date: '20/03/2024'
    },
    {
        id: 2,
        name: 'Trần Thị B',
        avatar: null,
        rating: 4.5,
        comment: 'Dịch vụ tư vấn rất tốt, giúp tôi tìm được căn hộ phù hợp với ngân sách. Sẽ giới thiệu cho bạn bè.',
        date: '15/03/2024'
    },
    {
        id: 3,
        name: 'Lê Văn C',
        avatar: null,
        rating: 5,
        comment: 'Website có nhiều tính năng lọc hay, giúp tôi tiết kiệm thời gian tìm kiếm. Thông tin nhà cho thuê rất chi tiết và chính xác.',
        date: '10/03/2024'
    }
];

const StatisticsAndTestimonials: React.FC = () => {
    return (
        <div className="statistics-testimonials my-16">
            {/* Phần thống kê */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-8 rounded-2xl shadow-xl mb-16">
                <h2 className="text-2xl font-bold mb-8 text-center">Chúng Tôi Tự Hào</h2>

                <Row gutter={48} justify="center">
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title={<span className="text-white/80">Căn Hộ Đã Cho Thuê</span>}
                            value={1500}
                            prefix={<HomeOutlined />}
                            valueStyle={{ color: 'white', fontWeight: 'bold' }}
                        />
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title={<span className="text-white/80">Người Dùng Hài Lòng</span>}
                            value={3000}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: 'white', fontWeight: 'bold' }}
                        />
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title={<span className="text-white/80">Nhà Môi Giới</span>}
                            value={500}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: 'white', fontWeight: 'bold' }}
                        />
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title={<span className="text-white/80">Đánh Giá 5 Sao</span>}
                            value={95}
                            suffix="%"
                            prefix={<SmileOutlined />}
                            valueStyle={{ color: 'white', fontWeight: 'bold' }}
                        />
                    </Col>
                </Row>
            </div>

            {/* Phần đánh giá */}
            <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                    Khách Hàng Nói Gì Về Chúng Tôi
                </h2>

                <Row gutter={[24, 24]}>
                    {testimonials.map(testimonial => (
                        <Col xs={24} md={8} key={testimonial.id}>
                            <Card
                                className="h-full rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-0"
                                bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                            >
                                <div className="flex items-center mb-4">
                                    <Avatar
                                        size={48}
                                        icon={<UserOutlined />}
                                        src={testimonial.avatar}
                                        className="bg-blue-500"
                                    />
                                    <div className="ml-4">
                                        <h4 className="font-bold">{testimonial.name}</h4>
                                        <Rate disabled defaultValue={testimonial.rating} allowHalf />
                                    </div>
                                </div>

                                <Divider className="my-3" />

                                <p className="italic text-gray-600 flex-grow">"{testimonial.comment}"</p>

                                <div className="text-right text-gray-400 text-sm mt-4">
                                    {testimonial.date}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};

export default StatisticsAndTestimonials;