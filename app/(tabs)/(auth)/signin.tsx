import icons from "@/constants/icons";
import { supabase } from "@/lib/supabase";
import { AntDesign } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const router = useRouter();

  const [nombre, setNombre] = useState<string>("");
  const [role, setRole] = useState("Operador");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [error, setError] = useState<String | null>("");
  const [loading, setLoading] = useState(false);

  type SignUpForm = {
    Nombre: string;
    Rol: string;
    Email: string;
    Password: string;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const onSubmmit = async (data: SignUpForm) => {
    try {
      setLoading(true);
      setError(null);

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
        Alert.alert("Error", "No se pudo guardar el nuevo usuario");
        return;
      }

      const userID = signUpData.user?.id;

      if (userID) {
        const { data: _, error: insertError } = await supabase
          .from("usuarios")
          .insert([
            {
              id_usuario: userID,
              nombre: data.Nombre,
              email: data.Email,
              rol: data.Rol,
              estatus: true,
            },
          ])
          .select();

        console.log(data);

        if (insertError) {
          Alert.alert("Error", "No se pudo guardar el nuevo usuario");
          return;
        }
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: data.Email,
        password: data.Password,
      });

      if (loginError) {
        Alert.alert("Error", "No se pudo iniciar sesion");
        return;
      }

      await sleep(1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="pt-4 pl-4">
        <TouchableOpacity onPress={() => router.navigate("/(tabs)")}>
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

                  {Platform.OS === "ios" ? (
                    <>
                      <TouchableOpacity
                        onPress={() => setShowRolePicker(true)}
                        className="bg-white flex flex-row items-center border border-black rounded-2xl px-3 py-3"
                      >
                        <Image
                          source={icons.role}
                          resizeMode="contain"
                          className="w-6 h-6 mr-3"
                        />
                        <Text className="text-lg text-gray-700">
                          {role ? role : "Selecciona un rol"}
                        </Text>
                      </TouchableOpacity>

                      <Modal
                        visible={showRolePicker}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowRolePicker(false)}
                      >
                        <View className="flex-1 justify-end bg-black/50">
                          <View className="bg-white rounded-t-3xl p-4">
                            <View className="flex-row justify-between mb-2">
                              <TouchableOpacity onPress={() => setShowRolePicker(false)}>
                                <Text className="text-green-600 font-bold text-lg">Cerrar</Text>
                              </TouchableOpacity>
                            </View>

                            <Picker
                              selectedValue={role}
                              itemStyle={{ color: "#000" }}
                              onValueChange={(itemValue) => {
                                setRole(itemValue);
                                setShowRolePicker(false);
                              }}
                            >
                              <Picker.Item label="Selecciona un rol" value="" />
                              <Picker.Item label="Operador" value="Operador" />
                              <Picker.Item label="Administrador" value="Administrador" />
                            </Picker>
                          </View>
                        </View>
                      </Modal>
                    </>
                  ) : (
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
                          style={styles.picker}
                          dropdownIconColor="black"
                        >
                          <Picker.Item label="Selecciona un rol" value="" />
                          <Picker.Item label="Operador" value="Operador" />
                          <Picker.Item label="Administrador" value="Administrador" />
                        </Picker>
                      </View>
                    </View>
                  )}
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

const styles = StyleSheet.create({
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    width: "100%",
    alignItems: "center",
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "white",
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  pickerIOS: {
    height: 200,
    fontSize: 16,
    color: '#000',
  },
});