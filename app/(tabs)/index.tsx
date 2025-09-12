import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="bg-[#f6f6f6] h-full">
      <View className="w-full pt-40 flex items-center h-2/3">
        <Image
          source={require("@/assets/images/logo_alra.png")}
          className="w-64 h-64"
          resizeMode="contain"
        />
        <Text className="font-ibm-condensed-bold text-5xl mt-5">ALRA</Text>
        <Text className="font-ibm-devanagari-bold text-4xl pt-3 text-green-700">PLASTIC RECICLING</Text>
      </View>
      <View className="h-1/3 pt-36 flex items-center px-7">
        <TouchableOpacity className="bg-green-700 w-full flex items-center py-5 rounded-xl" onPress={() => router.push("/(tabs)/(auth)/signin")}>
          <Text className="text-white font-ibm-condensed-bold text-3xl">Registrarme</Text>
        </TouchableOpacity>
        <View className="flex flex-row w-full justify-evenly pt-3">
          <Text className="text-xl font-ibm-italic-medium">¿Ya tienes una cuenta?</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/(auth)/login")}>
            <Text className="text-green-700 underline font-ibm-devanagari-bold text-xl">Iniciar sesion</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
