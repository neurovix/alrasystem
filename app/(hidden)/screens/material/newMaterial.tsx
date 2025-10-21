import { supabase } from '@/lib/supabase';
import AntDesign from '@expo/vector-icons/AntDesign';
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

export default function NewMaterial() {
  const [materialName, setMaterialName] = useState<string | any>("");

  const insertMaterial = async () => {
    const { data: _, error: materialError } = await supabase.from("materiales").insert({
      nombre_material: materialName,
    });

    if (materialError) {
      Alert.alert("Error", "Hubo algun problema al registrar el nuevo material");
      return;
    }

    if (!materialError) {
      Alert.alert("Material registrado exitosamente");
      setMaterialName("");
    }
  };

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex flex-row items-center px-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={40} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
          Registro de material
        </Text>
      </View>
      <ScrollView
        className="bg-white px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className='flex mb-20 items-center mx-auto justify-center mt-20 bg-gray-400 w-40 h-40 rounded-full'>
          <AntDesign name="codepen" size={70} color="white" />
        </View>
        <Text className='font-ibm-condensed-bold text-2xl'>Detalles del material</Text>
        <View className='flex flex-col mt-4'>
          <Text className='font-ibm-condensed-bold text-xl'>Nombre del material</Text>
          <View className='border-2 border-gray-600 rounded-xl px-3 py-1 mt-2'>
            <TextInput
              placeholder='Ingresa el nombre del material'
              onChangeText={(text) => setMaterialName(text)}
            />
          </View>
        </View>
        <View className='mt-5'>
          <Button
            color={"#16a34a"}
            title="Guardar"
            onPress={insertMaterial}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
