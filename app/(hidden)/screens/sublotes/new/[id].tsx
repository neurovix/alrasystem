import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NewSublote = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [idSublote, setIdSublote] = useState<number>(0);
  const [nombreSublote, setNombreSublote] = useState<string>("");

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const { count, error } = await supabase
          .from("sublotes")
          .select("*", { count: "exact", head: true })
          .eq("id_lote", id);

        if (error) {
          Alert.alert("Error", "No se pudo obtener el número de sublotes");
          return;
        }

        const nuevoNumero = (count ?? 0) + 1;
        setIdSublote(nuevoNumero);
        setNombreSublote(`SL-${nuevoNumero}`);
      };

      fetchData();
    }, [id])
  );

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex-row items-center px-5 pb-3 bg-green-600">
        <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full bg-green-500/20">
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl text-white font-ibm-condensed-bold ml-3 flex-1">
          {nombreSublote}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default NewSublote;
