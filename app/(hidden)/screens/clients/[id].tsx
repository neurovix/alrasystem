import LoteBox from '@/components/ui/LoteBox';
import { supabase } from '@/lib/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ClientInformation() {
  const { id } = useLocalSearchParams();

  const [clientName, setClientName] = useState<string>("");
  const [clientCompany, setClientCompany] = useState<string>("");
  const [loteData, setLoteData] = useState<any[]>([]);

  useEffect(() => {
    const fetchClientInfo = async () => {
      // 1️⃣ Obtener datos del cliente
      const { data: clientData, error: clientError } = await supabase
        .from("clientes")
        .select("nombre_cliente, empresa")
        .eq("id_cliente", id)
        .single(); // para obtener un solo registro

      if (clientError) {
        console.log(clientError);
        return;
      }

      if (clientData) {
        setClientName(clientData.nombre_cliente);
        setClientCompany(clientData.empresa);
      }

      // 2️⃣ Obtener lotes del cliente (si los hay)
      const { data: lotesData, error: lotesError } = await supabase
        .from("lotes")
        .select("id_lote, nombre_lote, estado_actual")
        .eq("id_cliente", id);

      if (lotesError) {
        console.log(lotesError);
        return;
      }

      if (lotesData && lotesData.length > 0) {
        const lotes = lotesData.map(item => ({
          id: item.id_lote,
          name: item.nombre_lote,
          status: ["Recibido", "Molienda", "Peletizado", "Retorno"].includes(item.estado_actual) ? "En proceso" : "Finalizado",
          etapa: item.estado_actual,
        }));
        setLoteData(lotes);
      }
    };

    fetchClientInfo();
  }, [id]);


  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex flex-row items-center px-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={40} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
          Información cliente
        </Text>
      </View>
      <ScrollView
        className="bg-white px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className='flex flex-row items-center'>
          <Text className='text-2xl font-ibm-condensed-bold'>Nombre:{" "}</Text>
          <Text className='text-2xl font-ibm-condensed-regular'>{clientName || "Cargando..."}</Text>
        </View>
        <View className='flex flex-row items-center'>
          <Text className='text-2xl font-ibm-condensed-bold'>Empresa:{" "}</Text>
          <Text className='text-xl font-ibm-condensed-regular flex-shrink'>{clientCompany || "Cargando..."}</Text>
        </View>
        <TouchableOpacity onPress={() => router.navigate(`/screens/clients/edit/${id}`)} className='bg-blue-500 w-full rounded-xl py-2 flex my-5 items-center'>
          <Text className='text-white font-ibm-condensed-bold text-2xl'>Editar</Text>
        </TouchableOpacity>

        {/* Renderizamos los lotes */}
        {loteData.map((item) => (
          <View key={item.id}>
            <LoteBox id={item.id} name={item.name} status={item.status} etapa={item.etapa} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
