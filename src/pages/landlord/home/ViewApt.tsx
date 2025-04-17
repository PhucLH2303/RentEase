import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Home, Mail, CheckCircle, AlertCircle, XCircle, ArrowLeft, Star, Calendar, Users, Box } from 'lucide-react';
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

interface Utility {
    id: number;
    utilityName: string;
    note: string;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
    status: null | boolean;
}

const ViewApt: React.FC = () => {
    const { aptId } = useParams<{ aptId: string }>();
    const navigate = useNavigate();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [utilities, setUtilities] = useState<Utility[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    const API_BASE_URL = 'https://renteasebe.io.vn';

    useEffect(() => {
        if (!aptId) return;

        const fetchApartmentDetails = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    navigate('/', { state: { from: `/home/apartment/view/${aptId}` } });
                    return;
                }

                const headers = {
                    Authorization: `Bearer ${token}`,
                    Accept: '*/*',
                };

                // Fetch apartment details
                const aptResponse = await axios.get<{ statusCode: number; message: string; data: Apartment }>(
                    `${API_BASE_URL}/api/Apt/GetById?aptId=${aptId}`,
                    { headers }
                );

                if (aptResponse.data.statusCode === 200 && aptResponse.data.data) {
                    setApartment(aptResponse.data.data);
                } else {
                    setError('Không thể tải thông tin căn hộ.');
                    return;
                }

                // Fetch apartment images
                const imageResponse = await axios.get(
                    `${API_BASE_URL}/api/AptImage/GetByAptId?aptId=${aptId}`,
                    { headers }
                ).catch(() => ({ data: { data: { aptId, images: [] } } }));

                const imageData: ImageData = imageResponse.data.data;
                if (imageData.images && imageData.images.length > 0) {
                    setImages(imageData.images.map(img => `${API_BASE_URL}${img.imageUrl}`));
                }

                // Fetch apartment utilities
                const utilityResponse = await axios.get(
                    `${API_BASE_URL}/api/AptUtility/GetByAptId?aptId=${aptId}&page=1&pageSize=50`,
                    { headers }
                );

                if (utilityResponse.data.data) {
                    const utilityIds = utilityResponse.data.data.map((item: any) => item.utilityId);

                    // Fetch full utility details for each ID
                    const utilitiesResponse = await axios.get(
                        `${API_BASE_URL}/api/Utility/GetAll?page=1&pageSize=50`,
                        { headers }
                    );

                    if (utilitiesResponse.data.data) {
                        const allUtilities: Utility[] = utilitiesResponse.data.data;
                        const apartmentUtilities = allUtilities.filter(utility =>
                            utilityIds.includes(utility.id)
                        );
                        setUtilities(apartmentUtilities);
                    }
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching apartment details:', err);
                setError('Không thể tải thông tin chi tiết. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchApartmentDetails();
    }, [aptId, navigate]);

    const getApproveStatusName = (statusId: number) => {
        switch (statusId) {
            case 1: return 'Đang duyệt';
            case 2: return 'Đã duyệt';
            case 3: return 'Bị từ chối';
            default: return 'Không xác định';
        }
    };

    const getApproveStatusIcon = (statusId: number) => {
        switch (statusId) {
            case 1: return <AlertCircle size={18} className="mr-2 text-yellow-500" />;
            case 2: return <CheckCircle size={18} className="mr-2 text-green-500" />;
            case 3: return <XCircle size={18} className="mr-2 text-red-500" />;
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

    const goToPreviousImage = () => {
        setCurrentImageIndex(prevIndex =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToNextImage = () => {
        setCurrentImageIndex(prevIndex =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Lỗi!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
                <button
                    onClick={goBack}
                    className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeft size={16} className="mr-1" /> Quay lại
                </button>
            </div>
        );
    }

    if (!apartment) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Thông báo!</strong>
                    <span className="block sm:inline"> Không tìm thấy thông tin căn hộ.</span>
                </div>
                <button
                    onClick={goBack}
                    className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeft size={16} className="mr-1" /> Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={goBack}
                className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
            >
                <ArrowLeft size={20} className="mr-1" /> Quay lại
            </button>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header with apartment name and status */}
                <div className="bg-blue-600 text-white p-6">
                    <div className="flex flex-wrap justify-between items-center">
                        <h1 className="text-2xl font-bold mb-2 md:mb-0">{apartment.name}</h1>
                        <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full">
                            {getApproveStatusIcon(apartment.approveStatusId)}
                            <span>{getApproveStatusName(apartment.approveStatusId)}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                    {/* Left column - Images */}
                    <div className="md:col-span-2">
                        <div className="bg-gray-100 rounded-lg overflow-hidden relative">
                            {images.length > 0 ? (
                                <>
                                    <img
                                        src={images[currentImageIndex]}
                                        alt={`${apartment.name} - ảnh ${currentImageIndex + 1}`}
                                        className="w-full h-96 object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://source.unsplash.com/random/800x600/?apartment`;
                                        }}
                                    />
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={goToPreviousImage}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                                                aria-label="Previous image"
                                            >
                                                <ArrowLeft size={20} />
                                            </button>
                                            <button
                                                onClick={goToNextImage}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                                                aria-label="Next image"
                                            >
                                                <ArrowLeft size={20} className="rotate-180" />
                                            </button>
                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                                {images.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setCurrentImageIndex(index)}
                                                        className={`w-3 h-3 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                                                            }`}
                                                        aria-label={`Go to image ${index + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-96 flex items-center justify-center bg-gray-200">
                                    <div className="text-center text-gray-500">
                                        <Home size={64} className="mx-auto mb-2 opacity-50" />
                                        <p>Chưa có hình ảnh</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail gallery */}
                        {images.length > 1 && (
                            <div className="mt-4 grid grid-cols-6 gap-2 overflow-x-auto">
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`cursor-pointer rounded-lg overflow-hidden border-2 ${currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-16 object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://source.unsplash.com/random/100x100/?apartment`;
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold mb-3">Mô tả</h2>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700 whitespace-pre-line">{apartment.note || "Không có mô tả chi tiết."}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Details */}
                    <div>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h2 className="text-lg font-semibold mb-3">Thông tin cơ bản</h2>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <Box className="text-blue-600 mr-3 mt-1" size={18} />
                                    <div>
                                        <p className="text-gray-500 text-sm">Diện tích</p>
                                        <p className="font-medium">{apartment.area} m²</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Home className="text-blue-600 mr-3 mt-1" size={18} />
                                    <div>
                                        <p className="text-gray-500 text-sm">Số phòng</p>
                                        <p className="font-medium">{apartment.numberOfRoom}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Users className="text-blue-600 mr-3 mt-1" size={18} />
                                    <div>
                                        <p className="text-gray-500 text-sm">Sức chứa</p>
                                        <p className="font-medium">{apartment.numberOfSlot} người</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Star className="text-blue-600 mr-3 mt-1" size={18} />
                                    <div>
                                        <p className="text-gray-500 text-sm">Đánh giá</p>
                                        <p className="font-medium">{apartment.rating || "Chưa có đánh giá"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Calendar className="text-blue-600 mr-3 mt-1" size={18} />
                                    <div>
                                        <p className="text-gray-500 text-sm">Ngày đăng</p>
                                        <p className="font-medium">{formatDate(apartment.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h2 className="text-lg font-semibold mb-3">Vị trí</h2>
                            <div className="flex items-start mb-3">
                                <MapPin className="text-blue-600 mr-2 mt-1 flex-shrink-0" size={18} />
                                <p className="text-gray-700">{apartment.address}</p>
                            </div>
                            {apartment.addressLink && (
                                <a
                                    href={apartment.addressLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
                                >
                                    Xem trên bản đồ
                                </a>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h2 className="text-lg font-semibold mb-3">Chủ nhà</h2>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <span className="font-medium mr-2">Tên:</span>
                                    <span>{apartment.ownerName}</span>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="text-gray-600 mr-2" size={16} />
                                    <span>{apartment.ownerEmail}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold mb-3">Trạng thái</h2>
                            <div className="space-y-3">
                                <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg flex items-center">
                                    {getApproveStatusIcon(apartment.approveStatusId)}
                                    <span>Trạng thái duyệt: {getApproveStatusName(apartment.approveStatusId)}</span>
                                </div>
                                <div className="px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                                    Trạng thái căn hộ: {getAptStatusName(apartment.aptStatusId)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Utilities */}
                <div className="px-6 pb-6">
                    <h2 className="text-xl font-semibold mb-4">Tiện ích</h2>
                    {utilities.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {utilities.map(utility => (
                                <div
                                    key={utility.id}
                                    className="bg-gray-50 p-3 rounded-lg flex items-center"
                                >
                                    <CheckCircle size={16} className="text-green-500 mr-2" />
                                    <span className="text-gray-700">{utility.note}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Chưa có thông tin về tiện ích.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewApt;