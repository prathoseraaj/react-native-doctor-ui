import { ScrollView, Text, View } from "react-native";

export default function Index() {
  return (

    <View className="flex-1 justify-center items-center bg-#F0F8FF w-full">
      <View className=" justify-center items-center bg-white w-[300px] h-[350px] rounded-2xl ">
        <Text>Current data</Text>
      </View>
      <View className="justify-center items-center bg-white w-[300px] h-[200px] mt-10 rounded-2xl">
      <Text>Future data</Text>
      </View> 
    </View>

  );
}