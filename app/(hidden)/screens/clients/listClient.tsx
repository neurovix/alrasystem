import ClientBox from "@/components/ui/ClientBox";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from "expo-router";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ListClient() {
  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex flex-row items-center px-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={40} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
          Lista de clientes
        </Text>
      </View>
      <ScrollView
        className="bg-white px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View>
          <ClientBox id={1} nombre="Fernando Vazquez" empresa="Neurovix S. de R.L. de C.V." />
          <ClientBox id={2} nombre="Armando Alvarado" empresa="ALRA PLASTIC RECICLING" />
          <ClientBox id={3} nombre="Ing. Vazquez" empresa="Vazna S.A. de C.V." />
          <ClientBox id={4} nombre="Ricardo Salinas" empresa="Bimbo S.A. de C.V." />
          <ClientBox id={5} nombre="Lic. Galindo" empresa="Paqueteria Tres Guerras" />
          <ClientBox id={6} nombre="Alejandro Vazquez" empresa="Motorola LLC" />
          <ClientBox id={7} nombre="Norma Medina" empresa="SoftTek S.A. de C.V." />
          <ClientBox id={8} nombre="Mariajose Medina" empresa="Tesla Co" />
          <ClientBox id={9} nombre="Antonia Cortes" empresa="Amazon LLC" />
          <ClientBox id={10} nombre="Natalio Medina" empresa="Apple Inc" />
          <ClientBox id={11} nombre="Dilan Medina" empresa="Samsung S. de R.L. de C.V." />
          <ClientBox id={12} nombre="Sofia Medina" empresa="Elektra S. de R.L. de C.V." />
          <ClientBox id={13} nombre="Manuel Alonso" empresa="Coca Cola S.A. de C.V." />
          <ClientBox id={14} nombre="Kassandra Medina" empresa="Barcel S.A. de C.V." />
          <ClientBox id={15} nombre="Dayanna Mendoza" empresa="Sabritas S.A. de C.V." />
        </View>
        <View className="w-full flex items-end mt-3">
          <TouchableOpacity onPress={() => router.navigate("/screens/clients/newClient")} className="bg-green-600 px-8 py-7 rounded-full">
            <FontAwesome6 name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
