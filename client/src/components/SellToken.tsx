import React from 'react'
import axios from 'axios';
import { useForm } from "react-hook-form";
import toast from 'react-hot-toast';
import { utils, constants } from "ethers";
import { useAccount, useSigner } from "wagmi";
import { LimitOrder } from "@0x/protocol-utils";
import { BigNumber } from "@0x/utils";
import { getContractAddressesForChainOrThrow } from "@0x/contract-addresses";
import { useToken } from "../context/tokenContext";

type FormData = {
  sellToken: string;
  buyToken: string;
  sellAmount: number;
  sellPrice: number;
  buyAmount: number;
  expirationTimeHours: number;
}

const SellToken = () => {
  const { register, watch, formState: { errors }, handleSubmit } = useForm<FormData>();
  const [buyAmount, setBuyAmount] = React.useState(0);

  const { contracts, balances, allowances } = useToken();

  const { address } = useAccount();
  const { data: signer } = useSigner();

  const makerToken = '0xA71dAf3a98c0fC93F53849ceFb76D2A27538eA9F'; // Rebase Token
  const takerToken = '0xAcBFc51186a5104BEA8DDc98c9C45569e86d2e0E'; // Mock Token

  const watchSellAmount = watch('sellAmount');
  const watchSellPrice = watch('sellPrice');

  React.useEffect(() => {
    const buyAmount = Number(watchSellAmount) * Number(watchSellPrice);
    setBuyAmount(buyAmount);
  }, [watchSellAmount, watchSellPrice])

  const handleSell = async (data: FormData) => {
    const { sellAmount, expirationTimeHours } = data;

    if (parseInt(allowances.rebaseToken, 10) < sellAmount) {
      try {
        const txn = await contracts.rebase?.connect(signer!).approve(getContractAddressesForChainOrThrow(137).exchangeProxy, constants.MaxUint256);
        console.log("txn: ", txn);
        
        await txn.wait();
      } catch (e) {
        return;
      }
    }

    const limitOrder = new LimitOrder({
      makerToken,
      takerToken,
      makerAmount: new BigNumber(sellAmount),
      takerAmount: new BigNumber(buyAmount),
      salt: new BigNumber(Date.now()),
      maker: address,
      sender: constants.AddressZero,
      chainId: 137,
      expiry: new BigNumber(Math.floor(Date.now() / 1000) + expirationTimeHours * 60 * 60),
      verifyingContract: getContractAddressesForChainOrThrow(137).exchangeProxy,
    })

    console.log("limitOrder: ", limitOrder)

    try {
      // Get signature
      const rawSignature = await signer!.signMessage(
        utils.arrayify(limitOrder.getHash())
      );
      const { v, r, s } = utils.splitSignature(rawSignature);
      const signature = {
        v,
        r,
        s,
        signatureType: 3,
      };
      const signedOrder = { ...limitOrder, signature };

      // submit order
      const response = await axios.post(
        'https://polygon.api.0x.org/orderbook/v1/order',
        signedOrder
      );
      console.log("Response: ", response);
      toast.success('Order Submitted');
    } catch (e) {
      toast.error('Order Failed');
      return;
    }
  }

  return (
    <div className='m-10 p-10 w-full text-left border'>
      <h1 className='text-3xl'>Sell Token</h1>
      <p className='text-gray-500'>You have {balances.rebaseToken} Rebase Token</p>
      <form onSubmit={handleSubmit((data) => {
        handleSell(data)
      })}>
        <div className='flex flex-col m-3'>
          <label htmlFor="sellToken">Sell Token</label>
          <input className='w-full border px-2' value={`Rebase Token (${makerToken})`} type="text" {...register("sellToken", { required: true, disabled: true })} />
          {errors.sellToken && <span>This field is required</span>}
        </div>
        <div className='flex flex-col m-3'>
          <label htmlFor="buyToken">Buy Token</label>
          <input className='w-full border px-2' value={`Mock Token (${takerToken})`} type="text" {...register("buyToken", { required: true, disabled: true })} />
          {errors.buyToken && <span>This field is required</span>}
        </div>
        <div className='flex flex-col m-3'>
          <label htmlFor="sellAmount">How much are you selling</label>
          <input className='w-full border px-2' type="text" {...register("sellAmount", { required: true })} />
          {errors.sellAmount && <span>This field is required</span>}
        </div>
        <div className='flex flex-col m-3'>
          <label htmlFor="buyAmount">How much are you selling for</label>
          <input className='w-full border px-2' type="text" {...register("sellPrice", { required: true })} />
          {errors.buyAmount && <span>This field is required</span>}
        </div>
        <div className='flex flex-col m-3'>
          <label htmlFor="expirationTimeHours">Expiration Time (hours)</label>
          <input className='w-full border px-2' type="number" {...register("expirationTimeHours", { required: true })} />
          {errors.expirationTimeHours && <span>This field is required</span>}
        </div>
        {
          buyAmount > 0 && (
            <div className='flex flex-col m-3'>
              <label htmlFor="buyAmount">You will receive</label>
              <input className='w-full border px-2' type="text" value={`${buyAmount} Mock Token`} {...register("buyAmount", { required: true, disabled: true })} />
            </div>
          )
        }
        <button className='bg-blue-700 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow' type="submit">Submit</button>
      </form>
    </div>
  )
}

export default SellToken