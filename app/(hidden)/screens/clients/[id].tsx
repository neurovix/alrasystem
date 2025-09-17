import LoteBox from '@/components/ui/LoteBox';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from "expo-router";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ClientInformation() {
  const { id } = useLocalSearchParams();

  var clientName: string = "Fernando Vazquez";
  var clientCompany: string = "Neurovix S. de R.L. de C.V."

  const loteData = [
    { id: 6, name: "LT-6", status: "Terminado", etapa: "Venta" },
    { id: 7, name: "LT-7", status: "Terminado", etapa: "Molienda" },
    { id: 9, name: "LT-9", status: "Terminado", etapa: "Molienda" },
    { id: 10, name: "LT-10", status: "Terminado", etapa: "Molienda" },
    { id: 12, name: "LT-12", status: "Terminado", etapa: "Venta" },
  ];

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex flex-row items-center px-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={40} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
          Informacion cliente
        </Text>
      </View>
      <ScrollView
        className="bg-white px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className='flex flex-row items-center'>
          <Text className='text-2xl font-ibm-condensed-bold'>Nombre:{" "}</Text>
          <Text className='text-2xl font-ibm-condensed-regular'>{clientName}</Text>
        </View>
        <View className='flex flex-row items-center'>
          <Text className='text-2xl font-ibm-condensed-bold'>Empresa:{" "}</Text>
          <Text className='text-2xl font-ibm-condensed-regular'>{clientCompany}</Text>
        </View>
        <TouchableOpacity onPress={() => router.navigate("/screens/clients/clientInfo")} className='bg-blue-500 w-full rounded-xl py-2 flex my-5 items-center'>
          <Text className='text-white font-ibm-condensed-bold text-2xl'>Editar</Text>
        </TouchableOpacity>
        {loteData.map((item, _) => (
          <View key={item.id}>
            <LoteBox id={item.id} name={item.name} status={item.status} etapa={item.etapa} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
