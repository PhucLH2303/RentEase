import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface PostRequest {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhone: string;
  note: string;
  approveStatusId: number;
  approveStatusName: string;
  responseMessage: string | null;
  createdAt: string;
}

interface UpdateRequestPayload {
  postId: string;
  approveStatusId: number;
  responseMessage: string;
  note: string;
}

const ManageRequest = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PostRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<PostRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [responseMessage, setResponseMessage] = useState<string>("");

  const token = localStorage.getItem("accessToken");
  const roleId = localStorage.getItem("roleId");

  useEffect(() => {
    const fetchRequests = async () => {
      if (!token || !postId) {
        navigate("/");
        return;
      }

      if (roleId !== "2") {
        setError("Bạn không có quyền truy cập trang này.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`https://renteasebe.io.vn/api/PostRequire/GetByPostId?postId=${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(response.data.data as PostRequest[]);
      } catch (err) {
        setError("Lỗi khi tải danh sách yêu cầu!");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [postId, token, navigate, roleId]);

  const handleAction = (request: PostRequest, type: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(type);
    setResponseMessage("");
    setShowConfirmModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !actionType || !token || !postId) return;

    try {
      const payload: UpdateRequestPayload = {
        postId: selectedRequest.postId,
        approveStatusId: actionType === "approve" ? 2 : 3, // 2: Approved, 3: Rejected
        responseMessage: responseMessage,
        note: "",
      };

      await axios.put(
        `https://renteasebe.io.vn/api/PostRequire/Update-ApproveStatus?Id=${selectedRequest.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                approveStatusId: payload.approveStatusId,
                approveStatusName: actionType === "approve" ? "Approved" : "Rejected",
                responseMessage: payload.responseMessage,
              }
            : req
        )
      );

      setShowConfirmModal(false);
      alert(`Yêu cầu đã được ${actionType === "approve" ? "chấp nhận" : "từ chối"} thành công!`);
    } catch (err) {
      console.error("Update status error:", err);
      alert("Lỗi khi cập nhật trạng thái yêu cầu!");
    }
  };

  const cancelAction = () => {
    setShowConfirmModal(false);
    setSelectedRequest(null);
    setActionType(null);
    setResponseMessage("");
  };

  if (loading) return <p className="text-center text-gray-600">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">
        ← Quay lại
      </button>

      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quản lý yêu cầu ở cùng phòng</h2>

        {requests.length === 0 ? (
          <p className="text-gray-600">Không có yêu cầu nào cho bài đăng này.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{request.userName}</h3>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      request.approveStatusId === 2
                        ? "bg-green-100 text-green-700"
                        : request.approveStatusId === 3
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {request.approveStatusName}
                  </span>
                </div>
                <p className="text-gray-700">
                  <strong>Số điện thoại:</strong> {request.userPhone}
                </p>
                <p className="text-gray-700">
                  <strong>Ghi chú:</strong> {request.note || "Không có"}
                </p>
                {request.responseMessage && (
                  <p className="text-gray-700">
                    <strong>Phản hồi:</strong> {request.responseMessage}
                  </p>
                )}
                <p className="text-gray-600 text-sm">
                  <strong>Ngày gửi:</strong> {new Date(request.createdAt).toLocaleDateString()}
                </p>

                {request.approveStatusId === 1 && (
                  <div className="flex space-x-4 mt-4">
                    <button
                      onClick={() => handleAction(request, "approve")}
                      className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg"
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleAction(request, "reject")}
                      className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg"
                    >
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              Xác nhận {actionType === "approve" ? "chấp nhận" : "từ chối"} yêu cầu
            </h3>
            <p className="text-gray-700 mb-4">
              Bạn có muốn {actionType === "approve" ? "chấp nhận" : "từ chối"} yêu cầu từ{" "}
              <strong>{selectedRequest.userName}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phản hồi (tùy chọn):</label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="w-full p-2 border rounded-lg"
                rows={4}
                placeholder="Nhập phản hồi của bạn..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelAction}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRequest;