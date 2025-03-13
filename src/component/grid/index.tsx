import React from "react";
import { Card } from "antd";
import { useNavigate } from "react-router-dom";

const gridStyle: React.CSSProperties = {
    width: "25%",
    textAlign: "center",
    padding: "20px",
    cursor: "pointer", // Add cursor pointer to indicate clickable
};

const imageStyle: React.CSSProperties = {
    width: "150px",
    height: "150px",
    objectFit: "cover",
    borderRadius: "8px",
};

const ApartmentGrid: React.FC = () => {
    const navigate = useNavigate();
    const apartments = [
        {
            id: "1",
            name: "D",
            district: 4,
            price: "5.5 triệu/tháng",
            area: "25m²",
            rating: 4.6,
        },
        {
            id: "2",
            name: "E",
            district: 5,
            price: "5.5 triệu/tháng",
            area: "25m²",
            rating: 4.6,
        },
        {
            id: "3",
            name: "F",
            district: 6,
            price: "5.5 triệu/tháng",
            area: "25m²",
            rating: 4.6,
        },
        {
            id: "4",
            name: "G",
            district: 7,
            price: "5.5 triệu/tháng",
            area: "25m²",
            rating: 4.6,
        },
        {
            id: "5",
            name: "H",
            district: 8,
            price: "5.5 triệu/tháng",
            area: "25m²",
            rating: 4.6,
        },
        {
            id: "6",
            name: "I",
            district: 9,
            price: "5.5 triệu/tháng",
            area: "25m²",
            rating: 4.6,
        },
        {
            id: "7",
            name: "F",
            district: 10,
            price: "5.5 triệu/tháng",
            area: "25m²",
            rating: 4.6,
        },
        {
            id: "8",
            name: "G",
            district: 11,
            price: "5.5 triệu/tháng",
            area: "25m²",
            rating: 4.6,
        },
    ];
    
    const imageUrl =
        "https://ecogreen-saigon.vn/uploads/phong-tro-la-loai-hinh-nha-o-pho-bien-gia-re-tien-loi-cho-sinh-vien-va-nguoi-di-lam.png";

        const handleApartmentClick = (apartmentId: string) => {
            navigate(`/home/apartment/${apartmentId}`);
        };

    return (
        <Card title="🏡 Các căn hộ khác">
            {apartments.map((apartment) => (
                <Card.Grid 
                    key={apartment.id} 
                    style={gridStyle}
                    onClick={() => handleApartmentClick(apartment.id)}
                >
                    <div className="flex justify-center">
                        <img src={imageUrl} alt="Phòng trọ" style={imageStyle} />
                    </div>
                    <h3 className="mt-2 font-semibold">
                        Căn hộ {apartment.name} - Quận {apartment.district}
                    </h3>
                    <p className="text-sm text-gray-500">{apartment.price} • {apartment.area}</p>
                    <span className="text-sm text-yellow-500">⭐ {apartment.rating}/5</span>
                </Card.Grid>
            ))}
        </Card>
    );
};

export default ApartmentGrid;