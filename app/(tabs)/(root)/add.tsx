import icons from "@/constants/icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import CheckBox from "expo-checkbox";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Add() {
  const idLote = "LT-1";

  const [date, setDate] = useState(new Date());

  const [permission, requestPermission] = useCameraPermissions();
  
  const cameraRef = useRef<CameraView>(null);

  const [showCamera, setShowCamera] = useState(false);

  const [checkedVenta, setCheckedVenta] = useState<boolean>(false);
  const [checkedMaquila, setCheckedMaquila] = useState<boolean>(false);

  const [photos, setPhotos] = useState<(string | null)[]>(Array(6).fill(null));
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

  const onChange = (_: any, selectedDate: any) => {
    setDate(selectedDate);
  };

  const showMode = (currentMode: any) => {
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const showDatepicker = () => {
    showMode("date");
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
            <Text className="text-2xl">ID: {idLote}</Text>
          </View>

          <Text className="mt-5 text-2xl font-ibm-devanagari-bold">Tipo</Text>
          <View className="border-2 border-black rounded-xl mt-2">
            <Picker>
              <Picker.Item label="PET" value={0} />
              <Picker.Item label="PP" value={1} />
              <Picker.Item label="HDPE" value={2} />
            </Picker>
          </View>

          <Text className="mt-3 pb-1 text-2xl font-ibm-devanagari-bold">
            Peso de entrada
          </Text>
          <View className="flex flex-row w-full pb-5">
            <TextInput
              className="border-2 w-7/12 border-black rounded-lg"
              placeholder="Ingresa el peso"
              keyboardType="number-pad"
            />
            <View className="w-1/12" />
            <View className="border-2 w-4/12 border-black rounded-lg">
              <Picker>
                <Picker.Item label="kg" value={0} />
                <Picker.Item label="ton" value={1} />
              </Picker>
            </View>
          </View>

          <Button
            color={"#16a34a"}
            onPress={showDatepicker}
            title="Fecha de recibido"
          />

          <Text className="mt-5 text-2xl font-ibm-devanagari-bold">
            Cliente
          </Text>
          <View className="border-2 border-black rounded-lg">
            <Picker>
              <Picker.Item label="Neurovix S. de R.L. de C.V." value={0} />
              <Picker.Item label="Coca Cola S.A. de C.V." value={1} />
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
              onPress={() => router.navigate("/(tabs)/(root)")}
            >
              <View className="w-[95%] flex items-center border-2 py-2 rounded-xl border-black">
                <Text className="font-ibm-condensed-bold text-2xl">
                  Cancelar
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="w-1/2 items-center">
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
});
