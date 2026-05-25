import { PipelineIntelligenceClient } from "./pipeline-intelligence-client";

export const metadata = {
  title: "Pipeline Intelligence | MergeX Sales OS",
  description: "Analyze lost deals, conversion rates, and competitor intelligence.",
};

export default function PipelineIntelligencePage() {
  return <PipelineIntelligenceClient />;
}
