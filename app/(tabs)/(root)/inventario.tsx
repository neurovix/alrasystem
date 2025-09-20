import InventoryBox from "@/components/ui/InventoryBox";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from "expo-router";
import { useState } from "react";
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

export default function Inventario() {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'chart'
  
  const data = [
    { id: 1, name: "Plastico PVC", quantity: "124700", color: "#EF4444" },
    { id: 2, name: "Plastico PP", quantity: "15002457", color: "#3B82F6" },
    { id: 3, name: "Plastico PET", quantity: "12457500", color: "#10B981" },
    { id: 4, name: "Plastico HDPE", quantity: "15024570", color: "#F59E0B" },
    { id: 5, name: "Plastico Naylon", quantity: "1565400", color: "#8B5CF6" },
    { id: 6, name: "Plastico PPP", quantity: "150560", color: "#EC4899" },
    { id: 7, name: "Plastico Scrap", quantity: "1502450", color: "#6B7280" },
    { id: 8, name: "Plastico PBC", quantity: "150034", color: "#14B8A6" },
    { id: 9, name: "Plastico Polipropeno", quantity: "150340", color: "#F97316" },
    { id: 10, name: "Plastico HDPE Negro", quantity: "140900", color: "#1F2937" },
  ];

  // Preparar datos para la gráfica
  const maxQuantity = Math.max(...data.map(item => parseInt(item.quantity)));
  const chartData = data.map(item => ({
    ...item,
    quantityNum: parseInt(item.quantity),
    percentage: (parseInt(item.quantity) / maxQuantity) * 100
  })).sort((a, b) => b.quantityNum - a.quantityNum);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const BarChart = () => (
    <View className="bg-white p-4 mb-4">
      <Text className="font-ibm-condensed-bold text-xl text-gray-800 mb-4">
        Distribución de Materiales (kg)
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row items-end h-80 px-2" style={{ width: Math.max(width - 40, data.length * 60) }}>
          {chartData.map((item, index) => (
            <View key={item.id} className="items-center mx-1" style={{ width: 50 }}>
              {/* Valor en la parte superior */}
              <Text className="text-xs font-medium text-gray-600 mb-2 transform -rotate-45 w-16 text-center">
                {formatNumber(item.quantityNum)}
              </Text>
              
              {/* Barra */}
              <View
                className="w-8 rounded-t-md relative"
                style={{
                  height: Math.max((item.percentage / 100) * 200, 20),
                  backgroundColor: item.color
                }}
              >
                {/* Efecto de brillo */}
                <View 
                  className="absolute top-0 left-0 w-2 rounded-tl-md opacity-30"
                  style={{ 
                    height: '100%',
                    backgroundColor: 'white'
                  }}
                />
              </View>
              
              {/* Etiqueta del material */}
              <Text 
                className="text-xs font-medium text-gray-700 mt-2 text-center"
                style={{ 
                  transform: [{ rotate: '-45deg' }],
                  width: 60,
                  height: 40
                }}
                numberOfLines={2}
              >
                {item.name.replace('Plastico ', '')}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Leyenda */}
      <View className="mt-6 pt-4 border-t border-gray-200">
        <Text className="font-ibm-condensed-bold text-lg text-gray-700 mb-3">
          Top 3 Materiales
        </Text>
        {chartData.slice(0, 3).map((item, index) => (
          <View key={item.id} className="flex-row items-center mb-2">
            <View 
              className="w-4 h-4 rounded mr-3"
              style={{ backgroundColor: item.color }}
            />
            <Text className="flex-1 font-medium text-gray-700">
              {item.name}
            </Text>
            <Text className="font-ibm-condensed-bold text-gray-900">
              {parseInt(item.quantity).toLocaleString()} kg
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const StatsCards = () => {
    const totalInventory = data.reduce((sum, item) => sum + parseInt(item.quantity), 0);
    const avgInventory = totalInventory / data.length;
    const topMaterial = chartData[0];

    return (
      <View className="flex-row mb-4">
        <View className="bg-blue-500 rounded-xl p-4 flex-1 mr-2">
          <Text className="text-white font-ibm-condensed-bold text-lg">
            Total
          </Text>
          <Text className="text-white text-2xl font-bold">
            {formatNumber(totalInventory)}
          </Text>
          <Text className="text-blue-100 text-sm">
            kg en inventario
          </Text>
        </View>
        
        <View className="bg-green-500 rounded-xl p-4 flex-1 ml-2">
          <Text className="text-white font-ibm-condensed-bold text-lg">
            Mayor Stock
          </Text>
          <Text className="text-white text-lg font-bold" numberOfLines={1}>
            {topMaterial.name.replace('Plastico ', '')}
          </Text>
          <Text className="text-green-100 text-sm">
            {formatNumber(topMaterial.quantityNum)} kg
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-5">
        <Text className="text-3xl text-white font-ibm-condensed-bold">
          Inventario
        </Text>
        <View className="flex-row bg-white/20 rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`px-3 py-2 rounded-md ${viewMode === 'list' ? 'bg-white' : ''}`}
          >
            <MaterialIcons 
              name="list" 
              size={20} 
              color={viewMode === 'list' ? '#059669' : 'white'} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('chart')}
            className={`px-3 py-2 rounded-md ml-1 ${viewMode === 'chart' ? 'bg-white' : ''}`}
          >
            <MaterialIcons 
              name="bar-chart" 
              size={20} 
              color={viewMode === 'chart' ? '#059669' : 'white'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="bg-gray-50 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'chart' ? (
          <>
            <StatsCards />
            <BarChart />
          </>
        ) : (
          data.map((item) => (
            <InventoryBox 
              key={item.id}
              id={item.id} 
              name={item.name} 
              quantity={item.quantity} 
            />
          ))
        )}
        
        {/* Botón flotante */}
        <View className="w-full flex items-end mt-3">
          <TouchableOpacity 
            onPress={() => router.navigate("/screens/inventario/newInventario")} 
            className="bg-green-600 px-8 py-7 rounded-full shadow-lg"
            activeOpacity={0.8}
          >
            <FontAwesome6 name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}