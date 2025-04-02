import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Form, Input, Select, DatePicker, notification } from "antd";
import axios from "axios";


const { Option } = Select;

interface PostCategory {
  id: number;
  categoryName: string;
  note: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  status: boolean | null;
}

interface PostFormData {
  postCategoryId: number;
  aptId: string;
  title: string;
  totalSlot: number;
  currentSlot: number;
  genderId: number;
  oldId: number;
  note: string;
  moveInDate: string;
  moveOutDate: string;
  approveStatusId: number;
}

const CreatePost: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Lấy aptId từ state của location (truyền từ UserApartmentList)
  const aptId = (location.state as { aptId?: string })?.aptId;

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/", { state: { from: "/create-post" } });
        return;
      }

      try {
        const response = await axios.get("https://renteasebe.io.vn/api/PostCategory/GetAll", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data.data);
      } catch (err) {
        setFetchError("Không thể tải danh mục bài đăng. Vui lòng thử lại sau.");
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();

    // Nếu có aptId, điền sẵn vào form
    if (aptId) {
      form.setFieldsValue({ aptId });
    }
  }, [aptId, form, navigate]);

  const openNotification = (type: "success" | "error", message: string, description: string) => {
    notification[type]({
      message,
      description,
      placement: "topRight",
    });
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/", { state: { from: "/create-post" } });
      setLoading(false);
      return;
    }

    const postData: PostFormData = {
      postCategoryId: values.postCategoryId,
      aptId: values.aptId,
      title: values.title,
      totalSlot: Number(values.totalSlot),
      currentSlot: Number(values.currentSlot),
      genderId: Number(values.genderId),
      oldId: Number(values.oldId),
      note: values.note,
      moveInDate: values.moveInDate.format("YYYY-MM-DD"),
      moveOutDate: values.moveOutDate.format("YYYY-MM-DD"),
      approveStatusId: 1, // Mặc định là "Đang duyệt"
    };

    try {
      await axios.post("https://renteasebe.io.vn/api/Post", postData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      openNotification("success", "Tạo bài đăng thành công", "Bài đăng của bạn đã được gửi để duyệt.");
      setTimeout(() => navigate("/home/profile"), 1000); // Quay lại danh sách căn hộ
    } catch (err) {
      console.error("Error creating post:", err);
      openNotification("error", "Tạo bài đăng thất bại", "Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Lỗi!</strong>
        <span className="block sm:inline"> {fetchError}</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tạo Bài Đăng Mới</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ aptId: aptId || "" }}
        className="space-y-4"
      >
        <Form.Item
          label="Danh mục bài đăng"
          name="postCategoryId"
          rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
        >
          <Select placeholder="Chọn danh mục">
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.categoryName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="ID căn hộ"
          name="aptId"
          rules={[{ required: true, message: "Vui lòng nhập ID căn hộ!" }]}
        >
          <Input disabled={!!aptId} placeholder="Nhập ID căn hộ" />
        </Form.Item>

        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input placeholder="Nhập tiêu đề bài đăng" />
        </Form.Item>

        <Form.Item
          label="Tổng số chỗ"
          name="totalSlot"
          rules={[{ required: true, message: "Vui lòng nhập tổng số chỗ!" }]}
        >
          <Input type="number" placeholder="Nhập tổng số chỗ" />
        </Form.Item>

        <Form.Item
          label="Số chỗ hiện tại"
          name="currentSlot"
          rules={[{ required: true, message: "Vui lòng nhập số chỗ hiện tại!" }]}
        >
          <Input type="number" placeholder="Nhập số chỗ hiện tại" />
        </Form.Item>

        <Form.Item
          label="Giới tính"
          name="genderId"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select placeholder="Chọn giới tính">
            <Option value={1}>Nam</Option>
            <Option value={2}>Nữ</Option>
            <Option value={3}>Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Độ tuổi"
          name="oldId"
          rules={[{ required: true, message: "Vui lòng chọn độ tuổi!" }]}
        >
          <Select placeholder="Chọn độ tuổi">
            <Option value={1}>Dưới 18</Option>
            <Option value={2}>18-25</Option>
            <Option value={3}>Trên 25</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea placeholder="Nhập ghi chú (nếu có)" rows={4} />
        </Form.Item>

        <Form.Item
          label="Ngày vào"
          name="moveInDate"
          rules={[{ required: true, message: "Vui lòng chọn ngày vào!" }]}
        >
          <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Ngày ra"
          name="moveOutDate"
          rules={[{ required: true, message: "Vui lòng chọn ngày ra!" }]}
        >
          <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Tạo bài đăng
          </Button>
        </Form.Item>
      </Form>
      <Button
        onClick={() => navigate(-1)}
        className="mt-4 text-blue-600 hover:underline"
      >
        ← Quay lại
      </Button>
    </div>
  );
};

export default CreatePost;