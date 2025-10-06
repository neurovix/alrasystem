import { supabase } from "@/lib/supabase"; // Adjust import path to your Supabase client setup
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoteInformation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lote, setLote] = useState<any>(null);
  const [procesos, setProcesos] = useState<any[]>([]);
  const [fotos, setFotos] = useState<any[]>([]);
  const [material, setMaterial] = useState<string>("");
  const [cliente, setCliente] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch lote with joined material and cliente
        const { data: loteData, error: loteError } = await supabase
          .from("lotes")
          .select("*, material: id_material (nombre_material), cliente: id_cliente (nombre_cliente)")
          .eq("id_lote", id)
          .single();

        if (loteError) throw loteError;
        if (loteData) {
          setLote(loteData);
          setMaterial(loteData.material?.nombre_material || "Desconocido");
          setCliente(loteData.cliente?.nombre_cliente || "Desconocido");
        }

        // Fetch procesos with joined cliente (if applicable)
        const { data: procData, error: procError } = await supabase
          .from("procesos")
          .select("*, cliente: id_cliente (nombre_cliente)")
          .eq("id_lote", id)
          .order("fecha_proceso", { ascending: true });

        if (procError) throw procError;
        setProcesos(procData || []);

        // Fetch fotos
        const { data: fotosData, error: fotosError } = await supabase
          .from("fotos")
          .select("*")
          .eq("id_lote", id);

        if (fotosError) throw fotosError;
        setFotos(fotosData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const formatNumber = (num: number) => {
    return num?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00";
  };

  const stepTitles: { [key: string]: string } = {
    Recibido: "Recibo de Material",
    Molienda: "Molienda",
    Peletizado: "Peletizado",
    Retorno: "Retorno a Planta",
    Venta: "Venta",
  };

  const handleN8N = async () => {
    await fetch(`https://n8n.srv1034345.hstgr.cloud/webhook/49909213-02c1-4faa-81ef-6d162d22ea15?id_lote=${id}`, {
      method: "POST",
    })

    Alert.alert("Exito", "Reporte enviado a su correo");

    router.back();
  }

  const getStepData = (proceso: any, lote: any, cliente: string) => {
    const procCliente = proceso.cliente?.nombre_cliente || cliente;
    switch (proceso.tipo_proceso) {
      case "Recibido":
        return [
          { label: "Fecha de Recibido", value: formatDate(proceso.fecha_proceso) },
          { label: "Cliente", value: procCliente },
          { label: "Proceso", value: lote.tipo_proceso },
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
        return [
          { label: "Peso Final", value: `${formatNumber(proceso.peso_salida_kg)} kg` },
          { label: "Fecha de Retorno", value: formatDate(proceso.fecha_proceso) },
          { label: "Cliente", value: procCliente },
        ];
      case "Venta":
        return [
          { label: "Peso Final", value: `${formatNumber(proceso.peso_salida_kg)} kg` },
          { label: "Fecha de Venta", value: formatDate(proceso.fecha_proceso) },
          { label: "Cliente", value: procCliente },
        ];
      default:
        return [];
    }
  };

  const ProcessStep = ({ title, data, images: stepImages }: any) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-3">
        <View className="w-2 h-6 bg-green-500 rounded-full mr-3" />
        <Text className="font-ibm-devanagari-bold text-xl text-gray-800">{title}</Text>
      </View>

      {data.map((item: any, index: any) => (
        <View key={index} className="flex-row justify-between items-center py-2">
          <Text className="font-ibm-devanagari-bold text-base text-gray-600 flex-1">
            {item.label}
          </Text>
          <Text className="text-base text-gray-900 font-medium">
            {item.value}
          </Text>
        </View>
      ))}

      {stepImages && stepImages.length > 0 && (
        <View className="mt-4">
          <Text className="font-ibm-devanagari-bold text-sm text-gray-500 mb-3">
            Imágenes del proceso
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {stepImages.map((image: any, index: any) => (
              <TouchableOpacity
                key={image.id}
                className="mr-3"
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: image.src }}
                  className="w-24 h-20 rounded-lg bg-gray-200 border border-gray-200"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="bg-green-600 flex-1 justify-center items-center">
        <Text className="text-white text-xl">Cargando...</Text>
      </SafeAreaView>
    );
  }

  if (!lote) {
    return (
      <SafeAreaView className="bg-green-600 flex-1 justify-center items-center">
        <Text className="text-white text-xl">Lote no encontrado</Text>
      </SafeAreaView>
    );
  }

  const eficiencia = lote.peso_final_kg && lote.peso_entrada_kg
    ? ((lote.peso_final_kg / lote.peso_entrada_kg) * 100).toFixed(1) + "%"
    : "N/A";

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      {/* Header */}
      <View className="flex flex-row items-center px-4 pb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={32} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl text-white font-ibm-condensed-bold flex-1 ml-2">
          Información del Lote
        </Text>
      </View>

      <ScrollView
        className="bg-gray-50 flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Detalles Generales */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          <Text className="font-ibm-condensed-bold text-2xl text-gray-800 mb-4">
            Detalles Generales
          </Text>

          <View className="flex flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="font-ibm-devanagari-bold text-sm text-gray-500 mb-1">
                ID LOTE
              </Text>
              <View className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <Text className="font-ibm-devanagari-bold text-lg text-green-700">
                  LT-{id}
                </Text>
              </View>
            </View>

            <View className="flex-1 ml-2">
              <Text className="font-ibm-devanagari-bold text-sm text-gray-500 mb-1">
                TIPO DE MATERIAL
              </Text>
              <View className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <Text className="font-ibm-devanagari-bold text-lg text-blue-700">
                  {material}
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="font-ibm-devanagari-bold text-base text-gray-600">
                Peso de Entrada
              </Text>
              <Text className="font-ibm-condensed-bold text-xl text-gray-900">
                {formatNumber(lote.peso_entrada_kg)} kg
              </Text>
            </View>
          </View>
        </View>

        {/* Título de Proceso */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="font-ibm-condensed-bold text-2xl text-gray-700 px-4">
            Proceso de Transformación
          </Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Dynamic Process Steps */}
        {procesos.map((proceso) => {
          const title = stepTitles[proceso.tipo_proceso] || proceso.tipo_proceso;
          const data = getStepData(proceso, lote, cliente);
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

        {/* Resumen Final */}
        <View className="bg-green-600 rounded-xl p-4 mt-2">
          <Text className="font-ibm-condensed-bold text-xl text-white mb-2">
            Resumen del Proceso
          </Text>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-green-100 font-ibm-condensed-bold">Peso Inicial:</Text>
            <Text className="text-white font-ibm-devanagari-bold text-lg">
              {formatNumber(lote.peso_entrada_kg)} kg
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-green-100 font-ibm-condensed-bold">Peso Final:</Text>
            <Text className="text-white font-ibm-devanagari-bold text-lg">
              {formatNumber(lote.peso_final_kg)} kg
            </Text>
          </View>
          <View className="h-px bg-green-400 my-2" />
          <View className="flex-row justify-between items-center">
            <Text className="text-green-100 font-ibm-condensed-bold">Eficiencia:</Text>
            <Text className="text-white font-ibm-condensed-bold text-xl">{eficiencia}</Text>
          </View>
        </View>

        {/* Botones de accion */}
        <View className="mt-5">
          <TouchableOpacity onPress={handleN8N} className="bg-blue-600 rounded-xl py-2">
            <Text className="text-center text-white font-ibm-condensed-bold text-xl">GENERAR REPORTE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}