import icons from "@/constants/icons";
import { supabase } from "@/lib/supabase";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogIn() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<String | null>("");
  const [loading, setLoading] = useState(false);

  type LoginForm = {
    Email: string,
    Password: string,
  }

  const onSubmmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError(null);

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: data.Email,
        password: data.Password,
      });

      if (loginError) {
        throw loginError;
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error")
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="pt-4 pl-4 z-10">
        <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
          <AntDesign name="left" size={30} color="green" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-5 flex-1 justify-center mt-15">
              <View className="w-full flex items-center mb-7">
                <Image
                  source={require("@/assets/images/logo_alra.png")}
                  resizeMode="contain"
                  className="w-32 h-32"
                />
                <Text className="font-ibm-condensed-bold text-4xl pt-5">
                  Inicio de sesion
                </Text>
              </View>
                       
              <View className="space-y-6">
                <View>
                  <Text className="text-xl font-ibm-condensed-bold mb-3">Email</Text>
                  <View className="bg-white flex flex-row items-center border border-black rounded-2xl px-4 py-2">
                    <Image
                      source={icons.email}
                      resizeMode="contain"
                      className="w-6 h-6 mr-3"
                    />
                    <TextInput
                      keyboardType="email-address"
                      className="font-ibm-devanagari-regular flex-1 text-base"
                      placeholder="Ingresa tu correo electronico"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      onChangeText={text => setEmail(text)}
                    />
                  </View>
                </View>
                           
                <View className="mt-4">
                  <Text className="text-xl font-ibm-condensed-bold mb-3">
                    Contraseña
                  </Text>
                  <View className="bg-white flex flex-row items-center border border-black rounded-2xl px-4 py-2">
                    <Image
                      source={icons.password}
                      resizeMode="contain"
                      className="w-6 h-6 mr-3"
                    />
                    <TextInput
                      secureTextEntry={true}
                      className="font-ibm-devanagari-regular flex-1 text-base"
                      placeholder="Ingresa tu contraseña"
                      placeholderTextColor="#9CA3AF"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                      onChangeText={text => setPassword(text)}
                    />
                  </View>
                </View>
                           
                <View className="pt-6">
                  <TouchableOpacity
                    className="bg-green-700 rounded-2xl py-4"
                    onPress={async () => {
                      const data: LoginForm = {
                        Email: email,
                        Password: password,
                      }

                      await onSubmmit(data);
                    }}
                  >
                    <Text className="text-white text-center text-2xl font-ibm-condensed-semibold">
                      Iniciar sesion
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="flex flex-row justify-center pt-10">
                  <Text className="mr-1 font-ibm-condensed-light text-xl">¿No tienes una cuenta aun?{' '}</Text>
                  <TouchableOpacity className="ml-1 flex items-center" onPress={() => router.replace("/(tabs)/(auth)/signin")}>
                    <Text className="text-green-600 text-xl underline font-ibm-devanagari-bold">Registrarme</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}