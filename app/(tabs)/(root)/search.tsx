import LoteBox from "@/components/ui/LoteBox";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Search() {
  const [loteData, setLoteData] = useState<any[]>([]);

  useEffect(() => {
    const fetchLotes = async () => {
      // 1️⃣ Traer lotes cuyo estado_actual sea distinto de "Finalizado"
      const { data, error } = await supabase
        .from("lotes")
        .select("id_lote, nombre_lote, estado_actual")
        .neq("estado_actual", "Finalizado"); // 👈 filtro directo en la query

      if (error) {
        console.log("Error cargando lotes:", error);
        return;
      }

      if (data && data.length > 0) {
        const lotes = data.map(item => ({
          id: item.id_lote,
          name: item.nombre_lote,
          status: "En proceso", // 👈 siempre en proceso si no es Finalizado
          etapa: item.estado_actual,
        }));
        setLoteData(lotes);
      }
    };

    fetchLotes();
  }, []);

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
