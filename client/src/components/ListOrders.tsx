import { useOrders } from '../context/orderContext'

const ListOrders = () => {
  const { orders, selectOrder, selectedOrder } = useOrders()
  return (
    <div className='w-1/2'>
      <h1 className='text-3xl'>List Orders</h1>
      <div className='flex flex-col p-4'>
        {orders.map(({ order, metaData }) => (
          <div
            onClick={() => selectOrder(metaData.orderHash)}
           className={`text-left border p-4 w-fit cursor-pointer ${
              selectedOrder === metaData.orderHash ? 'bg-gray-200' : ''
           }`} key={metaData.orderHash}>
            <p> Seller: { order.maker }</p>
            <p>Maker Token Address: {order.makerToken}</p>
            <p>Taker Token Address: {order.takerToken}</p>
            <p>Selling: {order.makerAmount} for {order.takerAmount} Mock Token</p>
            <p>Order expires in: {Math.ceil(Math.abs((order.expiry * 1000) - Date.now()) / 1000 / 3600)} Hours</p>
          </div>
        ))}
        </div>
    </div>
  )
}

export default ListOrders