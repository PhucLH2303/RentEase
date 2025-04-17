import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Radio, notification } from "antd";
import axios from "axios";

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const openNotification = (type: "success" | "error", message: string, description: string) => {
        notification[type]({
            message,
            description,
            placement: "topRight",
        });
    };

    const onFinish = async (values: {
        fullName: string;
        username: string;
        password: string;
        confirmPassword: string;
        phoneNumber: string;
        roleId: number;
    }) => {
        setLoading(true);
        try {
            const response = await axios.post("https://www.renteasebe.io.vn/api/Auth/SignUp", values);
            console.log(response);

            openNotification("success", "Registration Successful", "Please check your email for the verification code.");
            navigate(`/verify?email=${encodeURIComponent(values.username)}`);
        } catch (error: any) {
            openNotification("error", "Registration Failed", error.response?.data?.message || "Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="bg-white shadow-2xl rounded-xl flex max-w-4xl w-full overflow-hidden">
                {/* Image side */}
                <div className="hidden md:block w-1/2 relative">
                    <img
                        src="https://i.pinimg.com/736x/df/f9/e2/dff9e29b9d32effd2dd82d8b47f8e3a2.jpg"
                        alt="Register"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                </div>

                {/* Registration form */}
                <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mt-4 text-gray-800">Create Account</h2>
                        <p className="text-gray-500">Join our community today</p>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        className="mt-6 space-y-4"
                        initialValues={{ roleId: 3 }}
                    >
                        <Form.Item
                            label="Full Name"
                            name="fullName"
                            rules={[{ required: true, message: "Please enter your full name!" }]}
                        >
                            <Input size="large" placeholder="Enter your full name" className="rounded-md" />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="username"
                            rules={[
                                { required: true, message: "Please enter your email!" },
                                { type: 'email', message: "Please enter a valid email address!" }
                            ]}
                        >
                            <Input size="large" placeholder="Enter your email" className="rounded-md" />
                        </Form.Item>

                        <Form.Item
                            label="Phone Number"
                            name="phoneNumber"
                            rules={[{ required: true, message: "Please enter your phone number!" }]}
                        >
                            <Input size="large" placeholder="Enter your phone number" className="rounded-md" />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                { required: true, message: "Please enter your password!" },
                                { min: 6, message: "Password must be at least 6 characters!" }
                            ]}
                        >
                            <Input.Password size="large" placeholder="Enter password" className="rounded-md" />
                        </Form.Item>

                        <Form.Item
                            label="Confirm Password"
                            name="confirmPassword"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: "Please confirm your password!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password size="large" placeholder="Confirm password" className="rounded-md" />
                        </Form.Item>

                        <Form.Item
                            label="Account Type"
                            name="roleId"
                            rules={[{ required: true, message: "Please select your account type!" }]}
                        >
                            <Radio.Group>
                                <Radio value={2}>Lessor</Radio>
                                <Radio value={3}>Lesses</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full rounded-lg py-3 bg-blue-600 hover:bg-blue-700"
                                size="large"
                                loading={loading}
                            >
                                Create Account
                            </Button>
                        </Form.Item>
                    </Form>

                    <p className="text-center mt-6 text-gray-600">
                        Already have an account? <a href="/" className="text-blue-600 hover:underline">Sign in</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
