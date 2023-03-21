import React, {
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { useNetwork } from "wagmi";
import axios from "axios";

const makerToken = '0xA71dAf3a98c0fC93F53849ceFb76D2A27538eA9F'; // Rebase Token
const takerToken = '0xAcBFc51186a5104BEA8DDc98c9C45569e86d2e0E'; // Mock Token

type IOrder = {
  orders: Array<any>;
  fetchOrders: () => void;
  selectedOrder: string;
  selectOrder: (hash: string) => void;
};

export const OrderContext = React.createContext<IOrder>({
  orders: [],
  fetchOrders: () => {},
  selectedOrder: "",
  selectOrder: (hash: string) => {},
});

export const useOrders = () => {
  return useContext(OrderContext);
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {

  const [orders, setOrders] = useState<Array<any>>([]);
  const [selectedOrder, setSelectedOrder] = useState("");

  const { chain } = useNetwork();

  const fetchOrders = useCallback(async () => {
    if (!chain || chain.unsupported) return;

    try {
      const { data } = await axios.get(
        'https://polygon.api.0x.org/orderbook/v1',
        {
          params: {
            baseToken: makerToken,
            quoteToken: takerToken,
          },
        }
      );

      setOrders([...data.bids.records, ...data.asks.records]);
      console.log("Open orders.", data);
    } catch (e) {
      console.log("Failed to load orders list.");
      return;
    }
  }, [chain]);

  useEffect(() => {
    fetchOrders();
  }, [chain, fetchOrders]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        fetchOrders,
        selectedOrder,
        selectOrder: setSelectedOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
