import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Form, Input, Select, DatePicker, notification } from "antd";
import axios from "axios";

const { Option } = Select;

interface PostFormData {
  postCategoryId: number;
  aptId: string;
  title: string;
  totalSlot: number;
  currentSlot: number;
  rentPrice: number; // Added field
  pilePrice: number; // Added field
  genderId: number;
  oldId: number;
  note: string;
  moveInDate: string;
  moveOutDate: string;
  approveStatusId: number;
}

const fixedCategories = [
  { id: 1, categoryName: "Thuê" },
  { id: 2, categoryName: "Kiếm bạn" },
];

const CreatePost: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [roleId, setRoleId] = useState<number | null>(null);

  const aptId = (location.state as { aptId?: string })?.aptId;

  useEffect(() => {
    const storedRoleId = localStorage.getItem("roleId");
    if (storedRoleId) {
      setRoleId(Number(storedRoleId));
    }
  }, []);

  useEffect(() => {
    const initialValues: any = {};

    if (aptId) {
      initialValues.aptId = aptId;
    }

    if (roleId === 2) {
      initialValues.postCategoryId = 1;
    } else if (roleId === 3) {
      initialValues.postCategoryId = 2;
    }

    form.setFieldsValue(initialValues);
  }, [aptId, form, roleId]);

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
      rentPrice: Number(values.rentPrice), // Added field
      pilePrice: Number(values.pilePrice), // Added field
      genderId: Number(values.genderId),
      oldId: Number(values.oldId),
      note: values.note,
      moveInDate: values.moveInDate.format("YYYY-MM-DD"),
      moveOutDate: values.moveOutDate.format("YYYY-MM-DD"),
      approveStatusId: 1,
    };

    try {
      await axios.post("https://renteasebe.io.vn/api/Post", postData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      openNotification("success", "Tạo bài đăng thành công", "Bài đăng của bạn đã được gửi để duyệt.");
      setTimeout(() => navigate("/home/profile"), 1000);
    } catch (err) {
      console.error("Error creating post:", err);
      openNotification("error", "Tạo bài đăng thất bại", "Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

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
          <Select placeholder="Chọn danh mục" disabled={roleId === 2 || roleId === 3}>
            {fixedCategories.map((category) => (
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

        {/* Added rentPrice field */}
        <Form.Item
          label="Giá thuê"
          name="rentPrice"
          rules={[{ required: true, message: "Vui lòng nhập giá thuê!" }]}
        >
          <Input type="number" placeholder="Nhập giá thuê" suffix="VNĐ" />
        </Form.Item>

        {/* Added pilePrice field */}
        <Form.Item
          label="Phí đặt cọc"
          name="pilePrice"
          rules={[{ required: true, message: "Vui lòng nhập phí đặt cọc!" }]}
        >
          <Input type="number" placeholder="Nhập phí đặt cọc" suffix="VNĐ" />
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