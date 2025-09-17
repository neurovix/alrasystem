import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from "react-native";

export default function ClientBox({ id, nombre, empresa }: any) {
  return (
    <TouchableOpacity onPress={() => router.push(`/screens/clients/${id}`)} className="flex my-2 flex-row py-3 px-4 w-full items-center border-2 border-gray-500 rounded-xl shadow-slate-600">
      <View className="w-3/12">
        <RenderChar text={nombre} />
      </View>
      <View className="w-8/12">
        <Text className="font-ibm-condensed-bold text-xl">{nombre}</Text>
        <Text className="font-ibm-condensed-regular">{empresa}</Text>
      </View>
      <View className="w-1/12 flex items-start">
        <MaterialIcons name="navigate-next" size={40} color="black" />
      </View>
    </TouchableOpacity>
  );
}

const RenderChar = ({ text }: any) => {
  return (
    <View className="bg-slate-400 rounded-full w-14 h-14 flex items-center justify-center">
      <Text className="text-white text-3xl font-ibm-condensed-bold">{getFirstChar(text)}</Text>
    </View>
  )
}

const getFirstChar = (text: string) => {
  return text.charAt(0);
}
