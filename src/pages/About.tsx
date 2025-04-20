import React, { useEffect, useState } from 'react';
import {
    Typography,
    Row,
    Col,
    Card,
    Statistic,
    Timeline,
    Carousel,
    Space
} from 'antd';
import {
    HomeFilled,
    TeamOutlined,
    SafetyOutlined,
    CustomerServiceOutlined,
    GlobalOutlined,
    CheckCircleFilled
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Paragraph, Text } = Typography;

const AboutPage: React.FC = () => {
    const [animateStats, setAnimateStats] = useState(false);

    useEffect(() => {
        setAnimateStats(true);
    }, []);

    // const teamMembers = [
    //     {
    //         name: 'Sarah Kim',
    //         role: 'Founder & CEO',
    //         avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    //         description: 'Former real estate agent with 10+ years experience in East Asian housing markets'
    //     },
    //     {
    //         name: 'David Chen',
    //         role: 'CTO',
    //         avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    //         description: 'Software engineer passionate about creating accessible housing platforms'
    //     },
    //     {
    //         name: 'Minh Nguyen',
    //         role: 'Community Manager',
    //         avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    //         description: 'Housing advocate focusing on international student accommodation needs'
    //     },
    //     {
    //         name: 'Akira Tanaka',
    //         role: 'Marketing Director',
    //         avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
    //         description: 'Digital marketing specialist with expertise in cross-cultural communication'
    //     }
    // ];

    const testimonials = [
        {
            text: "Rent East helped me find the perfect roommate within days of arriving in a new city. The cultural matching system really works!",
            author: "Ngoc Minh, Student",
            location: "Ho Chi Minh City"
        },
        {
            text: "As a property owner, I've never had such a smooth experience finding reliable tenants. The verification system is top-notch.",
            author: "Quốc Việt, Landlord",
            location: "Ho Chi Minh City"
        },
        {
            text: "Moving to a new country was stressful enough, but Rent East made finding accommodation so easy with their translated listings.",
            author: "Tuấn Anh, Office staff",
            location: "Hà Nội"
        },
    ];

    return (
        <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '40px 0' }}>
            <Row justify="center">
                <Col xs={22} md={20} lg={18}>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Card
                            className="hero-section"
                            style={{
                                textAlign: 'center',
                                borderRadius: '15px',
                                backgroundImage: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
                                border: 'none',
                                boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
                            }}
                        >
                            <Space direction="vertical" size="large">
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <HomeFilled style={{ fontSize: '48px', color: '#fff' }} />
                                </motion.div>
                                <Title level={1} style={{ color: '#fff', margin: 0 }}>
                                    Welcome to Rent East
                                </Title>
                                <Title level={3} style={{ color: '#fff', fontWeight: 'normal', marginTop: 0 }}>
                                    Connecting East Asian Communities Through Housing
                                </Title>
                                <Paragraph style={{ fontSize: '18px', color: '#fff' }}>
                                    Your trusted platform for finding apartments and roommates across Eastern cultures
                                </Paragraph>
                            </Space>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <Card style={{ marginTop: '40px', borderRadius: '15px' }}>
                            <Title level={2} style={{ textAlign: 'center', color: '#1890ff' }}>Our Mission</Title>
                            <Paragraph style={{ fontSize: '16px', textAlign: 'center' }}>
                                Rent East was founded in 2024 with a simple goal: to create a specialized housing platform
                                that understands the unique needs of Viet Nam communities. We bridge cultural and language
                                barriers to make finding homes and roommates a seamless experience, whether you're a student,
                                professional, or property owner.
                            </Paragraph>

                            <Row gutter={[24, 24]} style={{ marginTop: '40px' }}>
                                <Col xs={24} sm={12} md={8}>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card
                                            style={{ height: '100%', borderRadius: '10px', borderTop: '4px solid #1890ff' }}
                                            hoverable
                                        >
                                            <SafetyOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                                            <Title level={4}>Trust & Safety</Title>
                                            <Paragraph>
                                                Advanced verification processes and review systems to create a secure community for all users.
                                            </Paragraph>
                                        </Card>
                                    </motion.div>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card
                                            style={{ height: '100%', borderRadius: '10px', borderTop: '4px solid #52c41a' }}
                                            hoverable
                                        >
                                            <GlobalOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                                            <Title level={4}>Cultural Bridge</Title>
                                            <Paragraph>
                                                Multilingual support and cultural matching algorithms to help you find compatible housing situations.
                                            </Paragraph>
                                        </Card>
                                    </motion.div>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card
                                            style={{ height: '100%', borderRadius: '10px', borderTop: '4px solid #fa8c16' }}
                                            hoverable
                                        >
                                            <CustomerServiceOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />
                                            <Title level={4}>24/7 Support</Title>
                                            <Paragraph>
                                                Dedicated assistance in multiple languages to help with any housing challenges you face.
                                            </Paragraph>
                                        </Card>
                                    </motion.div>
                                </Col>
                            </Row>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: animateStats ? 1 : 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        <Card style={{ marginTop: '40px', borderRadius: '15px', background: '#f0f5ff' }}>
                            <Title level={2} style={{ textAlign: 'center', color: '#1890ff' }}>Our Impact</Title>

                            <Row gutter={[48, 24]} style={{ marginTop: '30px' }}>
                                <Col xs={12} md={6}>
                                    <Statistic
                                        title={<Text strong>Active Users</Text>}
                                        value={200}
                                        prefix={<TeamOutlined />}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Col>
                                <Col xs={12} md={6}>
                                    <Statistic
                                        title={<Text strong>Properties Listed</Text>}
                                        value={450}
                                        prefix={<HomeFilled />}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Col>
                                <Col xs={12} md={6}>
                                    <Statistic
                                        title={<Text strong>Cities Covered</Text>}
                                        value={60}
                                        prefix={<GlobalOutlined />}
                                        valueStyle={{ color: '#fa8c16' }}
                                    />
                                </Col>
                                <Col xs={12} md={6}>
                                    <Statistic
                                        title={<Text strong>Successful Matches</Text>}
                                        value={75}
                                        prefix={<CheckCircleFilled />}
                                        valueStyle={{ color: '#eb2f96' }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </motion.div>

                    <Row gutter={[24, 24]} style={{ marginTop: '40px' }}>
                        <Col xs={24} md={12}>
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                            >
                                <Card style={{ height: '100%', borderRadius: '15px' }}>
                                    <Title level={3} style={{ color: '#1890ff' }}>Our Journey</Title>
                                    <Timeline
                                        items={[
                                            {
                                                color: 'green',
                                                children: (
                                                    <>
                                                        <Text strong style={{ fontSize: '16px' }}>6/2024</Text>
                                                        <p>Founded in HoChiMinh City with a focus on FPT students</p>
                                                    </>
                                                ),
                                            },
                                            {
                                                color: 'green',
                                                children: (
                                                    <>
                                                        <Text strong style={{ fontSize: '16px' }}>11/2024</Text>
                                                        <p>Expanded to major cities across VietNam</p>
                                                    </>
                                                ),
                                            },
                                            {
                                                color: 'blue',
                                                children: (
                                                    <>
                                                        <Text strong style={{ fontSize: '16px' }}>2/2025</Text>
                                                        <p>Launched cultural compatibility matching system</p>
                                                    </>
                                                ),
                                            },
                                            {
                                                color: 'blue',
                                                children: (
                                                    <>
                                                        <Text strong style={{ fontSize: '16px' }}>4/2025</Text>
                                                        <p>Now serving with over 100 active users</p>
                                                    </>
                                                ),
                                            },
                                        ]}
                                    />
                                </Card>
                            </motion.div>
                        </Col>

                        <Col xs={24} md={12}>
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                            >
                                <Card style={{ height: '100%', borderRadius: '15px' }}>
                                    <Title level={3} style={{ color: '#1890ff' }}>What Our Users Say</Title>
                                    <Carousel autoplay dots={{ className: 'custom-carousel-dots' }}>
                                        {testimonials.map((testimonial, index) => (
                                            <div key={index}>
                                                <Card style={{ margin: '10px', borderRadius: '10px', background: '#f9f9f9' }}>
                                                    <Paragraph style={{ fontSize: '16px', fontStyle: 'italic' }}>
                                                        "{testimonial.text}"
                                                    </Paragraph>
                                                    <div>
                                                        <Text strong>{testimonial.author}</Text>
                                                        <br />
                                                        <Text type="secondary">{testimonial.location}</Text>
                                                    </div>
                                                </Card>
                                            </div>
                                        ))}
                                    </Carousel>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>

                    {/* <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                    >
                        <Card style={{ marginTop: '40px', borderRadius: '15px' }}>
                            <Title level={2} style={{ textAlign: 'center', color: '#1890ff' }}>Meet Our Team</Title>
                            <Row gutter={[24, 24]} style={{ marginTop: '20px' }}>
                                {teamMembers.map((member, index) => (
                                    <Col xs={24} sm={12} md={6} key={index}>
                                        <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                                            <Card
                                                hoverable
                                                style={{ textAlign: 'center', height: '100%', borderRadius: '10px' }}
                                                cover={
                                                    <div style={{ padding: '20px 0 10px' }}>
                                                        <Avatar size={100} src={member.avatar} />
                                                    </div>
                                                }
                                            >
                                                <Card.Meta
                                                    title={member.name}
                                                    description={
                                                        <>
                                                            <Text type="secondary">{member.role}</Text>
                                                            <Paragraph style={{ marginTop: '10px' }}>{member.description}</Paragraph>
                                                        </>
                                                    }
                                                />
                                            </Card>
                                        </motion.div>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </motion.div> */}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                    >
                        <Card
                            style={{
                                marginTop: '40px',
                                borderRadius: '15px',
                                textAlign: 'center',
                                background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                                border: 'none'
                            }}
                        >
                            <Space direction="vertical" size="large">
                                <Title level={2} style={{ color: '#fff', marginBottom: '5px' }}>
                                    Ready to Find Your Perfect Match?
                                </Title>
                                <Paragraph style={{ fontSize: '18px', color: '#fff' }}>
                                    Join with us
                                </Paragraph>
                            </Space>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </div>
    );
};

export default AboutPage;