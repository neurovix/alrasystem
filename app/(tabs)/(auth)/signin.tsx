import icons from "@/constants/icons";
import { supabase } from "@/lib/supabase";
import { AntDesign } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const router = useRouter();

  const [nombre, setNombre] = useState<string>("");
  const [role, setRole] = useState("operador");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<String | null>("");
  const [loading, setLoading] = useState(false);

  type SignUpForm = {
    Nombre: string;
    Rol: string;
    Email: string;
    Password: string;
  };

  const onSubmmit = async (data: SignUpForm) => {
    try {
      setLoading(true);
      setError(null);

      const { error: signUpError } = await supabase.auth.signUp({
        email: data.Email,
        password: data.Password,
        options: {
          data: {
            name: data.Nombre,
            role: data.Rol,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: data.Email,
        password: data.Password,
      });

      if (loginError) {
        throw loginError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="pt-4 pl-4">
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
            <View className="px-5 flex-1 justify-center mt-5">
              <View className="w-full flex items-center">
                <Image
                  source={require("@/assets/images/logo_alra.png")}
                  resizeMode="contain"
                  className="w-28 h-28"
                />
                <Text className="font-ibm-devanagari-bold text-4xl mt-4">
                  REGISTRO
                </Text>
              </View>

              <View className="space-y-4">
                <View className="pb-3">
                  <Text className="text-xl font-ibm-condensed-bold mb-2">
                    Nombre
                  </Text>
                  <View className="bg-white flex flex-row items-center border border-black rounded-2xl px-3 py-1">
                    <Image
                      source={icons.user}
                      resizeMode="contain"
                      className="w-6 h-6 mr-3"
                    />
                    <TextInput
                      className="font-ibm-devanagari-regular flex-1"
                      placeholder="Ingresa tu nombre"
                      placeholderTextColor="#9CA3AF"
                      onChangeText={(text) => setNombre(text)}
                    />
                  </View>
                </View>

                <View className="pb-3">
                  <Text className="text-xl font-ibm-condensed-bold mb-2">
                    Rol
                  </Text>
                  <View className="bg-white flex flex-row items-center border border-black rounded-2xl px-3">
                    <Image
                      source={icons.role}
                      resizeMode="contain"
                      className="w-6 h-6 mr-3"
                    />
                    <View className="flex-1">
                      <Picker
                        selectedValue={role}
                        onValueChange={(itemValue) => setRole(itemValue)}
                        style={{
                          height: 60,
                          color: "#000000",
                        }}
                        mode="dropdown"
                      >
                        <Picker.Item label="Operador" value="operador" />
                        <Picker.Item
                          label="Administrador"
                          value="administrador"
                        />
                      </Picker>
                    </View>
                  </View>
                </View>

                <View className="pb-3">
                  <Text className="text-xl font-ibm-condensed-bold mb-2">
                    Email
                  </Text>
                  <View className="bg-white flex flex-row items-center border border-black rounded-2xl px-3 py-1">
                    <Image
                      source={icons.email}
                      resizeMode="contain"
                      className="w-6 h-6 mr-3"
                    />
                    <TextInput
                      keyboardType="email-address"
                      className="font-ibm-devanagari-regular flex-1"
                      placeholder="Ingresa tu email"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={(text) => setEmail(text)}
                    />
                  </View>
                </View>

                <View className="pb-3">
                  <Text className="text-xl font-ibm-condensed-bold mb-2">
                    Contraseña
                  </Text>
                  <View className="bg-white flex flex-row items-center border border-black rounded-2xl px-3 py-1">
                    <Image
                      source={icons.password}
                      resizeMode="contain"
                      className="w-6 h-6 mr-3"
                    />
                    <TextInput
                      secureTextEntry={true}
                      className="font-ibm-devanagari-regular flex-1"
                      placeholder="Ingresa tu contraseña"
                      placeholderTextColor="#9CA3AF"
                      onChangeText={(text) => setPassword(text)}
                    />
                  </View>
                </View>

                <View className="pt-2">
                  <TouchableOpacity
                    className="bg-green-700 rounded-2xl py-4"
                    onPress={async () => {
                      const data: SignUpForm = {
                        Nombre: nombre,
                        Rol: role,
                        Email: email,
                        Password: password,
                      };

                      await onSubmmit(data);
                    }}
                  >
                    <Text className="text-white text-center text-xl font-ibm-condensed-semibold">
                      REGISTRARME
                    </Text>
                  </TouchableOpacity>
                  <View className="flex flex-row justify-center pt-10">
                    <Text className="mr-1 font-ibm-condensed-light text-xl">
                      ¿Ya tienes una cuenta?{" "}
                    </Text>
                    <TouchableOpacity
                      className="ml-1 flex items-center"
                      onPress={() => router.replace("/(tabs)/(auth)/login")}
                    >
                      <Text className="text-green-600 text-xl underline font-ibm-devanagari-bold">
                        Iniciar sesion
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
