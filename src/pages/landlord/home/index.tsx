import React, { useState, useEffect } from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import ApartmentList from './ApartmentList';
import CreateApartment from '../create-appartment/index';

const HomeLandlord: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'listings' | 'create'>('listings');
    const [error, setError] = useState<string | null>(null);
    const [hasListings, setHasListings] = useState<boolean>(true); // Assume true initially

    // Callback to switch to listings tab
    const switchToListings = () => {
        setActiveTab('listings');
    };

    // Simulate checking for listings data (you may need to adjust this based on how ApartmentList works)
    useEffect(() => {
        if (activeTab === 'listings') {
            // Example: Check if ApartmentList has data or returns an error
            // This is a placeholder; replace with actual logic to check ApartmentList data
            const checkListings = async () => {
                try {
                    // Simulate fetching data or checking ApartmentList
                    // For example, you might call an API or check ApartmentList's props/state
                    const hasData = false; // Replace with actual check (e.g., API response or ApartmentList prop)
                    if (!hasData) {
                        setHasListings(false);
                        setError('Chưa có bài đăng');
                    } else {
                        setHasListings(true);
                        setError(null);
                    }
                } catch {
                    setHasListings(false);
                    setError('Đã xảy ra lỗi khi tải danh sách căn hộ');
                }
            };

            checkListings();
        }
    }, [activeTab]);

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
                            Tạo Căn Hộ Mới
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {activeTab === 'listings' ? (
                            error || !hasListings ? (
                                <Result
                                    status="warning"
                                    title="Chưa có bài đăng"
                                    // subTitle={error} // Uncomment if you want to show error details
                                    extra={
                                        <Link to="/home">
                                            <Button type="primary">Quay lại trang chủ</Button>
                                        </Link>
                                    }
                                />
                            ) : (
                                <ApartmentList />
                            )
                        ) : (
                            <CreateApartment onCreateSuccess={switchToListings} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeLandlord;