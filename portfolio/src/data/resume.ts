// Every value here comes from the uploaded resume (text + embedded hyperlinks).
// Edit this file to update the site; components read from it.

// Set VITE_RESUME_URL="" to hide every resume link.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RESUME_URL: string = (import.meta as any).env?.VITE_RESUME_URL ?? "/resume.pdf";

export const profile = {
  name: "Sujal Malhotra",
  handle: "sujal",
  role: "Cloud & DevOps Engineer",
  headline: "I build and run cloud infrastructure on OCI and AWS.",
  intro:
    "B.Tech CSE student at VIPS-TC and Oracle-certified DevOps professional. I work with Kubernetes, Terraform and GitOps pipelines, and I build AI tools on the side.",
  email: "malhotrasujal98@gmail.com",
  phone: "+91 83075 92137",
  phoneHref: "tel:+918307592137",
  github: { label: "Sujal-SM", url: "https://github.com/Sujal-SM" },
  linkedin: { label: "Sujal Malhotra", url: "https://www.linkedin.com/in/sujal-malhotra-407905252" },
};

export type Project = {
  slug: string;
  name: string;
  summary: string;
  details: string[];
  stack: string[];
  repo?: string;
  demo?: string;
};

export const projects: Project[] = [
  {
    slug: "retail-store-sample-app",
    name: "Retail Store Sample App",
    summary: "Microservices deployed across AWS EKS (Auto Mode) and Kind clusters using GitOps.",
    details: [
      "Automated infrastructure with Terraform",
      "CI/CD with GitHub Actions and ArgoCD",
      "Prometheus and Grafana monitoring",
      "Email alerts for deployment failures",
    ],
    stack: [
      "Java", "Go", "Node.js", "AWS EKS", "Kind", "Terraform", "SonarQube", "Trivy", "OWASP",
      "ArgoCD", "GitHub Actions", "Docker", "Kubernetes", "NGINX", "Prometheus", "Grafana",
    ],
    repo: "https://github.com/Sujal-SM/Retail-store-sample-app",
  },
  {
    slug: "autonomous-agentic-ai-framework",
    name: "Autonomous-Agentic-AI-Framework",
    summary:
      "A production-grade multi-agent AI research assistant that generates structured, citation-backed research reports.",
    details: [
      "Automates planning, source retrieval and validation",
      "Evidence extraction and report synthesis",
      "Modular agent pipelines for iterative deep research",
    ],
    stack: ["CrewAI", "Python", "OpenAI", "Exa", "Tavily"],
    repo: "https://github.com/Sujal-SM/Autonomous-Agentic-AI-Framework",
  },
  {
    slug: "krishiai",
    name: "Dr. Krishi - KrishiAI",
    summary:
      "An AI-powered agricultural advisory platform. Farmers detect crop diseases, predict risks and get expert treatment through image, text or voice input.",
    details: [
      "Real-time diagnosis and forecasting",
      "Multilingual advisory with conversational AI",
      "Automated agronomist escalation",
      "Cloud-native infrastructure",
    ],
    stack: ["Computer Vision", "CNN + XGBoost", "GPT-4o Vision", "RAG", "FastAPI", "Docker", "Kubernetes"],
    demo: "https://krishi-app-zhr1.onrender.com/",
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "programming", items: ["Python", "SQL", "Boto3", "Jira"] },
  { group: "os", items: ["Linux (RHEL)"] },
  { group: "cloud", items: ["AWS (EKS, EC2, S3, IAM, VPC, ELB)", "Oracle Cloud Infrastructure (OCI)"] },
  { group: "containers", items: ["Docker", "Kubernetes (K8s)", "Helm", "Kubectl"] },
  { group: "iac", items: ["Terraform", "Ansible"] },
  { group: "ci-cd-gitops", items: ["GitLab CI", "GitHub Actions", "ArgoCD", "Git", "GitHub"] },
  {
    group: "security-networking",
    items: [
      "SSL/TLS", "NGINX", "SonarQube", "Trivy", "OWASP", "TCP/IP", "DNS", "HTTP/HTTPS",
      "Load Balancing", "VPCs", "Subnets", "Security Groups",
    ],
  },
  { group: "observability", items: ["Prometheus", "Grafana"] },
  { group: "ai-automation", items: ["Antigravity", "Cursor", "Claude (Anthropic)", "AI-Assisted DevOps Automation"] },
];

export const experience = [
  {
    role: "OCI Intern",
    company: "Global Trend",
    companyType: "Digital Marketing Agency",
    companyUrl: "https://www.linkedin.com/company/global-trend-co-in/",
    period: "29 Jun 2026 - 29 Sept 2026",
    summary: "Engineered and managed cloud infrastructure on Oracle Cloud Infrastructure (OCI).",
    points: [
      "Deployed a secure enterprise mail server using iRedMail with iRedAdmin Pro: multi-domain hosting, mailbox administration, email aliases, domain management, SMTP services, DNS, SSL/TLS, VCNs, NSGs and secure networking.",
      "Deployed containerized applications on Kubernetes using Docker and declarative manifests.",
      "Optimized CI/CD pipelines and performed OCI cloud cost optimization.",
      "Resolved production infrastructure issues to deliver secure, scalable and highly available backend platforms.",
    ],
    tags: ["OCI", "iRedMail", "Kubernetes", "Docker", "CI/CD", "DNS", "SSL/TLS"],
  },
];

// From the internship completion certificate (uploaded PDF in public/certificates/).
export const internshipCertificate = {
  title: "Certificate of Internship Completion",
  company: "Global Trend",
  companyType: "Digital Marketing Agency",
  role: "OCI Intern",
  start: "2026-06-29",
  end: "2026-09-29",
  startLabel: "29 Jun 2026",
  endLabel: "29 Sept 2026",
  duration: "3 months",
  issued: "September 2026",
  signedBy: "Rajinder Singh",
  signerTitle: "Director",
  pdf: "/certificates/global-trend-internship.pdf",
  image: "/certificates/global-trend-internship.jpg",
};

export const education = [
  {
    school: "Vivekananda Institute of Professional Studies - Technical Campus",
    degree: "Bachelor of Technology (B.Tech) in Computer Science and Engineering",
    period: "2024 - 2027",
    score: "CGPA 9.2/10",
  },
  {
    school: "Delhi Skill and Entrepreneurship University, DSEU Pusa Campus",
    degree: "Diploma of Higher Education, Electronics and Communication Engineering",
    period: "2024",
    score: "93%",
  },
];

export const certifications = [
  {
    name: "Oracle Database@AWS Certified Architect Professional",
    issuer: "Oracle",
    url: "https://drive.google.com/file/d/1uRZGnWLRP1g98qk5YGlxprxdfeZbwCdX/view?usp=sharing",
    scoreReport: "https://drive.google.com/file/d/1L1j1QM195SGctdU6aRTR2LYbs2BWxOp6/view",
  },
  {
    name: "Oracle Cloud Infrastructure Certified DevOps Professional",
    issuer: "Oracle",
    url: "https://drive.google.com/file/d/1_Qr_-CrQ7e3W7r5KwKWjugGIme3zIXIa/view",
    scoreReport: "https://drive.google.com/file/d/1HN93wPSZqXPQKk2WZU02ig75eufC-jCt/view",
  },
  {
    name: "Machine Learning Specialization",
    issuer: "Coursera",
    url: "https://drive.google.com/file/d/1X144-KwEXrJB_EhkR3EokJOI0LSugzwg/view",
  },
];

export const publications = [
  {
    type: "Research Paper",
    title:
      "Value-Latency in AI-Driven Organizations: The Hidden Delay Between Algorithmic Decisions and Human Well-Being - A Human Sustainability Perspective",
  },
];

export const sections = [
  { id: "home", label: "home" },
  { id: "replay", label: "replay" },
  { id: "projects", label: "projects" },
  { id: "skills", label: "skills" },
  { id: "experience", label: "experience" },
  { id: "education", label: "education" },
  { id: "certs", label: "certs" },
  { id: "contact", label: "contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];
