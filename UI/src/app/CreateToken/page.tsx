"use client";

import { useEffect, useState } from 'react'
import { Form, Input, Button, notification } from "antd";
import { useAccount, useWriteContract, useWaitForTransactionReceipt,  type BaseError, useWatchContractEvent, usePublicClient
} from 'wagmi'

import { TokenFactoryAbi } from "@/app/common/abi";
import { TokenFactoryAddress } from '../common/constants';


export default function CreateToken() {
  const {address, isConnected} = useAccount();
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("");

  const { data: hash, isPending, writeContract, error } = useWriteContract();
  const client = usePublicClient();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const submit = async () => {
    console.log(address, tokenName, tokenSymbol, initialSupply);
    writeContract({ 
        abi: TokenFactoryAbi,
        address: TokenFactoryAddress as `0x${string}`,
        functionName: 'createToken',
        args: [
          address,
          initialSupply,
          tokenName,
          tokenSymbol
        ]
     })
  }

  useEffect(() => {
    async function  aa() {
      if (!client) return;
      const logs = await client.getContractEvents({
        address: TokenFactoryAddress as `0x${string}`,
        abi: TokenFactoryAbi,
        eventName: 'TokenCreated', 
      });
      console.log(logs);
    }
    aa();
  }, []);


  // useWatchContractEvent({
  //   address: TokenFactoryAddress as `0x${string}`,
  //   abi: TokenFactoryAbi,
  //   eventName: 'TokenCreated',
  //   poll: true,
  //   pollingInterval: 1000,
  //   onLogs(logs) {
  //     console.log('New logs!', logs);
  //   },
  //   onError(error) {
  //     console.log('Error', error)
  //   }
  // })

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
        <h2>Create ERC20 Token</h2>
      <Form
        layout="vertical"
        onFinish={ submit }
      >
        <Form.Item label="Token Name" required>
          <Input
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="Enter token name"
          />
        </Form.Item>

        <Form.Item label="Token Symbol" required>
          <Input
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            placeholder="Enter token symbol"
          />
        </Form.Item>

        <Form.Item label="Initial Supply" required>
          <Input
            type="number"
            value={initialSupply}
            onChange={(e) => setInitialSupply(e.target.value)}
            placeholder="Enter initial supply"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} disabled={isPending}>
            {isPending ? "Creating Token..." : "Create Token" }
          </Button>
        </Form.Item>
      </Form>

      {hash && <div>Transaction Hash: {hash}</div>}
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <div>Transaction confirmed.</div>}
      {error && (
        <div>Error: {(error as BaseError).shortMessage || error.message}</div>
      )}
    </div>
  )
}
