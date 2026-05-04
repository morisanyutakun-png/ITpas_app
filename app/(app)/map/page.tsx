import { getCurrentUser } from "@/lib/currentUser";
import { getRoadmap } from "@/server/queries/roadmap";
import { ConceptMapView } from "./ConceptMapView";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "コンセプトマップ",
  description:
    "ITパスポートの試験範囲を 3 クラスタで配置。あなたの理解度を地図上で可視化します。",
};

export default async function MapPage() {
  const user = await getCurrentUser();
  const roadmap = await getRoadmap(user.id);

  return (
    <div className="pb-12">
      <ConceptMapView roadmap={roadmap} />
    </div>
  );
}
