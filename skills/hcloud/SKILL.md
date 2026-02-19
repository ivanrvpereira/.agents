---
name: hcloud
description: Manage Hetzner Cloud infrastructure using the hcloud CLI. Use when the user needs to create/manage servers, volumes, networks, firewalls, load balancers, floating IPs, primary IPs, SSH keys, images, certificates, placement groups, storage boxes, DNS zones, or any Hetzner Cloud resource. Also use for hcloud setup, context management, scripting hcloud commands, CI/CD automation with Hetzner, or generating hcloud command sequences. Triggers on mentions of "hcloud", "hetzner", "hetzner cloud", or any Hetzner infrastructure task.
---

# hcloud CLI

Official CLI for Hetzner Cloud. Commands follow `hcloud <resource> <action>` pattern.

## Setup

```bash
# Install
brew install hcloud              # macOS/Linux
winget install hetznercloud.cli  # Windows
go install github.com/hetznercloud/cli/cmd/hcloud@latest

# Create context (prompts for API token from https://console.hetzner.cloud)
hcloud context create <name>

# Shell completions
source <(hcloud completion bash)   # or zsh, fish, powershell
```

## Command Pattern

All resources share consistent subcommands:

| Action | Pattern |
|--------|---------|
| Create | `hcloud <resource> create --name <n> [flags]` |
| List | `hcloud <resource> list [-l selector] [-o json\|yaml\|columns=...]` |
| Describe | `hcloud <resource> describe <name-or-id>` |
| Delete | `hcloud <resource> delete <name-or-id>` |
| Update | `hcloud <resource> update <name-or-id> --name <new>` |
| Labels | `hcloud <resource> add-label <id> key=val` / `remove-label <id> key` |
| Protection | `hcloud <resource> enable-protection <id> delete` / `disable-protection` |

## Quick Reference

### Server Lifecycle
```bash
hcloud server create --name my-srv --type cx22 --image ubuntu-24.04 --ssh-key my-key
hcloud server list
hcloud server ssh my-srv
hcloud server describe my-srv
hcloud server poweron|poweroff|reboot|shutdown|reset my-srv
hcloud server rebuild --image ubuntu-24.04 my-srv
hcloud server delete my-srv
```

### Networking
```bash
hcloud network create --name my-net --ip-range 10.0.0.0/16
hcloud network add-subnet my-net --type cloud --network-zone eu-central --ip-range 10.0.0.0/24
hcloud server attach-to-network --network my-net my-srv
hcloud firewall create --name my-fw
hcloud firewall add-rule my-fw --direction in --protocol tcp --port 443 --source-ips 0.0.0.0/0 --source-ips ::/0
hcloud firewall apply-to-resource my-fw --type server --server my-srv
```

### Storage
```bash
hcloud volume create --name my-vol --size 50 --server my-srv --automount --format ext4
hcloud volume resize my-vol --size 100
hcloud volume detach my-vol
hcloud floating-ip create --type ipv4 --home-location fsn1
hcloud floating-ip assign <id> my-srv
```

### Load Balancing
```bash
hcloud load-balancer create --name my-lb --type lb11 --location fsn1
hcloud load-balancer add-target my-lb --server my-srv --use-private-ip
hcloud load-balancer add-service my-lb --protocol https --http-certificates my-cert --listen-port 443 --destination-port 80
```

### DNS
```bash
hcloud zone create --name example.com --type primary
hcloud zone add-records example.com --type A --name @ --value 1.2.3.4
hcloud zone list
```

## Output Formatting

```bash
hcloud server list -o json                    # JSON output
hcloud server list -o yaml                    # YAML output
hcloud server list -o columns=id,name,status  # Select columns
hcloud server list -o noheader                # No header
hcloud server list -l env=production          # Filter by label
hcloud server list -s name:asc               # Sort
```

## Global Flags

```
--config <path>       Config file (default ~/.config/hcloud/cli.toml)
--context <name>      Active context
--debug               Debug output
--quiet               Only errors
-o json|yaml          Output format (on create/describe)
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `HCLOUD_TOKEN` | API token (bypasses context) |
| `HCLOUD_CONTEXT` | Active context |
| `HCLOUD_CONFIG` | Config file path |
| `HCLOUD_DEFAULT_SSH_KEYS` | Default SSH keys for server create |
| `HCLOUD_QUIET` | Suppress non-error output |

## Detailed References

- **Full command reference**: See [references/commands.md](references/commands.md) for every resource, subcommand, and flag
- **Common workflows**: See [references/workflows.md](references/workflows.md) for end-to-end infrastructure patterns
- **Automation patterns**: See [references/automation.md](references/automation.md) for scripting, CI/CD, and infrastructure-as-code
