import LoteBox from "@/components/ui/LoteBox";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Search() {
  const [loteData, setLoteData] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchLotes = async () => {
        const { data, error } = await supabase
          .from("lotes")
          .select("id_lote, nombre_lote, estado_actual")
          .neq("estado_actual", "Finalizado");

        if (error) {
          console.log("Error cargando lotes:", error);
          return;
        }

        if (data) {
          const lotes = data.map(item => ({
            id: item.id_lote,
            name: item.nombre_lote,
            status: "En proceso",
            etapa: item.estado_actual,
          }));
          setLoteData(lotes);
        } else {
          setLoteData([]); // 👈 limpiar si no hay datos
        }
      };

      fetchLotes();
    }, [])
  );


  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
        Historial de lotes
      </Text>
      <ScrollView
        className="bg-white px-5 pt-2 h-full"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {loteData.length > 0 ? (
          loteData.map((item) => (
            <View key={item.id}>
              <LoteBox
                id={item.id}
                name={item.name}
                status={item.status}
                etapa={item.etapa}
              />
            </View>
          ))
        ) : (
          <Text className="text-center text-xl text-gray-500 mt-10">
            No hay lotes en proceso
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
