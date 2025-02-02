export default async function NftDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  return (
    <div className="flex items-center justify-center h-screen">
      Nft Detail: {id}
    </div>
  );
}
