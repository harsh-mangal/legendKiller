import test from "node:test";
import assert from "node:assert/strict";
import DeliverySetting from "../src/models/DeliverySetting.js";
import { calculateOrderTotals, checkDeliveryAvailability, getDeliverySetting } from "../src/services/commerceService.js";

test("new COD orders are rejected before any stock or database work", async () => {
  await assert.rejects(
    () => calculateOrderTotals({ paymentMethod: "COD", pincode: "110001", orderItems: [], itemsPrice: 999 }),
    (error) => error.statusCode === 400 && /choose online payment/i.test(error.message),
  );
});

test("a previously enabled COD setting remains unavailable while online delivery works", async (t) => {
  t.mock.method(DeliverySetting, "findOneAndUpdate", async () => new DeliverySetting({
    codEnabled: true, onlinePaymentEnabled: true, serviceAllIndia: true,
  }));
  assert.equal((await getDeliverySetting()).codEnabled, false);
  const delivery = await checkDeliveryAvailability("110001");
  assert.equal(delivery.serviceable, true);
  assert.equal(delivery.codAvailable, false);
  assert.equal(delivery.onlinePaymentAvailable, true);
});
