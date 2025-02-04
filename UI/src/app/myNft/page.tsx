"use client";

import { Spin, Empty, List, Result, Button } from "antd";
import { abi as myNFTAbi, address as myNFTAddress } from "@/contract/myNFT";
import {
  abi as nftMarketAbi,
  address as nftMarketAddress,
} from "@/contract/nftMarkt";
import { useContext, useEffect, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import axios from "axios";
import { Context } from "@/components/WrapApp";
import NFTCard, { NFT } from "@/components/NFTCard";
import { useRouter } from "next/navigation";

export default function MyNft() {
  const { address: curAccount } = useAccount();
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const router = useRouter();

  const client = usePublicClient();
  const { notificationApi } = useContext(Context);

  useEffect(() => {
    async function fetchNfts() {
      if (client == null || curAccount == null) return;
      try {
        setLoading(true);
        const nftCnt = Number(
          await client.readContract({
            address: myNFTAddress,
            abi: myNFTAbi,
            functionName: "balanceOf",
            args: [curAccount],
          })
        );
        const newNFTs: Array<NFT> = [];
        for (let i = 0; i < nftCnt; i++) {
          const tokenId = Number(
            await client.readContract({
              address: myNFTAddress,
              abi: myNFTAbi,
              functionName: "tokenOfOwnerByIndex",
              args: [curAccount, BigInt(i)],
            })
          );
          const tokenURI = await client.readContract({
            address: myNFTAddress,
            abi: myNFTAbi,
            functionName: "tokenURI",
            args: [tokenId],
          });
          if (tokenURI != null) {
            const { data: metaData } = await axios.get(tokenURI as string);
            const isListed = await client.readContract({
              address: nftMarketAddress,
              abi: nftMarketAbi,
              functionName: "isListed",
              args: [tokenId],
            });
            const [seller, , price] = (await client.readContract({
              address: nftMarketAddress,
              abi: nftMarketAbi,
              functionName: "orderOfId",
              args: [tokenId],
            })) as any[];
            newNFTs.push({
              ...metaData,
              tokenId,
              isListed,
              seller,
              price: Number(price),
            });
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
  }, [client, curAccount]);

  const listBtnClickHandler = async (tokenId: number, price: number) => {
    const result = await writeContractAsync({
      abi: nftMarketAbi,
      address: nftMarketAddress!,
      functionName: "placeOrder",
      args: [curAccount, tokenId, price],
    });
    if (result) {
      notificationApi?.success({
        message: "Listed success",
        description: `NFT ${tokenId} has listed to the market successfully.`,
        duration: 10,
      });

      // update nfts state
      const newNfts = nfts.map((nft: NFT) => {
        if (nft.tokenId == tokenId) {
          nft.isListed = true;
          nft.seller = curAccount;
          nft.price = price;
        }
        return nft;
      });
      setNFTs(newNfts);
    }
  };

  const renderNfts = () => {
    if (nfts.length == 0) {
      return <Empty description="No NFTs" />;
    }
    return (
      <List
        grid={{
          gutter: 16,
        }}
        dataSource={nfts}
        renderItem={(nft: any) => (
          <List.Item>
            <NFTCard
              nft={nft}
              curAccount={curAccount!}
              listBtnClickHandler={listBtnClickHandler}
            />
          </List.Item>
        )}
      />
    );
  };

  if (curAccount == null) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page. Please connect your wallet first."
        extra={
          <Button type="primary" onClick={() => router.push("/market")}>
            Back Home
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {loading ? <Spin size="large"></Spin> : renderNfts()}
    </div>
  );
}
