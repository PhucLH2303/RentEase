import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { Home, User, DollarSign, Settings, LogOut } from 'lucide-react'; // Thêm LogOut icon
import ApartmentList from './ApartmentList';
import CreateApartment from '../create-appartment/index';

const HomeLandlord: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'listings' | 'create'>('listings');
    const navigate = useNavigate(); // Khai báo useNavigate

    // Hàm xử lý logout
    const handleLogout = () => {
        localStorage.removeItem('accessToken'); // Xóa accessToken khỏi localStorage
        navigate('/'); // Điều hướng về trang gốc
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-blue-600 text-white p-2 rounded-lg mr-2">
                            <Home size={24} />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            RentEase
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full">
                            <DollarSign size={18} className="text-blue-600 mr-1" />
                            <span className="font-medium text-blue-800">100,000 đ</span>
                        </div>
                        <div className="flex items-center bg-indigo-50 px-4 py-2 rounded-full cursor-pointer hover:bg-indigo-100 transition-colors">
                            <User size={18} className="text-indigo-600 mr-1" />
                            <span className="font-medium text-indigo-800">Tài khoản</span>
                        </div>
                        <div className="bg-gray-100 p-2 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
                            <Settings size={18} className="text-gray-600" />
                        </div>
                        {/* Nút Logout */}
                        <div
                            className="bg-red-100 p-2 rounded-full cursor-pointer hover:bg-red-200 transition-colors"
                            onClick={handleLogout}
                            title="Đăng xuất"
                        >
                            <LogOut size={18} className="text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto py-8 px-4">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Tabs */}
                    <div className="flex bg-gray-50 border-b">
                        <button
                            onClick={() => setActiveTab('listings')}
                            className={`flex-1 py-4 px-6 font-medium text-lg ${activeTab === 'listings'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-blue-600'
                                } transition-colors`}
                        >
                            Danh Sách Căn Hộ
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`flex-1 py-4 px-6 font-medium text-lg ${activeTab === 'create'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-blue-600'
                                } transition-colors`}
                        >
                            Tạo Bài Đăng Mới
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {activeTab === 'listings' ? <ApartmentList /> : <CreateApartment />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeLandlord;