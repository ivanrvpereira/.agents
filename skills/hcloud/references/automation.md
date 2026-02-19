# hcloud Automation Patterns

Scripting, CI/CD, and infrastructure-as-code patterns for hcloud CLI.

## Table of Contents
- [Scripting Fundamentals](#scripting-fundamentals)
- [JSON Output Parsing](#json-output-parsing)
- [Batch Operations](#batch-operations)
- [CI/CD Integration](#cicd-integration)
- [Docker Usage](#docker-usage)
- [Infrastructure Teardown](#infrastructure-teardown)
- [Firewall Rules from File](#firewall-rules-from-file)
- [Monitoring and Alerts](#monitoring-and-alerts)

---

## Scripting Fundamentals

### Authentication
```bash
# Use environment variable (preferred for automation)
export HCLOUD_TOKEN="your-api-token"

# Or specify context
export HCLOUD_CONTEXT="production"

# Suppress interactive output
export HCLOUD_QUIET=true
```

### Exit Codes
hcloud returns 0 on success, non-zero on failure. Always check:
```bash
if ! hcloud server create --name test --type cx22 --image ubuntu-24.04; then
  echo "Server creation failed" >&2
  exit 1
fi
```

---

## JSON Output Parsing

All commands support `-o json` for machine-readable output.

```bash
# Get server IP
hcloud server describe my-srv -o json | jq -r '.public_net.ipv4.ip'

# Get server ID
hcloud server describe my-srv -o json | jq -r '.id'

# List all server names
hcloud server list -o json | jq -r '.[].name'

# Get servers by label
hcloud server list -l env=production -o json | jq -r '.[].name'

# Get private IP of a server
hcloud server describe my-srv -o json | jq -r '.private_net[0].ip'

# Count servers by status
hcloud server list -o json | jq 'group_by(.status) | map({status: .[0].status, count: length})'

# Extract load balancer public IP
hcloud load-balancer describe my-lb -o json | jq -r '.public_net.ipv4.ip'
```

### Column output for simple scripting
```bash
# Get just names (no header)
hcloud server list -o noheader -o columns=name

# Get ID and name
hcloud server list -o noheader -o columns=id,name
```

---

## Batch Operations

### Iterate over resources
```bash
# Delete all servers with a label
hcloud server list -l env=staging -o noheader -o columns=name | while read name; do
  echo "Deleting $name..."
  hcloud server delete "$name"
done

# Power off all servers in a placement group
hcloud server list -o json | jq -r '.[] | select(.placement_group.name == "my-pg") | .name' | while read name; do
  hcloud server poweroff "$name"
done

# Add label to all servers missing it
hcloud server list -o json | jq -r '.[] | select(.labels.team == null) | .name' | while read name; do
  hcloud server add-label "$name" team=default
done
```

### Parallel operations
```bash
# Create multiple servers in parallel
for i in $(seq 1 5); do
  hcloud server create \
    --name "worker-$(printf '%02d' $i)" \
    --type cx22 \
    --image ubuntu-24.04 \
    --ssh-key deploy-key \
    --label role=worker &
done
wait
echo "All servers created"
```

---

## CI/CD Integration

### GitHub Actions
```yaml
name: Deploy to Hetzner
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install hcloud
        run: |
          curl -sSLO https://github.com/hetznercloud/cli/releases/latest/download/hcloud-linux-amd64.tar.gz
          sudo tar -C /usr/local/bin --no-same-owner -xzf hcloud-linux-amd64.tar.gz hcloud

      - name: Deploy
        env:
          HCLOUD_TOKEN: ${{ secrets.HCLOUD_TOKEN }}
        run: |
          # Rebuild server with latest snapshot
          SNAPSHOT_ID=$(hcloud image list --type snapshot -o json | jq -r 'sort_by(.created) | last | .id')
          hcloud server rebuild --image "$SNAPSHOT_ID" production-srv

          # Wait for server to be running
          while [ "$(hcloud server describe production-srv -o json | jq -r '.status')" != "running" ]; do
            sleep 5
          done
```

### GitLab CI
```yaml
deploy:
  image: hetznercloud/cli:latest
  variables:
    HCLOUD_TOKEN: $HCLOUD_TOKEN
  script:
    - hcloud server list
    - hcloud server rebuild --image ubuntu-24.04 production-srv
```

### Generic script pattern
```bash
#!/usr/bin/env bash
set -euo pipefail

: "${HCLOUD_TOKEN:?HCLOUD_TOKEN must be set}"

# Verify connectivity
hcloud server-type list --quiet || { echo "Cannot reach Hetzner API" >&2; exit 1; }

# Your deployment logic here
```

---

## Docker Usage

```bash
# One-off command
docker run --rm -e HCLOUD_TOKEN="$HCLOUD_TOKEN" hetznercloud/cli:latest server list

# With persistent config
docker run --rm \
  -v "$HOME/.config/hcloud/cli.toml:/root/.config/hcloud/cli.toml:ro" \
  hetznercloud/cli:latest server list

# Alias for convenience
alias hcloud='docker run --rm -e HCLOUD_TOKEN="$HCLOUD_TOKEN" hetznercloud/cli:latest'
```

---

## Infrastructure Teardown

### Ordered teardown (respects dependencies)
```bash
#!/usr/bin/env bash
set -euo pipefail

PROJECT_LABEL="project=my-app"

echo "Removing load balancer targets..."
hcloud load-balancer list -l "$PROJECT_LABEL" -o noheader -o columns=name | while read lb; do
  hcloud load-balancer describe "$lb" -o json | jq -r '.targets[].server.name' | while read srv; do
    hcloud load-balancer remove-target "$lb" --server "$srv" 2>/dev/null || true
  done
done

echo "Deleting load balancers..."
hcloud load-balancer list -l "$PROJECT_LABEL" -o noheader -o columns=name | while read name; do
  hcloud load-balancer delete "$name"
done

echo "Detaching volumes..."
hcloud volume list -l "$PROJECT_LABEL" -o noheader -o columns=name | while read name; do
  hcloud volume detach "$name" 2>/dev/null || true
done

echo "Deleting servers..."
hcloud server list -l "$PROJECT_LABEL" -o noheader -o columns=name | while read name; do
  hcloud server delete "$name"
done

echo "Deleting volumes..."
hcloud volume list -l "$PROJECT_LABEL" -o noheader -o columns=name | while read name; do
  hcloud volume delete "$name"
done

echo "Deleting firewalls..."
hcloud firewall list -l "$PROJECT_LABEL" -o noheader -o columns=name | while read name; do
  hcloud firewall delete "$name"
done

echo "Deleting networks..."
hcloud network list -l "$PROJECT_LABEL" -o noheader -o columns=name | while read name; do
  hcloud network delete "$name"
done

echo "Teardown complete."
```

---

## Firewall Rules from File

Create rules in JSON and apply them:

```json
[
  {
    "direction": "in",
    "protocol": "tcp",
    "port": "22",
    "source_ips": ["10.0.0.0/8"],
    "description": "SSH from private"
  },
  {
    "direction": "in",
    "protocol": "tcp",
    "port": "80",
    "source_ips": ["0.0.0.0/0", "::/0"],
    "description": "HTTP"
  },
  {
    "direction": "in",
    "protocol": "tcp",
    "port": "443",
    "source_ips": ["0.0.0.0/0", "::/0"],
    "description": "HTTPS"
  }
]
```

```bash
# Create firewall with rules from file
hcloud firewall create --name web-fw --rules-file rules.json

# Replace all rules
hcloud firewall replace-rules --rules-file rules.json web-fw

# Pipe from stdin
cat rules.json | hcloud firewall create --name web-fw --rules-file -
```

---

## Monitoring and Alerts

### Server metrics (experimental/alpha)
```bash
# CPU metrics for last hour
hcloud server metrics my-srv --type cpu --start "$(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ)" --end "$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Disk metrics
hcloud server metrics my-srv --type disk --start "1 hour ago" --end now

# Network metrics
hcloud server metrics my-srv --type network --start "1 hour ago" --end now
```

### Health check script
```bash
#!/usr/bin/env bash
# Check all production servers are running

FAILED=0
hcloud server list -l env=production -o json | jq -r '.[] | "\(.name) \(.status)"' | while read name status; do
  if [ "$status" != "running" ]; then
    echo "ALERT: $name is $status" >&2
    FAILED=1
  fi
done

exit $FAILED
```

### Resource inventory
```bash
#!/usr/bin/env bash
echo "=== Servers ==="
hcloud server list -o columns=name,type,status,ipv4,location

echo -e "\n=== Volumes ==="
hcloud volume list -o columns=name,size,server,location

echo -e "\n=== Networks ==="
hcloud network list

echo -e "\n=== Firewalls ==="
hcloud firewall list

echo -e "\n=== Load Balancers ==="
hcloud load-balancer list

echo -e "\n=== Floating IPs ==="
hcloud floating-ip list
```
