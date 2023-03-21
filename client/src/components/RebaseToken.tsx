import React from 'react'
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAccount, useSigner } from "wagmi";
import { useToken } from '../context/tokenContext';

type FormData = {
  rebaseRatio: number;
};

const RebaseToken = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const { contracts, setupBalanceAndAllowance } = useToken();
  const handleRebase = async (data: FormData) => {
    console.log("Rebase", data);

    try {
      const txn = await contracts.rebase?.connect(signer!).rebase(data.rebaseRatio);
      await txn.wait();
      setValue("rebaseRatio", 0);
      toast.success("Rebase successful");
    } catch (e) {
      toast.error("Rebase failed");
    }

    await setupBalanceAndAllowance(address?.toString()!);
  }
  return (
    <div className='m-10 p-10 w-full text-left border'>
      <h1 className='text-3xl'>Rebase Token</h1>
      <form className='flex flex-col m-3' onSubmit={handleSubmit((data) => handleRebase(data))}>
        <label>Rebase Ratio</label>
        <input className='w-full border px-2 mb-2' type="number" {...register("rebaseRatio", { required: true })} />
        <button className='bg-blue-700 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow' type="submit">Submit</button>
      </form>
    </div>
  )
}

export default RebaseToken