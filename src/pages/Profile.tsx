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
}

const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Lấy token từ localStorage - kiểm tra cả accessToken và token cũ
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  
  // Lấy thông tin user từ localStorage một cách an toàn
  const userString = localStorage.getItem("user");
  const user = userString && userString !== "undefined" ? JSON.parse(userString) : null;
  const accountId = user?.accountId;

  useEffect(() => {
    if (!token) {
      setError("Bạn cần đăng nhập để xem bài đăng!");
      setLoading(false);
      return;
    }

    // Kiểm tra nếu accountId không hợp lệ
    if (!accountId) {
      setError("Không thể tải bài đăng: ID tài khoản không hợp lệ!");
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await axios.get(`https://renteasebe.io.vn/api/Post/GetByAccountId?accountId=${accountId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      <h2 className="text-2xl font-bold text-center text-gray-800">
        {accountId ? "Bài đăng của tôi" : "Danh sách bài đăng"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {posts.map((post) => (
          <div key={post.postId} className="bg-white border border-gray-200 p-4 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{post.title}</h3>
            <p className="text-gray-600 text-sm truncate"><strong>Ghi chú:</strong> {post.note}</p>
            <p className="text-gray-700"><strong>Ngày vào:</strong> {post.moveInDate}</p>
            <p className="text-gray-700"><strong>Ngày ra:</strong> {post.moveOutDate}</p>
            <p className="text-blue-600 font-semibold"><strong>Còn chỗ:</strong> {post.totalSlot - post.currentSlot} / {post.totalSlot}</p>
            <div className="mt-4 flex justify-between">
              <Link to={`/home/profile/${post.postId}`} className="text-blue-600 hover:underline">
                Xem chi tiết →
              </Link>
              {accountId && (
                <Link to={`/home/profile/edit/${post.postId}`} className="text-green-600 hover:underline">
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