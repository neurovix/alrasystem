import icons from "@/constants/icons";
import { supabase } from "@/lib/supabase";
import AntDesign from '@expo/vector-icons/AntDesign';
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G, Path } from "react-native-svg";

function createPieSlice(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  color: string
) {
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  return (
    <Path
      d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArcFlag},1 ${x2},${y2} Z`}
      fill={color}
    />
  );
}

export default function Home() {
  const [dataLotes, setDataLotes] = useState<Array<{ label: string; value: number; color: string }>>([]);
  const [totalLotes, setTotalLotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{ estatus: boolean; rol: string }>({
    estatus: false,
    rol: "Operador",
  });
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const handleBarcodeScanned = ({ data }: any) => {
    if (scanned) return;
    setScanned(true);
    if (data && data.startsWith("/")) {
      router.push(data);
      setShowScanner(false);
      setScanned(false);
      return;
    }
    Alert.alert("QR Escaneado", data, [
      {
        text: "OK",
        onPress: () => {
          setScanned(false);
          setShowScanner(false);
        },
      },
    ]);
  };

  if (showScanner) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowScanner(false)}
        >
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function fetchData() {
    try {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData?.user;

      if (!user) {
        Alert.alert("Error", "⚠️ No hay sesión activa, redirigiendo...");
        router.replace("/(tabs)/(auth)/login");
        return;
      }

      const { data: perfil, error: perfilError } = await supabase
        .from("usuarios")
        .select("estatus, rol")
        .eq("id_usuario", user.id)
        .single();

      if (perfilError) {
        Alert.alert("Error", "❌ Error al obtener perfil");
        return;
      }

      setUserData({
        estatus: perfil.estatus,
        rol: perfil.rol,
      });

      if (!perfil.estatus) {
        Alert.alert("Acceso denegado", "Tu cuenta está inactiva o sin permisos.");
        await supabase.auth.signOut();
        router.replace("/(tabs)/(auth)/login");
        return;
      }

      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const firstDayISO = firstDay.toISOString();
      const lastDayISO = lastDay.toISOString();

      const { count: enProcesoCount, error: error1 } = await supabase
        .from("lotes")
        .select("*", { count: "exact", head: true })
        .not("estado_actual", "eq", "Finalizado")
        .gte("fecha_recibido", firstDayISO)
        .lte("fecha_recibido", lastDayISO);

      if (error1) {
        Alert.alert("Error", "No se pudieron obtener los procesos");
        return;
      }

      const { count: finalizadosCount, error: error2 } = await supabase
        .from("lotes")
        .select("*", { count: "exact", head: true })
        .eq("estado_actual", "Finalizado")
        .gte("fecha_recibido", firstDayISO)
        .lte("fecha_recibido", lastDayISO);

      if (error2) {
        Alert.alert("Error", "Error al obtener los lotes");
        return;
      }

      const total = (enProcesoCount || 0) + (finalizadosCount || 0);

      setTotalLotes(total);

      setDataLotes([
        { label: "En proceso", value: enProcesoCount || 0, color: "#eab308" },
        { label: "Finalizados", value: finalizadosCount || 0, color: "#059669" },
      ]);
    } catch (error) {
      Alert.alert("Error", "Ocurrió un problema al cargar la información.");
    } finally {
      setLoading(false);
    }
  }


  let startAngleLote = 0;
  const validData = dataLotes.filter((item) => item.value > 0);

  let slicesLote: any[] = [];
  if (totalLotes > 0) {
    if (validData.length === 1) {
      slicesLote = [
        <Circle key="full" cx="75" cy="75" r="70" fill={validData[0].color} />,
      ];
    } else {
      slicesLote = validData.map((item, index) => {
        const angle = (item.value / totalLotes) * 2 * Math.PI;
        const slice = createPieSlice(75, 75, 70, startAngleLote, startAngleLote + angle, item.color);
        startAngleLote += angle;
        return <G key={index}>{slice}</G>;
      });
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="bg-green-600 flex-1 justify-center items-center">
        <Text className="text-white text-xl">Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex flex-row items-center w-full">
        <Text className="text-3xl w-5/6 p-5 text-white font-ibm-condensed-bold">
          Información general
        </Text>
        <TouchableOpacity className="w-1/6 text-center" onPress={() => setShowScanner(true)}>
          <AntDesign name="scan" size={30} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView className="bg-white px-5 pt-2" contentContainerStyle={{ paddingBottom: 170 }}>
        <View className="w-full flex flex-row pt-3">
          <View className="w-5/12 items-center justify-center">
            <Svg height="150" width="150">
              <Circle cx="75" cy="75" r="65" fill="none" stroke="#f0fdf4" strokeWidth="2" />
              {slicesLote}
              <Circle cx="75" cy="75" r="35" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            </Svg>
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-2xl font-ibm-devanagari-bold text-green-700">{totalLotes}</Text>
              <Text className="text-xs text-green-500 font-ibm-condensed-bold">TOTAL</Text>
            </View>
          </View>

          <View className="w-7/12 flex flex-col items-center px-5">
            <View className="bg-yellow-50 rounded-xl px-4 py-1 w-full mb-3 border-l-4 border-yellow-500">
              <View className="flex flex-row items-center mb-2">
                <View className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></View>
                <Text className="font-ibm-condensed-bold text-green-700 text-lg">En proceso</Text>
              </View>
              <Text className="text-3xl font-ibm-devanagari-bold text-green-800">
                {dataLotes.find((d) => d.label === "En proceso")?.value || 0}
              </Text>
              <Text className="text-green-600 text-xs">lotes activos</Text>
            </View>

            <View className="bg-emerald-50 rounded-xl px-4 py-1 border-l-4 w-full border-emerald-500">
              <View className="flex flex-row items-center mb-2">
                <View className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></View>
                <Text className="font-ibm-condensed-bold text-emerald-700 text-lg">Finalizados</Text>
              </View>
              <Text className="text-3xl font-ibm-devanagari-bold text-emerald-800">
                {dataLotes.find((d) => d.label === "Finalizados")?.value || 0}
              </Text>
              <Text className="text-emerald-600 text-xs">lotes completados</Text>
            </View>
          </View>
        </View>

        <View className="w-full h-1 bg-gray-400 my-5"></View>

        <View>
          <Text className="text-2xl font-ibm-condensed-bold pt-3">Administración</Text>

          <View className="flex flex-row w-full mt-3 justify-between">
            <TouchableOpacity
              onPress={() => router.push("/screens/molienda")}
              className="w-[48%] flex items-center border-b-4 border-green-500 bg-emerald-50 rounded-xl py-4"
            >
              <Image tintColor="#059669" source={icons.molienda} />
              <Text className="font-ibm-condensed-bold pt-2 text-lg">Molienda</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/screens/peletizado")}
              className="w-[48%] flex items-center border-b-4 border-green-500 bg-emerald-50 rounded-xl py-4"
            >
              <Image tintColor="#059669" source={icons.peletizado} />
              <Text className="font-ibm-condensed-bold pt-2 text-lg">Peletizado</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row w-full mt-3 justify-between">
            <TouchableOpacity
              onPress={() => router.push("/screens/retorno")}
              className="w-[48%] flex items-center border-b-4 border-green-500 bg-emerald-50 rounded-xl py-4"
            >
              <Image tintColor="#059669" source={icons.retorno} />
              <Text className="font-ibm-condensed-bold pt-2 text-lg">Maquila</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/screens/venta")}
              className="w-[48%] flex items-center border-b-4 border-green-500 bg-emerald-50 rounded-xl py-4"
            >
              <Image tintColor="#059669" source={icons.maquila} />
              <Text className="font-ibm-condensed-bold pt-2 text-lg">Venta</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row w-full mt-3 justify-between">
            <TouchableOpacity
              onPress={() => router.push("/screens/clients/listClient")}
              className="w-[48%] flex items-center border-b-4 border-green-500 bg-emerald-50 rounded-xl py-4"
            >
              <Image tintColor="#059669" source={icons.registerUser} />
              <Text className="font-ibm-condensed-bold pt-2 text-lg">Clientes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/screens/material/listMaterial")}
              className="w-[48%] flex items-center border-b-4 border-green-500 bg-emerald-50 rounded-xl py-4"
            >
              <Image tintColor="#059669" source={icons.material} />
              <Text className="font-ibm-condensed-bold pt-2 text-lg">Materiales</Text>
            </TouchableOpacity>
          </View>

          {userData?.rol === "Administrador" && (
            <View className="mt-3">
              <TouchableOpacity
                onPress={() => router.push("/screens/users")}
                className="w-full flex items-center border-b-4 border-green-500 bg-emerald-50 rounded-xl py-4"
              >
                <Image tintColor="#059669" source={icons.usuarios} />
                <Text className="font-ibm-condensed-bold pt-2 text-lg">Usuarios</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 10,
  },
  closeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
