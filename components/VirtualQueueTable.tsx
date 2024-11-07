import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { icons } from "../constants";
import SearchInput from "./SearchInput";
import FilterModal from "./FilterModal";
import type { VirtualQueueItem, Filters } from "@/types/type";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { images } from "@/constants";

const windowWidth = Dimensions.get("window").width;

const VirtualQueueFlatList: React.FC = () => {
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

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

  const renderItem = ({
    item,
    index,
  }: {
    item: VirtualQueueItem;
    index: number;
  }) => (
    <View
      className={`bg-white rounded-lg p-3 mb-2 flex-row ${
        index === 0 ? "border-2 border-secondary-100" : ""
      }`}
    >
      <View className="w-1/5 justify-center">
        <Text className="text-lg font-bold text-primary">#{item.id}</Text>
        <Text className="text-xs text-gray-500">{item.time}</Text>
      </View>
      <View className="w-2/5 justify-center">
        <Text className="text-sm font-semibold">{item.owner}</Text>
        <Text className="text-xs text-gray-500">{item.plateNumber}</Text>
      </View>
      <View className="w-2/5 items-end justify-center">
        <Text className="text-sm">{item.date}</Text>
        {index === 0 && (
          <Text className="text-xs text-secondary-200 font-semibold">
            Currently Unloading
          </Text>
        )}
      </View>
    </View>
  );

  const ListHeaderComponent = () => (
    <>
      <View className="flex-row items-center mb-4">
        <View className="flex-1 mr-2">
          <SearchInput icon={icons.search} handlePress={() => {}} />
        </View>
        <TouchableOpacity
          onPress={handleOpenFilterModal}
          className="bg-white p-2 rounded"
        >
          <Image
            source={icons.filter}
            className="w-6 h-6"
            style={{ tintColor: "#59A60E" }}
          />
        </TouchableOpacity>
      </View>
    </>
  );

  const ListFooterComponent = () => (
    <View className="flex-row justify-between mt-4">
      <TouchableOpacity className="bg-white rounded-lg px-6 py-2">
        <Text className="text-primary font-medium">PREVIOUS</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-white rounded-lg px-6 py-2">
        <Text className="text-primary font-medium">NEXT</Text>
      </TouchableOpacity>
    </View>
  );

  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQueue();
  };

  const fetchQueue = async () => {
    if (!authState?.accessToken) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get("/queue", {
        headers: {
          Authorization: `Bearer ${authState.accessToken}`,
        },
      });
      console.log("QUEUE data: ", response.data.queue);
      setQueue(response.data.queue);
      setLoading(false);
      setRefreshing(false);
    } catch (err: any) {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [authState?.accessToken]);

  return (
    <SafeAreaView className="bg-primary flex-1 rounded-lg">
      <FlatList
        data={queue}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
        }
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
                <Text className="text-sm text-white my-5">No queue found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#59A60E" />
            )}
          </View>
        )}
      />

      <FilterModal
        visible={isFilterModalVisible}
        onClose={handleCloseFilterModal}
        onApplyFilters={handleApplyFilters}
      />
    </SafeAreaView>
  );
};

export default VirtualQueueFlatList;
