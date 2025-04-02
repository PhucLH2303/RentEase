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
  
  // Kiểm tra token (authorize)
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Bạn cần đăng nhập để xem bài đăng!");
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await axios.get("https://www.renteasebe.io.vn/api/Post/GetAll?page=1&pageSize=10", {
          headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
        });
        setPosts(response.data.data as Post[]);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  if (loading) return <p className="text-center text-gray-600">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-center text-gray-800">Danh sách bài đăng</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {posts.map((post) => (
          <div key={post.postId} className="bg-white border border-gray-200 p-4 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{post.title}</h3>
            <p className="text-gray-600 text-sm truncate"><strong>Ghi chú:</strong> {post.note}</p>
            <p className="text-gray-700"><strong>Ngày vào:</strong> {post.moveInDate}</p>
            <p className="text-gray-700"><strong>Ngày ra:</strong> {post.moveOutDate}</p>
            <p className="text-blue-600 font-semibold"><strong>Còn chỗ:</strong> {post.totalSlot - post.currentSlot} / {post.totalSlot}</p>
            <Link to={`/home/profile/${post.postId}`} className="text-blue-600 hover:underline">
  Xem chi tiết →
</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList;
