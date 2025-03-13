import React from "react";
import { Select, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ApartmentCard from "../component/card/index";
import ApartmentGrid from "../component/grid/index";

const { Option } = Select;

const Home: React.FC = () => {
  const apartments = [
    {
      title: "Căn hộ A - Quận 1",
      description: "4.5 triệu/tháng • 22m²",
      imageUrl: "/room-1.jpg",
      avatarUrl: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
    },
    {
      title: "Căn hộ B - Quận 2",
      description: "5 triệu/tháng • 24m²",
      imageUrl: "/room-2.jpg",
      avatarUrl: "https://api.dicebear.com/7.x/miniavs/svg?seed=2",
    },
    {
      title: "Căn hộ C - Quận 3",
      description: "6 triệu/tháng • 26m²",
      imageUrl: "/room-3.jpg",
      avatarUrl: "https://api.dicebear.com/7.x/miniavs/svg?seed=3",
    },
  ];
  return (
    <div className="bg-gray-100">
      {/* Header */}

      {/* Search Box */}
      <div className="flex items-center justify-center bg-white shadow-md p-4 rounded-lg mx-auto mt-6 w-11/12 max-w-4xl">
        <Select defaultValue="Địa điểm" className="w-1/3">
          <Option value="hcm">Hồ Chí Minh</Option>
          <Option value="hn">Hà Nội</Option>
        </Select>
        <Select defaultValue="Thời gian thuê" className="w-1/3">
          <Option value="short">Ngắn hạn</Option>
          <Option value="long">Dài hạn</Option>
        </Select>
        <Select defaultValue="Loại căn hộ" className="w-1/3">
          <Option value="studio">Studio</Option>
          <Option value="apartment">Căn hộ</Option>
        </Select>
        <Button type="primary" icon={<SearchOutlined />} className="ml-4">
          Tìm kiếm
        </Button>
      </div>

      {/* Căn hộ gợi ý */}
      <div className="p-8">
        <h2 className="text-lg font-bold mb-4">👀 Căn bạn</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {apartments.map((apartment, index) => (
            <ApartmentCard
              key={index}
              title={apartment.title}
              description={apartment.description}
              imageUrl={apartment.imageUrl}
              avatarUrl={apartment.avatarUrl}
            />
          ))}
        </div>
      </div>

      {/* Các căn hộ khác */}
      <div className="mt-8">
        <ApartmentGrid />
      </div>
    </div>
  );
};

export default Home;
