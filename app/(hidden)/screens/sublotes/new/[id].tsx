import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NewSublote = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [idSublote, setIdSublote] = useState<number>(0);
  const [nombreSublote, setNombreSublote] = useState<string>("");
  const [selectedProceso, setSelectedProceso] = useState<string | any>(null);
  const [tipoProceso, setTipoProceso] = useState<string>("");
  const [peso, setPeso] = useState<number>(0);
  const [userId, setUserId] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const { count, error: countError } = await supabase
            .from("sublotes")
            .select("*", { count: "exact", head: true })
            .eq("id_lote", id);

          if (countError) throw countError;

          const nuevoNumero = (count ?? 0) + 1;
          setIdSublote(nuevoNumero);
          setNombreSublote(`SL-${nuevoNumero}`);

          const { data, error: tipoError } = await supabase
            .from("lotes")
            .select("tipo_proceso")
            .eq("id_lote", id)
            .single();

          if (tipoError) throw tipoError;

          setTipoProceso(data.tipo_proceso);

          const { data: dataUser, error } = await supabase.auth.getUser();

          if (error) {
            Alert.alert("Error", "No se pudo obtener la informacion del usuario");
            return;
          }

          setUserId(dataUser.user.id);
        } catch (err) {
          console.error(err);
          Alert.alert("Error", "No se pudo obtener la información del lote");
        }
      };

      fetchData();
    }, [id])
  );

  const handleSave = async () => {
    const { error: insertError } = await supabase.from("sublotes").insert({
      id_lote: id,
      nombre_sublote: nombreSublote,
      peso_sublote_kg: peso,
      fecha_creado: new Date().toISOString(),
      estado_actual: selectedProceso,
      created_by: userId
    });

    if (insertError) {
      Alert.alert("Error", "No se pudo guardar el sublote");
      return;
    }

    const _ = await fetch(`https://n8n.srv1034345.hstgr.cloud/webhook/acd61cff-f5a3-470a-821c-c1e9b08ba59a?id_lote=${id}&id_sublote=${idSublote}`, {
      method: "POST",
    });

    Alert.alert("Exito", "Sublote guardado correctamente");
    router.back();
  };

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex-row items-center px-5 pb-3 bg-green-600">
        <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full bg-green-500/20">
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl text-white font-ibm-condensed-bold ml-3 flex-1">
          LT-{id}/{nombreSublote}
        </Text>
      </View>

      <ScrollView className="bg-white w-full px-5">
        <Text className="text-2xl font-ibm-devanagari-bold mt-10">Ingresa el peso del sublote</Text>
        <TextInput
          className="border-2 w-full py-4 px-2 border-black rounded-lg"
          placeholder="Peso de sublote"
          onChangeText={(text) => setPeso(Number(text))}
        />

        <Text className="text-2xl font-ibm-devanagari-bold mt-5">
          Proceso actual del sublote
        </Text>
        <View className="border-2 border-black rounded-lg">
          <Picker
            selectedValue={selectedProceso}
            onValueChange={(itemValue) => setSelectedProceso(itemValue)}
            style={Platform.OS === "ios" ? styles.pickerIOS : styles.picker}
            itemStyle={{ color: "#000" }}
          >
            <Picker.Item label="Selecciona un proceso" value="" />
            <Picker.Item label="Recibido" value="Recibido" />
            <Picker.Item label="Molienda" value="Molienda" />
            <Picker.Item label="Peletizado" value="Peletizado" />
            <Picker.Item label={tipoProceso} value={tipoProceso} />
            <Picker.Item label="Finalizado" value="Finalizado" />
          </Picker>
        </View>
        <TouchableOpacity className="bg-green-600 w-full flex justify-center items-center mt-5 rounded-lg py-3" onPress={handleSave}>
          <Text className="text-white font-ibm-condensed-bold text-xl">Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  picker: {
    height: 60,
  },
  pickerIOS: {
    height: 200,
    fontSize: 16,
  },
});

export default NewSublote;
