import { ethers, JsonRpcProvider } from "ethers";
import { abi as MyNFTAbi, address as MyNFTAddress } from "@/contract/myNFT";

export async function mint(address: string, uri: string) {
  const provider = new JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner();

  const MyNFTContract = new ethers.Contract(MyNFTAddress, MyNFTAbi, signer);

  const result = await MyNFTContract.safeMint(address, uri);
  console.log(result.hash);
}
