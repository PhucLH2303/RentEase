import React from 'react';
import { useNavigate } from 'react-router-dom';

const FailedPayment: React.FC = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/payment');
  };

  const handleBackToHome = () => {
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
          <p>Mã lỗi: ERR{Date.now().toString().slice(-4)}</p>
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