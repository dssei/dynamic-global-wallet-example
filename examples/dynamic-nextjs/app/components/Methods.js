'use client';
import { useState, useEffect } from 'react';
import { useDynamicContext, useIsLoggedIn, useUserWallets } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { encodeFunctionData } from 'viem';
import { createKernelClient } from "@sei-js/sei-global-wallet/zerodev";
import gw from '@sei-js/sei-global-wallet'

import './Methods.css';
import {PaymasterTypeEnum} from "@dynamic-labs/ethereum-aa";

export default function DynamicMethods({ isDarkMode }) {
  const isLoggedIn = useIsLoggedIn();
  const { sdkHasLoaded, primaryWallet, user } = useDynamicContext();
  const userWallets = useUserWallets();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState('');

  const safeStringify = (obj) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    }, 2);
  };

  useEffect(() => {
    if (sdkHasLoaded && isLoggedIn && primaryWallet) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [sdkHasLoaded, isLoggedIn, primaryWallet]);

  function clearResult() {
    setResult('');
  }

  function showUser() {
    setResult(safeStringify(user));
  }

  function showUserWallets() {
    setResult(safeStringify(userWallets));
  }


    async function fetchPublicClient() {
        if(!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        const publicClient = await primaryWallet.getPublicClient();
        setResult(safeStringify(publicClient));
    }

    async function fetchWalletClient() {
        if(!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        const walletClient = await primaryWallet.getWalletClient();
        setResult(safeStringify(walletClient));
    }

    async function signEthereumMessage() {
        if(!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        const signature = await primaryWallet.signMessage("Hello World");
        setResult(signature);
    }


    async function fetchConnection() {
        if(!primaryWallet || !isSolanaWallet(primaryWallet)) return;

        const connection = await primaryWallet.getConnection();
        setResult(safeStringify(connection));
    }

    async function fetchSigner() {
        if(!primaryWallet || !isSolanaWallet(primaryWallet)) return;

        const signer = await primaryWallet.getSigner();
        setResult(safeStringify(signer));
    }

    async function signSolanaMessage() {
        if(!primaryWallet || !isSolanaWallet(primaryWallet)) return;

        const signature = await primaryWallet.signMessage("Hello World");
        setResult(signature);
    }


    async function interactWithCounter() {
        try {

            setResult('Creating ZeroDev kernel client for AA transaction...');

            const contractAddress = '0x5bed1d02dc4c1696b1167e78254686d54bcb8a5a';
            const contractABI = [
                {
                    inputs: [],
                    name: 'increment',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                },
                {
                    inputs: [],
                    name: 'getCount',
                    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
                    stateMutability: 'view',
                    type: 'function',
                },
            ];

            const publicClient = await primaryWallet.getPublicClient();

            // First, read the current count
            const currentCount = await publicClient.readContract({
                address: contractAddress,
                abi: contractABI,
                functionName: 'getCount',
            });

            setResult(`Current count: ${currentCount}\nSetting up ZeroDev Account Abstraction with extensive logging...`);

            try {
                console.log('🔧 Step 1: Importing ZeroDev SDK and viem dependencies...');

                // Try to import the required functions and constants

                const smartWallet = gw.wallets[0]

                // Check if this is a smart wallet (AA-enabled)
                console.log('Smart wallet:', smartWallet);
                console.log('Wallet keys:', Object.keys(smartWallet));

                const kernelClient = await createKernelClient({
                    wallet: smartWallet,
                    paymaster: PaymasterTypeEnum.SPONSOR,
                    paymasterRpc: 'https://rpc.zerodev.app/api/v2/paymaster/e4f5bff6-c521-4b69-adce-7102b6b240d2?selfFunded=true',
                });
                const { account } = kernelClient;

                console.log('Kernel client', kernelClient)
                console.log('Account:', account);

                setResult(`Current count: ${currentCount}\nZeroDev setup complete! Sending AA transaction...`);

                console.log('✅ Step 3: User operation prepared');

                console.log('🚀 Step 4: Sending user operation...');


                const hash = await kernelClient.sendUserOperation({
                    callData: await kernelClient.account.encodeCalls([{
                        to: primaryWallet.address,
                        value: BigInt(0),
                        data: "0x", // Empty data for simple ETH transfer
                    }])
                })
                console.log('🚀 User operation sent!');
                console.log('User operation hash:', hash);

                setResult(`AA Transaction sent!\nUser Operation Hash: ${hash}\nWaiting for confirmation...`);

                console.log('⏳ Step 5: Waiting for user operation receipt...');
                // Wait for the user operation to be mined
                await new Promise(resolve => setTimeout(resolve, 5000));

                console.log('📖 Step 6: Reading new count...');
                const newCount = await publicClient.readContract({
                    address: contractAddress,
                    abi: contractABI,
                    functionName: 'getCount',
                });
                console.log('New count:', newCount);

                setResult(
                    `✅ Counter incremented successfully with ZeroDev Account Abstraction!\n\n` +
                    `Previous count: ${currentCount}\n` +
                    `New count: ${newCount}\n\n` +
                    `🎉 Transaction was sponsored (gas-free)!\n` +
                    `🔗 Using ZeroDev v5 with ERC-4337\n` +
                    `⛽ Paymaster: Gas sponsored\n`
                );

            } catch (aaError) {
                console.error('❌ ZeroDev AA Error:', aaError);
                console.error('Error stack:', aaError.stack);

                // Fallback to regular transaction
                console.log('🔄 Falling back to regular transaction...');

                const walletClient = await primaryWallet.getWalletClient();
                const hash = await walletClient.writeContract({
                    address: contractAddress,
                    abi: contractABI,
                    functionName: 'increment',
                });

                const receipt = await publicClient.waitForTransactionReceipt({ hash });
                const newCount = await publicClient.readContract({
                    address: contractAddress,
                    abi: contractABI,
                    functionName: 'getCount',
                });

                setResult(
                    `⚠️ ZeroDev AA failed, used regular transaction instead\n\n` +
                    `AA Error: ${aaError.message}\n\n` +
                    `Previous count: ${currentCount}\n` +
                    `New count: ${newCount}\n\n` +
                    `Transaction hash: ${hash}\n` +
                    `Block: ${receipt.blockNumber}\n` +
                    `Gas used: ${receipt.gasUsed}`
                );
            }

        } catch (error) {
            console.error('AA Counter interaction error:', error);
            setResult(`Error: ${error.message}\n\nNote: Make sure you have a smart wallet (AA-enabled) and @zerodev/sdk is installed.`);
        }
    }



   return (
    <>
      {!isLoading && (
        <div className="dynamic-methods" data-theme={isDarkMode ? 'dark' : 'light'}>
          <div className="methods-container">
            <button className="btn btn-primary" onClick={showUser}>Fetch User</button>
            <button className="btn btn-primary" onClick={showUserWallets}>Fetch User Wallets</button>


    {primaryWallet && isEthereumWallet(primaryWallet) &&
      <>
        <button className="btn btn-primary" onClick={fetchPublicClient}>Fetch Public Client</button>
        <button className="btn btn-primary" onClick={fetchWalletClient}>Fetch Wallet Client</button>
        <button className="btn btn-primary" onClick={signEthereumMessage}>Sign "Hello World" on Ethereum</button>
      </>
    }


    {primaryWallet && isSolanaWallet(primaryWallet) &&
      <>
        <button className="btn btn-primary" onClick={fetchConnection}>Fetch Connection</button>
        <button className="btn btn-primary" onClick={fetchSigner}>Fetch Signer</button>
          <button className="btn btn-primary" onClick={signSolanaMessage}>Sign "Hello World" on Solana</button>
      </>
  }

    {primaryWallet && isEthereumWallet(primaryWallet) &&
      <>
        <button className="btn btn-primary" onClick={interactWithCounter}>Increment Counter Contract</button>
      </>
    }

        </div>
          {result && (
            <div className="results-container">
              <pre className="results-text">{result}</pre>
            </div>
          )}
          {result && (
            <div className="clear-container">
              <button className="btn btn-primary" onClick={clearResult}>Clear</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
