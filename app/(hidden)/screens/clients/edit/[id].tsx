import { supabase } from '@/lib/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ClientInformation() {
  const { id } = useLocalSearchParams();

  const [clientName, setClientName] = useState<string>("");
  const [clientCompany, setClientCompany] = useState<string>("");

  useEffect(() => {
    const fetchClientInformation = async () => {
      const { data: clientInformation, error: clientError } = await supabase.from("clientes").select("id_cliente,nombre_cliente,empresa").eq("id_cliente", id);

      if (clientError) {
        Alert.alert("Ha habido problema al mostrar la informacion del cliente, favor de intentar mas tarde");
        return;
      }

      if (clientInformation && clientInformation.length > 0) {
        setClientName(clientInformation[0].nombre_cliente);
        setClientCompany(clientInformation[0].empresa)
      }
    };

    fetchClientInformation();
  }, [id]);

  const updateClientInformation = async () => {
    const { data: _, error: clientUpdateError } = await supabase.from("clientes").update({
      nombre_cliente: clientName,
      empresa: clientCompany,
    }).eq("id_cliente", id);

    if (clientUpdateError) {
      Alert.alert("Error", "No se pudo actualizar la informacion");
      return;
    }

    Alert.alert(
      "Cliente actualizado exitosamente"
    );

    router.back();
  };

  const deleteClient = async () => {
    const { data: _, error: clientError } = await supabase.from("clientes").delete().eq("id_cliente", id);

    if (clientError) {
      Alert.alert("Error", "No se pudo borrar el cliente");
      return;
    }

    Alert.alert("Cliente borrado exitosamente");

    router.back();
  }

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex flex-row items-center px-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={40} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
          Edicion de cliente
        </Text>
      </View>
      <ScrollView
        className="bg-white px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className='flex items-center mx-auto justify-center my-20 bg-gray-400 w-40 h-40 rounded-full'>
          <FontAwesome name="building" size={70} color="white" />
        </View>
        <Text className='font-ibm-condensed-bold text-2xl'>Detalles de contacto</Text>
        <View className='flex flex-col mt-4'>
          <Text className='font-ibm-condensed-bold text-xl'>Nombre de cliente</Text>
          <View className='border-2 border-gray-600 rounded-xl px-3 py-1 mt-2'>
            <TextInput
              value={clientName}
              placeholder="Cargando..."
              onChangeText={setClientName}
            />
          </View>
        </View>
        <View className='font-ibm-condensed-bold text-xl mt-5'>
          <Text className='text-xl font-ibm-condensed-bold'>Nombre de empresa</Text>
          <View className='border-2 border-gray-600 rounded-xl px-3 py-1 mt-2'>
            <TextInput
              value={clientCompany}
              placeholder="Cargando..."
              onChangeText={setClientCompany}
            />
          </View>
        </View>
        <View className='mt-5'>
          <Button
            color={"#16a34a"}
            title="Guardar"
            onPress={updateClientInformation}
          />
        </View>
        <View className='mt-5'>
          <Button
            color={"#dc2626"}
            title="Eliminar cliente"
            onPress={deleteClient}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}