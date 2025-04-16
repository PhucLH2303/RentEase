import React, { useState } from 'react';
import ApartmentList from './ApartmentList';
import CreateApartment from '../create-appartment/index';

const HomeLandlord: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'listings' | 'create'>('listings');

    // Callback để chuyển về tab listings
    const switchToListings = () => {
        setActiveTab('listings');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
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
                        {activeTab === 'listings' ? <ApartmentList /> : <CreateApartment onCreateSuccess={switchToListings} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeLandlord;