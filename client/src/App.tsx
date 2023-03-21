import React from 'react';
import { WagmiConfig, createClient, configureChains, useAccount } from "wagmi";
import { polygonMumbai, polygon } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

import Navigation from './components/Navigation';
import SellToken from './components/SellToken';
import ListOrders from './components/ListOrders';
import BuyToken from './components/BuyToken';
import { TokenProvider } from './context/tokenContext';
import { OrderProvider } from './context/orderContext';

import './App.css';

const { chains, provider, webSocketProvider } = configureChains([polygonMumbai, polygon], [
  publicProvider(),
]);

// Set up client
const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
  ],
  provider,
  webSocketProvider,
});

function App() {
  const { isConnected } = useAccount();
  return (
    <WagmiConfig client={client}>
      <TokenProvider>
        <OrderProvider>
          <div className="App w-full">
            <Navigation />
            <div className='w-full'>
              {isConnected ? (
                <div className='flex flex-row w-full'>
                  <ListOrders />
                  <div className='w-1/2'>
                    <SellToken />
                    <BuyToken />
                  </div>
                </div>
              ) : (
                <div className='p-20'>
                  <h1 className='text-3xl'>Connect Wallet To Proceed</h1>
                </div>
              )}

            </div>
          </div>
        </OrderProvider>
      </TokenProvider>
    </WagmiConfig>

  );
}

export default App;
