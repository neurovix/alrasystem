import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from "react-native";

export default function InventoryBox({ id, name, quantity }: any) {
  return (
    <View className='flex flex-row w-full items-center border border-black px-4 py-3 rounded-xl my-2'>
      <View className='w-2/12'>
        <FontAwesome name="recycle" size={30} color="black" />
      </View>
      <View className='w-8/12'>
        <Text className='font-ibm-condensed-bold text-2xl'>{name}</Text>
        <View className='flex flex-row items-center'>
          <Text className='font-ibm-condensed-bold'>Cantidad:{" "}</Text>
          <Text>{quantity}</Text>
        </View>
      </View>
      <View className='w-2/12 flex items-end'>
        <TouchableOpacity onPress={() => router.navigate(`/screens/inventario/${id}`)}>
          <AntDesign name="right" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  )
}