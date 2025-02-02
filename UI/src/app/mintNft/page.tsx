"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Space, Upload, Result } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import axios from "axios";
import { useAccount, useWriteContract } from "wagmi";
import {
  address as contractAddress,
  abi as contractAbi,
} from "@/contract/myNFT";

export default () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showNullImageError, setShowNullImageError] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const { address: curAccount } = useAccount();
  const [showResult, setShowResult] = useState(false);

  const onFinish = async (values: any) => {
    if (imageUrl == null) {
      setShowNullImageError(true);
      return;
    }
    const metadata = {
      ...values,
      imageUrl: imageUrl,
    };
    const { data, status } = await axios.post(
      "/api/nft/uploadMetadata",
      metadata
    );
    if (status == 200 && data && curAccount) {
      const { cid } = data;
      const result = await writeContractAsync({
        abi: contractAbi,
        address: contractAddress!,
        functionName: "safeMint",
        args: [curAccount, "http://127.0.0.1:8080/ipfs/" + cid],
      });
      console.log(result);
      setShowResult(true);
    }
  };

  const renderForm = () => (
    <div className="flex justify-center items-center h-screen">
      <Card title="Mint NFT">
        <Form
          name="MintNFt"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          className="w-[600px]"
          initialValues={{
            title: "",
            desc: "",
            fileList: null,
          }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[
              {
                required: true,
                message: "Input the title of your NFT",
              },
            ]}
          >
            <Input placeholder="Input the title of your NFT" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="desc"
            rules={[
              {
                required: true,
                message: "Describe your NFT",
              },
            ]}
          >
            <Input placeholder="Describe your NFT" />
          </Form.Item>
          <Form.Item label="Image">
            <Upload
              listType="picture-card"
              maxCount={1}
              action="/api/nft/uploadImage"
              method="post"
              onChange={({ file }) => {
                setShowNullImageError(false);
                const cid = file?.response?.cid;
                if (cid) {
                  setImageUrl("http://127.0.0.1:8080/ipfs/" + cid);
                }
              }}
            >
              <button
                style={{
                  border: 0,
                  background: "none",
                }}
                type="button"
              >
                <PlusOutlined />
                <div
                  style={{
                    marginTop: 8,
                  }}
                >
                  Upload
                </div>
              </button>
            </Upload>
            {showNullImageError && (
              <div className="text-red-500">
                Please upload a image for your NFT
              </div>
            )}
          </Form.Item>
          <Form.Item>
            <Space className="flex justify-end">
              <Button>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );

  const renderResult = () => {
    return (
      <Result
        status="success"
        title="You mint a NFT successfully."
        subTitle=""
        extra={[
          <Button type="primary" key="console">
            Go to your NFTs.
          </Button>,
          <Button key="buy">Back to Mint</Button>,
        ]}
      ></Result>
    );
  };

  return showResult ? renderResult() : renderForm();
};
