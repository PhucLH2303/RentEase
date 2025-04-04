import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown, Loader2, MapPin } from 'lucide-react';

interface ApartmentDetail {
  aptId: string;
  posterId: string;
  ownerName: string;
  ownerPhone: string | null;
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

interface ApiResponse {
  statusCode: number;
  message: string;
  count: number;
  currentPage: number;
  totalPages: number;
  data: ApartmentDetail | null;
}

const ApartmentEdit: React.FC = () => {
  const { aptId } = useParams<{ aptId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apartment, setApartment] = useState<ApartmentDetail | null>(null);
  
  const API_BASE_URL = 'https://renteasebe.io.vn';

  const [formData, setFormData] = useState({
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    name: '',
    area: 0,
    address: '',
    addressLink: '',
    provinceId: 0,
    districtId: 0,
    wardId: 0,
    aptCategoryId: 1,
    aptStatusId: 1,
    numberOfRoom: 0,
    numberOfSlot: 0,
    note: ''
  });

  useEffect(() => {
    if (!aptId) {
      setError('Không tìm thấy mã căn hộ');
      return;
    }
    
    fetchApartmentDetail();
  }, [aptId]);

  const fetchApartmentDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate('/', { state: { from: `/apartment/edit/${aptId}` } });
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: '*/*',
      };

      const response = await axios.get<ApiResponse>(
        `${API_BASE_URL}/api/Apt/GetById?aptId=${aptId}`,
        { headers }
      );

      if (response.data.statusCode !== 200 || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải thông tin căn hộ.');
      }

      const aptData = response.data.data;
      setApartment(aptData);
      
      setFormData({
        ownerName: aptData.ownerName || '',
        ownerPhone: aptData.ownerPhone || '',
        ownerEmail: aptData.ownerEmail || '',
        name: aptData.name || '',
        area: aptData.area || 0,
        address: aptData.address || '',
        addressLink: aptData.addressLink || '',
        provinceId: aptData.provinceId || 0,
        districtId: aptData.districtId || 0,
        wardId: aptData.wardId || 0,
        aptCategoryId: aptData.aptCategoryId || 1,
        aptStatusId: aptData.aptStatusId || 1,
        numberOfRoom: aptData.numberOfRoom || 0,
        numberOfSlot: aptData.numberOfSlot || 0,
        note: aptData.note || ''
      });

    } catch (err: any) {
      console.error('Error fetching apartment details:', err);
      if (err.response?.status === 404 && err.response?.data?.message === "Bạn không có quyền hạn.") {
        setError('Bạn không có quyền chỉnh sửa căn hộ này.');
      } else if (err.response?.status === 401) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('accessToken'); // Xóa token không hợp lệ
        setTimeout(() => navigate('/'), 2000); // Chuyển hướng sau 2 giây
      } else {
        setError(err.message || 'Không thể tải thông tin căn hộ. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    if (['area', 'aptCategoryId', 'aptStatusId', 'numberOfRoom', 'numberOfSlot'].includes(name)) {
      parsedValue = value === '' ? 0 : Number(value);
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate('/', { state: { from: `/apartment/edit/${aptId}` } });
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: '*/*',
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/Apt?AptId=${aptId}`,
        formData,
        { headers }
      );

      if (response.status !== 200) {
        throw new Error('Cập nhật thất bại.');
      }

      setSuccess('Cập nhật thông tin căn hộ thành công!');
      
      setTimeout(() => {
        navigate(`/home/apartment/detail/${aptId}`);
      }, 1500);

    } catch (err: any) {
      console.error('Error updating apartment:', err);
      if (err.response?.status === 404 && err.response?.data?.message === "Bạn không có quyền hạn.") {
        setError('Bạn không có quyền chỉnh sửa căn hộ này.');
      } else if (err.response?.status === 401) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('accessToken');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(err.response?.data?.message || 'Không thể cập nhật thông tin căn hộ. Vui lòng thử lại sau.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !apartment) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Lỗi!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <button 
          onClick={() => navigate(`/home/apartment/detail/${aptId}`)}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          ← Quay lại trang chi tiết
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Chỉnh Sửa Thông Tin Căn Hộ</h1>
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Lỗi!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Tên căn hộ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="area">
              Diện tích (m²) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="numberOfRoom">
              Số phòng <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="numberOfRoom"
              name="numberOfRoom"
              value={formData.numberOfRoom}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="numberOfSlot">
              Sức chứa (người) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="numberOfSlot"
              name="numberOfSlot"
              value={formData.numberOfSlot}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="aptCategoryId">
              Loại căn hộ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="aptCategoryId"
                name="aptCategoryId"
                value={formData.aptCategoryId}
                onChange={handleInputChange}
                className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={1}>Chung cư</option>
                <option value={2}>Nhà nguyên căn</option>
                <option value={3}>Phòng trọ</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="aptStatusId">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="aptStatusId"
                name="aptStatusId"
                value={formData.aptStatusId}
                onChange={handleInputChange}
                className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={1}>Đang Cho Thuê</option>
                <option value={2}>Đã Thuê</option>
                <option value={3}>Ngừng Cho Thuê</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-3">Địa chỉ</h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
              Địa chỉ chi tiết
            </label>
            <input
              type="text"
              id="address"
              value={formData.address}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              disabled
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="addressLink">
              Link Bản đồ
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-2 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                <MapPin size={16} />
              </span>
              <input
                type="text"
                id="addressLink"
                value={formData.addressLink}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md bg-gray-100"
                disabled
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-3">Thông tin chủ sở hữu</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ownerName">
                Tên chủ sở hữu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ownerEmail">
                Email chủ sở hữu <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="ownerEmail"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ownerPhone">
                Số điện thoại
              </label>
              <input
                type="tel"
                id="ownerPhone"
                name="ownerPhone"
                value={formData.ownerPhone || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="note">
            Mô tả
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mô tả chi tiết về căn hộ của bạn..."
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/home/apartment/detail/${aptId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApartmentEdit;