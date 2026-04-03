import { useEffect, useState } from "react";
import type { Group } from "@/entities/group/model/types";

interface UseGroupsResult {
  data: Group[];
  isLoading: boolean;
  isEmpty: boolean;
}

const mockGroups: Group[] = [
  {
    id: "grp_frontend_forge",
    name: "Frontend Forge",
    description: "Craft production-ready interfaces with React, TypeScript, motion, and scalable design systems.",
    memberCount: 9840,
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "grp_cloud_native",
    name: "Cloud Native Crew",
    description: "Swap notes on Kubernetes, observability, platform tooling, and resilient release pipelines.",
    memberCount: 11450,
    imageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "grp_open_source",
    name: "Open Source Orbit",
    description: "Review pull requests, maintain public libraries, and build healthier contributor workflows together.",
    memberCount: 12480,
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "grp_design_systems",
    name: "Design Systems Guild",
    description: "Align tokens, component APIs, and accessibility rules across ambitious product surfaces.",
    memberCount: 8350,
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "grp_ai_builders",
    name: "AI Builders Circle",
    description: "Prototype assistants, evaluation flows, and trustworthy AI experiences with other builders.",
    memberCount: 14320,
    imageUrl:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "grp_devrel_lab",
    name: "DevRel Lab",
    description: "Explore docs strategy, community programming, and launch playbooks for developer products.",
    memberCount: 6925,
    imageUrl:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "grp_security_ops",
    name: "Security Ops Nexus",
    description: "Trade incident response lessons, secure-by-default patterns, and pragmatic application defense.",
    memberCount: 7680,
    imageUrl:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "grp_product_engineering",
    name: "Product Engineering Room",
    description: "Bridge design, analytics, and engineering execution around high-signal product delivery.",
    memberCount: 9055,
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  },
];

export function useGroups(): UseGroupsResult {
  const [data, setData] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setData(mockGroups);
      setIsLoading(false);
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return {
    data,
    isLoading,
    isEmpty: !isLoading && data.length === 0,
  };
}
