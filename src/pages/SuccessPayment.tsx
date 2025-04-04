import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const SuccessPayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const transactionId = `#SPX${Date.now()}`;

  const handleBackToHome = async () => {
    setIsProcessing(true);
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
        // Call the payment callback API using GET
        const callbackParams = new URLSearchParams({
          code,
          id,
          cancel: cancel || 'false',
          status,
          orderCode
        });
        
        await axios.get(
          `https://www.renteasebe.io.vn/api/Payment/payment-callback?${callbackParams}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log("Payment callback successful");
      } catch (error) {
        console.error('Error processing payment callback:', error);
      }
    }
    
    setIsProcessing(false);
    navigate('/home');
  };

  // Extract orderCode for display if available
  const queryParams = new URLSearchParams(location.search);
  const orderCode = queryParams.get('orderCode');
  const displayTransactionId = orderCode ? `#${orderCode}` : transactionId;

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
          <p>Mã giao dịch: {displayTransactionId}</p>
          <p>Ngày: {new Date().toLocaleDateString()}</p>
          <p>Thời gian: {new Date().toLocaleTimeString()}</p>
        </div>

        <button 
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition-colors flex items-center justify-center w-full"
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
  );
};

export default SuccessPayment;