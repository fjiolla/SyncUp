import { PodDetailPage } from "@/components/pod-detail-page"

export default function PodDetail({ params }: { params: { id: string } }) {
  return <PodDetailPage podId={params.id} />
}
