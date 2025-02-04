import React from "react";
import { Button, Input } from "antd";
import {
  GithubOutlined,
  TwitterOutlined,
  TikTokOutlined,
  FacebookOutlined,
  WechatOutlined,
  WeiboOutlined,
} from "@ant-design/icons";

export default function Footer() {
  return (
    <div className="w-full bg-primary flex items-center justify-start space-x-10 px-10 py-4 font-bold  text-white">
      <div className="flex-1 ">
        <div>Stay in the loop</div>
        <div>
          Join our mailing list to stay in the loop with our newest feature
          releases, NFT drops, and tips and tricks for navigating OpenSea.
        </div>
        <div className="flex space-x-4 mt-4 items-center justify-center">
          <Input placeholder="Your Email" />
          <Button className="font-bold bg-primaryLight">Sign Up</Button>
        </div>
      </div>
      <div className="flex-1 font-bold text-center">
        Join the community
        <div className="flex justify-center items-center space-x-4 mt-4">
          <GithubOutlined style={{ fontSize: "30px" }} />
          <FacebookOutlined style={{ fontSize: "30px" }} />
          <TwitterOutlined style={{ fontSize: "30px" }} />
        </div>
        <div className="flex justify-center items-center space-x-4 mt-4">
          <WechatOutlined style={{ fontSize: "30px" }} />
          <TikTokOutlined style={{ fontSize: "30px" }} />
          <WeiboOutlined style={{ fontSize: "30px" }} />
        </div>
      </div>
      <div className="flex-1 ">
        <div>Needs Help?</div>
        <Button className="mt-4 font-bold bg-primaryLight">
          Contact Support
        </Button>
      </div>
    </div>
  );
}
