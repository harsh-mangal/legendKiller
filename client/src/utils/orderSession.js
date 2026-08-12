import { getSessionItem, removeSessionItem, safeJsonParse, setSessionItem } from "./storage";

const ORDER_RESULT_PREFIX = "legend_order_result_";
const PAYMENT_PREFIX = "legend_pending_payment_";

export const saveOrderResult = (orderId, value) => {
  if (!orderId) return false;
  setSessionItem(`${ORDER_RESULT_PREFIX}${orderId}`, JSON.stringify(value));
  return true;
};

export const getOrderResult = (orderId) =>
  orderId ? safeJsonParse(getSessionItem(`${ORDER_RESULT_PREFIX}${orderId}`)) : null;

export const savePendingPayment = (orderId, value) => {
  if (!orderId) return false;
  setSessionItem(`${PAYMENT_PREFIX}${orderId}`, JSON.stringify(value));
  return true;
};

export const getPendingPayment = (orderId) =>
  orderId ? safeJsonParse(getSessionItem(`${PAYMENT_PREFIX}${orderId}`)) : null;

export const clearPendingPayment = (orderId) => {
  if (!orderId) return;
  removeSessionItem(`${PAYMENT_PREFIX}${orderId}`);
};
