import ClientBox from "@/components/ui/ClientBox";
import { supabase } from "@/lib/supabase";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ListClient() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      const { data: clientList, error: clientError } = await supabase
        .from("clientes")
        .select("id_cliente,nombre_cliente,empresa").order("nombre_cliente", {ascending: true});

      if (clientError) {
        Alert.alert("Error", "No se pudieron obtener los clientes");
        return;
      }

      if (clientList) {
        setClients(clientList);
      }
    };

    fetchClients();
  }, [clients]);

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
        {clients.map((client) => (
          <ClientBox
            key={client.id_cliente}
            id={client.id_cliente}
            nombre={client.nombre_cliente}
            empresa={client.empresa}
          />
        ))}

        <View className="w-full flex items-end mt-3">
          <TouchableOpacity
            onPress={() => router.navigate("/screens/clients/newClient")}
            className="bg-green-600 px-8 py-7 rounded-full"
          >
            <FontAwesome6 name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

