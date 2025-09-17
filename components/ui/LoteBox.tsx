import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from "react-native";

export default function LoteBox({ id, name, status, etapa }: any) {
  return (
    <View className='flex flex-row my-2 items-center w-full border-2 border-gray-600 rounded-xl px-2 py-3'>
      <View className='w-2/12 px-2'>
        <AntDesign name="partition" size={24} color="black" />
      </View>
      <View className='w-8/12'>
        <Text className='text-2xl font-ibm-condensed-bold'>{name}</Text>
        <View className='flex flex-row items-center'>
          {
            status == "En proceso" ? (
              <Text className='text-yellow-600 font-ibm-devanagari-bold'>{status}</Text>
            ) : (
              <Text className='text-green-600 font-ibm-devanagari-bold'>{status}</Text>
            )
          }
          <Text>{" - "}</Text>
          <Text className='font-ibm-devanagari-bold'>{etapa}</Text>
        </View>
      </View>
      <View className='w-2/12 flex items-center'>
        <TouchableOpacity onPress={() => router.push(`/screens/lotes/${id}`)}>
          <AntDesign name="right" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}