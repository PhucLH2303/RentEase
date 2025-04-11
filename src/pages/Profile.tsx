import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Post {
  postId: string;
  title: string;
  note: string;
  moveInDate: string;
  moveOutDate: string;
  totalSlot: number;
  currentSlot: number;
  status: boolean; // Thêm status để hiển thị tình trạng thanh toán
}

const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString && userString !== "undefined" ? JSON.parse(userString) : null;
  const accountId = user?.accountId;

  useEffect(() => {
    if (!token) {
      setError("Bạn cần đăng nhập để xem bài đăng!");
      setLoading(false);
      return;
    }

    if (!accountId) {
      setError("Không thể tải bài đăng: ID tài khoản không hợp lệ!");
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `https://renteasebe.io.vn/api/Post/GetByAccountId?accountId=${accountId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPosts(response.data.data as Post[]);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Lỗi khi tải dữ liệu bài đăng!");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token, accountId]);

  if (loading) return <p className="text-center text-gray-600">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (posts.length === 0) return <p className="text-center text-gray-600">Không tìm thấy bài đăng nào.</p>;

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Bài đăng của tôi</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.postId}
            className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 p-5 space-y-3"
          >
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
            <p className="text-sm text-gray-600 line-clamp-2">
              <strong>Ghi chú:</strong> {post.note}
            </p>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Ngày vào:</strong> {post.moveInDate}</p>
              <p><strong>Ngày ra:</strong> {post.moveOutDate}</p>
              <p>
                <strong>Chỗ trống:</strong>{" "}
                <span className="text-blue-600 font-semibold">
                  {post.totalSlot - post.currentSlot} / {post.totalSlot}
                </span>
              </p>
            </div>
            <div className="flex justify-between items-center pt-3 border-t mt-3">
              <Link
                to={`/home/profile/${post.postId}`}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Xem chi tiết →
              </Link>
              {accountId && (
                <Link
                  to={`/home/profile/edit/${post.postId}`}
                  className="text-green-600 text-sm font-medium hover:underline"
                >
                  Chỉnh sửa
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList;
