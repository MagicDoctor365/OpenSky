"use client";

import { Context } from "@/components/WrapApp";
import { Card, List, Image, Spin } from "antd";
import { useEffect, useState, useContext } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";

import {
  address as marketAddress,
  abi as marketAbi,
} from "@/contract/nftMarkt";

type NFTMetadata = {
  title: string;
  desc: string;
  imageUrl: string;
  isListed: boolean;
  tokenId: string;
};

export default () => {
  const { address: curAccount } = useAccount();
  const [nfts, setNFTs] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();

  const client = usePublicClient();
  const { notificationApi } = useContext(Context);

  useEffect(() => {
    async function fetchNfts() {
      if (client == null || curAccount == null) return;
      const result = await client.readContract({
        address: marketAddress,
        abi: marketAbi,
        functionName: "getAllNFTs",
      });
      console.log(result);
    }
    fetchNfts();
  }, [client]);

  const renderNfts = () => {
    return (
      <List
        grid={{
          gutter: 16,
          column: 4,
        }}
        dataSource={nfts}
        renderItem={({ title, desc, imageUrl, isListed, tokenId }) => (
          <List.Item>
            <Card title={title} className="w-[300px]">
              <Image src={imageUrl} alt={title} width={260} />
              <p>{desc}</p>
            </Card>
          </List.Item>
        )}
      />
    );
  };
  return (
    <div className="flex items-center justify-center h-screen">
      {loading ? <Spin tip="Loading" size="large"></Spin> : renderNfts()}
    </div>
  );
};
