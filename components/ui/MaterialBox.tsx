import { supabase } from '@/lib/supabase';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function MaterialBox({ id, nombre }: any) {
  const deleteMaterial = async (id: string | number) => {
    const { data: materialData, error: materialError } = await supabase
      .from("materiales")
      .delete()
      .eq("id_material", id);

    if (materialError) {
      Alert.alert("Hubo algún problema al borrar el material, favor de intentar más tarde");
      return;
    }

    Alert.alert("Material borrado exitosamente");
    
    router.navigate("/(tabs)/(root)");
  };


  return (
    <TouchableOpacity className="flex my-2 flex-row py-3 px-4 w-full items-center border-2 border-gray-500 rounded-xl shadow-slate-600">
      <View className="w-2/12 mx-auto">
        <AntDesign name="container" size={24} color="black" />
      </View>
      <View className="w-9/12">
        <Text className="font-ibm-condensed-bold text-xl">{nombre}</Text>
      </View>
      <View className="w-1/12 flex flex-row items-center">
        <TouchableOpacity onPress={() => deleteMaterial(id)}>
          <AntDesign name="delete" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
