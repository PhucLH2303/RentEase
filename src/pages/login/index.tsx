import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Checkbox, Form, Input, notification } from "antd";
import axios from "axios";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const openNotification = (type: "success" | "error", message: string, description: string) => {
        notification[type]({
            message,
            description,
            placement: "topRight",
        });
    };

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        try {
            const response = await axios.post("https://www.renteasebe.io.vn/api/Auth/SignIn", values);
            const { accessToken, accountRes } = response.data.data;

            // ✅ Lưu thông tin vào localStorage
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("user", JSON.stringify(accountRes));
            localStorage.setItem("roleId", accountRes.roleId.toString());

            openNotification("success", "Login Successful", "You have successfully logged in.");

            // ✅ Điều hướng theo roleId
            setTimeout(() => {
                if (accountRes.roleId === 1) {
                    navigate("/admin");
                } else {
                    navigate("/home");
                }
            }, 1000);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            openNotification("error", "Login Failed", err.response?.data?.message || "Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="bg-white shadow-2xl rounded-xl flex max-w-4xl w-full overflow-hidden">
                <div className="hidden md:block w-1/2 relative">
                    <img
                        src="https://i.pinimg.com/736x/d8/1b/f3/d81bf3f2e3e706e40962f5f8c69301f8.jpg"
                        alt="Login"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                </div>
                <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mt-4 text-gray-800">Welcome Back</h2>
                        <p className="text-gray-500">Sign in to continue</p>
                    </div>
                    <Form layout="vertical" onFinish={onFinish} className="mt-6 space-y-4">
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[{ required: true, message: "Please enter your username!" }]}
                        >
                            <Input size="large" placeholder="Enter your username" className="rounded-md" />
                        </Form.Item>
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: "Please enter your password!" }]}
                        >
                            <Input.Password size="large" placeholder="Enter password" className="rounded-md" />
                        </Form.Item>
                        <div className="flex items-center justify-between text-sm">
                            <Form.Item name="remember" valuePropName="checked">
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                        </div>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full rounded-lg py-3 bg-blue-600 hover:bg-blue-700"
                                size="large"
                                loading={loading}
                            >
                                Sign in
                            </Button>
                        </Form.Item>
                    </Form>
                    <p className="text-center mt-6 text-gray-600">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-blue-600 hover:underline">
                            Sign up now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
