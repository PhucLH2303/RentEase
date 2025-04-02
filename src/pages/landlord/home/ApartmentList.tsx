import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, CheckCircle, AlertCircle, XCircle, Edit, Trash2, MapPin } from 'lucide-react';
import axios from 'axios';

interface Apartment {
    aptId: string;
    posterId: string;
    ownerName: string;
    ownerEmail: string;
    name: string;
    area: number;
    address: string;
    addressLink: string;
    provinceId: number;
    districtId: number;
    wardId: number;
    aptCategoryId: number;
    aptStatusId: number;
    numberOfRoom: number;
    numberOfSlot: number;
    approveStatusId: number;
 Ascendantly: true;
    note: string;
    rating: number;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
    status: boolean;
}

interface ApiResponse {
    statusCode: number;
    message: string;
    count: number;
    currentPage: number;
    totalPages: number;
    data: Apartment[];
}

const UserApartmentList: React.FC = () => {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<number | 'all'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchApartments();
    }, []);

    const fetchApartments = async () => {
        setLoading(true);
        try {
            const userString = localStorage.getItem('user');
            const token = localStorage.getItem('accessToken');

            if (!token || !userString) {
                setError('Phiên đăng nhập hết hạn hoặc không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
                navigate('/', { state: { from: '/apartments' } });
                setLoading(false);
                return;
            }

            const user = JSON.parse(userString);
            const accountId = user.accountId; // Sử dụng accountId thay vì id để khớp với Login

            if (!accountId) {
                setError('Không tìm thấy ID tài khoản. Vui lòng đăng nhập lại.');
                navigate('/', { state: { from: '/apartments' } });
                setLoading(false);
                return;
            }

            const response = await axios.get<ApiResponse>(
                `https://renteasebe.io.vn/api/Apt/GetByAccountId?accountId=${accountId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setApartments(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching apartments:', err);
            setError('Không thể tải danh sách căn hộ. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (aptId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa căn hộ này không?')) {
            try {
                const token = localStorage.getItem('accessToken');
                await axios.delete(`https://renteasebe.io.vn/api/Apt/${aptId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setApartments(apartments.filter(apt => apt.aptId !== aptId));
            } catch (err) {
                console.error('Error deleting apartment:', err);
                alert('Không thể xóa căn hộ. Vui lòng thử lại sau.');
            }
        }
    };

    const handleStatusChange = async (aptId: string, newStatusId: number) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.put(
                `https://renteasebe.io.vn/api/Apt/UpdateStatus`,
                { aptId, aptStatusId: newStatusId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setApartments(
                apartments.map(apt =>
                    apt.aptId === aptId ? { ...apt, aptStatusId: newStatusId } : apt
                )
            );
        } catch (err) {
            console.error('Error updating apartment status:', err);
            alert('Không thể cập nhật trạng thái căn hộ. Vui lòng thử lại sau.');
        }
    };

    const getApproveStatusName = (statusId: number) => {
        switch (statusId) {
            case 1: return 'Đang Duyệt';
            case 2: return 'Đã Duyệt';
            case 3: return 'Bị Từ Chối';
            default: return 'Không xác định';
        }
    };

    const getApproveStatusColor = (statusId: number) => {
        switch (statusId) {
            case 1: return 'bg-yellow-100 text-yellow-800';
            case 2: return 'bg-green-100 text-green-800';
            case 3: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getApproveStatusIcon = (statusId: number) => {
        switch (statusId) {
            case 1: return <AlertCircle size={14} className="mr-1" />;
            case 2: return <CheckCircle size={14} className="mr-1" />;
            case 3: return <XCircle size={14} className="mr-1" />;
            default: return null;
        }
    };

    const getAptStatusName = (statusId: number) => {
        switch (statusId) {
            case 1: return 'Đang Cho Thuê';
            case 2: return 'Đã Thuê';
            case 3: return 'Ngừng Cho Thuê';
            default: return 'Không xác định';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const filteredApartments = selectedStatus === 'all'
        ? apartments
        : apartments.filter(apt => apt.approveStatusId === selectedStatus);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Lỗi!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Căn Hộ Của Bạn</h2>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setSelectedStatus('all')}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                selectedStatus === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setSelectedStatus(1)}
                            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
                                selectedStatus === 1 ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            {getApproveStatusIcon(1)} Đang duyệt
                        </button>
                        <button
                            onClick={() => setSelectedStatus(2)}
                            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
                                selectedStatus === 2 ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            {getApproveStatusIcon(2)} Đã duyệt
                        </button>
                        <button
                            onClick={() => setSelectedStatus(3)}
                            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
                                selectedStatus === 3 ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            {getApproveStatusIcon(3)} Bị từ chối
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
                    <p className="text-gray-500 mb-6">Bạn chưa có căn hộ nào ở trạng thái này</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApartments.map((apartment) => (
                        <div
                            key={apartment.aptId}
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={`/api/placeholder/400/320`}
                                    alt={apartment.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getApproveStatusColor(
                                            apartment.approveStatusId
                                        )} flex items-center`}
                                    >
                                        {getApproveStatusIcon(apartment.approveStatusId)}
                                        {getApproveStatusName(apartment.approveStatusId)}
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">
                                        {apartment.name}
                                    </h3>
                                    <span className="text-white font-semibold">{apartment.area} m²</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-start mb-2">
                                    <MapPin size={16} className="text-gray-500 mt-1 mr-1 flex-shrink-0" />
                                    <p className="text-gray-600 text-sm line-clamp-2">{apartment.address}</p>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                    <div>Số phòng: {apartment.numberOfRoom}</div>
                                    <div>Sức chứa: {apartment.numberOfSlot} người</div>
                                </div>
                                <div className="mb-2">
                                    <p className="text-gray-600 text-sm line-clamp-2">{apartment.note}</p>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>Ngày đăng: {formatDate(apartment.createdAt)}</span>
                                    <span>Trạng thái: {getAptStatusName(apartment.aptStatusId)}</span>
                                </div>
                                // Trong phần return của UserApartmentList, thêm nút vào div.mt-4
<div className="mt-4 flex justify-between">
  <button
    onClick={() => handleStatusChange(
      apartment.aptId,
      apartment.aptStatusId === 1 ? 3 : 1
    )}
    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center"
  >
    <Edit size={14} className="mr-1" />
    {apartment.aptStatusId === 1 ? 'Ngừng cho thuê' : 'Kích hoạt'}
  </button>
  <button
    onClick={() => navigate("/home/create-post", { state: { aptId: apartment.aptId } })}
    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center"
  >
    <Edit size={14} className="mr-1" />
    Tạo bài đăng
  </button>
  <button
    onClick={() => handleDelete(apartment.aptId)}
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

export default UserApartmentList;