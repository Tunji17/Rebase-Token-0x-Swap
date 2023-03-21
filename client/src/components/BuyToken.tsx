import React from 'react'
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useSigner } from "wagmi";
import { Contract, utils, constants } from "ethers";
import { getContractAddressesForChainOrThrow } from "@0x/contract-addresses";
import { LimitOrder } from "@0x/protocol-utils";
import { useToken } from '../context/tokenContext';
import { useOrders } from '../context/orderContext';
import exchangeProxyContract from '../utils/proxyContract.json';

type FormData = {
  amount: number;
};


const BuyToken = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const { allowances, contracts } = useToken();
  const { orders, fetchOrders, selectedOrder } = useOrders();
  const watchAmount = watch("amount");

  const { data: signer } = useSigner();

  const order = React.useMemo(
    () =>
      orders.find((order) => order.metaData.orderHash === selectedOrder),
    [orders, selectedOrder]
  );

  const sellingPrice = React.useMemo(
    () =>
    order
        ? Number(utils.formatEther(order.order.makerAmount)) /
          Number(utils.formatEther(order.order.takerAmount))
        : 0,
    [order]
  );

  const amount = React.useMemo(
    () =>
      watchAmount
        ? watchAmount * sellingPrice
        : constants.Zero,
    [watchAmount, sellingPrice]
  );

  console.log("Amount", amount.toString());
  
  const handleBuy = async (data: FormData) => {
    const exchangeProxy = getContractAddressesForChainOrThrow(
      137
    ).exchangeProxy;

    if (parseInt(allowances.mockToken) < watchAmount) {
      try {
        const txn = await contracts.mockToken?.connect(signer!).approve(exchangeProxy, constants.MaxUint256);
        await txn.wait();
      } catch (e) {
        return;
      }
    }

    const proxyContract = new Contract(
      exchangeProxy,
      exchangeProxyContract.abi,
      signer!
    );

    try {
      // create limit order
      const limitOrder = new LimitOrder(order.order);
      const txn = await proxyContract.fillLimitOrder(
        limitOrder,
        order.order.signature,
        utils.parseEther(data.amount.toString())
      );
      await txn.wait();
      toast.success("Order Filled");
    } catch(e) {
      toast.error("Order Failed");
      return;
    }

    await fetchOrders();
  }

  if (!selectedOrder) return null;
  return (
    <div className='m-10 p-10 w-full text-left border'>
      <h1 className='text-3xl'>Buy Token</h1>
      <p className='text-gray-500'>Set Price: {sellingPrice}</p>
      <p className='text-gray-500'>
          You will recieve Amount: {amount.toString()} Rebase Token for {watchAmount || 0} Mock Token
      </p>
      <form className='flex flex-col m-3' onSubmit={handleSubmit((data) => handleBuy(data))}>
        <label>Amount of Mock Token</label>
        <input className='w-full border px-2 mb-2' type="number" {...register("amount", { required: true })} />
        <button className='bg-blue-700 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow' type="submit">Submit</button>
      </form>
    </div>
  )
}

export default BuyToken