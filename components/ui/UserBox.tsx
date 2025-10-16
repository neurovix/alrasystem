import { supabase } from "@/lib/supabase";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function UserBox({ id_usuario, nombre, rol, estatus: initialEstatus }: any) {
  const [estatus, setEstatus] = useState(initialEstatus);
  const isActivo = estatus === true;

  const handleUserEstatus = async () => {
    const nuevoEstatus = !isActivo;
    const accion = nuevoEstatus ? "dar de alta" : "dar de baja";

    Alert.alert(
      "Confirmación",
      `¿Deseas ${accion} al usuario ${nombre}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("usuarios")
                .update({ estatus: nuevoEstatus })
                .eq("id_usuario", id_usuario);

              if (error) throw error;

              setEstatus(nuevoEstatus);

              Alert.alert(
                "Éxito",
                nuevoEstatus
                  ? `${nombre} ha sido dado de alta.`
                  : `${nombre} ha sido dado de baja.`
              );
            } catch (err) {
              console.error("Error al actualizar estatus:", err);
              Alert.alert("Error", "No se pudo actualizar el estatus del usuario.");
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="flex my-2 flex-row py-3 px-4 w-full items-center border border-gray-400 rounded-xl bg-white shadow-sm"
    >
      <View className="w-3/12">
        <RenderChar text={nombre} activo={isActivo} />
      </View>

      <View className="w-7/12 pl-3">
        <Text className="font-ibm-condensed-bold text-xl">{nombre}</Text>
        <Text className="font-ibm-condensed-regular text-gray-700">{rol}</Text>
        <Text
          className={`font-ibm-condensed-bold mt-1 ${isActivo ? "text-green-600" : "text-red-600"
            }`}
        >
          {isActivo ? "🟢 Activo" : "🔴 Inactivo"}
        </Text>
      </View>

      <View className="w-2/12 flex items-end">
        <TouchableOpacity onPress={handleUserEstatus}>
          {isActivo ? (
            <AntDesign name="close" size={28} color="red" />
          ) : (
            <AntDesign name="check" size={28} color="green" />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const RenderChar = ({ text, activo }: any) => {
  return (
    <View
      className={`rounded-full w-14 h-14 flex items-center justify-center ${activo ? "bg-green-500" : "bg-red-400"
        }`}
    >
      <Text className="text-white text-3xl font-ibm-condensed-bold">
        {getFirstChar(text)}
      </Text>
    </View>
  );
};

const getFirstChar = (text: string) => text.charAt(0).toUpperCase();
