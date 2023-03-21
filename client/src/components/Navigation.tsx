import React from 'react'
import { useAccount, useDisconnect, useConnect } from "wagmi";

const Navigation = () => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isLoading, pendingConnector } =
  useConnect();

  return (
    <div className='flex justify-between py-5 border px-20'>
      <span>Rebase Token Swap</span>
      {!isConnected && (
          connectors.map((connector) => (
            <button
              className="bg-blue-700 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
              disabled={!connector.ready}
              key={connector.id}
              onClick={() => connect({ connector })}
            >
              Connect {connector.name}
              {!connector.ready && ' (unsupported)'}
              {isLoading &&
                connector.id === pendingConnector?.id &&
                ' (connecting)'}
            </button>
          ))
      )}
      {isConnected && (
        <button className="bg-red-700 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" onClick={() => disconnect()}>
        Disconnect
      </button>
      )}
    </div>
  )
}

export default Navigation