import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPayment: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/home');
  };

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
          <p>Mã giao dịch: #SPX{Date.now()}</p>
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