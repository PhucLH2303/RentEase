import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Select,
  Spin,
  message,
  Card,
  Divider,
  Alert,
} from "antd";
import moment from "moment";
import { SaveOutlined, RollbackOutlined } from "@ant-design/icons";

interface Post {
  postId: string;
  postCategoryId: number;
  posterId: string;
  aptId: string;
  title: string;
  totalSlot: number;
  currentSlot: number;
  rentPrice: number;
  pilePrice: number | null;
  genderId: number;
  oldId: number | null;
  note: string;
  moveInDate: string;
  moveOutDate: string;
  startPublic: string;
  endPublic: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  status: boolean;
}

interface Gender {
  id: number;
  name: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  count?: number;
  currentPage?: number;
  totalPages?: number;
}

const EditPost = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [genders] = useState<Gender[]>([
    { id: 0, name: "Tất cả" },
    { id: 1, name: "Nam" },
    { id: 2, name: "Nữ" },
  ]);

  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Bạn cần đăng nhập để chỉnh sửa bài đăng!");
      setLoading(false);
      return;
    }

    if (!postId) {
      setError("Không tìm thấy ID bài đăng! Vui lòng kiểm tra đường dẫn URL.");
      setLoading(false);
      return;
    }

    console.log("Post ID from URL:", postId);

    const fetchPost = async () => {
      try {
        const response = await axios.get<ApiResponse<Post>>(
          `https://renteasebe.io.vn/api/Post/GetById?id=${postId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.statusCode === 200 && response.data.data) {
          const postData = response.data.data;
          setPost(postData);

          form.setFieldsValue({
            title: postData.title,
            totalSlot: postData.totalSlot,
            currentSlot: postData.currentSlot,
            rentPrice: postData.rentPrice || 0,
            pilePrice: postData.pilePrice || 0,
            genderId: postData.genderId,
            note: postData.note,
            moveInDate: moment(postData.moveInDate),
            moveOutDate: moment(postData.moveOutDate),
          });
        } else {
          setError("Không tìm thấy bài đăng hoặc bạn không có quyền chỉnh sửa!");
        }
      } catch (err: any) {
        console.error("Error fetching post:", err);
        setError(`Lỗi khi tải dữ liệu bài đăng: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, token, form]);

  const handleSubmit = async (values: any) => {
    if (!post) return;
  
    setSaving(true);
    try {
      const updatedPost = {
        postId: post.postId,
        postCategoryId: post.postCategoryId,
        aptId: post.aptId,
        title: values.title,
        totalSlot: values.totalSlot,
        currentSlot: values.currentSlot,
        rentPrice: values.rentPrice,
        pilePrice: values.pilePrice,
        genderId: values.genderId,
        oldId: post.oldId,
        note: values.note,
        moveInDate: values.moveInDate.format("YYYY-MM-DD"),
        moveOutDate: values.moveOutDate.format("YYYY-MM-DD"),
        status: post.status,
      };
  
      const response = await axios.put<ApiResponse<Post>>(
        `https://renteasebe.io.vn/api/Post?id=${post.postId}`,
        updatedPost,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data.statusCode === 200) {
        message.success("Cập nhật bài đăng thành công!");
        navigate("/home/profile");
      } else {
        message.error(`Lỗi: ${response.data.message}`);
      }
    } catch (err: any) {
      console.error("Error updating post:", err);
      message.error(`Lỗi khi cập nhật bài đăng: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert message="Lỗi" description={error} type="error" showIcon />
        <Button type="primary" onClick={() => navigate("/home/profile")} className="mt-4">
          Trở về trang hồ sơ
        </Button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-4">
        <Alert
          message="Không tìm thấy dữ liệu"
          description="Không thể tải thông tin bài đăng"
          type="warning"
          showIcon
        />
        <Button type="primary" onClick={() => navigate("/home/profile")} className="mt-4">
          Trở về trang hồ sơ
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card title={<div className="text-2xl font-bold">Chỉnh sửa bài đăng</div>} bordered={false} className="shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            title: post.title,
            totalSlot: post.totalSlot,
            currentSlot: post.currentSlot,
            rentPrice: post.rentPrice || 0,
            pilePrice: post.pilePrice || 0,
            genderId: post.genderId,
            note: post.note,
            moveInDate: moment(post.moveInDate),
            moveOutDate: moment(post.moveOutDate),
          }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Nhập tiêu đề bài đăng" maxLength={100} />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="totalSlot"
              label="Tổng số chỗ"
              rules={[{ required: true, message: "Vui lòng nhập tổng số chỗ!" }]}
            >
              <InputNumber min={1} max={20} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="currentSlot"
              label="Số chỗ đã sử dụng"
              rules={[
                { required: true, message: "Vui lòng nhập số chỗ đã sử dụng!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("totalSlot") >= value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Số chỗ đã sử dụng không thể lớn hơn tổng số chỗ!"));
                  },
                }),
              ]}
            >
              <InputNumber min={0} max={20} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="rentPrice"
              label="Giá thuê"
              rules={[{ required: true, message: "Vui lòng nhập giá thuê!" }]}
            >
              <InputNumber
                min={0}
                step={100000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, "") || 0) as any}
                style={{ width: "100%" }}
                addonAfter="VNĐ"
              />
            </Form.Item>

            <Form.Item
              name="pilePrice"
              label="Phí dịch vụ"
              rules={[{ required: true, message: "Vui lòng nhập phí dịch vụ!" }]}
            >
              <InputNumber
                min={0}
                step={50000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, "") || 0) as any}
                style={{ width: "100%" }}
                addonAfter="VNĐ"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="genderId"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            <Select placeholder="Chọn giới tính">
              {genders.map((gender) => (
                <Select.Option key={gender.id} value={gender.id}>
                  {gender.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="moveInDate"
              label="Ngày vào"
              rules={[{ required: true, message: "Vui lòng chọn ngày vào!" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              name="moveOutDate"
              label="Ngày ra"
              rules={[
                { required: true, message: "Vui lòng chọn ngày ra!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue("moveInDate") || value.isAfter(getFieldValue("moveInDate"))) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Ngày ra phải sau ngày vào!"));
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={4} placeholder="Nhập ghi chú cho bài đăng" maxLength={500} />
          </Form.Item>

          <Divider />

          <div className="flex justify-end gap-3">
            <Button icon={<RollbackOutlined />} onClick={() => navigate("/home/profile")}>
              Quay lại
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default EditPost;