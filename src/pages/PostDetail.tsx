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
  aptId: string;
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
  day: number;
  amount: number;
  postCategoryId: number;
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
  const [showStatusConfirm, setShowStatusConfirm] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<boolean | null>(null);

  const token = localStorage.getItem("accessToken");
  const roleId = localStorage.getItem("roleId");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
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

        // Fetch apt data
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

        // Fetch order types only if roleId != 2
        if (roleId !== "2") {
          const orderTypesResponse = await axios.get("https://www.renteasebe.io.vn/api/OrderType/GetAll?page=1&pageSize=10", {
            headers: { Authorization: `Bearer ${token}` },
          });
          let fetchedOrderTypes = orderTypesResponse.data.data as OrderType[];

          // Filter order types based on roleId
          if (roleId === "3") {
            fetchedOrderTypes = fetchedOrderTypes.filter(
              (orderType) => orderType.postCategoryId === 2
            );
          }

          setOrderTypes(fetchedOrderTypes);
        }
      } catch (err) {
        setError("Lỗi khi tải dữ liệu!");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, navigate, location.pathname, roleId]);

  const handleCreatePayment = async (orderType: OrderType) => {
    if (!post || !token) return;

    try {
      const paymentData = {
        orderTypeId: orderType.id,
        postId: post.postId,
        amount: orderType.amount,
        incurredCost: 0,
        note: `${orderType.day} ngày`,
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

  const handleStatusToggle = () => {
    if (!post) return;
    
    // Set new status (opposite of current)
    setNewStatus(!post.status);
    setShowStatusConfirm(true);
  };

  const handleStatusChange = async () => {
    if (!post || newStatus === null || !token) return;

    try {
      const apiUrl = newStatus 
        ? `https://renteasebe.io.vn/api/Post/Active?id=${post.postId}` 
        : `https://renteasebe.io.vn/api/Post/Deactive?id=${post.postId}`;

      await axios.put(apiUrl, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local post state
      setPost({...post, status: newStatus});
      setShowStatusConfirm(false);
      
      // Show success message
      alert(newStatus ? "Đã chuyển bài viết sang chế độ Public" : "Đã chuyển bài viết sang chế độ Private");
    } catch (err) {
      console.error("Status change error:", err);
      alert("Đã xảy ra lỗi khi thay đổi trạng thái bài viết");
    }
  };

  const cancelStatusChange = () => {
    setShowStatusConfirm(false);
    setNewStatus(null);
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
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{post.title}</h2>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              post.status ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {post.status ? "Public" : "Private"}
          </span>
        </div>
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

      {/* Status Toggle for roleId == 2 */}
      {roleId === "2" && (
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Trạng thái bài đăng</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700">
                Trạng thái hiện tại: 
                <span className={`ml-2 font-bold ${post.status ? "text-green-600" : "text-yellow-600"}`}>
                  {post.status ? "Public" : "Private"}
                </span>
              </p>
            </div>
            <div>
              <button
                onClick={handleStatusToggle}
                className={`px-4 py-2 rounded-lg font-medium ${
                  post.status 
                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" 
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                Chuyển sang {post.status ? "Private" : "Public"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Dialog */}
      {showStatusConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Xác nhận thay đổi</h3>
            {newStatus ? (
              <p className="text-gray-700 mb-4">
                Bạn sẽ bị trừ 1 lượt đăng bài và không được hoàn lại khi chuyển từ Private sang Public.
              </p>
            ) : (
              <p className="text-gray-700 mb-4">
                Bạn sẽ không được hoàn lại lượt đăng bài khi chuyển từ Public sang Private.
              </p>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelStatusChange}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleStatusChange}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Options - Only shown for non-roleId 2 users */}
      {roleId !== "2" && orderTypes.length > 0 && (
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
      )}
    </div>
  );
};

export default PostDetail;