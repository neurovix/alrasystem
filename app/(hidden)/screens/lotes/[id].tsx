import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoteInformation() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const images = [
    { id: 1, src: "https://static.thenounproject.com/png/4595376-200.png" },
    { id: 2, src: "https://static.thenounproject.com/png/4595376-200.png" },
    { id: 3, src: "https://static.thenounproject.com/png/4595376-200.png" },
    { id: 4, src: "https://static.thenounproject.com/png/4595376-200.png" },
    { id: 5, src: "https://static.thenounproject.com/png/4595376-200.png" },
    { id: 6, src: "https://static.thenounproject.com/png/4595376-200.png" },
  ]

  const ProcessStep = ({ title, data, images: stepImages }: any) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-3">
        <View className="w-2 h-6 bg-green-500 rounded-full mr-3" />
        <Text className="font-ibm-devanagari-bold text-xl text-gray-800">{title}</Text>
      </View>
      
      {data.map((item: any, index: any) => (
        <View key={index} className="flex-row justify-between items-center py-2">
          <Text className="font-ibm-devanagari-bold text-base text-gray-600 flex-1">
            {item.label}
          </Text>
          <Text className="text-base text-gray-900 font-medium">
            {item.value}
          </Text>
        </View>
      ))}
      
      {stepImages && stepImages.length > 0 && (
        <View className="mt-4">
          <Text className="font-ibm-devanagari-bold text-sm text-gray-500 mb-3">
            Imágenes del proceso
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {stepImages.map((image: any, index: any) => (
              <TouchableOpacity
                key={image.id}
                className="mr-3"
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: image.src }}
                  className="w-24 h-20 rounded-lg bg-gray-200 border border-gray-200"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="bg-green-600 flex-1">
      {/* Header */}
      <View className="flex flex-row items-center px-4 pb-2">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2 -ml-2"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={32} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl text-white font-ibm-condensed-bold flex-1 ml-2">
          Información del Lote
        </Text>
      </View>

      <ScrollView
        className="bg-gray-50 flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Detalles Generales */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          <Text className="font-ibm-condensed-bold text-2xl text-gray-800 mb-4">
            Detalles Generales
          </Text>
          
          <View className="flex flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="font-ibm-devanagari-bold text-sm text-gray-500 mb-1">
                ID LOTE
              </Text>
              <View className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <Text className="font-ibm-devanagari-bold text-lg text-green-700">
                  LT-{id}
                </Text>
              </View>
            </View>
            
            <View className="flex-1 ml-2">
              <Text className="font-ibm-devanagari-bold text-sm text-gray-500 mb-1">
                TIPO DE MATERIAL
              </Text>
              <View className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <Text className="font-ibm-devanagari-bold text-lg text-blue-700">
                  Plástico HDPE
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="font-ibm-devanagari-bold text-base text-gray-600">
                Peso de Entrada
              </Text>
              <Text className="font-ibm-condensed-bold text-xl text-gray-900">
                10,547.00 kg
              </Text>
            </View>
          </View>
        </View>

        {/* Título de Proceso */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="font-ibm-condensed-bold text-2xl text-gray-700 px-4">
            Proceso de Transformación
          </Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Recibo de Material */}
        <ProcessStep
          title="Recibo de Material"
          data={[
            { label: "Fecha de Recibido", value: "9/17/2025" },
            { label: "Cliente", value: "Neurovix S. de R.L. de C.V." },
            { label: "Proceso", value: "Maquila" }
          ]}
          images={images}
        />

        {/* Molienda */}
        <ProcessStep
          title="Molienda"
          data={[
            { label: "Peso de Salida", value: "8,932 kg" },
            { label: "Merma", value: "249.02 kg" },
            { label: "Fecha de Molienda", value: "9/18/2025" }
          ]}
          images={images}
        />

        {/* Peletizado */}
        <ProcessStep
          title="Peletizado"
          data={[
            { label: "Peso de Salida", value: "8,192 kg" },
            { label: "Merma", value: "29.02 kg" },
            { label: "Fecha de Proceso", value: "9/19/2025" }
          ]}
          images={images}
        />

        {/* Retorno a Planta */}
        <ProcessStep
          title="Retorno a Planta"
          data={[
            { label: "Peso Final", value: "8,047 kg" },
            { label: "Fecha de Retorno", value: "9/20/2025" },
            { label: "Cliente", value: "Neurovix S. de R.L. de C.V." }
          ]}
          images={images}
        />

        {/* Resumen Final */}
        <View className="bg-green-600 rounded-xl p-4 mt-2">
          <Text className="font-ibm-condensed-bold text-xl text-white mb-2">
            Resumen del Proceso
          </Text>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-green-100 font-ibm-condensed-bold">Peso Inicial:</Text>
            <Text className="text-white font-ibm-devanagari-bold text-lg">10,547 kg</Text>
          </View>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-green-100 font-ibm-condensed-bold">Peso Final:</Text>
            <Text className="text-white font-ibm-devanagari-bold text-lg">8,047 kg</Text>
          </View>
          <View className="h-px bg-green-400 my-2" />
          <View className="flex-row justify-between items-center">
            <Text className="text-green-100 font-ibm-condensed-bold">Eficiencia:</Text>
            <Text className="text-white font-ibm-condensed-bold text-xl">76.3%</Text>
          </View>
        </View>

        { /* Botones de accion */}
        <View className="mt-5">
          <TouchableOpacity className="bg-blue-600 rounded-xl py-2">
            <Text className="text-center text-white font-ibm-condensed-bold text-xl">GENERAR REPORTE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}