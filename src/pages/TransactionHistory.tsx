import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Spin,
  DatePicker,
  Button,
  Input,
  Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";

const { RangePicker } = DatePicker;

interface Transaction {
  orderId: string;
  orderTypeId: string;
  orderCode: string;
  postId: string;
  senderId: string;
  totalAmount: number;
  note: string | null;
  createdAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  paymentStatusId: number;
}

interface TableTransaction extends Transaction {
  key: string;
}

interface User {
  accountId: string;
  roleId: number;
  [key: string]: any;
}

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[any, any]>([null, null]);
  const [searchText, setSearchText] = useState<string>("");

  const getStatusTag = (statusId: number): React.ReactNode => {
    switch (statusId) {
      case 1:
        return <Tag color="gold">Pending</Tag>;
      case 2:
        return <Tag color="green">Paid</Tag>;
      case 3:
        return <Tag color="blue">Processing</Tag>;
      case 4:
        return <Tag color="red">Cancelled</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isDateInRange = (
    dateString: string,
    startDate: Date | null,
    endDate: Date | null
  ): boolean => {
    if (!startDate || !endDate) return true;
    const date = new Date(dateString);
    return date >= startDate && date <= endDate;
  };

  const fetchTransactions = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const userString = localStorage.getItem("user");
      if (!userString) throw new Error("User not found. Please log in.");

      const user: User = JSON.parse(userString);
      const accountId = user.accountId;
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Token not found. Please log in.");

      const response = await axios.get(
        `https://renteasebe.io.vn/api/Order/GetByAccountId?accountId=${accountId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.statusCode === 200) {
        setTransactions(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch transactions");
      }
    } catch (err: any) {
      setError(err.message || "Error loading transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    let matchesSearch = true;
    let matchesDateRange = true;

    if (searchText) {
      matchesSearch =
        transaction.orderCode.toLowerCase().includes(searchText.toLowerCase()) ||
        transaction.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
        Boolean(transaction.note?.toLowerCase().includes(searchText.toLowerCase()));
    }

    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0]?.toDate?.() || null;
      const endDate = dateRange[1]?.toDate?.() || null;
      matchesDateRange = isDateInRange(transaction.createdAt, startDate, endDate);
    }

    return matchesSearch && matchesDateRange;
  });

  const compareDates = (dateA: string, dateB: string): number =>
    new Date(dateA).getTime() - new Date(dateB).getTime();

  const columns: ColumnsType<TableTransaction> = [
    {
      title: "Order Code",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => formatDate(text),
      sorter: (a, b) => compareDates(a.createdAt, b.createdAt),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => formatCurrency(amount),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Status",
      dataIndex: "paymentStatusId",
      key: "paymentStatusId",
      render: (statusId: number) => getStatusTag(statusId),
      filters: [
        { text: "Pending", value: 1 },
        { text: "Paid", value: 2 },
        { text: "Processing", value: 3 },
        { text: "Cancelled", value: 4 },
      ],
      onFilter: (value, record) => record.paymentStatusId === Number(value),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (text: string | null) => text || "-",
    },
    {
      title: "Payment Date",
      dataIndex: "paidAt",
      key: "paidAt",
      render: (text: string | null) => formatDate(text),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Transaction History
          </h1>

          {/* Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
            <Space direction="vertical" className="w-full md:w-auto">
              <Input
                placeholder="Search by order code or note"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full md:w-64"
              />
            </Space>

            <Space direction="vertical">
              <RangePicker
                onChange={(dates) => setDateRange(dates as [any, any])}
                format="DD/MM/YYYY"
                className="w-full"
              />
            </Space>

            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchTransactions}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Refresh
            </Button>
          </div>


          {loading ? (
            <div className="text-center py-10">
              <Spin size="large" />
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={filteredTransactions.map((item) => ({
                  ...item,
                  key: item.orderId,
                }))}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} transactions`,
                }}
                rowClassName="hover:bg-gray-50"
                scroll={{ x: "max-content" }}
                bordered
              />

              {filteredTransactions.length === 0 && !loading && (
                <div className="text-center py-6">
                  <p className="text-gray-500">No transactions found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;