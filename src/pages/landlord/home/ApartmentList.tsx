import React, { useState } from 'react';
import { Edit, Trash2, Home, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface Apartment {
    id: number;
    title: string;
    details: string;
    price: string;
    image: string;
    status?: 'active' | 'pending' | 'inactive';
    createdAt?: string;
}

const initialApartments: Apartment[] = [
    {
        id: 1,
        title: 'Đức Kỳ Túc Xá Cao Cấp - Vị Trí Trung Tâm',
        details: 'Nội thất đầy đủ | 1.4 triệu/tháng | 20 m² | Phường Hiệp Phước (Quận 9)',
        price: '1.4 triệu/tháng',
        image: 'https://via.placeholder.com/150',
        status: 'active',
        createdAt: '2025-03-10',
    },
    {
        id: 2,
        title: 'Phòng Dep, Gần Trường GTVT, Tài Chính, FPT, Hutech Khu E',
        details: 'Nội thất đầy đủ | 4 triệu/tháng | 15 m² | Phường Tân Nhơn Phú A (Quận 9)',
        price: '4 triệu/tháng',
        image: 'https://via.placeholder.com/150',
        status: 'active',
        createdAt: '2025-03-15',
    },
    {
        id: 3,
        title: 'Cho thuê phòng trọ giá rẻ gần Dinh Phông Phước, Ngõ Thủ Đức',
        details: 'Đức, khu CNC | Nội thất cao cấp | 3 triệu/tháng | 25 m² | Phường Tân Nhơn Phú A (Quận 9)',
        price: '3 triệu/tháng',
        image: 'https://via.placeholder.com/150',
        status: 'pending',
        createdAt: '2025-03-16',
    },
];

const ApartmentList: React.FC = () => {
    const [apartments, setApartments] = useState<Apartment[]>(initialApartments);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const handleDelete = (id: number) => {
        setApartments(apartments.filter((apartment) => apartment.id !== id));
    };

    const handleStatusChange = (id: number, newStatus: 'active' | 'pending' | 'inactive') => {
        setApartments(
            apartments.map((apartment) =>
                apartment.id === id ? { ...apartment, status: newStatus } : apartment
            )
        );
    };

    const filteredApartments =
        selectedStatus === 'all'
            ? apartments
            : apartments.filter((apartment) => apartment.status === selectedStatus);

    const getStatusColor = (status: string = 'active') => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string = 'active') => {
        switch (status) {
            case 'active':
                return <CheckCircle size={14} className="mr-1" />;
            case 'pending':
                return <AlertCircle size={14} className="mr-1" />;
            case 'inactive':
                return <XCircle size={14} className="mr-1" />;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Căn Hộ Của Bạn</h2>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setSelectedStatus('all')}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${selectedStatus === 'all'
                                ? 'bg-white shadow-sm text-blue-600'
                                : 'text-gray-600 hover:text-blue-600'
                                }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setSelectedStatus('active')}
                            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${selectedStatus === 'active'
                                ? 'bg-white shadow-sm text-blue-600'
                                : 'text-gray-600 hover:text-blue-600'
                                }`}
                        >
                            {getStatusIcon('active')} Đang cho thuê
                        </button>
                        <button
                            onClick={() => setSelectedStatus('pending')}
                            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${selectedStatus === 'pending'
                                ? 'bg-white shadow-sm text-blue-600'
                                : 'text-gray-600 hover:text-blue-600'
                                }`}
                        >
                            {getStatusIcon('pending')} Đang duyệt
                        </button>
                        <button
                            onClick={() => setSelectedStatus('inactive')}
                            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${selectedStatus === 'inactive'
                                ? 'bg-white shadow-sm text-blue-600'
                                : 'text-gray-600 hover:text-blue-600'
                                }`}
                        >
                            {getStatusIcon('inactive')} Đã hủy
                        </button>
                    </div>
                </div>
            </div>

            {filteredApartments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Home size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Không có căn hộ nào</h3>
                    <p className="text-gray-500 mb-6">Bạn chưa có bài đăng nào ở trạng thái này</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApartments.map((apartment) => (
                        <div
                            key={apartment.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={apartment.image}
                                    alt={apartment.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                            apartment.status
                                        )} flex items-center`}
                                    >
                                        {getStatusIcon(apartment.status)}
                                        {apartment.status === 'active'
                                            ? 'Đang Cho Thuê'
                                            : apartment.status === 'pending'
                                                ? 'Đang Duyệt'
                                                : 'Đã Hủy'}
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">
                                        {apartment.title}
                                    </h3>
                                    <span className="text-white font-semibold">{apartment.price}</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{apartment.details}</p>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>Ngày đăng: {apartment.createdAt}</span>
                                    <span>Trạng thái: {apartment.status}</span>
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <button
                                        onClick={() =>
                                            handleStatusChange(
                                                apartment.id,
                                                apartment.status === 'active' ? 'inactive' : 'active'
                                            )
                                        }
                                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center"
                                    >
                                        <Edit size={14} className="mr-1" />
                                        {apartment.status === 'active' ? 'Hủy' : 'Kích hoạt'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(apartment.id)}
                                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 flex items-center"
                                    >
                                        <Trash2 size={14} className="mr-1" />
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApartmentList;