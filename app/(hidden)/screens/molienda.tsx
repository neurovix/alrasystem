import icons from "@/constants/icons";
import { supabase } from "@/lib/supabase";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from "@react-native-picker/picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from 'expo-file-system/legacy';
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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

export default function Molienda() {
  const { id_lote, id_sublote } = useLocalSearchParams<{ id_lote: string; id_sublote?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [peso, setPeso] = useState<number>(0);
  const [merma, setMerma] = useState<number>(0);
  const cameraRef = useRef<CameraView>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [photos, setPhotos] = useState<(string | null)[]>(Array(6).fill(null));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [lotes, setLotes] = useState<any[]>([]);
  const [selectedLote, setSelectedLote] = useState<any>(null);
  const [userId, setUserId] = useState<any>(null);
  const [material, setMaterial] = useState<number | any>(0);
  const [sublotes, setSublotes] = useState<any[]>([]);
  const [selectedSublote, setSelectedSublote] = useState<any>(null);
  const [tieneSublotes, setTieneSublotes] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const { data: loteData } = await supabase.from("lotes")
          .select("id_lote,nombre_lote,peso_entrada_kg,id_material,id_cliente,numero_de_sublotes")
          .not("estado_actual", "in", "(Finalizado,Molienda,Peletizado)");

        setLotes(loteData || []);

        if (selectedLote) {
          setMaterial(selectedLote.id_material);
        }

        const { data, error } = await supabase.auth.getUser();

        if (error) throw error;

        setUserId(data.user.id);
      };

      if (selectedLote && selectedSublote && peso > 0) {
        setMerma(Number(selectedSublote?.peso_sublote_kg) - peso);
      } else if (selectedLote && peso > 0) {
        setMerma(Number(selectedLote?.peso_entrada_kg) - peso);
      } else {
        setMerma(0);
      }

      fetchData();
    }, [selectedLote, peso])
  );

  const autoSelectLote = useCallback(async () => {
    if (id_lote && lotes.length > 0 && !selectedLote) {
      const id = parseInt(id_lote as string);
      const loteObj = lotes.find((l: any) => l.id_lote === id);

      if (loteObj) {
        setSelectedLote(loteObj);
        await handleLoteChange(loteObj.id_lote);

        if (id_sublote) {
          const subId = parseInt(id_sublote as string);
          const interval = setInterval(() => {
            setSublotes((currentSublotes) => {
              const subObj = currentSublotes.find((s: any) => s.id_sublote === subId);
              if (subObj) {
                setSelectedSublote(subObj);
                clearInterval(interval);
              }
              return currentSublotes;
            });
          }, 300);
        }
      }
    }
  }, [lotes, id_lote, id_sublote, selectedLote]);

  const handleSave = async () => {
    const { data: processData, error: insertError } = await supabase
      .from("procesos")
      .insert({
        id_lote: selectedLote?.id_lote,
        id_sublote: tieneSublotes ? selectedSublote?.id_sublote : null,
        tipo_proceso: "Molienda",
        peso_salida_kg: peso,
        merma_kg: merma,
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
        id_sublote: tieneSublotes ? selectedSublote?.id_sublote : null,
      })

    if (historialError) {
      Alert.alert("Error al insertar el movimiento en el historial" + historialError);
      console.log(historialError);
      return;
    }

    if (!tieneSublotes) {
      await supabase
        .from("lotes")
        .update({ estado_actual: "Molienda" })
        .eq("id_lote", selectedLote.id_lote);
    } else {
      const { data: sublotesData, error: subError } = await supabase
        .from("sublotes")
        .select("id_sublote, estado_actual")
        .eq("id_lote", selectedLote.id_lote);

      if (subError) {
        console.log("Error al traer sublotes:", subError);
        return;
      }

      const sublotesPendientes = sublotesData?.filter(
        (s: any) => s.estado_actual !== "Molienda" && s.estado_actual !== "Finalizado"
      );

      if (sublotesPendientes && sublotesPendientes.length === 1) {
        await supabase
          .from("lotes")
          .update({ estado_actual: "Molienda" })
          .eq("id_lote", selectedLote.id_lote);
      }

      const { error: sublotesUpdateError } = await supabase.from("sublotes")
        .update({
          estado_actual: "Molienda",
        })
        .eq("id_sublote", selectedSublote.id_sublote);

      if (sublotesUpdateError) {
        Alert.alert("Error", "Error al actualizar los sublotes");
        return;
      }
    }

    const { data: materialData, error: matError } = await supabase.from("materiales")
      .select("cantidad_disponible_kg")
      .eq("id_material", selectedLote?.id_material)
      .single();

    if (matError) {
      console.log("Mat error:", matError);
      return;
    }

    const cantidadMaterial = materialData?.cantidad_disponible_kg;

    if (!cantidadMaterial || isNaN(merma)) {
      console.log("❌ Datos inválidos para actualizar material:", { cantidadMaterial, merma });
      return;
    }

    const { error: materialError } = await supabase.from("materiales")
      .update({
        cantidad_disponible_kg: Number(cantidadMaterial) - merma,
      })
      .eq("id_material", selectedLote?.id_material);

    if (materialError) {
      Alert.alert("Error", "Error al actualizar la cantidad de material");
      console.log("Material error: ", materialError);
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

          const base64 = await FileSystem.readAsStringAsync(photoUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const binary = atob(base64);
          const arrayBuffer = new Uint8Array(binary.length);
          for (let j = 0; j < binary.length; j++) {
            arrayBuffer[j] = binary.charCodeAt(j);
          }

          const fileExt = photoUri.split(".").pop()?.toLowerCase() || "jpg";
          const contentType = fileExt === "png" ? "image/png" : "image/jpeg";
          const filePath = tieneSublotes
            ? `lotes/${selectedLote.id_lote}/${selectedSublote.id_sublote}/${lastProcessId}/foto_${i + 1}.${fileExt}`
            : `lotes/${selectedLote.id_lote}/${lastProcessId}/foto_${i + 1}.${fileExt}`;

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
            id_sublote: tieneSublotes ? selectedSublote?.id_sublote : null,
            id_proceso: lastProcessId,
            url_foto: publicUrl,
          });

          if (insertFotoError) {
            console.log(`❌ Error insertando foto ${i + 1}:`, insertFotoError);
          }

          await FileSystem.deleteAsync(photoUri, { idempotent: true });
          console.log(`✅ Foto ${i + 1} subida y archivo local eliminado`);
        } catch (err) {
          console.log(`❌ Error procesando foto ${i + 1}:`, err);
        }
      }

      Alert.alert("Éxito", "✅ Molienda guardada correctamente");
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
      setSelectedLote(null);
      setPhotos(Array(6).fill(null));
      setMerma(0);

      const fetchData = async () => {
        const { data: loteData } = await supabase.from("lotes")
          .select("id_lote,nombre_lote,peso_entrada_kg,id_material,id_cliente,numero_de_sublotes")
          .not("estado_actual", "in", "(Finalizado,Molienda,Peletizado)");

        setLotes(loteData || []);
      };

      if (selectedLote && peso) {
        setMerma(Number(selectedLote.peso_entrada_kg) - Number(peso));
      } else {
        setMerma(0);
      }
    } catch (err) {
      console.log("❌ Error en reFetch:", err);
    }
  };

  useEffect(() => {
    const tryAutoSelect = async () => {
      try {
        if (!id_lote || lotes.length === 0) return;
        if (selectedLote && String(selectedLote.id_lote) === String(id_lote)) {
          if (id_sublote && tieneSublotes) {
            const subId = parseInt(id_sublote as string, 10);
            const subObj = sublotes.find((s: any) => s.id_sublote === subId);
            if (subObj) setSelectedSublote(subObj);
          }
          return;
        }

        const id = parseInt(id_lote as string, 10);
        const loteObj = lotes.find((l: any) => l.id_lote === id);
        if (!loteObj) return;

        setSelectedLote(loteObj);
        const loadedSublotes = await handleLoteChange(loteObj.id_lote);

        if (id_sublote) {
          const subId = parseInt(id_sublote as string, 10);
          const subObj = (loadedSublotes || []).find((s: any) => s.id_sublote === subId);
          if (subObj) {
            setSelectedSublote(subObj);
          }
        }
      } catch (err) {
        console.log("❌ Error auto-seleccionando lote/sublote:", err);
      }
    };

    tryAutoSelect();
  }, [lotes, id_lote, id_sublote]);


  const handleLoteChange = async (idLote: any) => {
    // NO bloquear cambios por el param: queremos permitir selección desde el efecto
    const loteObj = lotes.find((l) => l.id_lote === idLote);
    setSelectedLote(loteObj || null);
    setSelectedSublote(null);
    setSublotes([]);
    setTieneSublotes(false);

    if (loteObj) {
      const { data: sublotesData, error: subError } = await supabase
        .from("sublotes")
        .select("id_sublote, nombre_sublote, peso_sublote_kg")
        .eq("id_lote", loteObj.id_lote)
        .eq("estado_actual", "Recibido")
        .order("nombre_sublote", { ascending: true });

      if (subError) {
        console.error("❌ Error al obtener sublotes:", subError);
        return [];
      }

      if (sublotesData && sublotesData.length > 0) {
        setSublotes(sublotesData);
        setTieneSublotes(true);
      } else {
        setTieneSublotes(false);
      }

      setMaterial(loteObj.id_material);

      return sublotesData || [];
    }

    return [];
  };

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      <View className="flex flex-row items-center px-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={40} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
          Molienda
        </Text>
      </View>

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
              enabled={!id_lote}
              selectedValue={selectedLote?.id_lote || ""}
              onValueChange={handleLoteChange}
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

          {tieneSublotes && sublotes.length > 0 && (
            <>
              <Text className="mt-3 pb-1 text-2xl font-ibm-devanagari-bold">
                Selecciona un sublote
              </Text>
              <View className="border-2 border-black rounded-xl mt-2">
                <Picker
                  enabled={!id_sublote}
                  selectedValue={selectedSublote?.id_sublote || ""}
                  onValueChange={(idSublote) => {
                    const subObj = sublotes.find((s) => s.id_sublote === idSublote);
                    setSelectedSublote(subObj || null);
                  }}
                  style={Platform.OS === "ios" ? styles.pickerIOS : styles.picker}
                >
                  <Picker.Item label="Selecciona un sublote" value="" />
                  {sublotes.map((s) => (
                    <Picker.Item
                      key={s.id_sublote}
                      label={`${s.nombre_sublote}`}
                      value={s.id_sublote}
                    />
                  ))}
                </Picker>
              </View>
            </>
          )}

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

          {!tieneSublotes && (
            <View className="mb-4 flex flex-row">
              <Text className="font-ibm-devanagari-bold">Merma: </Text>
              <Text className="font-ibm-devanagari-regular text-red-600">{merma} kg</Text>
            </View>
          )}

          <Text className="text-2xl font-ibm-devanagari-bold">Fotos</Text>
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