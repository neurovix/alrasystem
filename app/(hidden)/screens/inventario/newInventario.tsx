import { supabase } from '@/lib/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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

export default function NewInventario() {
  const [materialName, setMaterialName] = useState<string | any>("");
  const [materialQuantity, setMaterialQuantity] = useState<string | any>("");

  const insertMaterial = async () => {
    const { data: _, error: materialError } = await supabase.from("materiales").insert({
      nombre_material: materialName,
      cantidad_disponible_kg: materialQuantity,
    });

    if (materialError) {
      Alert.alert("Error", "No se pudo guardar el material");
      return;
    }

    Alert.alert("Material guardado exitosamente");
    
    router.back();
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
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className='flex items-center mx-auto justify-center my-20 bg-gray-400 w-32 h-32 rounded-full'>
          <MaterialIcons name="recycling" size={60} color="white" />
        </View>
        <Text className='font-ibm-condensed-bold text-2xl'>Detalles de material</Text>
        <View className='flex flex-col mt-4'>
          <Text className='font-ibm-condensed-bold text-xl'>Nombre de material</Text>
          <View className='border-2 border-gray-600 rounded-xl px-3 py-1 mt-2'>
            <TextInput
              placeholder='Ingresa el nombre del material'
              placeholderTextColor="#4b5563"
              onChangeText={(text) => setMaterialName(text)}
            />
          </View>
        </View>
        <View className='font-ibm-condensed-bold text-xl mt-5'>
          <Text className='text-xl font-ibm-condensed-bold'>Cantidad</Text>
          <View className='border-2 border-gray-600 rounded-xl px-3 py-1 mt-2'>
            <TextInput
              placeholder='Ingresa la cantidad inicial (kg)'
              placeholderTextColor="#4b5563"
              keyboardType='numeric'
              onChangeText={(text) => setMaterialQuantity(text)}
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