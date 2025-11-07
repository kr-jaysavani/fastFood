import CartItem from "@/components/CartItem";
import { CustomButton } from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { useCartStore } from "@/store/cart.store";
import { PaymentInfoStripeProps } from "@/type";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import cn from "clsx";
import { useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentInfoStripe = ({
  label,
  value,
  labelStyle,
  valueStyle,
}: PaymentInfoStripeProps) => (
  <View className="flex-between flex-row my-1">
    <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
      {label}
    </Text>
    <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
      {value}
    </Text>
  </View>
);

const Cart = () => {
  const { items, getTotalItems, getTotalPrice } = useCartStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const fetchPaymentSheetParams = async () => {
    const response = await fetch(`/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: (totalPrice + 5 - 0.5).toFixed(2),
      }),
    });

    console.log("🚀 ~ fetchPaymentSheetParams ~ response:", response);
    const { paymentIntent, ephemeralKey, customer } = await response.json();

    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };

  const initializePaymentSheet = async () => {
    const { paymentIntent, ephemeralKey, customer } =
      await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: "Jane Doe",
      },
    });
    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    }
  };

  const openPaymentSheet = async () => {
    setLoading(true);

    await initializePaymentSheet();
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert("Success", "Your order is confirmed!");
    }
    setLoading(false);
  };
  //   useEffect(() => {
  //     initializePaymentSheet();
  //   }, [totalPrice]);

  return (
    <SafeAreaView className="bg-white h-full">
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
        merchantIdentifier="merchant.identifier" // required for Apple Pay
        urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
      >
        <FlatList
          data={items}
          renderItem={({ item }) => <CartItem item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerClassName="pb-28 px-5 pt-5"
          ListHeaderComponent={() => <CustomHeader title="Your Cart" />}
          ListEmptyComponent={() => <Text>Cart Empty</Text>}
          ListFooterComponent={() =>
            totalItems > 0 && (
              <View className="gap-5">
                <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
                  <Text className="h3-bold text-dark-100 mb-5">
                    Payment Summary
                  </Text>

                  <PaymentInfoStripe
                    label={`Total Items (${totalItems})`}
                    value={`$${totalPrice.toFixed(2)}`}
                  />
                  <PaymentInfoStripe label={`Delivery Fee`} value={`$5.00`} />
                  <PaymentInfoStripe
                    label={`Discount`}
                    value={`- $0.50`}
                    valueStyle="!text-success"
                  />
                  <View className="border-t border-gray-300 my-2" />
                  <PaymentInfoStripe
                    label={`Total`}
                    value={`$${(totalPrice + 5 - 0.5).toFixed(2)}`}
                    labelStyle="base-bold !text-dark-100"
                    valueStyle="base-bold !text-dark-100 !text-right"
                  />
                </View>

                <CustomButton
                  title="Order Now"
                  onPress={() => openPaymentSheet()}
                  isLoading={loading}
                />
              </View>
            )
          }
        />
      </StripeProvider>
    </SafeAreaView>
  );
};

export default Cart;
