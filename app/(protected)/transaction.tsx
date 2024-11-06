import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { images } from "@/constants";
import { icons } from "@/constants";
import TransactionCard from "@/components/transactionCard";
import AddFab from "@/components/AddFab";
import AddTransactionModal from "@/components/AddTransactionModal";
import UpdateTransactionModal from "@/components/UpdateTransactionModal";
import SearchInput from "@/components/SearchInput";
import FilterModal from "@/components/FilterModal";
import type { Filters, Transaction } from "@/types/type";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

// const transactions = [
//   {
//     transaction_id: "1",
//     transaction_date_time: "2024-08-12 05:19:20",
//     buyer_name: "Hakim Saricala",
//     transaction_amount: "140000.00",
//     plate_number: "ABC123",
//     copra_weight: 8,
//     payment_method: "Bank",
//     status: "Paid",
//   },
//   {
//     transaction_id: "2",
//     transaction_date_time: "2024-08-12 05:19:20",
//     buyer_name: "King Baltazar",
//     transaction_amount: "24000.00",
//     plate_number: "JAB789",
//     copra_weight: 2,
//     payment_method: "Cash",
//     status: "Pending",
//   },
//   {
//     transaction_id: "3",
//     transaction_date_time: "2024-09-12 05:19:20",
//     buyer_name: "Lester David",
//     transaction_amount: "170000.00",
//     plate_number: "KYU119",
//     copra_weight: 10,
//     payment_method: "Cheque",
//     status: "Paid",
//   },
// ];

const transaction = () => {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchTransactions = async () => {
    if (!authState?.accessToken) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get("/transactions", {
        headers: {
          Authorization: `Bearer ${authState.accessToken}`,
        },
      });
      console.log("Transctions data: ", response.data.transactions);
      setTransactions(response.data.transactions);
      setLoading(false);
      setRefreshing(false);
    } catch (err: any) {
      setLoading(false);
      setRefreshing(false);
    }

    if (authState.data.role === "COPRA_BUYER") {
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [authState?.accessToken]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const handleFABPress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalVisible(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalVisible(false);
  };

  const handleApplyFilters = (filters: Filters) => {
    console.log("Filters applied:", filters);
    handleCloseFilterModal();
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleTransactionPress = (transaction: Transaction) => {
    if (isEditMode) {
      setSelectedTransaction(transaction);
      setIsUpdateModalVisible(true);
    }
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalVisible(false);
    setSelectedTransaction(null);
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    const updatedTransactions = transactions.map((t) =>
      t.transaction_id === updatedTransaction.transaction_id
        ? updatedTransaction
        : t
    );

    handleCloseUpdateModal();
    setIsEditMode(false);
  };

  return (
    <View className="flex-1 bg-off-100">
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            isEditMode={isEditMode}
            onPress={() => handleTransactionPress(item)}
          />
        )}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
        className="px-4 pb-24"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.empty}
                  className="w-40 h-40"
                  alt="No transaction found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No transaction found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#59A60E" />
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <View className="pt-4">
            <View className="flex flex-row items-center space-x-2 w-full">
              <View className="flex-1 flex-row items-center">
                <SearchInput icon={icons.search} handlePress={() => {}} />
              </View>
              <TouchableOpacity
                className="p-1.5 border border-primary bg-white rounded-md"
                onPress={handleOpenFilterModal}
              >
                <Image
                  source={icons.filter}
                  className="w-7 h-7"
                  style={{ tintColor: "#59A60E" }}
                />
              </TouchableOpacity>
            </View>
            <View className="flex flex-row items-start justify-between my-5">
              <Text className="flex-1 text-primary text-3xl font-pbold">
                Transaction
              </Text>
              <TouchableOpacity onPress={toggleEditMode}>
                <Text className="flex-2 text-lg font-pmedium text-primary">
                  {isEditMode ? "Done" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <AddFab onPress={handleFABPress} />
      <AddTransactionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
      />
      <UpdateTransactionModal
        visible={isUpdateModalVisible}
        onClose={handleCloseUpdateModal}
        onUpdate={handleUpdateTransaction}
        transaction={selectedTransaction}
      />
      <FilterModal
        visible={isFilterModalVisible}
        onClose={handleCloseFilterModal}
        onApplyFilters={handleApplyFilters}
      />
    </View>
  );
};

export default transaction;
