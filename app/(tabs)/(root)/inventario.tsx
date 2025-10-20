import InventoryBox from "@/components/ui/InventoryBox";
import { supabase } from "@/lib/supabase";
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Dimensions, Modal, Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

export default function Inventario() {
  const [viewMode, setViewMode] = useState('list');
  const [materials, setMaterials] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showInicio, setShowInicio] = useState(false);
  const [showFin, setShowFin] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [isAdmin, setIsAdmin] = useState(false); // 👈 Aquí guardamos si es administrador

  // 🔹 Obtener usuario loggeado y determinar si es administrador
  useFocusEffect(
    useCallback(() => {
      const fetchUserAndMaterials = async () => {
        try {
          // Obtener usuario loggeado
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;

          const user = userData?.user;
          if (user) {
            // Consultar su rol en la tabla usuarios
            const { data: perfil, error: perfilError } = await supabase
              .from("usuarios")
              .select("rol")
              .eq("id_usuario", user.id)
              .single();

            if (perfilError) {
              console.log("Error al obtener rol del usuario:", perfilError);
            } else {
              setIsAdmin(perfil?.rol === "Administrador"); // 👈 Solo si el rol es Administrador
            }
          }

          // Cargar materiales
          const { data: materialData, error: materialError } = await supabase
            .from("materiales")
            .select("id_material, nombre_material, cantidad_disponible_kg");

          if (materialError) {
            Alert.alert("Error al cargar los materiales");
            return;
          }

          if (materialData) {
            const colors = [
              "#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6",
              "#EC4899", "#6B7280", "#14B8A6", "#F97316", "#1F2937"
            ];

            const dataWithColors = materialData.map((item, index) => ({
              id: item.id_material,
              name: item.nombre_material,
              quantity: item.cantidad_disponible_kg,
              color: colors[index % colors.length],
            }));

            setMaterials(dataWithColors);
          }
        } catch (error) {
          console.error("Error general:", error);
        }
      };

      fetchUserAndMaterials();
    }, [])
  );

  const maxQuantity =
    materials.length > 0
      ? Math.max(...materials.map((item) => parseInt(item.quantity || 0)))
      : 0;

  const chartData = materials
    .map((item) => ({
      ...item,
      quantityNum: parseInt(item.quantity || 0),
      percentage: maxQuantity > 0
        ? (parseInt(item.quantity || 0) / maxQuantity) * 100
        : 0,
    }))
    .sort((a, b) => b.quantityNum - a.quantityNum);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const handlePDF = async () => {
    setModalVisible(false);

    const _ = await fetch(`https://n8n.srv1034345.hstgr.cloud/webhook/d5efff09-b123-4d05-bece-31e6bee4050f?fecha_inicio=${formatDate(fechaInicio)}&fecha_fin=${formatDate(fechaFin)}`, {
      method: "POST",
    })

    Alert.alert("Notificacion", "El reporte deberia estar en tu correo en pocos segundos")
  };

  const BarChart = () => (
    <View className="bg-white p-4 mb-4">
      <Text className="font-ibm-condensed-bold text-xl text-gray-800 mb-4">
        Distribución de Materiales (kg)
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View
          className="flex-row items-end h-80 px-2"
          style={{ width: Math.max(width - 40, chartData.length * 60) }}
        >
          {chartData.map((item) => (
            <View key={item.id} className="items-center mx-1" style={{ width: 50 }}>
              <Text className="text-xs font-medium text-gray-600 mb-2 transform -rotate-45 w-16 text-center">
                {formatNumber(item.quantityNum)}
              </Text>
              <View
                className="w-8 rounded-t-md relative"
                style={{
                  height: Math.max((item.percentage / 100) * 200, 20),
                  backgroundColor: item.color,
                }}
              >
                <View
                  className="absolute top-0 left-0 w-2 rounded-tl-md opacity-30"
                  style={{ height: "100%", backgroundColor: "white" }}
                />
              </View>
              <Text
                className="text-xs font-medium text-gray-700 mt-2 text-center"
                style={{ transform: [{ rotate: "-45deg" }], width: 60, height: 40 }}
                numberOfLines={2}
              >
                {item.name.replace("Plastico ", "")}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const StatsCards = () => {
    if (!materials || materials.length === 0) return null;

    const totalInventory = materials.reduce(
      (sum, item) => sum + parseInt(item.quantity || 0),
      0
    );
    const topMaterial = chartData[0];

    return (
      <View className="flex-row mb-4">
        <View className="bg-blue-500 rounded-xl p-4 flex-1 mr-2">
          <Text className="text-white font-ibm-condensed-bold text-lg">Total</Text>
          <Text className="text-white text-2xl font-bold">{formatNumber(totalInventory)}</Text>
          <Text className="text-blue-100 text-sm">kg en inventario</Text>
        </View>

        <View className="bg-green-500 rounded-xl p-4 flex-1 ml-2">
          <Text className="text-white font-ibm-condensed-bold text-lg">Mayor Stock</Text>
          <Text className="text-white text-lg font-bold" numberOfLines={1}>
            {topMaterial.name.replace("Plastico ", "")}
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
      <View className="flex-row items-center justify-between px-5 py-5">
        <Text className="text-3xl text-white font-ibm-condensed-bold">Inventario</Text>
        <View className="flex-row bg-white/20 rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setViewMode("list")}
            className={`px-3 py-2 rounded-md ${viewMode === "list" ? "bg-white" : ""}`}
          >
            <MaterialIcons
              name="list"
              size={20}
              color={viewMode === "list" ? "#059669" : "white"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode("chart")}
            className={`px-3 py-2 rounded-md ml-1 ${viewMode === "chart" ? "bg-white" : ""}`}
          >
            <MaterialIcons
              name="bar-chart"
              size={20}
              color={viewMode === "chart" ? "#059669" : "white"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="bg-gray-50 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === "list" ? (
          materials.map((item) => (
            <InventoryBox
              key={item.id}
              id={item.id}
              name={item.name}
              quantity={item.quantity}
              color={item.color}
              isAdmin={isAdmin} // 👈 Solo los admins pueden editar
            />
          ))
        ) : (
          <>
            <StatsCards />
            <BarChart />
          </>
        )}

        <View className="w-full flex flex-row items-center justify-between mt-4">
          <TouchableOpacity
            className="flex-1 bg-green-600 py-5 flex flex-row items-center justify-center rounded-3xl mr-3 shadow-md active:opacity-80"
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
          >
            <AntDesign name="file-pdf" size={26} color="white" />
            <Text className="text-white font-ibm-condensed-bold ml-2 text-xl">
              Exportar PDF
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.navigate("/screens/inventario/newInventario")}
            className="bg-green-600 p-5 rounded-full shadow-md items-center justify-center active:opacity-80"
            activeOpacity={0.8}
          >
            <FontAwesome6 name="add" size={26} color="white" />
          </TouchableOpacity>
        </View>

        {/* Modal para exportar PDF */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white w-11/12 rounded-2xl p-5 shadow-lg">
              <Text className="text-2xl font-ibm-condensed-bold text-center mb-4">
                Selecciona el rango de fechas
              </Text>

              <Pressable
                onPress={() => setShowInicio(true)}
                className="border border-gray-300 rounded-xl p-3 mb-3"
              >
                <Text className="text-lg">📅 Inicio: {formatDate(fechaInicio)}</Text>
              </Pressable>

              <Pressable
                onPress={() => setShowFin(true)}
                className="border border-gray-300 rounded-xl p-3 mb-5"
              >
                <Text className="text-lg">📅 Fin: {formatDate(fechaFin)}</Text>
              </Pressable>

              {showInicio && (
                <DateTimePicker
                  value={fechaInicio}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowInicio(false);
                    if (selectedDate) setFechaInicio(selectedDate);
                  }}
                />
              )}

              {showFin && (
                <DateTimePicker
                  value={fechaFin}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowFin(false);
                    if (selectedDate) setFechaFin(selectedDate);
                  }}
                />
              )}

              <View className="flex flex-row justify-around">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-gray-400 px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-bold text-lg">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handlePDF}
                  className="bg-green-600 px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-bold text-lg">Generar PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
