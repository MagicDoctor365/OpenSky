"use client";

import { Spin, Empty, List, Card, Image, Button } from "antd";
import { abi as myNFTAbi, address as myNFTAddress } from "@/contract/myNFT";
import {
  abi as nftMarketAbi,
  address as nftMarketAddress,
} from "@/contract/nftMarkt";
import { useContext, useEffect, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import axios from "axios";
import { Context } from "@/components/WrapApp";

type NFTMetadata = {
  title: string;
  desc: string;
  imageUrl: string;
  isListed: boolean;
  tokenId: string;
};

export default function MyNft() {
  const { address: curAccount } = useAccount();
  const [nfts, setNFTs] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();

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
        const newNFTs: Array<NFTMetadata> = [];
        for (let i = 0; i < nftCnt; i++) {
          const tokenId = (await client.readContract({
            address: myNFTAddress,
            abi: myNFTAbi,
            functionName: "tokenOfOwnerByIndex",
            args: [curAccount, BigInt(i)],
          })) as string;
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
            newNFTs.push({ ...metaData, tokenId, isListed });
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
        renderItem={({ title, desc, imageUrl, isListed, tokenId }) => (
          <List.Item>
            <Card title={title} className="w-[300px]">
              <Image src={imageUrl} alt={title} width={260} />
              <p>{desc}</p>
              {isListed ? (
                <div>Listed</div>
              ) : (
                <Button
                  type="primary"
                  onClick={async () => {
                    const result = await writeContractAsync({
                      abi: nftMarketAbi,
                      address: nftMarketAddress!,
                      functionName: "placeOrder",
                      args: [curAccount, tokenId, 100],
                    });
                    if (result) {
                      console.log("listed success:", result);
                      notificationApi?.success({
                        message: "Listed success",
                        description: `NFT ${tokenId} has listed to the market successfully.`,
                        duration: 10,
                      });

                      // update nfts state
                      const newNfts = nfts.map((nft: NFTMetadata) => {
                        if (nft.tokenId == tokenId) {
                          nft.isListed = true;
                        }
                        return nft;
                      });
                      setNFTs(newNfts);
                    }
                  }}
                >
                  List
                </Button>
              )}
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
