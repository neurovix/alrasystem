import MaterialBox from "@/components/ui/MaterialBox";
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

export default function ListMaterial() {
  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex flex-row items-center px-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={40} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
          Lista de materiales
        </Text>
      </View>
      <ScrollView
        className="bg-white px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View>
          <MaterialBox id={1} nombre="PVC" />
          <MaterialBox id={2} nombre="PP" />
          <MaterialBox id={3} nombre="HDPE" />
          <MaterialBox id={4} nombre="ABS" />
          <MaterialBox id={5} nombre="Poliestileno" />
          <MaterialBox id={6} nombre="Naylon" />
        </View>
        <View className="w-full flex items-end mt-3">
          <TouchableOpacity onPress={() => router.navigate("/screens/material/newMaterial")} className="bg-green-600 px-8 py-7 rounded-full">
            <FontAwesome6 name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
