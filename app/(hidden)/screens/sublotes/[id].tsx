import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SubloteInformation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sublote, setSublote] = useState<any>(null);
  const [procesos, setProcesos] = useState<any[]>([]);
  const [fotos, setFotos] = useState<any[]>([]);
  const [material, setMaterial] = useState<string>("");
  const [cliente, setCliente] = useState<string>("");
  const [nombreLote, setNombreLote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [pesoFinal, setPesoFinal] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const idNum = parseInt(id || "0");

        if (isNaN(idNum)) {
          Alert.alert("Error", "Favor de intentar mas tarde");
          return;
        }

        const { data: subloteData, error: subloteError } = await supabase
          .from("sublotes")
          .select("*, lote: id_lote (*, material: id_material (nombre_material), cliente: id_cliente (nombre_cliente))")
          .eq("id_sublote", idNum)
          .single();

        if (subloteError) {
          Alert.alert("Error", "No se pudieron obtener los sublotes");
          return;
        }

        if (subloteData) {
          setSublote(subloteData);
          setMaterial(subloteData.lote?.material?.nombre_material || "Desconocido");
          setCliente(subloteData.lote?.cliente?.nombre_cliente || "Desconocido");
          setNombreLote(subloteData.lote?.nombre_lote || "Desconocido");
        }

        const { data: procData, error: procError } = await supabase
          .from("procesos")
          .select("*, cliente: id_cliente (nombre_cliente)")
          .eq("id_sublote", idNum)
          .order("fecha_proceso", { ascending: true });

        if (procError) {
          Alert.alert("Error", "No se pudieron obtener los procesos del sublote");
          return;
        }

        setProcesos(procData || []);

        if (procData && procData.length > 0) {
          const lastProceso = procData[procData.length - 1];
          setPesoFinal(lastProceso.peso_salida_kg);
        }

        const { data: fotosData, error: fotosError } = await supabase
          .from("fotos")
          .select("*")
          .eq("id_sublote", idNum);

        if (fotosError) {
          Alert.alert("Error", "No se pudieron obtener las fotos del sublote");
          return;
        }

        setFotos(fotosData || []);
      } catch (error) {
        Alert.alert("Error", "Favor de intentar mas tarde");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatNumber = (num: number) =>
    num?.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || "0.00";

  const stepTitles: { [key: string]: string } = {
    Recibido: "Recibo de Material",
    Molienda: "Molienda",
    Peletizado: "Peletizado",
    Retorno: "Retorno a Planta",
    Venta: "Venta",
  };

  const getStepData = (proceso: any, cliente: string) => {
    const procCliente = proceso.cliente?.nombre_cliente || cliente;
    switch (proceso.tipo_proceso) {
      case "Recibido":
        return [
          { label: "Fecha de Recibido", value: formatDate(proceso.fecha_proceso) },
          { label: "Cliente", value: procCliente },
        ];
      case "Molienda":
        return [
          { label: "Peso de Salida", value: `${formatNumber(proceso.peso_salida_kg)} kg` },
          { label: "Merma", value: `${formatNumber(proceso.merma_kg)} kg` },
          { label: "Fecha de Molienda", value: formatDate(proceso.fecha_proceso) },
        ];
      case "Peletizado":
        return [
          { label: "Peso de Salida", value: `${formatNumber(proceso.peso_salida_kg)} kg` },
          { label: "Merma", value: `${formatNumber(proceso.merma_kg)} kg` },
          { label: "Fecha de Proceso", value: formatDate(proceso.fecha_proceso) },
        ];
      case "Retorno":
      case "Venta":
        return [
          { label: "Peso Final", value: `${formatNumber(proceso.peso_salida_kg)} kg` },
          { label: "Fecha", value: formatDate(proceso.fecha_proceso) },
          { label: "Cliente", value: procCliente },
        ];
      default:
        return [];
    }
  };

  const ProcessStep = ({ title, data, images }: any) => (
    <View className="bg-white rounded-2xl p-5 mb-5 shadow-lg border border-green-100">
      <View className="flex-row items-center mb-4">
        <View className="w-3 h-8 bg-green-500 rounded-full mr-4" />
        <Text className="font-ibm-condensed-bold text-xl text-gray-800">
          {title}
        </Text>
      </View>

      <View className="space-y-3">
        {data.map((item: any, index: number) => (
          <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <Text className="text-gray-600 font-ibm-devanagari-bold text-base">
              {item.label}
            </Text>
            <Text className="text-gray-900 font-semibold text-base">{item.value}</Text>
          </View>
        ))}
      </View>

      {images?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          <View className="flex-row">
            {images.map((img: any) => (
              <Image
                key={img.id}
                source={{ uri: img.src }}
                className="w-28 h-24 rounded-xl mr-4 border border-gray-200 shadow-sm"
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );

  const ActionButton = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-green-600 rounded-2xl py-4 mb-3 shadow-lg"
    >
      <Text className="text-white font-ibm-condensed-bold text-lg text-center">
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <SafeAreaView className="flex-1 bg-green-600 justify-center items-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-3 text-lg font-medium">Cargando información del sublote...</Text>
      </SafeAreaView>
    );

  if (!sublote)
    return (
      <SafeAreaView className="flex-1 bg-green-600 justify-center items-center">
        <Ionicons name="document-outline" size={64} color="white" />
        <Text className="text-white text-xl font-ibm-condensed-bold mt-4">Sublote no encontrado</Text>
      </SafeAreaView>
    );

  const eficiencia =
    pesoFinal && sublote.peso_sublote_kg
      ? ((pesoFinal / sublote.peso_sublote_kg) * 100).toFixed(1) + "%"
      : "N/A";

  const showButtons = sublote.estado_actual !== "Finalizado";

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex-row items-center px-5 pb-3 bg-green-600">
        <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full bg-green-500/20">
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl text-white font-ibm-condensed-bold ml-3 flex-1">
          {sublote.nombre_sublote}
        </Text>
      </View>

      <ScrollView
        className="bg-gray-50 flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-green-100">
          <View className="flex-row items-center mb-4">
            <Ionicons name="information-circle-outline" size={24} color="#22c55e" />
            <Text className="font-ibm-condensed-bold text-2xl text-gray-800 ml-2">
              Detalles Generales
            </Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-ibm-devanagari-bold w-32">Lote Padre:</Text>
              <Text className="text-gray-900 font-semibold flex-1">{nombreLote}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-ibm-devanagari-bold w-32">Cliente:</Text>
              <Text className="text-gray-900 font-semibold flex-1">{cliente}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-ibm-devanagari-bold w-32">Material:</Text>
              <Text className="text-gray-900 font-semibold flex-1">{material}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-ibm-devanagari-bold w-32">Peso Sublote:</Text>
              <Text className="text-gray-900 font-semibold flex-1">{formatNumber(sublote.peso_sublote_kg)} kg</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-ibm-devanagari-bold w-32">Fecha Creado:</Text>
              <Text className="text-gray-900 font-semibold flex-1">{formatDate(sublote.fecha_creado)}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-ibm-devanagari-bold w-32">Estado Actual:</Text>
              <View className="flex-row items-center bg-green-50 px-3 py-1 rounded-full ml-auto">
                <Ionicons name="ellipse" size={12} color="#22c55e" />
                <Text className="text-green-600 font-medium text-sm ml-1">{sublote.estado_actual}</Text>
              </View>
            </View>
          </View>
        </View>

        {procesos.length > 0 && (
          <>
            <Text className="font-ibm-condensed-bold text-2xl text-gray-700 mb-4 flex-row items-center">
              <Ionicons name="cog-outline" size={24} color="#22c55e" className="mr-2" />
              Proceso de Transformación
            </Text>

            {procesos.map((proceso) => {
              const title = stepTitles[proceso.tipo_proceso] || proceso.tipo_proceso;
              const data = getStepData(proceso, cliente);
              const stepImages = fotos
                .filter((f: any) => f.id_proceso === proceso.id_proceso)
                .map((f: any) => ({ id: f.id_foto, src: f.url_foto }));

              return (
                <ProcessStep
                  key={proceso.id_proceso}
                  title={title}
                  data={data}
                  images={stepImages}
                />
              );
            })}
          </>
        )}

        {showButtons && (
          <View className="mb-6 space-y-3">
            {sublote.estado_actual === "Recibido" && (
              <ActionButton
                title="Molienda"
                onPress={() => router.push(`/screens/molienda?id_lote=${sublote.id_lote}&id_sublote=${id}`)}
              />
            )}
            {sublote.estado_actual === "Molienda" && (
              <>
                <ActionButton
                  title="Peletizar"
                  onPress={() => router.push(`/screens/peletizado?id_lote=${sublote.id_lote}&id_sublote=${id}`)}
                />
                <ActionButton
                  title={sublote.lote?.tipo_proceso === "Maquila" ? "Maquila" : "Venta"}
                  onPress={() =>
                    router.push(
                      sublote.lote?.tipo_proceso === "Maquila"
                        ? `/screens/retorno?id_lote=${sublote.id_lote}&id_sublote=${id}`
                        : `/screens/venta?id_lote=${sublote.id_lote}&id_sublote=${id}`
                    )
                  }
                />
              </>
            )}
          </View>
        )}

        <View className="bg-green-600 rounded-2xl p-6 mt-6 shadow-lg">
          <View className="flex-row items-center mb-4">
            <Ionicons name="bar-chart-outline" size={24} color="white" />
            <Text className="font-ibm-condensed-bold text-xl text-white ml-2">
              Resumen del Proceso
            </Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-green-100 font-semibold">Peso Inicial</Text>
              <Text className="text-white font-bold text-lg">{formatNumber(sublote.peso_sublote_kg)} kg</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-t border-green-500/30">
              <Text className="text-green-100 font-semibold">Peso Final</Text>
              <Text className="text-white font-bold text-lg">{formatNumber(pesoFinal || 0)} kg</Text>
            </View>
            <View className="flex-row justify-between items-center pt-2">
              <Text className="text-green-100 font-semibold">Eficiencia</Text>
              <View className={`flex-row items-center ${eficiencia !== "N/A" ? "bg-white/20 px-3 py-1 rounded-full" : ""}`}>
                <Text className="text-white font-bold text-lg">{eficiencia}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
