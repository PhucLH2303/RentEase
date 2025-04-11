import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

interface Post {
  postId: string;
  title: string;
  rentPrice: number;
  totalSlot: number;
  currentSlot: number;
  note: string;
  moveInDate: string;
  moveOutDate: string;
  createdAt: string;
  aptId: string; // Thêm aptId
  status: boolean; 
}

interface Apt {
  aptId: string;
  ownerName: string;
  ownerPhone: string;
  name: string;
  area: number;
  address: string;
  addressLink: string;
  numberOfRoom: number;
  numberOfSlot: number;
  note: string;
}

interface AptImage {
  id: number;
  imageUrl: string;
  createAt: string;
  updateAt: string;
}

interface AptImageResponse {
  aptId: string;
  images: AptImage[];
}

interface OrderType {
  id: string;
  name: string;
  note: string;
  month: number;
  amount: number;
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState<Post | null>(null);
  const [apt, setApt] = useState<Apt | null>(null);
  const [aptImages, setAptImages] = useState<AptImage[]>([]);
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl] = useState<string | null>(null);

  // Sử dụng "accessToken" thay vì "token" để đồng bộ với Login
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        // Điều hướng đến trang đăng nhập, lưu URL hiện tại để quay lại sau
        navigate("/", { state: { from: location.pathname } });
        return;
      }

      try {
        // Fetch post data
        const postResponse = await axios.get(`https://www.renteasebe.io.vn/api/Post/GetById?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const postData = postResponse.data.data as Post;
        setPost(postData);

        // Fetch apt data using aptId from post
        if (postData.aptId) {
          const aptResponse = await axios.get(`https://www.renteasebe.io.vn/api/Apt/GetById?aptId=${postData.aptId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setApt(aptResponse.data.data as Apt);

          // Fetch apt images
          const aptImagesResponse = await axios.get(`https://www.renteasebe.io.vn/api/AptImage/GetByAptId?aptId=${postData.aptId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const imagesData = aptImagesResponse.data.data as AptImageResponse;
          setAptImages(imagesData.images || []);
        }

        // Fetch order types
        const orderTypesResponse = await axios.get("https://www.renteasebe.io.vn/api/OrderType/GetAll?page=1&pageSize=10", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrderTypes(orderTypesResponse.data.data);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu!");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, navigate, location.pathname]);

  const handleCreatePayment = async (orderType: OrderType) => {
    if (!post || !token) return;

    try {
      const paymentData = {
        orderTypeId: orderType.id,
        postId: post.postId,
        amount: orderType.amount,
        incurredCost: 0,
        note: `${orderType.month} tháng`,
      };

      const response = await axios.post(
        "https://www.renteasebe.io.vn/api/Payment/create-payment-link",
        paymentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const checkoutUrl = response.data?.data?.payosRes?.data?.checkoutUrl;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        console.error("No checkout URL found in response", response.data);
        alert("Không thể tạo đường dẫn thanh toán");
      }
    } catch (err) {
      console.error("Payment creation error:", err);
      alert("Lỗi khi tạo liên kết thanh toán");
    }
  };

  if (loading) return <p className="text-center text-gray-600">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!post) return <p className="text-center text-gray-600">Không tìm thấy bài đăng.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">
        ← Quay lại
      </button>

      {/* Post Details */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{post.title}</h2>
        <p className="text-gray-600 text-sm truncate">
          <strong>Ghi chú:</strong> {post.note}
        </p>
        <p className="text-gray-700">
          <strong>Ngày vào:</strong> {post.moveInDate}
        </p>
        <p className="text-gray-700">
          <strong>Ngày ra:</strong> {post.moveOutDate}
        </p>
        <p className="text-blue-600 font-semibold">
          <strong>Còn chỗ:</strong> {post.totalSlot - post.currentSlot} / {post.totalSlot}
        </p>
        <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{post.title}</h3>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  post.status ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {post.status ? "Đã thanh toán" : "Chưa thanh toán"}
              </span>
            </div>
      </div>

      {/* Apartment Details */}
      {apt && (
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Thông tin căn hộ</h3>
          
          {/* Apartment Images */}
          {aptImages.length > 0 && (
            <div className="mb-4 overflow-x-auto">
              <div className="flex space-x-2">
                {aptImages.map((image) => (
                  <img
                    key={image.id}
                    src={`https://www.renteasebe.io.vn${image.imageUrl}`}
                    alt="Hình ảnh căn hộ"
                    className="h-48 w-auto object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}
          
          <h4 className="font-bold text-lg">{apt.name}</h4>
          <p className="text-gray-700">
            <strong>Địa chỉ:</strong> {apt.address}
          </p>
          <p className="text-gray-700">
            <strong>Diện tích:</strong> {apt.area} m²
          </p>
          <p className="text-gray-700">
            <strong>Số phòng:</strong> {apt.numberOfRoom}
          </p>
          <p className="text-gray-700">
            <strong>Tổng số chỗ:</strong> {apt.numberOfSlot}
          </p>
          <p className="text-gray-700">
            <strong>Mô tả:</strong> {apt.note}
          </p>
          
          {apt.addressLink && (
            <a 
              href={apt.addressLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Xem trên bản đồ
            </a>
          )}
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h5 className="font-semibold">Thông tin chủ hộ</h5>
            <p className="text-gray-700">
              <strong>Tên:</strong> {apt.ownerName}
            </p>
            <p className="text-gray-700">
              <strong>Số điện thoại:</strong> {apt.ownerPhone}
            </p>
          </div>
        </div>
      )}

      {/* Payment Options */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Chọn gói thanh toán</h3>
        <div className="grid grid-cols-2 gap-4">
          {orderTypes.map((orderType) => (
            <div
              key={orderType.id}
              className="border p-4 rounded-lg hover:bg-gray-100 cursor-pointer"
              onClick={() => handleCreatePayment(orderType)}
            >
              <h4 className="font-bold text-lg capitalize">{orderType.name}</h4>
              <p className="text-gray-600">{orderType.note}</p>
              <p className="text-blue-600 font-semibold">{orderType.amount.toLocaleString()} VNĐ</p>
            </div>
          ))}
        </div>

        {paymentUrl && (
          <div className="mt-4 p-4 bg-green-100 rounded">
            <p className="font-bold">Checkout URL:</p>
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {paymentUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;