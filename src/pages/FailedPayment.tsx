import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const FailedPayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Extract orderCode for display if available
  const queryParams = new URLSearchParams(location.search);
  const orderCode = queryParams.get('orderCode');
  const errorCode = orderCode ? `ERR-${orderCode}` : `ERR${Date.now().toString().slice(-4)}`;

  const handleTryAgain = () => {
    navigate('/payment');
  };

  const handleBackToHome = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/", { state: { from: location.pathname } });
      return;
    }

    // Parse query parameters from URL
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code') || '01';
    const id = queryParams.get('id');
    const cancel = queryParams.get('cancel') || 'true';
    const status = queryParams.get('status') || 'FAILED';
    const orderCode = queryParams.get('orderCode');

    if (id && orderCode) {
      try {
        // Call the payment callback API using GET
        const callbackParams = new URLSearchParams({
          code: code || '01',
          id,
          cancel: cancel || 'true',
          status: status || 'FAILED',
          orderCode
        });
        
        await axios.get(
          `https://www.renteasebe.io.vn/api/Payment/payment-callback?${callbackParams}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log("Failed payment callback successful");
      } catch (error) {
        console.error('Error processing failed payment callback:', error);
      }
    }
    
    setIsProcessing(false);
    navigate('/home');
  };

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

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition-colors"
            onClick={handleTryAgain}
          >
            Thử lại
          </button>
          <button 
            className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600 transition-colors flex items-center justify-center"
            onClick={handleBackToHome}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                Đang xử lý...
              </>
            ) : (
              'Quay về trang chủ'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FailedPayment;