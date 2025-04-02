import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Form, Input, notification, Result } from "antd";
import axios from "axios";

const Verify: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [email, setEmail] = useState<string>("");

    useEffect(() => {
        // Get email from state passed during navigation
        const params = new URLSearchParams(location.search);
        const emailParam = params.get("email");

        if (emailParam) {
            setEmail(emailParam);
        } else {
            // If no email in URL params, redirect to register
            notification.error({
                message: "Email Required",
                description: "No email address found. Please register again.",
                placement: "topRight",
            });
            navigate("/register");
        }
    }, [location, navigate]);

    const openNotification = (type: "success" | "error", message: string, description: string) => {
        notification[type]({
            message,
            description,
            placement: "topRight",
        });
    };

    const onFinish = async (values: { verificationCode: string }) => {
        setLoading(true);
        try {
            const response = await axios.post("https://www.renteasebe.io.vn/api/Auth/Verification", {
                
                email: email,
                verificationCode: values.verificationCode
            });

            console.log(response);
            setVerified(true);
            openNotification("success", "Verification Successful", "Your email has been verified successfully!");

            // Wait 2 seconds before redirecting to login
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch {
            // openNotification("error", "Verification Failed", error.response?.data?.message || "Invalid verification code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (verified) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="bg-white shadow-2xl rounded-xl p-8 max-w-md w-full">
                    <Result
                        status="success"
                        title="Verification Successful!"
                        subTitle="Your account has been verified. Redirecting to login page..."
                        extra={[
                            <Button
                                type="primary"
                                key="login"
                                onClick={() => navigate("/")}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Go to Login
                            </Button>
                        ]}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="bg-white shadow-2xl rounded-xl flex flex-col max-w-md w-full overflow-hidden">
                <div className="p-8">
                    <div className="text-center">
                        <img src="/logo.png" alt="Logo" className="mx-auto w-20" />
                        <h2 className="text-3xl font-bold mt-4 text-gray-800">Email Verification</h2>
                        <p className="text-gray-500 mt-2 mb-4">
                            We've sent a verification code to <span className="font-semibold">{email}</span>.
                            Please enter the code below to verify your account.
                        </p>
                    </div>

                    <Form layout="vertical" onFinish={onFinish} className="mt-6">
                        <Form.Item
                            name="verificationCode"
                            rules={[
                                { required: true, message: "Please enter the verification code!" },
                                { min: 4, message: "Verification code should be at least 4 characters!" }
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder="Enter verification code"
                                className="rounded-md text-center text-xl tracking-widest"
                                maxLength={8}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full rounded-lg py-3 bg-blue-600 hover:bg-blue-700"
                                size="large"
                                loading={loading}
                            >
                                Verify Account
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            Didn't receive a code? <a href="#" className="text-blue-600 hover:underline">Resend Code</a>
                        </p>
                        <p className="text-gray-600 mt-2">
                            <a onClick={() => navigate("/")} className="text-blue-600 hover:underline cursor-pointer">
                                Back to Login
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Verify;