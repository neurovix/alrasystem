import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Configuracion() {
  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView>
      <Text>Configuracion</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Cerrar Sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
