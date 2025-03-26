import { Image, ScrollView, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-#F0F8FF w-full">
      <View className=" flex-column items-center bg-white w-[300px] h-[350px] rounded-2xl ">
        <Text className="m-[20px] text-[30px] font-bold font-custom">
          Bengaluru, India
        </Text>
        <View className="flex-1 flex-row gap-5">
          <Image
            source={{
              uri: "https://th.bing.com/th/id/R.770b805d5c99c7931366c2e84e88f251?rik=khgO%2bY1Hh3BT9w&riu=http%3a%2f%2fpurepng.com%2fpublic%2fuploads%2flarge%2fpurepng.com-weather-iconsymbolsiconsapple-iosiosios-8-iconsios-8-721522596142qx4ep.png&ehk=6msbAydV7X6D4bO8zvLC664aXwKOdBU17dwrHcKxaAg%3d&risl=&pid=ImgRaw&r=0",
            }}
            className="w-[100px] h-[100px]"
            resizeMode="cover"
          />
          <Text className="text-[50px] mt-3">34°</Text>
        </View>
        <Text className=" flex-1 text-base text-gray-500 font-bold mt-[40px] ">
          Gomala kodhikuthu
        </Text>
        <View className="flex-1 flex-row w-full justify-center">
          <View className="flex-row items-center mx-4 ">
            <Image
              source={{
                uri: "https://th.bing.com/th/id/OIP.I3Sp9bJJDXeOf6yM8mJ86gHaHa?w=1024&h=1024&rs=1&pid=ImgDetMain",
              }}
              className="w-[25px] h-[25px]"
              resizeMode="contain"
            />
            <Text className="ml-2">12mph</Text>
          </View>
          <View className="flex-row items-center mx-4 ">
            <Image 
              source={{
                uri: "https://static-00.iconduck.com/assets.00/humidity-icon-1024x838-vqbjj1sp.png",
              }}
              className="w-[25px] h-[25px]"
              resizeMode="contain"
            />
            <Text className="ml-2">60%</Text>
          </View>
        </View>
      </View>
      <View className="justify-center items-center bg-white w-[300px] h-[200px] mt-10 rounded-2xl">
        <Text>Future data</Text>
      </View>
    </View>
  );
}
