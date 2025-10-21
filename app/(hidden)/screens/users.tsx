import UserBox from "@/components/ui/UserBox";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setLoading(true);

          const { data: usersData, error: usersError } = await supabase
            .from("usuarios")
            .select("id_usuario,nombre,rol,estatus")
            .order("estatus", {ascending: true});

          if (usersError) {
            Alert.alert("Error", "No se han podido obtener los usuarios");
            return;
          }

          setUsers(usersData || []);
        } catch (err) {
          Alert.alert("Error", "Ocurrió un error al obtener los usuarios");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex flex-row items-center px-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={40} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
          Usuarios
        </Text>
      </View>

      <ScrollView
        className="bg-white px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {loading ? (
          <View className="flex items-center justify-center mt-10">
            <ActivityIndicator size="large" color="#16a34a" />
            <Text className="mt-3 text-gray-500">Cargando usuarios...</Text>
          </View>
        ) : users.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10">
            No hay usuarios registrados.
          </Text>
        ) : (
          users.map((user: any) => (
            <UserBox
              key={user.id_usuario}
              id_usuario={user.id_usuario}
              nombre={user.nombre}
              rol={user.rol}
              estatus={user.estatus}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
