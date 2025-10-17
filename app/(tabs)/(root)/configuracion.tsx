import { supabase } from "@/lib/supabase";
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Configuracion() {
  const logout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace("/(tabs)");
          }
        }
      ]
    );
  };

  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.log(error);
        throw error;
      }

      const user = data.user;

      if (user) {
        const { data: perfil, error: perfilError } = await supabase.from("usuarios").select("nombre,rol").eq("id_usuario",user.id).single();

        if (perfilError) {
          console.log(perfilError);
        } else {
          setUserData({
            email: user?.email,
            nombre: perfil?.nombre,
            rol: perfil?.rol,
          });
        }
      }
    }

    fetchUser();
  }, [])

  const ProfileItem = ({ icon, label, value, iconColor = "#6B7280", bgColor = "bg-gray-50" }: any) => (
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
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-green-600">
      <Text className="text-3xl text-white p-5 font-ibm-condensed-bold">
        Configuracion
      </Text>
      <ScrollView
        className="bg-white pt-5"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text className="font-ibm-condensed-bold text-3xl text-gray-800">
            Mi Perfil
          </Text>
          <Text className="text-gray-500 mt-1">
            Información de la cuenta
          </Text>
        </View>

        <View className="flex-1 px-6 py-6">
          {/* Avatar Section */}
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

          {/* Profile Information */}
          <View className="mb-6">
            <ProfileItem
              icon={<FontAwesome name="user" size={24} color="#10B981" />}
              label="Nombre Completo"
              value={userData?.nombre || "Cargando..."}
              bgColor="bg-green-50"
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
            />
          </View>

          {/* Actions Section */}
          <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <View className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <Text className="font-ibm-condensed-bold text-lg text-gray-700">
                Acciones
              </Text>
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
                <Text className="text-gray-500 text-sm">
                  Salir de la aplicación
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View className="mt-8 items-center">
            <Text className="text-gray-400 text-sm">
              Versión 1.0.0
            </Text>
            <Text className="text-gray-400 text-xs mt-1">
              © {new Date().getFullYear()} Aplicacion creada por Neurovix
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}