import React, { useState, useEffect } from 'react';
import {
    Layout,
    Card,
    Table,
    Tag,
    Statistic,
    Space,
    Spin,
    DatePicker,
    Select
} from 'antd';
import {
    DashboardOutlined,
    ShoppingCartOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Area, Pie } from '@ant-design/plots';
import axios from 'axios';
import moment from 'moment';

const { Header, Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Order {
    orderId: string;
    orderTypeId: string;
    orderCode: string;
    postId: string;
    senderId: string;
    totalAmount: number;
    note: string;
    createdAt: string;
    paidAt: string | null;
    cancelledAt: string | null;
    paymentStatusId: number;
}

interface Account {
    accountId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string | null;
    genderId: number | null;
    oldId: string | null;
    avatarUrl: string | null;
    roleId: number;
    isVerify: boolean;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
    status: boolean;
}

interface OrderResponse {
    statusCode: number;
    message: string;
    count: number;
    currentPage: number;
    totalPages: number;
    data: Order[];
}

interface AccountResponse {
    statusCode: number;
    message: string;
    count: number;
    currentPage: number;
    totalPages: number;
    data: Account[];
}

const API_BASE_URL = 'https://www.renteasebe.io.vn';

const AdminDashboard: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<number | null>(null);
    const [accountTypeFilter, setAccountTypeFilter] = useState<number | null>(null);

    // Get token from localStorage
    const token = localStorage.getItem('accessToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJlZTM1ZmYyMTlkMjQwYjg4Zjg0NmZlY2U3ZDdhYzdlIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiMiIsImV4cCI6MTc0NDI5ODk3NiwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzI1NSIsImF1ZCI6Imh0dHBzOi8vbG9jYWxob3N0OjcyNTUifQ.6_f9euomZ37lDaaUck0PfMBQI3tB7GGDROKULf_RJ2k';

    const getPaymentStatusName = (statusId: number): string => {
        switch (statusId) {
            case 1: return 'Chờ thanh toán';
            case 2: return 'Đã thanh toán';
            case 3: return 'Hoàn thành';
            case 4: return 'Đã hủy';
            default: return 'Không xác định';
        }
    };

    const getPaymentStatusColor = (statusId: number): string => {
        switch (statusId) {
            case 1: return 'blue';
            case 2: return 'green';
            case 3: return 'purple';
            case 4: return 'red';
            default: return 'default';
        }
    };

    const getRoleName = (roleId: number): string => {
        switch (roleId) {
            case 1: return 'Admin';
            case 2: return 'Chủ nhà';
            case 3: return 'Người thuê';
            default: return 'Không xác định';
        }
    };

    const getRoleColor = (roleId: number): string => {
        switch (roleId) {
            case 1: return 'red';
            case 2: return 'blue';
            case 3: return 'green';
            default: return 'default';
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch orders
                const ordersResponse = await axios.get<OrderResponse>(
                    `${API_BASE_URL}/api/Order/GetAll?page=1&pageSize=100`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // Fetch accounts
                const accountsResponse = await axios.get<AccountResponse>(
                    `${API_BASE_URL}/api/Accounts/GetAll?page=1&pageSize=100`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setOrders(ordersResponse.data.data);
                setAccounts(accountsResponse.data.data);

                // Calculate total revenue from completed orders
                const totalRevenue = ordersResponse.data.data
                    .filter(order => order.paymentStatusId === 2 || order.paymentStatusId === 3)
                    .reduce((sum, order) => sum + order.totalAmount, 0);

                setTotalRevenue(totalRevenue);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    // Chart data preparation for orders by payment status
    const orderStatusData = React.useMemo(() => {
        const statusCounts: { [key: number]: number } = {};

        orders.forEach(order => {
            const { paymentStatusId } = order;
            statusCounts[paymentStatusId] = (statusCounts[paymentStatusId] || 0) + 1;
        });

        return Object.keys(statusCounts).map(statusId => ({
            type: getPaymentStatusName(parseInt(statusId)),
            value: statusCounts[parseInt(statusId)],
        }));
    }, [orders]);

    // Chart data preparation for accounts by role
    const accountRoleData = React.useMemo(() => {
        const roleCounts: { [key: number]: number } = {};

        accounts.forEach(account => {
            const { roleId } = account;
            roleCounts[roleId] = (roleCounts[roleId] || 0) + 1;
        });

        return Object.keys(roleCounts).map(roleId => ({
            type: getRoleName(parseInt(roleId)),
            value: roleCounts[parseInt(roleId)],
        }));
    }, [accounts]);

    // Chart data preparation for revenue over time (last 7 days)
    const revenueData = React.useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
                date: moment(date).format('YYYY-MM-DD'),
                revenue: 0,
            };
        });

        orders.forEach(order => {
            if (order.paymentStatusId === 2 || order.paymentStatusId === 3) {
                const orderDate = moment(order.createdAt).format('YYYY-MM-DD');
                const dayData = last7Days.find(day => day.date === orderDate);
                if (dayData) {
                    dayData.revenue += order.totalAmount;
                }
            }
        });

        return last7Days.map(day => ({
            date: moment(day.date).format('DD/MM'),
            revenue: day.revenue,
        }));
    }, [orders]);

    // Order columns for table
    const orderColumns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderCode',
            key: 'orderCode',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => moment(text).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Số tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount: number) =>
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paidAt',
            key: 'paidAt',
            render: (text: string) => text ? moment(text).format('DD/MM/YYYY HH:mm') : 'Chưa thanh toán',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'paymentStatusId',
            key: 'paymentStatusId',
            render: (statusId: number) => (
                <Tag color={getPaymentStatusColor(statusId)}>
                    {getPaymentStatusName(statusId)}
                </Tag>
            ),
        },
    ];

    // Account columns for table
    const accountColumns = [
        {
            title: 'Tên đầy đủ',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => moment(text).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Vai trò',
            dataIndex: 'roleId',
            key: 'roleId',
            render: (roleId: number) => (
                <Tag color={getRoleColor(roleId)}>
                    {getRoleName(roleId)}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: boolean) => (
                <Tag color={status ? 'green' : 'red'}>
                    {status ? 'Hoạt động' : 'Bị khóa'}
                </Tag>
            ),
        },
    ];

    // Filter orders by payment status
    const filteredOrders = React.useMemo(() => {
        if (paymentStatusFilter === null) {
            return orders;
        }
        return orders.filter(order => order.paymentStatusId === paymentStatusFilter);
    }, [orders, paymentStatusFilter]);

    // Filter accounts by role
    const filteredAccounts = React.useMemo(() => {
        if (accountTypeFilter === null) {
            return accounts;
        }
        return accounts.filter(account => account.roleId === accountTypeFilter);
    }, [accounts, accountTypeFilter]);

    return (
        <Layout className="min-h-screen">
            <Header className="bg-white shadow-sm flex justify-between items-center px-6">
                <div className="flex items-center">
                    <DashboardOutlined className="text-2xl text-blue-600 mr-3" />
                    <h1 className="text-xl font-bold m-0">Admin Dashboard</h1>
                </div>
            </Header>

            <Content className="p-6 bg-gray-50">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spin size="large" />
                    </div>
                ) : (
                    <div>
                        {/* Dashboard Overview Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <Card bordered={false} className="shadow-sm">
                                <Statistic
                                    title="Tổng đơn hàng"
                                    value={orders.length}
                                    prefix={<ShoppingCartOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                            <Card bordered={false} className="shadow-sm">
                                <Statistic
                                    title="Tổng doanh thu"
                                    value={totalRevenue}
                                    prefix="₫"
                                    valueStyle={{ color: '#3f8600' }}
                                    formatter={(value) =>
                                        new Intl.NumberFormat('vi-VN', {
                                            style: 'decimal',
                                            maximumFractionDigits: 0
                                        }).format(Number(value))
                                    }
                                />
                            </Card>
                            <Card bordered={false} className="shadow-sm">
                                <Statistic
                                    title="Đơn hàng hoàn thành"
                                    value={orders.filter(o => o.paymentStatusId === 3).length}
                                    valueStyle={{ color: '#722ed1' }}
                                />
                            </Card>
                            <Card bordered={false} className="shadow-sm">
                                <Statistic
                                    title="Tổng tài khoản"
                                    value={accounts.length}
                                    prefix={<UserOutlined />}
                                    valueStyle={{ color: '#cf1322' }}
                                />
                            </Card>
                        </div>

                        {/* Revenue Chart */}
                        <Card
                            title="Doanh thu 7 ngày gần đây"
                            className="mb-6 shadow-sm"
                            extra={
                                <RangePicker
                                    format="DD/MM/YYYY"
                                    className="w-52"
                                />
                            }
                        >
                            <Area
                                data={revenueData}
                                xField="date"
                                yField="revenue"
                                smooth
                                areaStyle={{
                                    fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
                                }}
                            />
                        </Card>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Card title="Đơn hàng theo trạng thái" className="shadow-sm">
                                <Pie
                                    data={orderStatusData}
                                    angleField="value"
                                    colorField="type"
                                    radius={0.8}
                                    innerRadius={0.6}
                                    label={{
                                        type: 'inner',
                                        offset: '-50%',
                                        content: '{value}',
                                        style: {
                                            textAlign: 'center',
                                            fontSize: 14,
                                        },
                                    }}
                                    interactions={[{ type: 'element-selected' }, { type: 'element-active' }]}
                                    statistic={{
                                        title: false,
                                        content: {
                                            style: {
                                                whiteSpace: 'pre-wrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            },
                                            content: `${orders.length}\nĐơn hàng`,
                                        },
                                    }}
                                />
                            </Card>
                            <Card title="Tài khoản theo vai trò" className="shadow-sm">
                                <Pie
                                    data={accountRoleData}
                                    angleField="value"
                                    colorField="type"
                                    radius={0.8}
                                    innerRadius={0.6}
                                    label={{
                                        type: 'inner',
                                        offset: '-50%',
                                        content: '{value}',
                                        style: {
                                            textAlign: 'center',
                                            fontSize: 14,
                                        },
                                    }}
                                    interactions={[{ type: 'element-selected' }, { type: 'element-active' }]}
                                    statistic={{
                                        title: false,
                                        content: {
                                            style: {
                                                whiteSpace: 'pre-wrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            },
                                            content: `${accounts.length}\nTài khoản`,
                                        },
                                    }}
                                />
                            </Card>
                        </div>

                        {/* Orders Table */}
                        <Card
                            title="Danh sách đơn hàng gần đây"
                            className="mb-6 shadow-sm"
                            extra={
                                <Space>
                                    <span>Lọc theo trạng thái:</span>
                                    <Select
                                        style={{ width: 150 }}
                                        placeholder="Tất cả trạng thái"
                                        allowClear
                                        onChange={(value) => setPaymentStatusFilter(value !== undefined ? value : null)}
                                    >
                                        <Option value={1}>Chờ thanh toán</Option>
                                        <Option value={2}>Đã thanh toán</Option>
                                        <Option value={3}>Hoàn thành</Option>
                                        <Option value={4}>Đã hủy</Option>
                                    </Select>
                                </Space>
                            }
                        >
                            <Table
                                dataSource={filteredOrders}
                                columns={orderColumns}
                                rowKey="orderId"
                                pagination={{ pageSize: 5 }}
                            />
                        </Card>

                        {/* Accounts Table */}
                        <Card
                            title="Danh sách tài khoản"
                            className="shadow-sm"
                            extra={
                                <Space>
                                    <span>Lọc theo vai trò:</span>
                                    <Select
                                        style={{ width: 150 }}
                                        placeholder="Tất cả vai trò"
                                        allowClear
                                        onChange={(value) => setAccountTypeFilter(value !== undefined ? value : null)}
                                    >
                                        <Option value={1}>Admin</Option>
                                        <Option value={2}>Chủ nhà</Option>
                                        <Option value={3}>Người thuê</Option>
                                    </Select>
                                </Space>
                            }
                        >
                            <Table
                                dataSource={filteredAccounts}
                                columns={accountColumns}
                                rowKey="accountId"
                                pagination={{ pageSize: 5 }}
                            />
                        </Card>
                    </div>
                )}
            </Content>
        </Layout>
    );
};

export default AdminDashboard;