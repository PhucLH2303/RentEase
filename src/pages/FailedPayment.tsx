import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const FailedPayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorCode, setErrorCode] = useState(`ERR${Date.now().toString().slice(-4)}`);

  useEffect(() => {
    const processFailedPayment = async () => {
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
      const status = queryParams.get('status') || 'FAILED';
      const orderCode = queryParams.get('orderCode');

      if (id && orderCode) {
        try {
          // Call the payment callback API with status FAILED
          await axios.post(
            'https://www.renteasebe.io.vn/api/Payment/payment-callback',
            {
              code: code || '01', // Default error code if not provided
              id,
              cancel: cancel === 'true' || true,
              status: status || 'FAILED',
              orderCode
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          // Set error code to include order code for reference
          if (orderCode) {
            setErrorCode(`ERR-${orderCode}`);
          }
        } catch (error) {
          console.error('Error processing failed payment callback:', error);
        }
      }
      
      setIsProcessing(false);
    };

    processFailedPayment();
  }, [location, navigate]);

  const handleTryAgain = () => {
    navigate('/payment');
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xử lý thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ✗
        </div>
        <h1 className="text-2xl font-bold mb-2">Thanh Toán Thất Bại</h1>
        <p className="text-gray-600 mb-4">Rất tiếc, giao dịch của bạn không thể hoàn tất.</p>
        
        <div className="text-left text-gray-600 mb-6">
          <p>Mã lỗi: {errorCode}</p>
          <p>Thời gian: {new Date().toLocaleString()}</p>
          <p>Vui lòng kiểm tra thông tin thanh toán và thử lại.</p>
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition-colors"
            onClick={handleTryAgain}
          >
            Thử lại
          </button>
          <button 
            className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600 transition-colors"
            onClick={handleBackToHome}
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default FailedPayment;