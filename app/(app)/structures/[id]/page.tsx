import { StructureDetail } from '@/components/structures/StructureDetail';

export default async function StructureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StructureDetail id={id} />;
}
