import icons from "@/constants/icons";
import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G, Path } from "react-native-svg";

function createPieSlice(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  color: string
) {
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  return (
    <Path
      d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArcFlag},1 ${x2},${y2} Z`}
      fill={color}
    />
  );
}

export default function Home() {
  const dataLotes = [
    { label: "En proceso", value: 45, color: "#eab308" }, // amarillo
    { label: "Finalizados", value: 10, color: "#059669" }, // verde
  ];

  const totalLotes = dataLotes.reduce((acc, item) => acc + item.value, 0);
  let startAngleLote = 0;

  const slicesLote = dataLotes.map((item, index) => {
    const angle = (item.value / totalLotes) * 2 * Math.PI;
    const slice = createPieSlice(
      75,
      75,
      70,
      startAngleLote,
      startAngleLote + angle,
      item.color
    );
    startAngleLote += angle;
    return <G key={index}>{slice}</G>;
  });

  const dataMerma = [
    { label: "En proceso", value: 40, color: "#15803d" }, // verde
    { label: "Finalizados", value: 20, color: "#b91c1c" }, // rojo
  ];

  let startAngleMerma = 0;

  const slicesMerma = dataMerma.map((item, index) => {
    const angle = (item.value / totalLotes) * 2 * Math.PI;
    const slice = createPieSlice(
      75,
      75,
      70,
      startAngleMerma,
      startAngleMerma + angle,
      item.color
    );
    startAngleMerma += angle;
    return <G key={index}>{slice}</G>;
  });

  return (
    <SafeAreaView>
      <ScrollView
        className="bg-white px-5 pt-2"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text className="text-3xl pt-5 font-ibm-devanagari-bold">
          Informacion semanal
        </Text>
        <View className="w-full flex flex-row pt-3">
          <View className="w-5/12 items-center justify-center">
            <Svg height="150" width="150">
              {/* Círculo de fondo */}
              <Circle
                cx="75"
                cy="75"
                r="65"
                fill="none"
                stroke="#f0fdf4"
                strokeWidth="2"
              />
              {slicesLote}
              {/* Círculo interno para efecto donut */}
              <Circle
                cx="75"
                cy="75"
                r="35"
                fill="white"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </Svg>
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-2xl font-ibm-devanagari-bold text-green-700">
                {totalLotes}
              </Text>
              <Text className="text-xs text-green-500 font-ibm-condensed-bold">
                TOTAL
              </Text>
            </View>
          </View>
          <View className="w-7/12 flex flex-col items-center px-5">
            <View className="bg-yellow-50 rounded-xl px-4 py-1 w-full mb-3 border-l-4 border-yellow-500">
              <View className="flex flex-row items-center mb-2">
                <View className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></View>
                <Text className="font-ibm-condensed-bold text-green-700 text-lg">
                  En proceso
                </Text>
              </View>
              <Text className="text-3xl font-ibm-devanagari-bold text-green-800">
                45
              </Text>
              <Text className="text-green-600 text-xs">lotes activos</Text>
            </View>
            <View className="bg-emerald-50 rounded-xl px-4 py-1 border-l-4 w-full border-emerald-500">
              <View className="flex flex-row items-center mb-2">
                <View className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></View>
                <Text className="font-ibm-condensed-bold text-emerald-700 text-lg">
                  Finalizados
                </Text>
              </View>
              <Text className="text-3xl font-ibm-devanagari-bold text-emerald-800">
                10
              </Text>
              <Text className="text-emerald-600 text-xs">lotes completados</Text>
            </View>
          </View>
        </View>
        <View className="w-full h-1 bg-gray-400 my-5"></View>
        <View className="w-full flex flex-row">
          <View className="w-5/12 items-center justify-center">
            <Svg height="150" width="150">
              {slicesMerma}
            </Svg>
          </View>
          <View className="w-7/12 flex flex-col items-center px-5">
            <View className="bg-green-50 rounded-xl px-2 py-1 w-full mb-3 border-l-4 border-green-500">
              <View className="flex flex-row items-center mb-2">
                <View className="w-3 h-3 bg-green-500 rounded-full mr-2"></View>
                <Text className="font-ibm-condensed-bold text-green-700 text-lg">
                  Salida
                </Text>
              </View>
              <Text className="text-xl font-ibm-devanagari-bold text-green-800">
                459,786,435
              </Text>
            </View>
            <View className="bg-red-50 rounded-xl px-2 py-1 border-l-4 w-full border-red-500">
              <View className="flex flex-row items-center mb-2">
                <View className="w-3 h-3 bg-red-600 rounded-full mr-2"></View>
                <Text className="font-ibm-condensed-bold text-emerald-700 text-lg">
                  Merma
                </Text>
              </View>
              <Text className="text-xl font-ibm-devanagari-bold text-emerald-800">
                10,849
              </Text>
            </View>
          </View>
        </View>
        <View className="w-full h-1 bg-gray-400 my-5"></View>
        <View>
          <Text className="text-2xl font-ibm-condensed-bold pt-3">
            Administracion
          </Text>
          <View className="flex flex-row w-full mt-3 justify-between">
            <TouchableOpacity onPress={() => router.push("/screens/molienda")} className="w-[48%] flex items-center border-b-4 border-green-500 bg-emerald-50 rounded-xl py-4">
              <Image tintColor="#059669" source={icons.molienda} />
              <Text className="font-ibm-condensed-bold pt-2 text-lg">
                Molienda
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/screens/peletizado")} className="w-[48%] flex items-center border-b-4 border-green-500 bg-emerald-50 rounded-xl py-4">
              <Image tintColor="#059669" source={icons.peletizado} />
              <Text className="font-ibm-condensed-bold pt-2 text-lg">
                Peletizado
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex flex-row w-full mt-3 justify-between">
            <TouchableOpacity onPress={() => router.push("/screens/retorno")} className="w-[48%] flex items-center border-b-4 border-green-500 bg-emerald-50 rounded-xl py-4">
              <Image tintColor="#059669" source={icons.retorno} />
              <Text className="font-ibm-condensed-bold pt-2 text-lg">
                Retorno a planta
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/screens/venta")} className="w-[48%] flex items-center border-b-4 border-green-500 bg-emerald-50 rounded-xl py-4">
              <Image tintColor="#059669" source={icons.maquila} />
              <Text className="font-ibm-condensed-bold pt-2 text-lg">
                Venta
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex flex-row w-full mt-3 justify-between">
            <TouchableOpacity onPress={() => router.push("/screens/clients/listClient")} className="w-[48%] flex items-center border-b-4 border-green-500 bg-emerald-50 rounded-xl py-4">
              <Image tintColor="#059669" source={icons.registerUser} />
              <Text className="font-ibm-condensed-bold pt-2 text-lg">
                Clientes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/screens/material/listMaterial")} className="w-[48%] flex items-center border-b-4 border-green-500 bg-emerald-50 rounded-xl py-4">
              <Image tintColor="#059669" source={icons.material} />
              <Text className="font-ibm-condensed-bold pt-2 text-lg">
                Materiales
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
