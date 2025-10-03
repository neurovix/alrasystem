import icons from "@/constants/icons";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from 'expo-file-system/legacy';
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Retorno() {
  const [permission, requestPermission] = useCameraPermissions();

  const [loading, setLoading] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  const [peso, setPeso] = useState<number>(0);

  const [showCamera, setShowCamera] = useState(false);

  const [photos, setPhotos] = useState<(string | null)[]>(Array(6).fill(null));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [lotes, setLotes] = useState<any[]>([]);
  const [selectedLote, setSelectedLote] = useState("");

  const [userId, setUserId] = useState<any>(null);
  const [material, setMaterial] = useState<number | any>(0);

  const [clientes, setClientes] = useState<any[]>([]);
  const [selectedCliente, setSelectedCliente] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // Traer lotes activos
      const { data: loteData, error: loteError } = await supabase
        .from("lotes")
        .select("id_lote,nombre_lote,peso_final_kg,id_material,id_cliente")
        .not("estado_actual", "in", "(Finalizado,Retorno,Recibido,Venta)");

      if (loteError) {
        Alert.alert("Error", "Error al obtener los lotes: " + loteError.message);
        return;
      }

      setLotes(loteData || []);

      if (selectedLote) {
        setMaterial(selectedLote.id_material);
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!userError) {
        setUserId(userData.user.id);
      }

      const { data: clientsData, error: clientsError } = await supabase.from("clientes")
        .select("id_cliente,empresa");

      if (clientsError) {
        Alert.alert("Error", "Error al obtener los clientes");
        return;
      }

      setClientes(clientsData);
    };

    fetchData();
  }, [selectedLote]);

  const takePicture = async () => {
    if (cameraRef.current && activeIndex !== null) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5, // Compress image to 50% quality
        base64: false, // Avoid base64 in capture to save memory
      });
      setPhotos((prev) => {
        const newPhotos = [...prev];
        newPhotos[activeIndex] = photo?.uri || "";
        return newPhotos;
      });
      setShowCamera(false);
      setActiveIndex(null);
    }
  };

  const handleSave = async () => {
    const { error: updateError } = await supabase.from("lotes")
      .update({
        estado_actual: "Finalizado",
        peso_final_kg: peso,
      })
      .eq("id_lote", selectedLote?.id_lote);

    if (updateError) {
      Alert.alert("Error", "Error al actualizar el estado del lote");
      throw updateError;
    }

    const { data: processData, error: insertError } = await supabase.from("procesos")
      .insert({
        id_lote: selectedLote?.id_lote,
        tipo_proceso: "Retorno",
        peso_salida_kg: peso,
        merma_kg: null,
        fecha_proceso: new Date().toISOString(),
        id_cliente: selectedLote?.id_cliente,
        created_by: userId,
      })
      .select("id_proceso")
      .single();

    const lastProcessId = processData?.id_proceso;

    if (insertError) {
      console.log("❌ Error insertando proceso:", insertError);
      Alert.alert("Error", "No se pudo guardar el proceso: " + insertError.message);
      return;
    }

    const { error: historialError } = await supabase.from("inventario_movimientos")
      .insert({
        id_material: material,
        cantidad_kg: peso,
        tipo_movimiento: "Salida",
        fecha: new Date().toISOString(),
        id_lote: selectedLote?.id_lote,
        created_by: userId,
      })

    if (historialError) {
      Alert.alert("Error al insertar el movimiento en el historial");
      return;
    }

    const { data: materialData, error: matError } = await supabase.from("materiales")
      .select("cantidad_disponible_kg")
      .eq("id_material", selectedLote?.id_material)
      .single();

    const cantidadMaterial = materialData?.cantidad_disponible_kg;

    const { error: materialError } = await supabase.from("materiales")
      .update({
        cantidad_disponible_kg: Number(cantidadMaterial) - peso,
      })
      .eq("id_material", selectedLote?.id_material);

    if (materialError) {
      Alert.alert("Error", "Error al actualizar la cantidad de material");
      return;
    }

    try {
      setLoading(true);

      const fotosValidas = photos.filter((photo) => photo !== null && photo !== "");
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      for (let i = 0; i < fotosValidas.length; i++) {
        await delay(500);
        const photoUri = fotosValidas[i];
        if (!photoUri) continue;

        try {
          console.log(`Iniciando subida de foto ${i + 1}, URI: ${photoUri}`);
          const fileInfo = await FileSystem.getInfoAsync(photoUri);
          if (!fileInfo.exists) {
            console.log(`❌ Archivo no encontrado: ${photoUri}`);
            continue;
          }
          if (fileInfo.size > 10 * 1024 * 1024) {
            console.log(`❌ Foto ${i + 1} excede el tamaño máximo (10MB)`);
            Alert.alert("Error", `La foto ${i + 1} es demasiado grande.`);
            continue;
          }

          // Read file as base64
          const base64 = await FileSystem.readAsStringAsync(photoUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Convert base64 to ArrayBuffer
          const binary = atob(base64);
          const arrayBuffer = new Uint8Array(binary.length);
          for (let j = 0; j < binary.length; j++) {
            arrayBuffer[j] = binary.charCodeAt(j);
          }

          const fileExt = photoUri.split(".").pop()?.toLowerCase() || "jpg";
          const contentType = fileExt === "png" ? "image/png" : "image/jpeg";
          const filePath = `lotes/${selectedLote.id_lote}/${lastProcessId}/foto_${i + 1}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("lotes")
            .upload(filePath, arrayBuffer, {
              cacheControl: "3600",
              upsert: true,
              contentType,
            });

          if (uploadError) {
            console.log(`❌ Error subiendo foto ${i + 1}:`, uploadError);
            continue;
          }

          const { data: publicUrlData } = supabase.storage
            .from("lotes")
            .getPublicUrl(filePath);

          const publicUrl = publicUrlData.publicUrl;

          const { error: insertFotoError } = await supabase.from("fotos").insert({
            id_lote: selectedLote.id_lote,
            id_proceso: lastProcessId,
            url_foto: publicUrl,
          });

          if (insertFotoError) {
            console.log(`❌ Error insertando foto ${i + 1}:`, insertFotoError);
          }

          // Clean up local file
          await FileSystem.deleteAsync(photoUri, { idempotent: true });
          console.log(`✅ Foto ${i + 1} subida y archivo local eliminado`);
        } catch (err) {
          console.log(`❌ Error procesando foto ${i + 1}:`, err);
        }
      }

      Alert.alert("Éxito", "✅ Retorno a planta guardado correctamente");
      await reFetch();
      router.push("/(tabs)/(root)");
    } catch (err) {
      console.log("❌ Error inesperado:", err);
      Alert.alert("Error", "Error inesperado: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const reFetch = async () => {
    try {
      setPeso(0);
      setSelectedLote("");
      setPhotos(Array(6).fill(null));
      setSelectedCliente("");

      const fetchData = async () => {
        const { data: loteData } = await supabase.from("lotes")
          .select("id_lote,nombre_lote,peso_final_kg,id_material,id_cliente")
          .not("estado_actual", "in", "(Finalizado,Recibido,Retorno,Venta)");

        setLotes(loteData || []);
      };
    } catch (err) {
      console.log("❌ Error en reFetch:", err);
    }
  };

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex flex-row items-center px-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={40} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
          Retorno a planta
        </Text>
      </View>

      {/* 🔑 Manejo de permisos sin cortar hooks */}
      {!permission ? (
        <View className="flex-1 items-center justify-center">
          <Text>Cargando permisos...</Text>
        </View>
      ) : !permission.granted ? (
        <View className="flex-1 items-center justify-center">
          <Text style={{ textAlign: "center", marginBottom: 10 }}>
            Necesitamos permiso para usar la cámara
          </Text>
          <Button onPress={requestPermission} title="Dar permiso" />
        </View>
      ) : showCamera ? (
        <View style={{ flex: 1 }}>
          <CameraView style={{ flex: 1 }} ref={cameraRef}>
            <View style={styles.shutterContainer}>
              <TouchableOpacity className="mb-5" style={styles.shutterBtn} onPress={takePicture}>
                <View style={styles.shutterBtnInner} />
              </TouchableOpacity>
              <View className="mb-8">
                <Button color={"#dc2626"} title="Cancelar" onPress={() => setShowCamera(false)} />
              </View>
            </View>
          </CameraView>
        </View>
      ) : (
        <ScrollView
          className="bg-white px-5 pt-5"
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          <Text className="text-2xl font-ibm-devanagari-bold">Selecciona un lote</Text>
          <View className="border-2 border-black rounded-xl mt-2">
            <Picker
              selectedValue={selectedLote?.id_lote || ""}
              onValueChange={(itemValue) => {
                const loteObj = lotes.find((l) => l.id_lote === itemValue);
                setSelectedLote(loteObj || null);
              }}
              style={Platform.OS === "ios" ? styles.pickerIOS : styles.picker}
            >
              <Picker.Item label="Selecciona un lote" value="" />
              {lotes.map((lote) => (
                <Picker.Item
                  key={lote.id_lote}
                  label={lote.nombre_lote}
                  value={lote.id_lote}
                />
              ))}
            </Picker>
          </View>

          <Text className="mt-3 pb-1 text-2xl font-ibm-devanagari-bold">
            Peso de salida
          </Text>

          <View className="flex flex-row w-full pb-5">
            <TextInput
              className="border-2 w-full py-4 px-2 border-black rounded-lg"
              placeholder="Ingresa el peso"
              keyboardType="number-pad"
              value={String(peso)}
              onChangeText={(text) => setPeso(Number(text) || 0)}
            />
          </View>

          <View>
            <Text className="font-ibm-devanagari-bold text-2xl">Selecciona un cliente</Text>
            <View className="border-2 border-black rounded-lg">
              <Picker
                selectedValue={selectedCliente?.id_cliente || ""}
                onValueChange={(itemValue) => {
                  const clienteObj = clientes.find((c) => c.id_cliente === itemValue);
                  setSelectedCliente(clienteObj || null);
                }}
                style={Platform.OS === "ios" ? styles.pickerIOS : styles.picker}
              >
                <Picker.Item label="Selecciona un cliente" value="" />
                {clientes.map((cliente) => (
                  <Picker.Item
                    key={cliente.id_cliente}
                    label={cliente.empresa}
                    value={cliente.id_cliente}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <Text className="mt-5 text-2xl font-ibm-devanagari-bold">Fotos</Text>
          <View className="flex flex-row flex-wrap w-full mt-3 justify-center">
            {photos.map((uri, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setActiveIndex(index);
                  setShowCamera(true);
                }}
                className="w-44 h-44 bg-green-200 rounded-xl border-4 border-dashed border-green-600 flex items-center justify-center m-2"
              >
                {uri ? (
                  <Image
                    source={{ uri }}
                    style={{ width: "100%", height: "100%", borderRadius: 12 }}
                  />
                ) : (
                  <Image source={icons.camera} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex flex-row w-full mt-5 justify-center">
            <TouchableOpacity
              className="w-1/2 items-center"
              onPress={() => router.back()}
            >
              <View className="w-[95%] flex items-center border-2 py-2 rounded-xl border-black">
                <Text className="font-ibm-condensed-bold text-2xl">
                  Cancelar
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} className="w-1/2 items-center">
              <View className="w-[95%] flex items-center border-2 border-black bg-green-500 py-2 rounded-xl">
                <Text className="text-2xl font-ibm-condensed-bold">
                  Guardar
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-3 text-xl">Guardando...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    width: "100%",
    alignItems: "center",
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "white",
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  pickerIOS: {
    height: 200,
    fontSize: 16,
  },
});
