import React, {
  ReactNode,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Contract, utils } from "ethers";
import { useNetwork, useProvider, useSigner, useAccount } from "wagmi";
import { getContractAddressesForChainOrThrow } from "@0x/contract-addresses";


import rebaseToken from "../utils/rebaseToken.json";
import mockToken from "../utils/mockToken.json";

const makerToken = '0xA71dAf3a98c0fC93F53849ceFb76D2A27538eA9F'; // Rebase Token
const takerToken = '0xAcBFc51186a5104BEA8DDc98c9C45569e86d2e0E'; // Mock Token

type IToken = {
  contracts: Record<string, Contract | undefined>;
  allowances: Record<string, string>;
  balances: Record<string, string>;
  setupBalanceAndAllowance: (account: string) => void;
};

export const TokenContext = React.createContext<IToken>({
  contracts: {},  // ethers.Contract instances
  allowances: {}, // account's allowance to exchangeProxy
  balances: {},   // token balances
  setupBalanceAndAllowance: (account: string) => {},  // read balances of connected wallet from token contracts
});

export const useToken = () => {
  return useContext(TokenContext);
};

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  // allowances to 0xProxy
  const [allowances, setAllowances] = useState({});
  const [balances, setBalances] = useState({});

  // get wallet info from wagmi
  const provider = useProvider();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const { address } = useAccount();

  const contracts = useMemo(
    () =>
      !chain || chain?.unsupported
        ? {}
        : {
            rebase: new Contract(
              makerToken,
              rebaseToken.abi,
              signer || provider
            ),
            mockToken: new Contract(
              takerToken,
              mockToken.abi,
              signer || provider
            ),
          },
    [chain, signer, provider]
  );
  const proxyAddress = useMemo(
    () =>
      chain?.id && getContractAddressesForChainOrThrow(chain?.id).exchangeProxy,
    [chain?.id]
  );
  const setupBalanceAndAllowance = useCallback(async (account: string) => {
    if (!contracts.rebase || !contracts.mockToken || !account) {
      return;
    }

    setBalances({
      rebaseToken: utils.formatEther(await contracts.rebase.balanceOf(account)),
      mockToken: utils.formatEther(await contracts.mockToken.balanceOf(account)),
    });
    setAllowances({
      rebaseToken: utils.formatEther(
        await contracts.rebase.allowance(account, proxyAddress)
      ),
      mockToken: utils.formatEther(
        await contracts.mockToken.allowance(account, proxyAddress)
      ),
    });
  }, [contracts, proxyAddress]);

  useEffect(() => {
    if (address) {
      setupBalanceAndAllowance(address);
    }
  }, [address, chain, setupBalanceAndAllowance]);

  return (
    <TokenContext.Provider
      value={{ contracts, allowances, balances, setupBalanceAndAllowance }}
    >
      {children}
    </TokenContext.Provider>
  );
};
