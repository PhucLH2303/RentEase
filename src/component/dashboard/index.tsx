import React, { useState } from "react";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    SettingOutlined,
    AppstoreOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme, Avatar, Dropdown, message } from "antd";
import { useNavigate } from "react-router-dom";
import DashboardHome from "../../pages/admin/dashboard";
import Users from "../../pages/admin/user";
import Manage from "../../pages/admin/manage";

const { Header, Sider, Content } = Layout;

const Dashboard: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedPage, setSelectedPage] = useState("dashboard");
    const navigate = useNavigate(); // Điều hướng

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Hàm để render trang tương ứng khi chọn menu
    const renderContent = () => {
        switch (selectedPage) {
            case "dashboard":
                return <DashboardHome />;
            case "users":
                return <Users />;
            case "manage":
                return <Manage />;
            default:
                return <DashboardHome />;
        }
    };

    // Xử lý Logout
    const handleLogout = () => {
        message.success("Logged out successfully!");
        setTimeout(() => {
            navigate("/"); // Điều hướng về trang Login
        }, 1000);
    };

    // Menu dropdown khi click vào Avatar
    const userMenu = (
        <Menu
            items={[
                { key: "profile", icon: <UserOutlined />, label: "Profile" },
                { key: "settings", icon: <SettingOutlined />, label: "Settings" },
                { key: "logout", icon: <LogoutOutlined />, label: "Logout", onClick: handleLogout },
            ]}
        />
    );

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div className="text-white text-center py-4 text-xl font-bold">
                    {collapsed ? "D" : "Dashboard"}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedPage]}
                    onClick={(e) => setSelectedPage(e.key)}
                >
                    <Menu.Item key="dashboard" icon={<AppstoreOutlined />}>
                        Dashboard
                    </Menu.Item>
                    <Menu.Item key="users" icon={<UserOutlined />}>
                        Users
                    </Menu.Item>
                    <Menu.Item key="manage" icon={<SettingOutlined />}>
                        Manage
                    </Menu.Item>
                    <Menu.Item key="settings" icon={<SettingOutlined />}>
                        Settings
                    </Menu.Item>
                </Menu>
            </Sider>

            {/* Main Layout */}
            <Layout>
                {/* Header */}
                <Header
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0 16px",
                        background: colorBgContainer,
                    }}
                >
                    {/* Nút Toggle Sidebar */}
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: "18px" }}
                    />

                    {/* Avatar & Dropdown Menu */}
                    <Dropdown overlay={userMenu} placement="bottomRight">
                        <Avatar
                            size="large"
                            icon={<UserOutlined />}
                            className="cursor-pointer"
                        />
                    </Dropdown>
                </Header>

                {/* Content */}
                <Content
                    style={{
                        margin: "16px",
                        padding: "24px",
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {renderContent()} {/* Hiển thị trang tương ứng */}
                </Content>
            </Layout>
        </Layout>
    );
};

export default Dashboard;
