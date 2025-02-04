"use client";

import {
  Card,
  Button,
  InputNumber,
  Tag,
  Descriptions,
  Modal,
  Image,
} from "antd";
import NextImage from "next/image";
import { useState } from "react";
import { zeroAddress } from "viem";

export type NFT = {
  title: string;
  desc: string;
  imageUrl: string;
  tokenId: number;
  isListed?: boolean;
  price?: number;
  seller?: string;
};

export type NFTCardProps = {
  nft: NFT;
  curAccount: string;
  listBtnClickHandler?: (tokenId: number, price: number) => void;
  buyClickHandler?: (tokenId: number) => void;
};

const NFTCard = ({
  nft,
  curAccount,
  listBtnClickHandler,
  buyClickHandler,
}: NFTCardProps) => {
  const { title, desc, imageUrl, isListed, tokenId, seller, price } = nft;
  const [listPrice, setListPrice] = useState(0);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const renderListForm = () => {
    if (isListed) return null;
    return (
      <>
        <div className="font-bold mb-2">Publish Your NFT to Market!</div>
        <div className="flex flex-row items-center space-x-2">
          <InputNumber
            addonBefore={
              <div className="w-[20px] h-[20px]">
                <NextImage
                  src="/ETH.png"
                  width={20}
                  height={20}
                  alt="ETH logo"
                />
              </div>
            }
            addonAfter="ETH"
            defaultValue={0}
            min={0}
            onChange={(value: any) => {
              setListPrice(value);
            }}
          />
          <Button
            type="primary"
            onClick={() => {
              if (listBtnClickHandler) {
                listBtnClickHandler(tokenId, listPrice);
              }
            }}
          >
            List
          </Button>
        </div>
      </>
    );
  };

  const renderBrief = () => {
    if (!isListed) return null;
    const items: any[] = [
      {
        label: "Token Id",
        children: tokenId,
      },
      {
        label: "Price",
        children: price,
      },
      {
        label: "Seller",
        span: "filled",
        children: <div>{seller?.slice(0, 5) + "..." + seller?.slice(-5)}</div>,
      },
    ];
    return <Descriptions bordered items={items} layout="vertical" />;
  };

  const renderDetailModal = () => {
    const items: any[] = [
      {
        label: "Title",
        children: title,
      },
      {
        label: "Token Id",
        children: tokenId,
      },
      {
        label: "Price",
        children: price,
      },
      {
        label: "Seller",
        span: "filled",
        children: seller === zeroAddress ? "Not Listed" : seller,
      },
      {
        label: "Description",
        span: "filled",
        children: desc,
      },
    ];
    return (
      <Modal
        title="Detail Information"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        onOk={() => setIsDetailModalOpen(false)}
        onClose={() => setIsDetailModalOpen(false)}
      >
        <Descriptions bordered items={items} layout="vertical" />
      </Modal>
    );
  };

  return (
    <Card
      title={title}
      className="w-[400px]"
      extra={
        <div className="flex items-center space-x-2">
          <Button type="link" onClick={() => setIsDetailModalOpen(true)}>
            Detail
          </Button>
          {seller !== zeroAddress && seller !== curAccount && (
            <Button
              type="primary"
              onClick={() => {
                if (buyClickHandler) {
                  buyClickHandler(tokenId);
                }
              }}
            >
              Buy
            </Button>
          )}
          {isListed && <Tag color="green">Listed</Tag>}
        </div>
      }
    >
      <>
        <Image src={imageUrl} alt={title} width={360} />
        {renderBrief()}
        {renderDetailModal()}
        {renderListForm()}
      </>
    </Card>
  );
};

export default NFTCard;
