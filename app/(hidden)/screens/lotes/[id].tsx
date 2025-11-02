import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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

export default function LoteInformation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lote, setLote] = useState<any>(null);
  const [procesos, setProcesos] = useState<any[]>([]);
  const [fotos, setFotos] = useState<any[]>([]);
  const [material, setMaterial] = useState<string>("");
  const [cliente, setCliente] = useState<string>("");
  const [sublotes, setSublotes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const { data: loteData, error: loteError } = await supabase
          .from("lotes")
          .select("*, material: id_material (nombre_material), cliente: id_cliente (nombre_cliente)")
          .eq("id_lote", id)
          .single();
        if (loteError) {
          Alert.alert("Error", "No se pudo obtener la informacion del lote");
          return;
        }

        if (loteData) {
          setLote(loteData);
          setMaterial(loteData.material?.nombre_material || "Desconocido");
          setCliente(loteData.cliente?.nombre_cliente || "Desconocido");
        }

        const { data: procData, error: procError } = await supabase
          .from("procesos")
          .select("*, cliente: id_cliente (nombre_cliente)")
          .eq("id_lote", id)
          .order("fecha_proceso", { ascending: true });

        if (procError) {
          Alert.alert("Error", "No se pudieron obtener los procesos del lote");
          return;
        }

        setProcesos(procData || []);

        const { data: fotosData, error: fotosError } = await supabase
          .from("fotos")
          .select("*")
          .eq("id_lote", id);

        if (fotosError) {
          Alert.alert("Error", "No se pudieron obtener las fotos")
          return;
        }

        setFotos(fotosData || []);

        const { data: sublotesData, error: subError } = await supabase
          .from("sublotes")
          .select("id_sublote, nombre_sublote, peso_sublote_kg, estado_actual, fecha_creado")
          .eq("id_lote", id)
          .order("id_sublote", { ascending: true });

        if (subError) {
          Alert.alert("Error", "No se pudieron obtener los sublotes");
          return;
        }

        setSublotes(sublotesData || []);
      } catch (error) {
        Alert.alert("Error", "Hubo algun problema, favor de intentar mas tarde");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleN8N = async () => {
    const _ = await fetch(`https://n8n.srv1034345.hstgr.cloud/webhook/49909213-02c1-4faa-81ef-6d162d22ea15?id_lote=${id}`, {
      method: "POST",
    })

    Alert.alert("Notificacion", "El reporte deberia estar en tu correo en pocos segundos")
  }

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

  const deleteLote = async () => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Seguro que deseas eliminar este lote y toda su información relacionada?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              const { error: fotosError } = await supabase
                .from("fotos")
                .delete()
                .eq("id_lote", id);

              if (fotosError) {
                Alert.alert("Error", "No se pudieron borrar las fotos del lote");
                return;
              }

              const { error: procesosError } = await supabase
                .from("procesos")
                .delete()
                .eq("id_lote", id);

              if (procesosError) {
                Alert.alert("Error", "No se pudieron borrar los procesos del lote");
                return;
              }

              const { error: sublotesError } = await supabase
                .from("sublotes")
                .delete()
                .eq("id_lote", id);

              if (sublotesError) {
                Alert.alert("Error", "No se pudieron borrar los sublotes del lote");
                return;
              }

              const { error: invError } = await supabase
                .from("inventario_movimientos")
                .delete()
                .eq("id_lote", id);

              if (invError) {
                Alert.alert("Error", "No se pudieron borrar los movimientos de inventario del lote");
                return;
              }

              const { error: loteError } = await supabase
                .from("lotes")
                .delete()
                .eq("id_lote", id);

              if (loteError) {
                Alert.alert("Error", "No se pudo borrar el lote")
                return;
              }

              Alert.alert("Éxito", "El lote y toda su información fueron eliminados correctamente.");

              router.back();
            } catch (error: any) {
              Alert.alert("Error", "No se pudo eliminar el lote. Intenta nuevamente.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStepData = (proceso: any, lote: any, cliente: string) => {
    const procCliente = proceso.cliente?.nombre_cliente || cliente;
    switch (proceso.tipo_proceso) {
      case "Recibido":
        return [
          { label: "Fecha de Recibido", value: formatDate(proceso.fecha_proceso) },
          { label: "Cliente", value: procCliente },
          { label: "Tipo de Proceso", value: lote.tipo_proceso },
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

  const SubloteCard = ({ sublote }: { sublote: any }) => (
    <TouchableOpacity
      onPress={() =>
        router.push(`/(hidden)/screens/sublotes/${sublote.id_sublote}`)
      }
      activeOpacity={0.8}
      className="bg-white rounded-2xl px-5 py-4 mb-4 flex-row justify-between items-center border border-green-100 shadow-lg"
    >
      <View className="flex-1">
        <Text className="text-gray-800 font-ibm-condensed-bold text-lg mb-1">
          {sublote.nombre_sublote}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-green-600 font-ibm-devanagari-bold text-base mr-4">
            {formatNumber(sublote.peso_sublote_kg)} kg
          </Text>
          <View className="flex-row items-center px-3 py-1 bg-green-50 rounded-full">
            <Ionicons name="ellipse" size={12} color="#22c55e" />
            <Text className="text-green-600 font-medium text-sm ml-1">
              {sublote.estado_actual}
            </Text>
          </View>
        </View>
        <Text className="text-gray-500 text-sm mt-1">
          Creado: {formatDate(sublote.fecha_creado)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#22c55e" />
    </TouchableOpacity>
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
        <Text className="text-white mt-3 text-lg font-medium">Cargando información del lote...</Text>
      </SafeAreaView>
    );

  if (!lote)
    return (
      <SafeAreaView className="flex-1 bg-green-600 justify-center items-center">
        <Ionicons name="document-outline" size={64} color="white" />
        <Text className="text-white text-xl font-ibm-condensed-bold mt-4">Lote no encontrado</Text>
      </SafeAreaView>
    );

  const eficiencia =
    lote.peso_final_kg && lote.peso_entrada_kg
      ? ((lote.peso_final_kg / lote.peso_entrada_kg) * 100).toFixed(1) + "%"
      : "N/A";

  const hasSublotes = sublotes.length > 0;

  const showButtons = !hasSublotes && lote.estado_actual !== "Finalizado";

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex-row items-center px-5 pb-3 bg-green-600">
        <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full bg-green-500/20">
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl text-white font-ibm-condensed-bold ml-3 flex-1">
          {lote.nombre_lote}
        </Text>
        <MaterialCommunityIcons name="delete-forever-outline" size={40} color="red" onPress={deleteLote} />
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
              <Text className="text-gray-600 font-ibm-devanagari-bold w-32">Cliente:</Text>
              <Text className="text-gray-900 font-semibold flex-1">{cliente}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-ibm-devanagari-bold w-32">Material:</Text>
              <Text className="text-gray-900 font-semibold flex-1">{material}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-ibm-devanagari-bold w-32">Peso Entrada:</Text>
              <Text className="text-gray-900 font-semibold flex-1">{formatNumber(lote.peso_entrada_kg)} kg</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-ibm-devanagari-bold w-32">Fecha Recibido:</Text>
              <Text className="text-gray-900 font-semibold flex-1">{formatDate(lote.fecha_recibido)}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-ibm-devanagari-bold w-32">Tipo Proceso:</Text>
              <Text className="text-green-600 font-semibold flex-1">{lote.tipo_proceso}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-ibm-devanagari-bold w-32">Estado Actual:</Text>
              <View className="flex-row items-center bg-green-50 px-3 py-1 rounded-full ml-auto">
                <Ionicons name="ellipse" size={12} color="#22c55e" />
                <Text className="text-green-600 font-medium text-sm ml-1">{lote.estado_actual}</Text>
              </View>
            </View>
          </View>
        </View>

        {!hasSublotes && (
          <>
            <Text className="font-ibm-condensed-bold text-2xl text-gray-700 mb-4 flex-row items-center">
              <Ionicons name="cog-outline" size={24} color="#22c55e" className="mr-2" />
              Proceso de Transformación
            </Text>

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

            {showButtons && (
              <View className="">
                {lote.estado_actual === "Recibido" && (
                  <ActionButton
                    title="Moler lote"
                    onPress={() => router.push(`/screens/molienda?id_lote=${id}`)}
                  />
                )}
                {lote.estado_actual === "Molienda" && (
                  <>
                    <ActionButton
                      title="Peletizar"
                      onPress={() => router.push(`/screens/peletizado?id_lote=${id}`)}
                    />
                    <ActionButton
                      title={lote.tipo_proceso === "Maquila" ? "Maquila" : "Venta"}
                      onPress={() =>
                        router.push(
                          lote.tipo_proceso === "Maquila"
                            ? `/screens/retorno?id_lote=${id}`
                            : `/screens/venta?id_lote=${id}`
                        )
                      }
                    />
                  </>
                )}
              </View>
            )}
          </>
        )}

        {hasSublotes && (
          <View className="mb-4">
            <Text className="font-ibm-condensed-bold text-2xl text-gray-700 mb-4 flex-row items-center">
              <Ionicons name="layers-outline" size={24} color="#22c55e" className="mr-2" />
              Sublotes ({sublotes.length})
            </Text>
            <View className="space-y-3">
              {sublotes.map((sublote) => (
                <SubloteCard key={sublote.id_sublote} sublote={sublote} />
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity className="w-full bg-green-500 mb-2 flex items-center justify-center py-3 rounded-lg" onPress={() => router.navigate(`/screens/sublotes/new/${id}`)}>
          <Text className="text-white text-xl font-ibm-condensed-bold">Agregar sublote</Text>
        </TouchableOpacity>

        <View className="bg-green-600 rounded-2xl p-6 mt-2 shadow-lg">
          <View className="flex-row items-center mb-4">
            <Ionicons name="bar-chart-outline" size={24} color="white" />
            <Text className="font-ibm-condensed-bold text-xl text-white ml-2">
              Resumen del Proceso
            </Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-green-100 font-semibold">Peso Inicial</Text>
              <Text className="text-white font-bold text-lg">{formatNumber(lote.peso_entrada_kg)} kg</Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-t border-green-500/30">
              <Text className="text-green-100 font-semibold">Peso Final</Text>
              <Text className="text-white font-bold text-lg">{formatNumber(lote.peso_final_kg || 0)} kg</Text>
            </View>
            <View className="flex-row justify-between items-center pt-2">
              <Text className="text-green-100 font-semibold">Eficiencia</Text>
              <View className={`flex-row items-center ${eficiencia !== "N/A" ? "bg-white/20 px-3 py-1 rounded-full" : ""}`}>
                <Text className="text-white font-bold text-lg">{eficiencia}</Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleN8N} className="bg-green-600 w-full rounded-2xl py-5 mt-5">
          <Text className="font-ibm-condensed-bold text-white text-center">OBTENER REPORTE</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}