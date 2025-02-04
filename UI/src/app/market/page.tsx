"use client";

import { Context } from "@/components/WrapApp";
import { Spin, Empty } from "antd";
import { useEffect, useState, useContext } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import axios from "axios";

import {
  address as marketAddress,
  abi as marketAbi,
} from "@/contract/nftMarkt";
import { address as myNftAddress, abi as myNftAbi } from "@/contract/myNFT";
import NFTCard, { NFT } from "@/components/NFTCard";
import { parseEther } from "viem";

export default () => {
  const { address: curAccount } = useAccount();
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();

  const client = usePublicClient();
  const { notificationApi } = useContext(Context);

  useEffect(() => {
    async function fetchNfts() {
      if (client == null) return;
      setLoading(true);
      try {
        const allNfts = await client.readContract({
          address: marketAddress,
          abi: marketAbi,
          functionName: "getAllNFTs",
        });
        console.log(allNfts);
        if (allNfts == null || (allNfts as any[]).length == 0) return;
        const newNFTs: NFT[] = [];
        for (let i = 0; i < (allNfts as any[]).length; i++) {
          const { tokenId, price, seller } = (allNfts as any)[i];
          const tokenURI = await client.readContract({
            address: myNftAddress,
            abi: myNftAbi,
            functionName: "tokenURI",
            args: [Number(tokenId)],
          });
          if (tokenURI != null) {
            const { data: metaData } = await axios.get(tokenURI as string);
            newNFTs.push({
              ...metaData,
              tokenId: Number(tokenId),
              price: Number(price),
              seller,
              isListed: true,
            });
          }
        }
        console.log(newNFTs);
        setNFTs(newNFTs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchNfts();
  }, [client]);

  const buyClickHandler = async (tokenId: number) => {
    const result = await writeContractAsync({
      abi: marketAbi,
      address: marketAddress!,
      functionName: "buy",
      args: [tokenId],
    });
    console.log(result);
  };

  const renderNfts = () => {
    if (nfts.length == 0) {
      return <Empty description="No NFTs" />;
    }
    if (curAccount == null) {
      return <Empty description="Please connect your wallet" />;
    }
    return (
      <div className="flex flex-wrap justify-start space-x-4 items-center space-y-4 ">
        {nfts.map((nft: NFT) => (
          <NFTCard
            nft={nft}
            curAccount={curAccount!}
            buyClickHandler={buyClickHandler}
          />
        ))}
      </div>
    );
  };
  return (
    <div className="flex items-center justify-center h-full">
      {loading ? <Spin tip="Loading" size="large"></Spin> : renderNfts()}
    </div>
  );
};
