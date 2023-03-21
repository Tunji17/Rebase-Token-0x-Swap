import React from 'react'
import { useForm } from "react-hook-form";

import { useToken } from '../context/tokenContext';
import { useOrders } from '../context/orderContext';
import proxyContract from '../utils/proxyContract.json';

type FormData = {
  amount: number;
};


const BuyToken = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const { orders, fetchOrders, selectedOrder } = useOrders();

  const handleBuy = async (data: FormData) => {

  }

  return (

    <div className='m-10 p-10 w-full text-left border'>
      <h1 className='text-3xl'>Buy Token</h1>
      <p className='text-gray-500'>Set Price: </p>
      <form className='flex flex-col m-3' onSubmit={handleSubmit((data) => console.log(data))}>
        <label>Amount of Mock Token</label>
        <input className='w-full border px-2 mb-2' type="number" {...register("amount", { required: true })} />
        <button className='bg-blue-700 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow' type="submit">Submit</button>
      </form>
    </div>
  )
}

export default BuyToken