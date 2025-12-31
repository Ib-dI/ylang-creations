import type { Order, OrderStatus } from "@/types/admin";
import { create } from "zustand";

interface AdminStore {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;

  // Actions
  setOrders: (orders: Order[]) => void;
  setSelectedOrder: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addTrackingNumber: (orderId: string, trackingNumber: string) => void;
  addNote: (orderId: string, note: string) => void;

  // Filters
  filterByStatus: (status: OrderStatus | "all") => Order[];
  searchOrders: (query: string) => Order[];
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,

  setOrders: (orders) => set({ orders }),

  setSelectedOrder: (order) => set({ selectedOrder: order }),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date() }
          : order,
      ),
      selectedOrder:
        state.selectedOrder?.id === orderId
          ? { ...state.selectedOrder, status, updatedAt: new Date() }
          : state.selectedOrder,
    })),

  addTrackingNumber: (orderId, trackingNumber) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? { ...order, trackingNumber, updatedAt: new Date() }
          : order,
      ),
      selectedOrder:
        state.selectedOrder?.id === orderId
          ? { ...state.selectedOrder, trackingNumber, updatedAt: new Date() }
          : state.selectedOrder,
    })),

  addNote: (orderId, note) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? { ...order, notes: note, updatedAt: new Date() }
          : order,
      ),
      selectedOrder:
        state.selectedOrder?.id === orderId
          ? { ...state.selectedOrder, notes: note, updatedAt: new Date() }
          : state.selectedOrder,
    })),

  filterByStatus: (status) => {
    const { orders } = get();
    if (status === "all") return orders;
    return orders.filter((order) => order.status === status);
  },

  searchOrders: (query) => {
    const { orders } = get();
    const lowerQuery = query.toLowerCase();
    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(lowerQuery) ||
        order.customerName.toLowerCase().includes(lowerQuery) ||
        order.customerEmail.toLowerCase().includes(lowerQuery),
    );
  },
}));
