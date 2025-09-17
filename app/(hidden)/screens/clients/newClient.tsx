import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from "expo-router";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewClient() {
  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex flex-row items-center px-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={40} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
          Registro de cliente
        </Text>
      </View>
      <ScrollView
        className="bg-white px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View>
          <Text>Detalles de contacto</Text>
          <View>
            <Text>Nombre de cliente</Text>
            <View>
              <TextInput
                placeholder='Ingresa el nombre del cliente'
              />
            </View>
          </View>
          <View>
            <Text>Nombre de empresa</Text>
            <View>
              <TextInput
                placeholder='Ingresa el nombre de la empresa'
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
