// Display names and short descriptions for each skill group.
// Descriptions only restate what the resume lists (tools, the OCI internship, the Oracle certifications).
export const skillMeta: Record<string, { title: string; desc: string; icon: string }> = {
  programming: { title: "Programming", icon: "code", desc: "Python and SQL for automation and data work, Boto3 for scripting AWS, and Jira for tracking the work." },
  os: { title: "Linux", icon: "terminal", desc: "Red Hat Enterprise Linux, the base layer everything else in the stack runs on." },
  cloud: { title: "Cloud Platforms", icon: "cloud", desc: "AWS (EKS, EC2, S3, IAM, VPC, ELB) and Oracle Cloud Infrastructure, backed by an OCI internship and two Oracle certifications." },
  containers: { title: "Containers & Orchestration", icon: "box", desc: "Docker images, Kubernetes clusters, Helm charts and kubectl for running containerized apps." },
  iac: { title: "Infrastructure as Code", icon: "layers", desc: "Terraform and Ansible for provisioning and configuring infrastructure from code." },
  "ci-cd-gitops": { title: "CI/CD & GitOps", icon: "loop", desc: "Pipelines in GitLab CI and GitHub Actions, with GitOps delivery through ArgoCD." },
  "security-networking": { title: "Security & Networking", icon: "shield", desc: "TLS, NGINX, code and image scanning with SonarQube, Trivy and OWASP, plus DNS, load balancing, VPCs, subnets and security groups." },
  observability: { title: "Monitoring & Observability", icon: "pulse", desc: "Prometheus for metrics and Grafana for dashboards and alerting views." },
  "ai-automation": { title: "AI & Automation", icon: "spark", desc: "AI-assisted DevOps automation with Antigravity, Cursor and Claude." },
};
