import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, InputNumber, Select, notification, Modal } from "antd";
import axios, { AxiosError } from "axios";
import provincesData from '../../../assets/data.json';
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
import L, { Icon, LatLng } from 'leaflet';
import { EnvironmentOutlined } from '@ant-design/icons';

// Fix Leaflet default icon without using 'any'
interface IconDefaultExtended extends Icon.Default {
    _getIconUrl?: () => string;
}

const defaultIcon = L.Icon.Default.prototype as IconDefaultExtended;
delete defaultIcon._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const { Option } = Select;

// Raw data structure from JSON
interface RawWard { Id: string | number; Name: string; Level: string }
interface RawDistrict { Id: string | number; Name: string; Wards: RawWard[] }
interface RawProvince { Id: string | number; Name: string; Districts: RawDistrict[] }

// Processed types
type Ward = { Id: number; Name: string; Level: string }
type District = { Id: number; Name: string; Wards: Ward[] }
type Province = { Id: number; Name: string; Districts: District[] }

type AptFormData = {
    ownerName: string;
    ownerPhone: string;
    ownerEmail: string;
    name: string;
    area: number;
    address: string;
    addressLink?: string;
    provinceId: number;
    districtId: number;
    wardId: number;
    aptCategoryId: number;
    // aptStatusId: number;
    numberOfRoom: number;
    numberOfSlot: number;
    note?: string;
}

type Category = { id: number; categoryName: string }
type Status = { id: number; statusName: string }

type SelectOption = Province | District | Ward | Category | Status;

// Type guards
function isProvince(option: SelectOption): option is Province { return 'Districts' in option; }
function isDistrict(option: SelectOption): option is District { return 'Wards' in option; }
function isCategory(option: SelectOption): option is Category { return 'categoryName' in option; }
function isStatus(option: SelectOption): option is Status { return 'statusName' in option; }

// Component to resize the map when the modal opens
const MapResize: React.FC = () => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
    }, [map]);
    return null;
};

// Component to handle map click events
const MapClickHandler: React.FC<{ onLocationSelect: (latlng: LatLng) => void }> = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
};

const CreateApartment: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isMapModalVisible, setIsMapModalVisible] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null);

    const [formData, setFormData] = useState({
        categories: [] as Category[],
        statuses: [] as Status[],
        provinces: [] as Province[],
        districts: [] as District[],
        wards: [] as Ward[]
    });

    // Transform province data
    const transformProvinceData = useMemo(() => {
        try {
            console.log("Transforming province data...");
            if (!provincesData || !Array.isArray(provincesData)) {
                console.error("Province data is not valid:", provincesData);
                return [];
            }
            
            return (provincesData as RawProvince[]).map(province => ({
                ...province,
                Id: Number(province.Id),
                Districts: province.Districts.map((district: RawDistrict) => ({
                    ...district,
                    Id: Number(district.Id),
                    Wards: district.Wards.map((ward: RawWard) => ({
                        ...ward,
                        Id: Number(ward.Id)
                    }))
                }))
            })) as Province[];
        } catch (error) {
            console.error("Location data transform error:", error);
            notification.error({
                message: "Data Loading Error",
                description: "Could not process location data"
            });
            return [];
        }
    }, []);

    // Updated fetchData function with better token handling and error management
    const fetchData = async () => {
        console.log("Fetching data...");
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
            notification.error({ 
                message: "Authentication Error", 
                description: "Please log in again to continue" 
            });
            navigate("/");
            return;
        }

        try {
            // Safely parse JWT token to extract user ID
            let userId;
            try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                console.log("Token payload:", tokenPayload);
                userId = tokenPayload.id || tokenPayload.userId || tokenPayload.sub;
                
                if (!userId) {
                    throw new Error("User ID not found in token");
                }
                console.log("User ID from token:", userId);
            } catch (tokenError) {
                console.error("Token parsing error:", tokenError);
                notification.error({
                    message: "Authentication Error",
                    description: "Invalid token format. Please log in again."
                });
                navigate("/");
                return;
            }

            // Configure request headers with CORS considerations
            const requestConfig = {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            console.log("Making API requests with token...");
            
            // Use Promise.allSettled instead of Promise.all for better error handling
            const [categoriesRes, statusesRes, accountResponse] = await Promise.allSettled([
                axios.get("https://www.renteasebe.io.vn/api/AptCategory/GetAll", requestConfig),
                axios.get("https://www.renteasebe.io.vn/api/AptStatus/GetAll", requestConfig),
                axios.get(`https://www.renteasebe.io.vn/api/Accounts/GetById?id=${userId}`, requestConfig)
            ]);

            // Handle each response individually
            if (categoriesRes.status === 'fulfilled') {
                console.log("Categories loaded:", categoriesRes.value.data);
                setFormData(prev => ({
                    ...prev,
                    categories: categoriesRes.value.data.data
                }));
            } else {
                console.error("Categories fetch error:", categoriesRes.reason);
                notification.error({
                    message: "Data Loading Error",
                    description: "Failed to load apartment categories"
                });
            }

            if (statusesRes.status === 'fulfilled') {
                console.log("Statuses loaded:", statusesRes.value.data);
                setFormData(prev => ({
                    ...prev,
                    statuses: statusesRes.value.data.data
                }));
            } else {
                console.error("Statuses fetch error:", statusesRes.reason);
                notification.error({
                    message: "Data Loading Error",
                    description: "Failed to load apartment statuses"
                });
            }

            if (accountResponse.status === 'fulfilled') {
                console.log("Account data loaded:", accountResponse.value.data);
                const userData = accountResponse.value.data.data;
                form.setFieldsValue({
                    ownerName: userData.fullName,
                    ownerPhone: userData.phoneNumber,
                    ownerEmail: userData.email
                });
            } else {
                console.error("Account fetch error:", accountResponse.reason);
                notification.error({
                    message: "Data Loading Error",
                    description: "Failed to load account information"
                });
            }

            // Always set provinces from local data regardless of API failures
            console.log("Setting provinces from local data");
            setFormData(prev => ({
                ...prev,
                provinces: transformProvinceData
            }));

        } catch (error) {
            console.error("Data fetch error:", error);
            const axiosError = error as AxiosError;
            
            // Check if it's a CORS error
            if (axiosError.message?.includes('Network Error')) {
                notification.error({
                    message: "Network Error",
                    description: "This may be caused by CORS settings on the server. Please contact the administrator."
                });
            } else {
                notification.error({
                    message: "Data Fetch Error",
                    description: axiosError.message || "Unknown error occurred"
                });
            }
        }
    };

    // Add useEffect to call fetchData when component mounts
    useEffect(() => {
        console.log("Component mounted, calling fetchData");
        fetchData();
    }, []); // Empty dependency array means this runs once on mount

    // Handle map click and save location
    const handleLocationSelect = async (latlng: LatLng) => {
        setSelectedPosition(latlng);
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
            );
            const address = response.data.display_name;
            const mapLink = `https://www.openstreetmap.org/?mlat=${latlng.lat}&mlon=${latlng.lng}#map=15/${latlng.lat}/${latlng.lng}`;
            form.setFieldsValue({ addressLink: mapLink, address });
        } catch (error) {
            console.error("Geocoding error:", error);
            notification.error({
                message: "Geocoding Error",
                description: "Could not retrieve address"
            });
        }
    };

    // Location selection handlers
    const handleLocationChange = {
        province: (provinceId: number) => {
            console.log("Province selected:", provinceId);
            const province = formData.provinces.find(p => p.Id === provinceId);
            if (province) {
                setFormData(prev => ({ ...prev, districts: province.Districts, wards: [] }));
                form.setFieldsValue({
                    districtId: undefined,
                    wardId: undefined,
                    address: province.Name
                });
            }
        },
        district: (districtId: number) => {
            console.log("District selected:", districtId);
            const district = formData.districts.find(d => d.Id === districtId);
            if (district) {
                setFormData(prev => ({ ...prev, wards: district.Wards }));
                form.setFieldsValue({
                    wardId: undefined,
                    address: `${form.getFieldValue("address")}, ${district.Name}`
                });
            }
        },
        ward: (wardId: number) => {
            console.log("Ward selected:", wardId);
            const ward = formData.wards.find(w => w.Id === wardId);
            if (ward) {
                form.setFieldsValue({
                    address: `${form.getFieldValue("address")}, ${ward.Name}`
                });
            }
        }
    };

    const getOptionLabel = (option: SelectOption): string => {
        if (isProvince(option) || isDistrict(option) || (option as Ward).Name) {
            return (option as Province | District | Ward).Name;
        }
        if (isCategory(option)) return option.categoryName;
        if (isStatus(option)) return option.statusName;
        return '';
    };

    const getOptionValue = (option: SelectOption): number => {
        if (isProvince(option) || isDistrict(option) || (option as Ward).Id) {
            return (option as Province | District | Ward).Id;
        }
        if (isCategory(option) || isStatus(option)) return option.id;
        return 0;
    };

    const onFinish = async (values: AptFormData) => {
        console.log("Form submitted with values:", values);
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
            notification.error({ 
                message: "Authentication Error", 
                description: "Please log in again to continue" 
            });
            navigate("/");
            return;
        }
        
        try {
            const submissionData = {
                ...values,
                provinceId: Number(values.provinceId),
                districtId: Number(values.districtId),
                wardId: Number(values.wardId),
                aptCategoryId: Number(values.aptCategoryId),
                // aptStatusId: Number(values.aptStatusId),
                area: Number(values.area),
                numberOfRoom: Number(values.numberOfRoom),
                numberOfSlot: Number(values.numberOfSlot)
            };

            console.log("Submitting data:", submissionData);

            await axios.post("https://www.renteasebe.io.vn/api/Apt", submissionData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            notification.success({
                message: "Apartment Posted Successfully!",
                description: "Redirecting to home page..."
            });
            setTimeout(() => navigate("/home/landlord-home"), 1500);
        } catch (error) {
            console.error("Submission error:", error);
            const axiosError = error as AxiosError<{ message?: string }>;
            notification.error({
                message: "Apartment Posting Error",
                description: axiosError.response?.data?.message || "System Error"
            });
        } finally {
            setLoading(false);
        }
    };

    const showMapModal = () => {
        setIsMapModalVisible(true);
    };

    const handleMapModalOk = () => {
        setIsMapModalVisible(false);
    };

    const handleMapModalCancel = () => {
        setIsMapModalVisible(false);
        setSelectedPosition(null); // Reset position when canceling
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
                    Post New Apartment
                </h2>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                >
                    <Form.Item name="ownerName" hidden><Input /></Form.Item>
                    <Form.Item name="ownerPhone" hidden><Input /></Form.Item>
                    <Form.Item name="ownerEmail" hidden><Input /></Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { name: 'name', label: 'Apartment Name', type: 'input', rules: true },
                            { name: 'area', label: 'Area (m²)', type: 'number', rules: true },
                            { name: 'address', label: 'Detailed Address', type: 'input', rules: true },
                            {
                                name: 'addressLink',
                                label: 'Map Link',
                                type: 'input',
                                rules: false,
                                extra: (
                                    <Button
                                        icon={<EnvironmentOutlined />}
                                        onClick={showMapModal}
                                        style={{ marginTop: 8 }}
                                    >
                                        Select Location
                                    </Button>
                                )
                            },
                            {
                                name: 'provinceId',
                                label: 'Province',
                                type: 'select',
                                options: formData.provinces,
                                onChange: handleLocationChange.province,
                                rules: true
                            },
                            {
                                name: 'districtId',
                                label: 'District',
                                type: 'select',
                                options: formData.districts,
                                onChange: handleLocationChange.district,
                                rules: true,
                                disabled: formData.districts.length === 0
                            },
                            {
                                name: 'wardId',
                                label: 'Ward',
                                type: 'select',
                                options: formData.wards,
                                onChange: handleLocationChange.ward,
                                rules: true,
                                disabled: formData.wards.length === 0
                            },
                            {
                                name: 'aptCategoryId',
                                label: 'Apartment Category',
                                type: 'select',
                                options: formData.categories,
                                rules: true
                            },
                            // {
                            //     name: 'aptStatusId',
                            //     label: 'Apartment Status',
                            //     type: 'select',
                            //     options: formData.statuses,
                            //     rules: true
                            // },
                            { name: 'numberOfRoom', label: 'Number of Rooms', type: 'number', rules: true },
                            { name: 'numberOfSlot', label: 'Maximum Occupancy', type: 'number', rules: true }
                        ].map(field => (
                            <Form.Item
                                key={field.name}
                                label={field.label}
                                name={field.name}
                                rules={field.rules ? [{
                                    required: true,
                                    message: `Please enter ${field.label.toLowerCase()}`
                                }] : undefined}
                                extra={field.extra}
                            >
                                {field.type === 'input' ? (
                                    <Input placeholder={`Enter ${field.label.toLowerCase()}`} />
                                ) : field.type === 'number' ? (
                                    <InputNumber
                                        min={0}
                                        className="w-full"
                                        placeholder={field.name === 'numberOfRoom' ? "2" : "4"}
                                    />
                                ) : field.type === 'select' ? (
                                    <Select
                                        showSearch
                                        placeholder={`Select ${field.label.toLowerCase()}`}
                                        onChange={field.onChange}
                                        disabled={field.disabled}
                                        filterOption={(input, option) =>
                                            String(option?.children)
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                    >
                                        {(field.options || []).map((option: SelectOption) => (
                                            <Option
                                                key={getOptionValue(option)}
                                                value={getOptionValue(option)}
                                            >
                                                {getOptionLabel(option)}
                                            </Option>
                                        ))}
                                    </Select>
                                ) : null}
                            </Form.Item>
                        ))}
                    </div>

                    <Form.Item label="Additional Notes" name="note">
                        <Input.TextArea
                            rows={4}
                            placeholder="Additional apartment details..."
                            className="resize-none"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            className="bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                        >
                            Complete Registration
                        </Button>
                    </Form.Item>
                </Form>

                {/* Modal for map */}
                <Modal
                    title="Select Location on Map"
                    open={isMapModalVisible}
                    onOk={handleMapModalOk}
                    onCancel={handleMapModalCancel}
                    width={800}
                    bodyStyle={{ padding: 0 }} // Remove padding to fit map properly
                >
                    <div style={{ height: "400px", width: "100%", overflow: "hidden" }}>
                        <MapContainer
                            center={[10.7769, 106.7009]} // Default location (Ho Chi Minh City)
                            zoom={12}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <MapResize />
                            <MapClickHandler onLocationSelect={handleLocationSelect} />
                            {selectedPosition && <Marker position={selectedPosition} />}
                        </MapContainer>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default CreateApartment;