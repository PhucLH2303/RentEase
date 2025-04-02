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
        const postResponse = await axios.get(`https://www.renteasebe.io.vn/api/Post/GetById?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(postResponse.data.data as Post);

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
      </div>

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