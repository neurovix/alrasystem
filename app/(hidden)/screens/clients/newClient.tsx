import { supabase } from '@/lib/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from "expo-router";
import { useState } from 'react';
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

export default function NewClient() {
  const [clientName, setClientName] = useState<string | any>("");
  const [clientCompany, setClientCompany] = useState<string | any>("");

  const insertClientInformation = async () => {
    const { data: clientInformation, error: clientError} = await supabase.from("clientes").insert({
      nombre_cliente: clientName,
      empresa: clientCompany,
    });

    if (clientError) {
      Alert.alert("Ha ocurrido algun problema al momento de registrar el cliente, favor de intentar nuevamente mas tarde")
      throw clientError;
    }

    Alert.alert("Cliente registrado exitosamente");
  };

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex flex-row items-center px-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={40} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
          Registro de cliente
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
              placeholder='Ingresa el nombre del cliente'
              onChangeText={(text) => setClientName(text)}
            />
          </View>
        </View>
        <View className='font-ibm-condensed-bold text-xl mt-5'>
          <Text className='text-xl font-ibm-condensed-bold'>Nombre de empresa</Text>
          <View className='border-2 border-gray-600 rounded-xl px-3 py-1 mt-2'>
            <TextInput
              placeholder='Ingresa el nombre de la empresa'
              onChangeText={(text) => setClientCompany(text)}
            />
          </View>
        </View>
        <View className='mt-5'>
          <Button
            color={"#16a34a"}
            title="Guardar"
            onPress={insertClientInformation}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
