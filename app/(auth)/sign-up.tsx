import { router } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

const Signup = () => {
  return (
    <View>
      <Text>Signup</Text>
      <Button title="SignIn" onPress={() => router.push("/sign-in")} />
    </View>
  );
};

export default Signup;
