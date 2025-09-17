import LoteBox from "@/components/ui/LoteBox";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Search() {
    const loteData = [
        { id: 1, name: "LT-1", status: "En proceso", etapa: "Molienda" },
        { id: 2, name: "LT-2", status: "En proceso", etapa: "Peletizado" },
        { id: 3, name: "LT-3", status: "En proceso", etapa: "Molienda" },
        { id: 4, name: "LT-4", status: "En proceso", etapa: "Molienda" },
        { id: 5, name: "LT-5", status: "En proceso", etapa: "Retorno a planta" },
        { id: 6, name: "LT-6", status: "Terminado", etapa: "Venta" },
        { id: 7, name: "LT-7", status: "Terminado", etapa: "Molienda" },
        { id: 8, name: "LT-8", status: "Terminado", etapa: "Peletizado" },
        { id: 9, name: "LT-9", status: "Terminado", etapa: "Molienda" },
        { id: 10, name: "LT-10", status: "Terminado", etapa: "Molienda" },
        { id: 11, name: "LT-11", status: "Terminado", etapa: "Retorno a planta" },
        { id: 12, name: "LT-12", status: "Terminado", etapa: "Venta" },
    ];

    return (
        <SafeAreaView className="bg-green-600 flex-1">
            <Text className="text-3xl bg-green-600 py-5 text-white font-ibm-condensed-bold px-5">
                Historial de lotes
            </Text>
            <ScrollView
                className="bg-white px-5 pt-2 h-full"
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {loteData.map((item, _) => (
                    <View key={item.id}>
                        <LoteBox id={item.id} name={item.name} status={item.status} etapa={item.etapa} />
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
