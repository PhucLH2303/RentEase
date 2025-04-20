import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, CheckCircle, AlertCircle, XCircle, Edit, Trash2, MapPin, Image, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import axios from 'axios';
import { InfoCircleOutlined } from '@ant-design/icons';

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
    note: string;
    rating: number;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
    status: boolean;
}

interface ImageData {
    aptId: string;
    images: {
        id: number;
        imageUrl: string;
        createAt: string;
        updateAt: string;
    }[];
}

interface ApiResponse {
    statusCode: number;
    message: string;
    count: number;
    currentPage: number;
    totalPages: number;
    data: Apartment[];
}

interface Utility {
    id: number;
    utilityName: string;
    note: string;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
    status: null | boolean;
}

interface UtilityApiResponse {
    statusCode: number;
    message: string;
    count: number;
    currentPage: number;
    totalPages: number;
    data: Utility[];
}

interface AptUtility {
    utilityId: number;
    note: string;
}

interface AptUtilityApiResponse {
    statusCode: number;
    message: string;
    count: number;
    currentPage: number;
    totalPages: number;
    data: AptUtility[];
}

// Modal component for managing utilities
const UtilityModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    utilities: Utility[];
    selectedUtilities: number[];
    onSave: (selectedIds: number[]) => void;
}> = ({ isOpen, onClose, utilities, selectedUtilities, onSave }) => {
    const [selected, setSelected] = useState<number[]>(selectedUtilities);

    useEffect(() => {
        setSelected(selectedUtilities);
    }, [selectedUtilities]);

    const toggleUtility = (utilityId: number) => {
        setSelected(prev =>
            prev.includes(utilityId)
                ? prev.filter(id => id !== utilityId)
                : [...prev, utilityId]
        );
    };

    const handleSave = () => {
        onSave(selected);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Thêm tiện ích cho căn hộ</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Chọn các tiện ích có sẵn trong căn hộ:</p>
                    <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                        {utilities.map(utility => (
                            <div
                                key={utility.id}
                                onClick={() => toggleUtility(utility.id)}
                                className={`
                                    border rounded-lg p-3 cursor-pointer flex items-center
                                    ${selected.includes(utility.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                                `}
                            >
                                <div className={`
                                    w-5 h-5 rounded-full mr-2 flex items-center justify-center
                                    ${selected.includes(utility.id) ? 'bg-blue-500' : 'border border-gray-300'}
                                `}>
                                    {selected.includes(utility.id) && <CheckCircle size={14} className="text-white" />}
                                </div>
                                <span className="text-sm">{utility.note}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

// Updated ImageGallery component to include delete functionality
const ImageGallery: React.FC<{
    images: { id: number; url: string }[];
    altText: string;
    aptId: string;
    onImageDelete: (aptId: string, imageId: number) => void;
}> = ({ images, altText, aptId, onImageDelete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fallback image if the array is empty
    if (!images || images.length === 0) {
        return (
            <img
                src={`https://source.unsplash.com/random/400x320/?apartment`}
                alt={altText}
                className="w-full h-full object-cover"
            />
        );
    }

    const goToPrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prevIndex =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prevIndex =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handleDeleteClick = (e: React.MouseEvent, imageId: number) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc chắn muốn xóa ảnh này không?')) {
            onImageDelete(aptId, imageId);
        }
    };

    return (
        <div className="relative h-full w-full group">
            <img
                src={images[currentIndex].url}
                alt={`${altText} - image ${currentIndex + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                    (e.target as HTMLImageElement).src =
                        `https://source.unsplash.com/random/400x320/?apartment`;
                }}
            />

            {images.length > 0 && (
                <>
                    <button
                        onClick={(e) => handleDeleteClick(e, images[currentIndex].id)}
                        className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete image"
                    >
                        <Trash2 size={16} />
                    </button>

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <button
                                onClick={goToNext}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Next image"
                            >
                                <ChevronRight size={20} />
                            </button>

                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentIndex(index);
                                        }}
                                        className={`w-2 h-2 rounded-full transition-colors ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

const UserApartmentList: React.FC = () => {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [images, setImages] = useState<{ [key: string]: { id: number; url: string }[] }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<number | 'all'>('all');
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const navigate = useNavigate();
    const API_BASE_URL = 'https://renteasebe.io.vn';

    const [utilities, setUtilities] = useState<Utility[]>([]);
    const [selectedUtilities, setSelectedUtilities] = useState<{ [key: string]: number[] }>({});
    const [isUtilityModalOpen, setIsUtilityModalOpen] = useState<boolean>(false);
    const [currentAptId, setCurrentAptId] = useState<string | null>(null);
    const [addingUtilitiesFor, setAddingUtilitiesFor] = useState<string | null>(null);
    const [loadingUtilities, setLoadingUtilities] = useState<boolean>(false);
    useEffect(() => {
        fetchApartments();
        fetchUtilities();
    }, []);

    useEffect(() => {
        if (apartments.length > 0) {
            apartments.forEach(apartment => {
                fetchApartmentUtilities(apartment.aptId);
            });
        }
    }, [apartments]);

    const fetchUtilities = async () => {
        setLoadingUtilities(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                setLoadingUtilities(false);
                return;
            }

            const response = await axios.get<UtilityApiResponse>(
                `${API_BASE_URL}/api/Utility/GetAll?page=1&pageSize=50`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: '*/*'
                    }
                }
            );

            if (response.data && response.data.data) {
                setUtilities(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching utilities:', err);
            setError('Không thể tải danh sách tiện ích. Vui lòng thử lại sau.');
        } finally {
            setLoadingUtilities(false);
        }
    };

    const fetchApartmentUtilities = async (aptId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const response = await axios.get<AptUtilityApiResponse>(
                `${API_BASE_URL}/api/AptUtility/GetByAptId?aptId=${aptId}&page=1&pageSize=50`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data && response.data.data) {
                const utilityIds = response.data.data.map(item => item.utilityId);
                setSelectedUtilities(prev => ({
                    ...prev,
                    [aptId]: utilityIds
                }));
            }
        } catch (err) {
            console.error(`Error fetching utilities for apartment ${aptId}:`, err);
        }
    };

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
            const accountId = user.accountId;

            if (!accountId) {
                setError('Không tìm thấy ID tài khoản. Vui lòng đăng nhập lại.');
                navigate('/', { state: { from: '/apartments' } });
                setLoading(false);
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`,
                Accept: '*/*',
            };

            const aptResponse = await axios.get<ApiResponse>(
                `${API_BASE_URL}/api/Apt/GetByAccountId?accountId=${accountId}`,
                { headers }
            );

            const fetchedApartments = aptResponse.data.data;
            setApartments(fetchedApartments);

            const imagePromises = fetchedApartments.map(apt =>
                axios.get(`${API_BASE_URL}/api/AptImage/GetByAptId?aptId=${apt.aptId}`, { headers })
                    .catch(() => ({ data: { data: { aptId: apt.aptId, images: [] } } }))
            );

            const imageResponses = await Promise.all(imagePromises);

            const imageMap = imageResponses.reduce((acc, response) => {
                const imageData: ImageData = response.data.data;
                if (imageData.images && imageData.images.length > 0) {
                    acc[imageData.aptId] = imageData.images.map(img => ({
                        id: img.id,
                        url: `${API_BASE_URL}${img.imageUrl}`
                    }));
                }
                return acc;
            }, {} as { [key: string]: { id: number; url: string }[] });

            setImages(imageMap);
            setError(null);
        } catch (err) {
            console.error('Error fetching apartments or images:', err);
            setError('Không thể tải danh sách căn hộ hoặc ảnh. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (aptId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa căn hộ này không?')) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    return;
                }

                await axios.delete(`${API_BASE_URL}/api/Apt`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { aptId: aptId }
                });

                setApartments(apartments.filter(apt => apt.aptId !== aptId));
                setImages(prev => {
                    const newImages = { ...prev };
                    delete newImages[aptId];
                    return newImages;
                });

                alert('Xóa căn hộ thành công!');
            } catch (err) {
                console.error('Error deleting apartment:', err);
                alert('Không thể xóa căn hộ. Vui lòng thử lại sau.');
            }
        }
    };

    const handleImageUpload = (aptId: string) => {
        if (fileInputRefs.current[aptId]) {
            fileInputRefs.current[aptId]?.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, aptId: string) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            navigate('/', { state: { from: '/apartments' } });
            return;
        }

        setUploadingId(aptId);

        try {
            const formData = new FormData();
            formData.append('aptId', aptId);
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            await axios.post(
                `${API_BASE_URL}/api/AptImage?aptId=${aptId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            const imageResponse = await axios.get(
                `${API_BASE_URL}/api/AptImage/GetByAptId?aptId=${aptId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const imageData: ImageData = imageResponse.data.data;
            if (imageData.images && imageData.images.length > 0) {
                setImages(prev => ({
                    ...prev,
                    [aptId]: imageData.images.map(img => ({
                        id: img.id,
                        url: `${API_BASE_URL}${img.imageUrl}`
                    }))
                }));
            }

            alert('Tải ảnh lên thành công!');
        } catch (err) {
            console.error('Error uploading images:', err);
            alert('Không thể tải ảnh lên. Vui lòng thử lại sau.');
        } finally {
            setUploadingId(null);
            if (fileInputRefs.current[aptId]) {
                (fileInputRefs.current[aptId] as HTMLInputElement).value = '';
            }
        }
    };

    const handleDeleteImage = async (aptId: string, imageId: number) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                navigate('/', { state: { from: '/apartments' } });
                return;
            }

            await axios.delete(`${API_BASE_URL}/api/AptImage`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { imageId }
            });

            setImages(prev => ({
                ...prev,
                [aptId]: prev[aptId].filter(img => img.id !== imageId)
            }));

            alert('Xóa ảnh thành công!');
        } catch (err) {
            console.error('Error deleting image:', err);
            alert('Không thể xóa ảnh. Vui lòng thử lại sau.');
        }
    };

    const openUtilityModal = (aptId: string) => {
        setCurrentAptId(aptId);
        if (!selectedUtilities[aptId]) {
            fetchApartmentUtilities(aptId);
        }
        setIsUtilityModalOpen(true);
    };

    const handleSaveUtilities = async (selectedIds: number[]) => {
        if (!currentAptId) return;

        setAddingUtilitiesFor(currentAptId);

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                return;
            }

            await axios.post(
                `${API_BASE_URL}/api/AptUtility/Remove-All-Utilities?aptId=${currentAptId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (selectedIds.length > 0) {
                const selectedUtilitiesData = selectedIds.map(id => {
                    const utility = utilities.find(u => u.id === id);
                    return {
                        utilityId: id,
                        note: utility?.note || ''
                    };
                });

                await axios.post(
                    `${API_BASE_URL}/api/AptUtility/Add-Utilities`,
                    {
                        aptId: currentAptId,
                        utilities: selectedUtilitiesData
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            setSelectedUtilities(prev => ({
                ...prev,
                [currentAptId]: selectedIds
            }));

            alert('Đã cập nhật tiện ích thành công!');
        } catch (err) {
            console.error('Error adding utilities:', err);
            alert('Không thể thêm tiện ích. Vui lòng thử lại sau.');
        } finally {
            setAddingUtilitiesFor(null);
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
            <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded flex items-center gap-2" role="alert">
                <InfoCircleOutlined style={{ fontSize: '20px', color: '#1e40af' }} />
                <span>Không có dữ liệu để hiển thị.</span>
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
                            className={`px-3 py-1 rounded-md text-sm font-medium ${selectedStatus === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setSelectedStatus(1)}
                            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${selectedStatus === 1 ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                        >
                            {getApproveStatusIcon(1)} Đang duyệt
                        </button>
                        <button
                            onClick={() => setSelectedStatus(2)}
                            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${selectedStatus === 2 ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                        >
                            {getApproveStatusIcon(2)} Đã duyệt
                        </button>
                        <button
                            onClick={() => setSelectedStatus(3)}
                            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${selectedStatus === 3 ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                        >
                            {getApproveStatusIcon(3)} Bị từ chối
                        </button>
                    </div>
                </div>
            </div>

            {loadingUtilities && (
                <div className="mb-4 p-2 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent mr-2"></div>
                    Đang tải danh sách tiện ích...
                </div>
            )}

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
                    {filteredApartments.map((apartment) => {
                        const aptImages = images[apartment.aptId] || [];

                        return (
                            <div
                                key={apartment.aptId}
                                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <ImageGallery
                                        images={aptImages}
                                        altText={apartment.name}
                                        aptId={apartment.aptId}
                                        onImageDelete={handleDeleteImage}
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${getApproveStatusColor(
                                                apartment.approveStatusId
                                            )} flex items-center`}
                                        >
                                            {getApproveStatusIcon(apartment.approveStatusId)}
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
                                    {selectedUtilities[apartment.aptId] && selectedUtilities[apartment.aptId].length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-600 font-medium mb-1">Tiện ích:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedUtilities[apartment.aptId].map(utilityId => {
                                                    const utility = utilities.find(u => u.id === utilityId);
                                                    return utility ? (
                                                        <span
                                                            key={utilityId}
                                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                        >
                                                            {utility.note}
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        ref={(el) => {
                                            fileInputRefs.current[apartment.aptId] = el;
                                        }}
                                        onChange={(e) => handleFileChange(e, apartment.aptId)}
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                    />

                                    <div className="mt-4 flex flex-wrap justify-between gap-2">
                                        <button
                                            onClick={() => navigate(`/home/apartment/view/${apartment.aptId}`)}
                                            className="bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 flex items-center"
                                        >
                                            <Home size={14} className="mr-1" />
                                            Xem chi tiết
                                        </button>
                                        <button
                                            onClick={() => handleImageUpload(apartment.aptId)}
                                            disabled={uploadingId === apartment.aptId}
                                            className={`bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 flex items-center ${uploadingId === apartment.aptId ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {uploadingId === apartment.aptId ? (
                                                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-1"></div>
                                            ) : (
                                                <Image size={14} className="mr-1" />
                                            )}
                                            Thêm hình ảnh
                                        </button>

                                        <button
                                            onClick={() => openUtilityModal(apartment.aptId)}
                                            disabled={addingUtilitiesFor === apartment.aptId}
                                            className={`bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center ${addingUtilitiesFor === apartment.aptId ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {addingUtilitiesFor === apartment.aptId ? (
                                                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-1"></div>
                                            ) : (
                                                <Plus size={14} className="mr-1" />
                                            )}
                                            Thêm tiện ích
                                        </button>

                                        <button
                                            onClick={() => navigate('/home/create-post', { state: { aptId: apartment.aptId } })}
                                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center"
                                        >
                                            <Edit size={14} className="mr-1" />
                                            Tạo bài đăng
                                        </button>
                                        <button
                                            onClick={() => navigate(`/home/apartment/detail/${apartment.aptId}`)}
                                            className="bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 flex items-center"
                                        >
                                            <Edit size={14} className="mr-1" />
                                            Chỉnh sửa
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
                        );
                    })}
                </div>
            )}

            <UtilityModal
                isOpen={isUtilityModalOpen}
                onClose={() => setIsUtilityModalOpen(false)}
                utilities={utilities}
                selectedUtilities={currentAptId ? (selectedUtilities[currentAptId] || []) : []}
                onSave={handleSaveUtilities}
            />
        </div>
    );
};

export default UserApartmentList;