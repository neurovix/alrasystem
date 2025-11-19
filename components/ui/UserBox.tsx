import { supabase } from "@/lib/supabase";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function UserBox({ id_usuario, nombre, rol: initialRol, estatus: initialEstatus }: any) {
  const [estatus, setEstatus] = useState(initialEstatus);
  const [rol, setRol] = useState(initialRol);
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

  const handleUserRol = async () => {
    const nuevoRol = rol === "Administrador" ? "Operador" : "Administrador";
    const accion = nuevoRol === "Administrador" ? "asignar como administrador" : "degradar a operador";

    Alert.alert(
      "Confirmación",
      `¿Deseas ${accion} a ${nombre}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("usuarios")
                .update({ rol: nuevoRol })
                .eq("id_usuario", id_usuario);

              if (error) throw error;

              setRol(nuevoRol);

              Alert.alert(
                "Éxito",
                `${nombre} ahora es ${nuevoRol}.`
              );
            } catch (err) {
              console.error("Error al actualizar rol:", err);
              Alert.alert("Error", "No se pudo actualizar el rol del usuario.");
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
      <View className="w-2/12">
        <RenderChar text={nombre} activo={isActivo} />
      </View>

      <View className="w-7/12 pl-3">
        <Text className="font-ibm-condensed-bold text-xl">{nombre}</Text>
        <Text className="font-ibm-condensed-regular text-gray-700 capitalize">
          {rol}
        </Text>
        <Text
          className={`font-ibm-condensed-bold mt-1 ${isActivo ? "text-green-600" : "text-red-600"
            }`}
        >
          {isActivo ? "🟢 Activo" : "🔴 Inactivo"}
        </Text>
      </View>

      <View className="w-3/12 flex items-end">
        <View className="w-full flex flex-row">
          <TouchableOpacity className="w-1/2" onPress={handleUserRol}>
            <AntDesign name="user-switch" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity className="w-1/2" onPress={handleUserEstatus}>
            {isActivo ? (
              <AntDesign name="close" size={28} color="red" />
            ) : (
              <AntDesign name="check" size={28} color="green" />
            )}
          </TouchableOpacity>
        </View>
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
