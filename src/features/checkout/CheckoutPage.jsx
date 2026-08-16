import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useOrdersStore } from "@/stores/ordersStore";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutSteps } from "./components/CheckoutSteps";
import { OrderSummary } from "./components/OrderSummary";
import { OrderPlaced } from "./components/OrderPlaced";
import { CustomerStage } from "./stages/CustomerStage";
import { DeliveryStage } from "./stages/DeliveryStage";
import { PaymentStage } from "./stages/PaymentStage";
import { ReviewStage } from "./stages/ReviewStage";
import { DELIVERY_FEE, STAGE_IDS } from "./constants";
import { rememberGuestOrder } from "@/lib/guestOrders";

const EMPTY_CUSTOMER = { name: "", email: "", phoneNumber: "" };

export function CheckoutPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateUser = useAuthStore((s) => s.updateUser);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const addOrder = useOrdersStore((s) => s.addOrder);
  const addGuestOrder = useOrdersStore((s) => s.addGuestOrder);

  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  // Prefilled details aren't confirmed until the shopper submits the contact stage.
  const [isContactConfirmed, setIsContactConfirmed] = useState(false);
  const [delivery, setDelivery] = useState({ method: "pickup", address: "" });
  const [payment, setPayment] = useState({ file: null, preview: null });
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [guestToken, setGuestToken] = useState(null);

  // Prefill contact details from the signed-in account.
  useEffect(() => {
    if (!user) return;
    setCustomer((current) => ({
      name: current.name || user.name || "",
      email: user.email || "",
      phoneNumber: current.phoneNumber || user.phoneNumber || "",
    }));
  }, [user]);

  // Guests qualify on contact details alone: no account required to continue.
  const isCustomerDone = Boolean(
    customer.name && customer.email && customer.phoneNumber && isContactConfirmed
  );
  const isDeliveryDone =
    isCustomerDone &&
    (delivery.method === "pickup" ||
      (delivery.method === "delivery" && Boolean(delivery.address)));
  const isPaymentDone = isDeliveryDone && Boolean(payment.file);

  /** Furthest stage the shopper has unlocked, everything after it is out of bounds. */
  const reachedIndex = isPaymentDone ? 3 : isDeliveryDone ? 2 : isCustomerDone ? 1 : 0;

  const requestedStage = searchParams.get("stage");
  const requestedIndex = STAGE_IDS.indexOf(requestedStage);
  const currentIndex = Math.min(
    requestedIndex === -1 ? 0 : requestedIndex,
    reachedIndex
  );
  const currentStage = STAGE_IDS[currentIndex];

  const goToStage = (stageId) => {
    setSearchParams({ stage: stageId }, { replace: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Keep the URL honest when a stage is skipped, out of range, or missing.
  useEffect(() => {
    if (placedOrder) return;
    if (requestedStage !== currentStage) {
      setSearchParams({ stage: currentStage }, { replace: true });
    }
  }, [placedOrder, requestedStage, currentStage, setSearchParams]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );
  const isDelivery = delivery.method === "delivery";
  const total = subtotal + (isDelivery ? DELIVERY_FEE : 0);

  const handleCustomerSubmit = async (data) => {
    setCustomer(data);
    setIsContactConfirmed(true);

    if (!isAuthenticated) {
      // Guest: nothing to sync, the details ride along with the order itself.
      goToStage("delivery");
      return;
    }

    // Keep the account in sync so the order carries the right name and phone.
    const changed =
      data.name !== (user?.name ?? "") || data.phoneNumber !== (user?.phoneNumber ?? "");
    if (changed) {
      try {
        const res = await api.patch("/v1/auth/me", {
          name: data.name,
          phoneNumber: data.phoneNumber,
        });
        updateUser(res.data);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Couldn't save your contact details."
        );
        return;
      }
    }
    goToStage("delivery");
  };

  const handleDeliverySubmit = (data) => {
    setDelivery(data);
    goToStage("payment");
  };

  /** Reflect the picked method in the summary as soon as it's selected. */
  const handleMethodChange = useCallback(
    (method) => setDelivery((current) => (current.method === method ? current : { ...current, method })),
    []
  );

  const handlePlaceOrder = async () => {
    if (isPlacing) return;
    setIsPlacing(true);
    const cartPayload = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
    const deliveryPayload = isDelivery
      ? { delivery: true, deliveryAddress: delivery.address }
      : {};

    try {
      if (isAuthenticated) {
        const order = await addOrder(cartPayload, payment.file, deliveryPayload);
        clearCart();
        setPlacedOrder(order);
      } else {
        const { order, guestToken: token } = await addGuestOrder(
          cartPayload,
          payment.file,
          customer,
          deliveryPayload
        );
        rememberGuestOrder({ orderId: order.id, token, total: order.total });
        clearCart();
        setGuestToken(token);
        setPlacedOrder(order);
      }
      toast.success("Order placed. Your price is locked.");
      window.scrollTo({ top: 0 });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Couldn't place the order. Please try again."
      );
    } finally {
      setIsPlacing(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-background">
        <CheckoutHeader />
        <OrderPlaced order={placedOrder} guestToken={guestToken} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <CheckoutHeader />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-sunken">
            <ShoppingBag className="h-7 w-7 text-muted" aria-hidden />
          </div>
          <h1 className="text-xl font-bold text-foreground">Your cart is empty</h1>
          <p className="mt-2 text-body">
            Add something from our merchants and your price gets locked at today&apos;s
            rate.
          </p>
          <Link
            to="/#shop"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-accent hover:shadow-primary/35"
          >
            Browse merchants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Summary sits above the form on mobile, beside it on desktop */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          <div className="order-2 min-w-0 lg:order-1">
            <CheckoutSteps
              currentIndex={currentIndex}
              reachedIndex={reachedIndex}
              onSelect={goToStage}
            />

            {currentStage === "customer" && (
              <CustomerStage customer={customer} onSubmit={handleCustomerSubmit} />
            )}
            {currentStage === "delivery" && (
              <DeliveryStage
                delivery={delivery}
                onSubmit={handleDeliverySubmit}
                onMethodChange={handleMethodChange}
                onBack={() => goToStage("customer")}
              />
            )}
            {currentStage === "payment" && (
              <PaymentStage
                total={total}
                payment={payment}
                onChange={setPayment}
                onSubmit={() => goToStage("review")}
                onBack={() => goToStage("delivery")}
              />
            )}
            {currentStage === "review" && (
              <ReviewStage
                customer={customer}
                delivery={delivery}
                payment={payment}
                isPlacing={isPlacing}
                onEdit={goToStage}
                onPlaceOrder={handlePlaceOrder}
                onBack={() => goToStage("payment")}
              />
            )}
          </div>

          <div className="order-1 lg:order-2">
            <OrderSummary items={items} isDelivery={isDelivery} />
          </div>
        </div>
      </div>
    </div>
  );
}
