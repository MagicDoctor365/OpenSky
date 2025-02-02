import { create } from "kubo-rpc-client";

const ipfs = create(new URL("http://127.0.0.1:5001"));

export async function addJSONToIPFS(json: any) {
  try {
    const result = await ipfs.add(JSON.stringify(json));
    return result;
  } catch (error) {
    console.error("Failed to add JSON to IPFS:", error);
  }
}

export async function addFileToIPFS(file: File) {
  try {
    const result = await ipfs.add({ content: file });
    return result;
  } catch (error) {
    console.error("Failed to add file to IPFS:", error);
  }
}
