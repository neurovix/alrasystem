import icons from "@/constants/icons";
import { supabase } from "@/lib/supabase";
import { Picker } from "@react-native-picker/picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import CheckBox from "expo-checkbox";
import * as FileSystem from 'expo-file-system/legacy';
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Add() {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [lastLoteId, setLastLoteId] = useState<number | null>(null);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedCliente, setSelectedCliente] = useState("");
  const [peso, setPeso] = useState<string>("");
  const cameraRef = useRef<CameraView>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [checkedVenta, setCheckedVenta] = useState<boolean>(false);
  const [checkedMaquila, setCheckedMaquila] = useState<boolean>(false);
  const [checkedSublote, setCheckedSublote] = useState<boolean>(false);
  const [userId, setUserId] = useState<any>(null);
  const [photos, setPhotos] = useState<(string | null)[]>(Array(6).fill(null));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [numeroDeSublotes, setNumeroDeSublotes] = useState<string>("");
  const [checkedPesosDiferentes, setCheckedPesosDiferentes] = useState<boolean>(false);
  const [checkedPesosIguales, setCheckedPesosIguales] = useState<boolean>(false);
  const [sublotes, setSublotes] = useState([{}]);

  useEffect(() => {
    const num = parseInt(numeroDeSublotes);
    if (checkedPesosDiferentes && num > 0) {
      const nuevos = Array.from({ length: num }, (_, i) => ({
        numero: i + 1,
        peso: "",
      }));
      setSublotes(nuevos);
    } else {
      setSublotes([]);
    }
  }, [numeroDeSublotes, checkedPesosDiferentes]);

  const handlePesoChange = (index: any, value: any) => {
    const nuevos = [...sublotes];
    nuevos[index].peso = value;
    setSublotes(nuevos);
  };

  const takePicture = async () => {
    if (cameraRef.current && activeIndex !== null) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
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

  const toggleVenta = () => setCheckedVenta(!checkedVenta);
  const toggleMaquila = () => setCheckedMaquila(!checkedMaquila);

  const toggleSublote = () => setCheckedSublote(!checkedSublote);

  const togglePesosDiferentes = () => {
    setCheckedPesosDiferentes(!checkedPesosDiferentes);
    setCheckedPesosIguales(false);
  };

  const togglePesosIguales = () => {
    setCheckedPesosIguales(!checkedPesosIguales);
    setCheckedPesosDiferentes(false);
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const { data: lotesData, error: lotesError } = await supabase
            .from("lotes")
            .select("id_lote")
            .order("id_lote", { ascending: false })
            .limit(1);

          if (lotesError) {
            console.log("❌ Error obteniendo último lote:", lotesError);
            setLastLoteId(1);
          } else if (lotesData && lotesData.length > 0) {
            setLastLoteId(lotesData[0].id_lote + 1);
          } else {
            setLastLoteId(1);
          }

          const { data: materialesData } = await supabase
            .from("materiales")
            .select("id_material, nombre_material");

          setMateriales(materialesData || []);

          const { data: clientesData } = await supabase
            .from("clientes")
            .select("id_cliente, nombre_cliente, empresa");
          setClientes(clientesData || []);

          const { data, error } = await supabase.auth.getUser();
          if (error) throw error;

          setUserId(data.user.id);
        } catch (err) {
          console.log("❌ Error inesperado:", err);
        }
      };

      fetchData();
    }, [])
  );

  const reFetch = async () => {
    try {
      setSelectedMaterial("");
      setSelectedCliente("");
      setPeso("");
      setCheckedVenta(false);
      setCheckedMaquila(false);
      setPhotos(Array(6).fill(null));
      setActiveIndex(null);
      setCheckedSublote(false);
      setNumeroDeSublotes("0");

      const { data: lotesData, error: lotesError } = await supabase
        .from("lotes")
        .select("id_lote")
        .order("id_lote", { ascending: false })
        .limit(1);

      if (lotesError) {
        console.log("❌ Error obteniendo último lote:", lotesError);
        setLastLoteId(1);
      } else if (lotesData && lotesData.length > 0) {
        setLastLoteId(lotesData[0].id_lote + 1);
      } else {
        setLastLoteId(1);
      }
    } catch (err) {
      console.log("❌ Error en reFetch:", err);
      setLastLoteId(1);
    }
  };

  const handleSave = async () => {
    try {
      if (!lastLoteId) {
        Alert.alert("Error", "No se pudo obtener el ID del lote");
        return;
      }
      if (!selectedMaterial) {
        Alert.alert("Error", "Por favor selecciona un material");
        return;
      }
      if (!selectedCliente) {
        Alert.alert("Error", "Por favor selecciona un cliente");
        return;
      }
      if (!checkedVenta && !checkedMaquila) {
        Alert.alert("Error", "Por favor selecciona un tipo de proceso");
        return;
      }

      setLoading(true);
      const pesoNumerico = parseFloat(peso);

      if (checkedSublote && (!numeroDeSublotes || isNaN(parseInt(numeroDeSublotes)) || parseInt(numeroDeSublotes) <= 0)) {
        Alert.alert("Error", "Por favor ingresa un número de sublotes válido");
        return;
      }

      const numeroSublotes = parseInt(numeroDeSublotes) || null;

      const { error: insertError } = await supabase.from("lotes").insert({
        id_lote: lastLoteId,
        nombre_lote: `LT-${lastLoteId}`,
        id_material: selectedMaterial,
        peso_entrada_kg: pesoNumerico,
        fecha_recibido: new Date().toISOString(),
        id_cliente: selectedCliente,
        tipo_proceso: checkedVenta ? "Venta" : "Maquila",
        estado_actual: "Recibido",
        peso_final_kg: null,
        created_by: userId,
        numero_de_sublotes: checkedSublote ? numeroSublotes : 0,
      });

      if (insertError) {
        console.log("❌ Error insertando lote:", insertError);
        Alert.alert("Error", "No se pudo guardar el lote: " + insertError.message);
        return;
      }

      if (checkedSublote) {
        const numSublotes = parseInt(numeroDeSublotes);
        const pesoNumerico = parseFloat(peso);

        if (!numSublotes || numSublotes <= 0) {
          Alert.alert("Error", "Número de sublotes inválido");
          return;
        }

        let sublotesAInsertar: any[] = [];

        if (checkedPesosDiferentes) {
          sublotesAInsertar = sublotes.map((sub) => ({
            id_lote: lastLoteId,
            nombre_sublote: `SL-${sub.numero}`,
            peso_sublote_kg: parseFloat(sub.peso) || 0,
            fecha_creado: new Date().toISOString(),
            estado_actual: "Recibido",
            created_by: userId,
          }));
        } else if (checkedPesosIguales) {
          const pesoPorSublote = pesoNumerico / numSublotes;

          sublotesAInsertar = Array.from({ length: numSublotes }, (_, i) => ({
            id_lote: lastLoteId,
            nombre_sublote: `SL-${i + 1}`,
            peso_sublote_kg: pesoPorSublote,
            fecha_creado: new Date().toISOString(),
            estado_actual: "Recibido",
            created_by: userId,
          }));
        }

        const { error: sublotesError } = await supabase
          .from("sublotes")
          .insert(sublotesAInsertar);

        if (sublotesError) {
          console.log("❌ Error insertando sublotes:", sublotesError);
          Alert.alert("Error", "No se pudieron guardar los sublotes");
          return;
        }
      }


      const { data: procesoData, error: procesoError } = await supabase
        .from("procesos")
        .insert({
          id_lote: lastLoteId,
          tipo_proceso: "Recibido",
          peso_salida_kg: pesoNumerico,
          merma_kg: null,
          fecha_proceso: new Date().toISOString(),
          id_cliente: selectedCliente,
          created_by: userId,
        })
        .select("id_proceso")
        .single();

      const lastProcessId = procesoData?.id_proceso;

      if (procesoError) {
        console.log("❌ Error insertando proceso:", procesoError);
        Alert.alert("Error", "No se pudo guardar el proceso: " + procesoError.message);
        return;
      }

      const { error: historialError } = await supabase.from("inventario_movimientos")
        .insert({
          id_material: selectedMaterial,
          cantidad_kg: pesoNumerico,
          tipo_movimiento: "Entrada",
          fecha: new Date().toISOString(),
          id_lote: lastLoteId,
          created_by: userId,
        });

      if (historialError) {
        console.log("❌ Error insertando movimiento:", historialError);
        Alert.alert("Error", "No se pudo guardar el movimiento: " + historialError.message);
        return;
      }

      const { data: materialData, error: matError } = await supabase.from("materiales")
        .select("cantidad_disponible_kg")
        .eq("id_material", selectedMaterial)
        .single();

      const materialDisponible = materialData?.cantidad_disponible_kg;

      const { error: materialError } = await supabase.from("materiales")
        .update({
          cantidad_disponible_kg: Number(materialDisponible) + pesoNumerico,
        })
        .eq("id_material", selectedMaterial)

      if (materialError) {
        console.log("❌ Error actualizando cantidad de material:", materialError);
        Alert.alert("Error", "No se pudo actualizar el inventario");
        return;
      }

      /*
        const _ = await fetch(`https://n8n.srv1034345.hstgr.cloud/webhook/fcb03570-1335-4d18-a8e3-824ef86d3ef9?id_lote=${lastLoteId}`, {
          method: "POST",
        });
      */

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
          const filePath = `lotes/${lastLoteId}/${lastProcessId}/foto_${i + 1}.${fileExt}`;

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
            id_lote: lastLoteId,
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

      Alert.alert("Éxito", "✅ Lote guardado exitosamente");
      await reFetch();
      router.push("/(tabs)/(root)");
    } catch (err) {
      console.log("❌ Error inesperado:", err);
      Alert.alert("Error", "Error inesperado: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
        Nuevo lote
      </Text>
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
          <CameraView style={{ flex: 1 }} ref={cameraRef} />
          <View style={styles.shutterContainer}>
            <TouchableOpacity
              className="mb-5"
              style={styles.shutterBtn}
              onPress={takePicture}
            >
              <View style={styles.shutterBtnInner} />
            </TouchableOpacity>
            <View className="mb-8">
              <Button
                color={"#dc2626"}
                title="Cancelar"
                onPress={() => setShowCamera(false)}
              />
            </View>
          </View>
        </View>
      ) : (
        <ScrollView
          className="bg-white px-5 pt-5"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="flex flex-row justify-between">
            <Text className="text-2xl font-ibm-devanagari-bold">Detalles</Text>
            <Text className="text-2xl">ID: {lastLoteId ? `LT-${lastLoteId}` : "Cargando..."}</Text>
          </View>
          <Text className="mt-5 text-2xl font-ibm-devanagari-bold">Tipo</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedMaterial}
              onValueChange={(itemValue) => setSelectedMaterial(itemValue)}
              style={Platform.OS === "ios" ? styles.pickerIOS : styles.picker}
            >
              <Picker.Item label="Selecciona un material" value="" />
              {materiales.map((mat) => (
                <Picker.Item
                  key={mat.id_material}
                  label={mat.nombre_material}
                  value={mat.id_material}
                />
              ))}
            </Picker>
          </View>
          <Text className="mt-3 pb-1 text-2xl font-ibm-devanagari-bold">
            Peso de entrada
          </Text>
          <View className="flex flex-row w-full pb-5">
            <TextInput
              className="border-2 w-full py-4 px-2 border-black rounded-lg"
              placeholder="Ingresa el peso"
              keyboardType="numeric"
              value={peso}
              onChangeText={setPeso}
            />
          </View>
          <View className="flex flex-row w-full mb-4">
            <TouchableOpacity
              onPress={toggleSublote}
              className="flex flex-row justify-center items-center"
              activeOpacity={0.7}
            >
              <Text
                className={
                  checkedSublote
                    ? `ml-2 rounded-lg py-3 w-full text-center bg-green-800 text-white text-xl font-ibm-condensed-regular`
                    : `ml-2 rounded-lg py-3 w-full text-center bg-green-600 text-white text-xl font-ibm-condensed-regular`
                }
              >
                Sublotes
              </Text>
            </TouchableOpacity>
          </View>
          {checkedSublote ? (
            <>
              <Text className="mt-3 pb-1 text-2xl font-ibm-devanagari-bold">
                Número de sublotes
              </Text>
              <View className="flex flex-row w-full pb-5">
                <TextInput
                  className="border-2 w-full py-4 px-2 border-black rounded-lg"
                  placeholder="Ingresa el número de sublotes"
                  keyboardType="numeric"
                  value={numeroDeSublotes}
                  onChangeText={setNumeroDeSublotes}
                />
              </View>

              <View className="flex flex-row w-full mb-5">
                <TouchableOpacity
                  onPress={togglePesosDiferentes}
                  className="flex flex-row justify-center w-1/2 items-center"
                  activeOpacity={0.7}
                >
                  <CheckBox
                    value={checkedPesosDiferentes}
                    onValueChange={setCheckedPesosDiferentes}
                  />
                  <Text className="ml-2 text-xl font-ibm-condensed-regular">
                    Pesos diferentes
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={togglePesosIguales}
                  className="flex flex-row justify-center w-1/2 items-center"
                  activeOpacity={0.7}
                >
                  <CheckBox
                    value={checkedPesosIguales}
                    onValueChange={setCheckedPesosIguales}
                  />
                  <Text className="ml-2 text-xl font-ibm-condensed-regular">
                    Pesos iguales
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          {checkedPesosDiferentes && sublotes.length > 0 && (
            <>
              {sublotes.map((sub, index) => (
                <View key={index} className="mb-4">
                  <Text className="text-2xl font-ibm-devanagari-bold">
                    Ingresa el peso del sublote #{sub.numero}
                  </Text>
                  <TextInput
                    className="border-2 w-full py-4 px-2 border-black rounded-lg"
                    placeholder={`Peso del sublote #${sub.numero}`}
                    keyboardType="numeric"
                    value={sub.peso}
                    onChangeText={(text) => handlePesoChange(index, text)}
                  />
                </View>
              ))}
            </>
          )}
          <Text className="text-2xl font-ibm-devanagari-bold">
            Cliente
          </Text>
          <View className="border-2 border-black rounded-lg">
            <Picker
              selectedValue={selectedCliente}
              onValueChange={(itemValue) => setSelectedCliente(itemValue)}
              style={Platform.OS === "ios" ? styles.pickerIOS : styles.picker}
            >
              <Picker.Item label="Selecciona un cliente" value="" />
              {clientes.map((cliente) => (
                <Picker.Item
                  key={cliente.id_cliente}
                  label={cliente.nombre_cliente}
                  value={cliente.id_cliente}
                />
              ))}
            </Picker>
          </View>
          <Text className="mt-5 text-2xl font-ibm-devanagari-bold">
            Proceso
          </Text>
          <View className="flex flex-row w-full">
            <TouchableOpacity
              onPress={toggleVenta}
              className="flex flex-row justify-center w-1/2 items-center"
              activeOpacity={0.7}
            >
              <CheckBox value={checkedVenta} onValueChange={setCheckedVenta} />
              <Text className="ml-2 text-xl font-ibm-condensed-regular">
                Venta
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleMaquila}
              className="flex flex-row justify-center w-1/2 items-center"
              activeOpacity={0.7}
            >
              <CheckBox
                value={checkedMaquila}
                onValueChange={setCheckedMaquila}
              />
              <Text className="ml-2 text-xl font-ibm-condensed-regular">
                Maquila
              </Text>
            </TouchableOpacity>
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
              onPress={reFetch}
            >
              <View className="w-[95%] flex items-center border-2 py-2 rounded-xl border-black">
                <Text className="font-ibm-condensed-bold text-2xl">
                  Cancelar
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="w-1/2 items-center" onPress={handleSave}>
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
