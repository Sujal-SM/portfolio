// Architecture diagrams, built only from what the resume says about each project.
export type DNode = { id: string; label: string; x: number; y: number; desc: string };
export type Diagram = { nodes: DNode[]; edges: [string, string][] };

export const architecture: Record<string, Diagram> = {
  "retail-store-sample-app": {
    nodes: [
      { id: "dev", label: "git push", x: 60, y: 60, desc: "Code changes land on GitHub and trigger the pipeline." },
      { id: "gha", label: "GitHub Actions", x: 230, y: 60, desc: "CI/CD: builds the microservices (Java, Go, Node.js) and runs checks." },
      { id: "sec", label: "SonarQube + Trivy + OWASP", x: 430, y: 60, desc: "Code quality and security scanning before anything ships." },
      { id: "argo", label: "ArgoCD", x: 430, y: 170, desc: "GitOps: syncs the declared Kubernetes manifests to the clusters." },
      { id: "tf", label: "Terraform", x: 60, y: 170, desc: "Provisions the infrastructure as code." },
      { id: "eks", label: "AWS EKS (Auto Mode)", x: 230, y: 170, desc: "Production cluster running the microservices behind NGINX." },
      { id: "kind", label: "Kind cluster", x: 230, y: 270, desc: "Local Kubernetes cluster for the same GitOps setup." },
      { id: "mon", label: "Prometheus + Grafana", x: 430, y: 270, desc: "Monitoring and dashboards for the running services." },
      { id: "mail", label: "Email alerts", x: 600, y: 170, desc: "Alerts sent when a deployment fails." },
    ],
    edges: [["dev", "gha"], ["gha", "sec"], ["sec", "argo"], ["tf", "eks"], ["argo", "eks"], ["argo", "kind"], ["eks", "mon"], ["argo", "mail"]],
  },
  "autonomous-agentic-ai-framework": {
    nodes: [
      { id: "q", label: "Research question", x: 60, y: 120, desc: "The topic the user wants researched." },
      { id: "plan", label: "Planning agent", x: 220, y: 120, desc: "Breaks the question into a research plan (CrewAI agents)." },
      { id: "ret", label: "Source retrieval", x: 380, y: 50, desc: "Finds sources on the web with Exa and Tavily." },
      { id: "val", label: "Validation", x: 380, y: 190, desc: "Checks sources for reliability before they are used." },
      { id: "ev", label: "Evidence extraction", x: 540, y: 120, desc: "Pulls the facts that answer the plan, with their sources." },
      { id: "rep", label: "Report synthesis", x: 540, y: 250, desc: "Writes a structured, citation-backed report with OpenAI models." },
      { id: "loop", label: "Iterate", x: 220, y: 250, desc: "Modular pipelines repeat the cycle for deeper research." },
    ],
    edges: [["q", "plan"], ["plan", "ret"], ["ret", "val"], ["val", "ev"], ["ret", "ev"], ["ev", "rep"], ["rep", "loop"], ["loop", "plan"]],
  },
  krishiai: {
    nodes: [
      { id: "in", label: "Image / text / voice", x: 60, y: 140, desc: "Farmers describe the problem the way that suits them." },
      { id: "api", label: "FastAPI", x: 220, y: 140, desc: "Backend that routes each request to the right model." },
      { id: "cv", label: "CNN + XGBoost, GPT-4o Vision", x: 410, y: 40, desc: "Computer vision for crop disease detection and risk prediction." },
      { id: "rag", label: "RAG pipelines", x: 410, y: 140, desc: "Grounds advice in a knowledge base." },
      { id: "chat", label: "Conversational AI", x: 410, y: 240, desc: "Multilingual advisory in a chat format." },
      { id: "out", label: "Diagnosis + forecasting", x: 600, y: 90, desc: "Real-time diagnosis and risk forecasts back to the farmer." },
      { id: "agro", label: "Agronomist escalation", x: 600, y: 210, desc: "Hard cases are escalated to an expert automatically." },
      { id: "k8s", label: "Docker + Kubernetes", x: 220, y: 260, desc: "Cloud-native infrastructure the services run on." },
    ],
    edges: [["in", "api"], ["api", "cv"], ["api", "rag"], ["api", "chat"], ["cv", "out"], ["rag", "out"], ["chat", "agro"], ["rag", "agro"], ["k8s", "api"]],
  },
};
