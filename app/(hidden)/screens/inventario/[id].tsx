import { supabase } from '@/lib/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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

export default function MaterialInformation() {
  const { id } = useLocalSearchParams();

  const [materialName, setMaterialName] = useState<string | any>("");
  const [materialQuantity, setMaterialQuantity] = useState<number | any>(null);

  useEffect(() => {
    const fetchMaterialInformation = async () => {
      const { data: materialInformation, error: materialError } = await supabase.from("materiales").select("id_material,nombre_material,cantidad_disponible_kg").eq("id_material", id);

      if (materialError) {
        Alert.alert("Ha habido problema al mostrar la informacion del material");
        throw materialError;
      }

      if (materialInformation && materialInformation.length > 0) {
        setMaterialName(materialInformation[0].nombre_material);
        setMaterialQuantity(materialInformation[0].cantidad_disponible_kg);
      }
    };

    fetchMaterialInformation();
  }, [id]);

  const updateMaterialInformation = async () => {
    const { data: materialUpdate, error: materialUpdateError } = await supabase.from("materiales").update({
      nombre_material: materialName,
      cantidad_disponible_kg: materialQuantity,
    }).eq("id_material", id);

    if (materialUpdateError) {
      Alert.alert("Ha ocurrido algun error, favor de intentar mas tarde");
      throw materialUpdateError;
    }

    Alert.alert(
      "Material actualizado exitosamente"
    );

    router.back();
  };

  const deleteMaterial = async () => {
    const { data: materialInfo, error: materialError } = await supabase.from("materiales").delete().eq("id_material", id);

    if (materialError) {
      Alert.alert("Ha ocurrido algun problema al borrar el material")
      return;
    }

    Alert.alert("Material borrado exitosamente");

    router.back();
  }

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex flex-row items-center px-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={40} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
          Edicion de material
        </Text>
      </View>
      <ScrollView
        className="bg-white px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className='flex items-center mx-auto justify-center my-20 bg-gray-400 w-40 h-40 rounded-full'>
          <MaterialIcons name="recycling" size={70} color="white" />
        </View>
        <Text className='font-ibm-condensed-bold text-2xl'>Detalles de material</Text>
        <View className='flex flex-col mt-4'>
          <Text className='font-ibm-condensed-bold text-xl'>Nombre del material</Text>
          <View className='border-2 border-gray-600 rounded-xl px-3 py-1 mt-2'>
            <TextInput
              value={materialName}
              placeholder='Cargando...'
              onChangeText={(text) => setMaterialName(text)}
            />
          </View>
        </View>
        <View className='font-ibm-condensed-bold text-xl mt-5'>
          <Text className='text-xl font-ibm-condensed-bold'>Ingresa la cantidad de material</Text>
          <View className='border-2 border-gray-600 rounded-xl px-3 py-1 mt-2'>
            <TextInput
              value={materialQuantity !== null ? String(materialQuantity) : ""}
              placeholder='Cargando...'
              keyboardType="numeric"
              onChangeText={(text) => setMaterialQuantity(Number(text))}
            />
          </View>
        </View>
        <View className='mt-5'>
          <Button
            color={"#16a34a"}
            title="Actualizar"
            onPress={updateMaterialInformation}
          />
        </View>
        <View className='mt-5'>
          <Button
            color={"#dc2626"}
            title="Eliminar material"
            onPress={deleteMaterial}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}