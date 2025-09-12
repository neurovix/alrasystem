import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, Text, View } from "react-native";

import icons from "@/constants/icons";

const TabIcon = ({
  focused,
  icon,
  title,
}: {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}) => (
  <View className="flex-1 mt-3 flex flex-col items-center">
    <Image
      source={icon}
      tintColor={focused ? "#1F8C15" : "#666876"}
      resizeMode="contain"
      className="size-6"
    />
    <Text
      className={`${
        focused
          ? "text-primary-300 font-ibm-devanagari-bold"
          : "text-black-200 font-ibm-devanagari-regular"
      } text-xs w-full text-center mt-1`}
    >
      {title}
    </Text>
  </View>
);

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "white",
          position: "absolute",
          borderTopColor: "#0061FF1A",
          borderTopWidth: 1,
          minHeight: 70,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Inicio" />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Buscar",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Buscar" />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Nuevo",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.add} title="Nuevo" />
          ),
        }}
      />
      <Tabs.Screen
        name="inventario"
        options={{
          title: "Inventario",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.inventory} title="Inventario" />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracion"
        options={{
          title: "Configuracion",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.settings} title="Configuracion" />
          ),
        }}
      />
    </Tabs>
  );
};
