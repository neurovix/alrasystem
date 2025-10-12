import LoteBox from "@/components/ui/LoteBox";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Search() {
  const [loteData, setLoteData] = useState<any[]>([]);
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useFocusEffect(
    useCallback(() => {
      const fetchLotes = async () => {
        const { data, error } = await supabase
          .from("lotes")
          .select("id_lote, nombre_lote, estado_actual")
          .neq("estado_actual", "Finalizado")
          .order("id_lote", {ascending: true});

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
          setLoteData([]);
        }
      };

      fetchLotes();
    }, [])
  );

  const handleSearch = async (id: string) => {
    if (!id.trim()) {
      setSearchResult(null);
      setSearchError("");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    const { data, error } = await supabase
      .from("lotes")
      .select("id_lote, nombre_lote, estado_actual")
      .eq("id_lote", id)
      .single();

    setIsSearching(false);

    if (error || !data) {
      setSearchError("No se encontró el lote");
      setSearchResult(null);
      return;
    }

    setSearchResult({
      id: data.id_lote,
      name: data.nombre_lote,
      status: data.estado_actual === "Finalizado" ? "Finalizado" : "En proceso",
      etapa: data.estado_actual,
    });
  };

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
        Historial de lotes
      </Text>
      <ScrollView
        className="bg-white px-5 pt-2 h-full"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-gray-700">
            Buscar lote por ID
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Ingresa el ID del lote"
            value={searchId}
            onChangeText={(text) => {
              setSearchId(text);
              handleSearch(text);
            }}
            keyboardType="numeric"
          />
          
          {isSearching && (
            <View className="mt-4 items-center">
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
          )}

          {searchError && !isSearching && (
            <Text className="text-red-500 text-center mt-4">
              {searchError}
            </Text>
          )}

          {searchResult && !isSearching && (
            <View className="mt-4">
              <LoteBox
                id={searchResult.id}
                name={searchResult.name}
                status={searchResult.status}
                etapa={searchResult.etapa}
              />
            </View>
          )}

          {!searchId && !isSearching && (
            <Text className="text-gray-400 text-center mt-4 text-sm">
              Ingresa un ID para buscar
            </Text>
          )}
        </View>

        <View className="border-t border-gray-200 pt-6">
          <Text className="text-lg font-semibold mb-4 text-gray-700">
            Lotes en proceso
          </Text>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}