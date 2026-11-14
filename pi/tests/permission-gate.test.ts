import gate from "./gate.ts";
import { homedir } from "node:os";
const HOME = homedir();
let handler: any; gate({ on: (_: string, h: any) => (handler = h) } as any);
const ctx = { hasUI: false, cwd: `${HOME}/go/src/k8s.io/k8s.io` };
const bash = async (command: string) => !!(await handler({ toolName: "bash", input: { command } }, ctx))?.block;
const file = async (tool: string, path: string) => !!(await handler({ toolName: tool, input: { path } }, ctx))?.block;
const cases: [string, boolean][] = [
  ["kubectl apply -f deploy.yaml", true], ["kubectl -n prod patch deploy x -p '{}'", true], ["kubectl scale deploy x --replicas=0", true],
  ["kubectl rollout restart deploy/x", true], ["kubectl label node n1 a=b", true], ["kubectl apply -f x.yaml --dry-run=client", false],
  ["kubectl get pods -A", false], ["kubectl rollout status deploy/x", false], ["kubectl logs -f pod/x", false], ["kubectl describe node n1", false],
  ["kubectl exec -it pod/x -- ls", false], ["kubectl diff -f x.yaml", false],
  ["gcloud compute instances delete vm-1 --zone us-central1-a", true], ["gcloud projects add-iam-policy-binding p --member=x --role=y", true],
  ["gcloud container clusters resize c --num-nodes 0", true], ["gcloud storage rm gs://b/o", true], ["gsutil rm -r gs://b/p", true],
  ["gcloud compute instances list", false], ["gcloud config set project foo", false], ["gcloud auth login", false],
  ["gcloud container clusters get-credentials c --zone z", false], ["gcloud compute instances describe vm-1 --format=json", false], ["gsutil ls gs://b", false],
  // regression: global flags before the command (watchdog finding)
  ["gcloud --project=my-project compute instances delete my-instance", true],
  ["gcloud --project my-project compute instances delete my-instance", true],
  ["gcloud --account a@b.com --configuration prod container clusters delete c", true],
  ["gcloud --quiet --project=p projects remove-iam-policy-binding p --member=x --role=y", true],
  ["gcloud --verbosity debug --project p run deploy svc --image i", true],
  ["gcloud --project=p compute instances list", false], ["gcloud --project p config set compute/zone z", false],
  ["gcloud --format json --project p compute instances describe vm", false],
  ["gsutil -m rm -r gs://b/p", true], ["kubectl --context prod -n x apply -f y.yaml", true],
  ["echo x >> ~/.ssh/config", true], ["printf y > $HOME/.kube/config", true], ["cp key ~/.ssh/id_test", true], ["sed -i s/a/b/ ~/.pi/agent/settings.json", true],
  ["rm ~/.kube/cache/x", true], [`tee ${HOME}/dotfiles/pi/agent/mcp.json < f`, true],
  ["cat ~/.kube/config", false], ["grep Host ~/.ssh/config", false], ["ls ~/.pi/agent/sessions", false], ["echo hi > /tmp/x", false],
  ["cat ~/.pi/agent/sessions/x.jsonl > /tmp/y", false],
  ["terraform apply", true], ["git push --force origin main", true], ["git reset --hard HEAD~1", true], ["sudo pacman -Syu", true],
  ["rm -rf build", true], ["helm upgrade x y", true], ["git status", false], ["go test ./...", false], ["terraform plan", false],
];
let fail = 0;
for (const [c, want] of cases) { const got = await bash(c); if (got !== want) { fail++; console.log(`FAIL bash want=${want} got=${got}: ${c}`); } }
const fcases: [string, string, boolean][] = [
  ["edit", "~/.ssh/config", true], ["write", `${HOME}/.kube/config`, true], ["edit", `${HOME}/.pi/agent/settings.json`, true],
  ["edit", `${HOME}/dotfiles/pi/agent/extensions/notify.ts`, true], ["edit", `${HOME}/.config/gh/config.yml`, true],
  ["edit", `${HOME}/go/src/k8s.io/k8s.io/README.md`, false], ["edit", ".env.local", true], ["edit", ".env.example", false],
  ["edit", `${HOME}/.pi/agent/sessions/x.jsonl`, false], ["edit", `${HOME}/dotfiles/fish/config.fish`, false],
];
for (const [t, p, want] of fcases) { const got = await file(t, p); if (got !== want) { fail++; console.log(`FAIL ${t} want=${want} got=${got}: ${p}`); } }
console.log(`${cases.length + fcases.length} cases, ${fail} failures`);
process.exit(fail ? 1 : 0);
