"use client";

import { Spin, Empty, List, Card, Image } from "antd";
import {
  abi as contractAbi,
  address as contractAddress,
} from "@/contract/myNFT";
import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";

import axios from "axios";

type NFTMetadata = {
  title: string;
  desc: string;
  imageUrl: string;
};

export default function MyNft() {
  const { address: curAccount } = useAccount();
  const [nfts, setNFTs] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  const client = usePublicClient();

  useEffect(() => {
    async function fetchNfts() {
      if (client == null) return;
      try {
        setLoading(true);
        const nftCnt = Number(
          await client.readContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: "balanceOf",
            args: [curAccount],
          })
        );
        const newNFTs: Array<NFTMetadata> = [];
        for (let i = 0; i < nftCnt; i++) {
          const tokenId = (await client.readContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: "tokenOfOwnerByIndex",
            args: [curAccount, BigInt(i)],
          })) as string;
          const tokenURI = await client.readContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: "tokenURI",
            args: [tokenId],
          });
          if (tokenURI != null) {
            const { data: metaData } = await axios.get(tokenURI as string);
            newNFTs.push(metaData);
          }
        }
        setNFTs(newNFTs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchNfts();
  }, [client]);

  const renderNfts = () => {
    if (nfts.length == 0) {
      return <Empty description="No NFTs" />;
    }
    return (
      <List
        grid={{
          gutter: 16,
          column: 4,
        }}
        dataSource={nfts}
        renderItem={({ title, desc, imageUrl }) => (
          <List.Item>
            <Card title={title}>
              <Image src={imageUrl} alt={title} />
              <p>{desc}</p>
            </Card>
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen mt-[64px]">
      {loading ? <Spin tip="Loading" size="large"></Spin> : renderNfts()}
    </div>
  );
}
