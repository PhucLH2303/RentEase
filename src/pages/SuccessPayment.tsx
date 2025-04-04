import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const SuccessPayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [transactionId, setTransactionId] = useState(`#SPX${Date.now()}`);

  useEffect(() => {
    const processPayment = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/", { state: { from: location.pathname } });
        return;
      }

      // Parse query parameters from URL
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('code');
      const id = queryParams.get('id');
      const cancel = queryParams.get('cancel');
      const status = queryParams.get('status');
      const orderCode = queryParams.get('orderCode');

      if (code && id && status && orderCode) {
        try {
          // Call the payment callback API
          await axios.post(
            'https://www.renteasebe.io.vn/api/Payment/payment-callback',
            {
              code,
              id,
              cancel: cancel === 'true',
              status,
              orderCode
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          // Set transaction ID to the order code from the URL
          setTransactionId(`#${orderCode}`);
        } catch (error) {
          console.error('Error processing payment callback:', error);
        }
      }
      
      setIsProcessing(false);
    };

    processPayment();
  }, [location, navigate]);

  const handleBackToHome = () => {
    navigate('/home');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xử lý thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ✓
        </div>
        <h1 className="text-2xl font-bold mb-2">Thanh Toán Thành Công!</h1>
        <p className="text-gray-600 mb-2">Cảm ơn bạn đã thực hiện thanh toán.</p>
        <p className="text-gray-600 mb-4">Đơn hàng của bạn đã được xử lý thành công.</p>
        
        <div className="text-left text-gray-600 mb-6">
          <p>Mã giao dịch: {transactionId}</p>
          <p>Ngày: {new Date().toLocaleDateString()}</p>
          <p>Thời gian: {new Date().toLocaleTimeString()}</p>
        </div>

        <button 
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition-colors"
          onClick={handleBackToHome}
        >
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
};

export default SuccessPayment;