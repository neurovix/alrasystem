import icons from "@/constants/icons";
import { supabase } from "@/lib/supabase";
import { Picker } from "@react-native-picker/picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import CheckBox from "expo-checkbox";
import * as FileSystem from 'expo-file-system/legacy';
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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

  const [lastLoteId, setLastLoteId] = useState<number | null>(null);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedCliente, setSelectedCliente] = useState("");
  const [peso, setPeso] = useState<number | any>(0);

  const cameraRef = useRef<CameraView>(null);

  const [showCamera, setShowCamera] = useState(false);

  const [checkedVenta, setCheckedVenta] = useState<boolean>(false);
  const [checkedMaquila, setCheckedMaquila] = useState<boolean>(false);

  const [userId, setUserId] = useState<any>(null);

  const [photos, setPhotos] = useState<(string)[]>(Array(6).fill(null));

  console.log(photos);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const takePicture = async () => {
    if (cameraRef.current && activeIndex !== null) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotos((prev) => {
        const newPhotos = [...prev];
        newPhotos[activeIndex] = photo?.uri || null;
        return newPhotos;
      });
      setShowCamera(false);
      setActiveIndex(null);
    }
  };

  const toggleVenta = () => setCheckedVenta(!checkedVenta);
  const toggleMaquila = () => setCheckedMaquila(!checkedMaquila);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: lotesData, error: lotesError } = await supabase
          .from("lotes")
          .select("id_lote")
          .order("id_lote", { ascending: false })
          .limit(1);

        if (lotesError) {
          console.log("❌ Error obteniendo último lote:", lotesError);
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
  }, []);

  const reFetch = async () => {
    try {
      // Limpiar campos
      setSelectedMaterial("");
      setSelectedCliente("");
      setPeso(0);
      setCheckedVenta(false);
      setCheckedMaquila(false);
      setPhotos(Array(6).fill(null));
      setActiveIndex(null);

      // Obtener el último id_lote de la base de datos
      const { data: lotesData, error: lotesError } = await supabase
        .from("lotes")
        .select("id_lote")
        .order("id_lote", { ascending: false })
        .limit(1);

      if (lotesError) {
        console.log("❌ Error obteniendo último lote:", lotesError);
        setLastLoteId(1); // fallback
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


  function base64ToArrayBuffer(base64: any) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  const handleSave = async () => {
    try {
      if (!lastLoteId) return;

      // 1️⃣ Insertar lote en BD
      const { error: insertError } = await supabase.from("lotes").insert({
        id_lote: lastLoteId,
        nombre_lote: `LT-${lastLoteId}`,
        id_material: selectedMaterial,
        peso_entrada_kg: peso,
        fecha_recibido: new Date().toISOString(),
        id_cliente: selectedCliente,
        tipo_proceso: checkedVenta ? "Venta" : checkedMaquila ? "Maquila" : "Venta",
        estado_actual: "Recibido",
        peso_final_kg: peso,
        created_by: userId,
      });

      if (insertError) {
        console.log("❌ Error insertando lote", insertError);
        return;
      }

      const { data: procesoData, error: procesoError } = await supabase
        .from("procesos")
        .insert({
          id_lote: lastLoteId,
          tipo_proceso: "Recibido",
          peso_salida_kg: peso,
          merma_kg: null,
          fecha_proceso: new Date().toISOString(),
          id_cliente: selectedCliente,
          created_by: userId,
        })
        .select("id_proceso")
        .single();

      if (procesoError) {
        console.log("❌ Error insertando proceso Recibido", procesoError);
        return;
      }

      const idProcesoRecibido = procesoData.id_proceso;

      const { error: historialError } = await supabase.from("inventario_movimientos")
        .insert({
          id_material: selectedMaterial,
          cantidad_kg: peso,
          tipo_movimiento: "Entrada",
          fecha: new Date().toISOString(),
          id_lote: lastLoteId,
          created_by: userId,
        })

      if (historialError) {
        console.log("Error insertando los movimientos en el historial ", historialError)
        return;
      }

      // 3️⃣ Subir fotos + insertar en tabla fotos
      for (let i = 0; i < photos.length; i++) {
        if (!photos[i]) continue;

        try {
          // Leer archivo como Base64 usando la API legacy
          const base64 = await FileSystem.readAsStringAsync(photos[i], {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Convertir Base64 a ArrayBuffer para Supabase
          const arrayBuffer = Uint8Array.from(
            atob(base64),
            c => c.charCodeAt(0)
          );

          const fileExt = photos[i].split(".").pop() || "jpg";
          const filePath = `lotes/${lastLoteId}/${idProcesoRecibido}/foto_${i + 1}.${fileExt}`;

          // Subir al Storage
          const { error: uploadError } = await supabase.storage
            .from("lotes")
            .upload(filePath, arrayBuffer, {
              cacheControl: "3600",
              upsert: true,
              contentType: "image/jpeg",
            });

          if (uploadError) {
            console.log("❌ Error subiendo foto", i + 1, uploadError);
            continue;
          }

          // Obtener URL pública
          const { data: publicUrlData } = supabase.storage
            .from("lotes")
            .getPublicUrl(filePath);

          const publicUrl = publicUrlData.publicUrl;

          // Insertar en tabla fotos
          const { error: insertFotoError } = await supabase.from("fotos").insert({
            id_lote: lastLoteId,
            id_proceso: idProcesoRecibido,
            url_foto: publicUrl,
          });

          if (insertFotoError) console.log("❌ Error insertando foto", i + 1, insertFotoError);

        } catch (err) {
          console.log("❌ Error procesando archivo", i + 1, err);
        }
      }



      Alert.alert("✅ Lote, proceso Recibido y fotos guardadas correctamente");

      router.push("/(tabs)/(root)");
    } catch (err) {
      console.log("❌ Error inesperado:", err);
    }
  };

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
        Nuevo lote
      </Text>

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
              keyboardType="number-pad"
              onChangeText={(text) => setPeso(text)}
            />
          </View>

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
    height: 200, // <-- ajusta este valor a lo que prefieras
    fontSize: 16, // opcional
  },
});
