import { supabase } from "@/lib/supabase";
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Configuracion() {
  const logout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace("/(tabs)");
          },
        },
      ]
    );
  };

  const [userData, setUserData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState<"nombre" | "email" | null>(null);
  const [newValue, setNewValue] = useState("");
  const [userID, setUserID] = useState<String>("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        Alert.alert("Error", "No se pudo obtener la informacion del usuario loggeado");
        return;
      }

      const user = data.user;

      if (user) {
        const { data: perfil, error: perfilError } = await supabase
          .from("usuarios")
          .select("nombre, rol")
          .eq("id_usuario", user.id)
          .single();

        if (perfilError) console.log(perfilError);
        else {
          setUserData({
            id: user.id,
            email: user?.email,
            nombre: perfil?.nombre,
            rol: perfil?.rol,
          });
        }
      }

      setUserID(user.id);
    };

    fetchUser();
  }, []);

  const handleOpenEdit = (field: "nombre" | "email") => {
    setEditField(field);
    setNewValue(userData?.[field] || "");
    setModalVisible(true);
  };

  const deleteAccount = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas eliminar tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar cuenta",
          style: "destructive",
          onPress: async () => {
            const { data: _, error: updateError } = await supabase.from("usuarios")
              .update({
                estatus: false,
              })
              .eq("id_usuario", userID);

            if (updateError) {
              Alert.alert("Error", "No se pudo eliminar tu cuenta, intenta mas tarde");
              return;
            }
            await supabase.auth.signOut();
            router.replace("/(tabs)");
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!editField || !newValue.trim()) {
      Alert.alert("Error", "Por favor ingresa un valor válido.");
      return;
    }

    try {
      if (editField === "nombre") {
        const { error } = await supabase
          .from("usuarios")
          .update({ nombre: newValue })
          .eq("id_usuario", userData.id);

        if (error) {
          Alert.alert("Error", "No se pudo actualizar el nombre");
          return;
        }

        setUserData({ ...userData, nombre: newValue });

        Alert.alert("Éxito", "Nombre actualizado correctamente.");
      } else if (editField === "email") {
        const { error: authError } = await supabase.auth.updateUser({
          email: newValue,
        });

        if (authError) throw authError;

        setUserData({ ...userData, email: newValue });

        Alert.alert("Éxito", "Correo actualizado correctamente.");
      }
    } catch (err: any) {
      Alert.alert("Error", "No se pudo actualizar el dato.");
    } finally {
      setModalVisible(false);
    }
  };

  const ProfileItem = ({ icon, label, value, bgColor = "bg-gray-50", isEdit, onEdit }: any) => (
    <View className={`${bgColor} rounded-xl p-4 mb-4 border border-gray-200`}>
      <Text className="font-ibm-condensed-bold text-sm text-gray-500 mb-2 uppercase tracking-wide">
        {label}
      </Text>
      <View className="flex flex-row items-center">
        <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4 shadow-sm">
          {icon}
        </View>
        <Text className="font-ibm-devanagari-bold text-lg text-gray-800 flex-1">
          {value}
        </Text>
        {isEdit && (
          <TouchableOpacity onPress={onEdit}>
            <Feather name="edit" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-green-600">
      <Text className="text-3xl text-white p-5 font-ibm-condensed-bold">
        Configuración
      </Text>
      <ScrollView className="bg-white pt-5" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text className="font-ibm-condensed-bold text-3xl text-gray-800">
            Mi Perfil
          </Text>
          <Text className="text-gray-500 mt-1">Información de la cuenta</Text>
        </View>

        <View className="flex-1 px-6 py-6">
          <View className="bg-white rounded-xl p-6 mb-6 items-center border border-gray-200 shadow-sm">
            <View className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full items-center justify-center mb-4 shadow-lg">
              <Feather name="user" size={40} color="black" />
            </View>
            <Text className="font-ibm-condensed-bold text-2xl text-gray-800">
              {userData?.nombre || "Cargando..."}
            </Text>
            <View className="bg-green-100 px-3 py-1 rounded-full mt-2">
              <Text className="font-ibm-devanagari-bold text-sm text-green-700">
                {userData?.rol || "Cargando..."}
              </Text>
            </View>
          </View>

          <View className="mb-6">
            <ProfileItem
              icon={<FontAwesome name="user" size={24} color="#10B981" />}
              label="Nombre Completo"
              value={userData?.nombre || "Cargando..."}
              bgColor="bg-green-50"
              isEdit={true}
              onEdit={() => handleOpenEdit("nombre")}
            />

            <ProfileItem
              icon={<FontAwesome5 name="user-secret" size={24} color="#3B82F6" />}
              label="Rol en el Sistema"
              value={userData?.rol || "Cargando..."}
              bgColor="bg-blue-50"
            />

            <ProfileItem
              icon={<Entypo name="email" size={24} color="#8B5CF6" />}
              label="Correo Electrónico"
              value={userData?.email || "Cargando..."}
              bgColor="bg-purple-50"
              isEdit={true}
              onEdit={() => handleOpenEdit("email")}
            />
          </View>

          <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <View className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <Text className="font-ibm-condensed-bold text-lg text-gray-700">Acciones</Text>
            </View>

            <TouchableOpacity
              onPress={logout}
              className="flex flex-row items-center px-4 py-4 active:bg-red-50"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center mr-4">
                <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="font-ibm-devanagari-bold text-lg text-red-600">
                  Cerrar Sesión
                </Text>
                <Text className="text-gray-500 text-sm">Salir de la aplicación</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={deleteAccount}
              className="flex flex-row items-center px-4 py-4 bg-red-500 active:bg-red-200"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mr-4">
                <MaterialCommunityIcons name="delete" size={24} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="font-ibm-devanagari-bold text-lg text-white">
                  Eliminar cuenta
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View className="mt-8 items-center">
            <Text className="text-gray-400 text-sm">Versión 1.0.0</Text>
            <Text className="text-gray-400 text-xs mt-1">
              © {new Date().getFullYear()} Aplicación creada por Neurovix
            </Text>
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/30">
            <View className="bg-white w-11/12 rounded-2xl p-5 shadow-lg">
              <Text className="text-2xl font-ibm-condensed-bold text-center mb-4">
                Editar {editField === "nombre" ? "Nombre" : "Correo"}
              </Text>
              <TextInput
                value={newValue}
                onChangeText={setNewValue}
                placeholder={`Nuevo ${editField}`}
                className="border border-gray-300 rounded-xl px-4 py-3 mb-5 text-lg"
                autoCapitalize="none"
              />
              <View className="flex flex-row justify-around">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-gray-400 px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-bold text-lg">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-green-600 px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-bold text-lg">Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
