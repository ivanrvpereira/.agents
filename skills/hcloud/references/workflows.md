# hcloud Common Workflows

End-to-end patterns for typical Hetzner Cloud infrastructure tasks.

## Table of Contents
- [Web Server with Firewall](#web-server-with-firewall)
- [Private Network with Multiple Servers](#private-network-with-multiple-servers)
- [Load-Balanced Application](#load-balanced-application)
- [Server with Persistent Storage](#server-with-persistent-storage)
- [DNS Setup](#dns-setup)
- [Server Migration / Upgrade](#server-migration--upgrade)
- [Disaster Recovery with Snapshots](#disaster-recovery-with-snapshots)
- [Secure Bastion Host](#secure-bastion-host)

---

## Web Server with Firewall

Provision a server with SSH key, firewall, and cloud-init.

```bash
# 1. Upload SSH key
hcloud ssh-key create --name deploy-key --public-key-from-file ~/.ssh/id_ed25519.pub

# 2. Create firewall
hcloud firewall create --name web-fw
hcloud firewall add-rule web-fw --direction in --protocol tcp --port 22 \
  --source-ips 0.0.0.0/0 --source-ips ::/0 --description "SSH"
hcloud firewall add-rule web-fw --direction in --protocol tcp --port 80 \
  --source-ips 0.0.0.0/0 --source-ips ::/0 --description "HTTP"
hcloud firewall add-rule web-fw --direction in --protocol tcp --port 443 \
  --source-ips 0.0.0.0/0 --source-ips ::/0 --description "HTTPS"
hcloud firewall add-rule web-fw --direction in --protocol icmp \
  --source-ips 0.0.0.0/0 --source-ips ::/0 --description "Ping"

# 3. Create server with cloud-init
hcloud server create \
  --name web-01 \
  --type cx22 \
  --image ubuntu-24.04 \
  --location fsn1 \
  --ssh-key deploy-key \
  --firewall web-fw \
  --user-data-from-file cloud-init.yml \
  --label env=production \
  --label role=web

# 4. Enable delete protection
hcloud server enable-protection web-01 delete rebuild

# 5. Connect
hcloud server ssh web-01
```

---

## Private Network with Multiple Servers

Set up app servers communicating over a private network.

```bash
# 1. Create network
hcloud network create --name app-net --ip-range 10.0.0.0/16

# 2. Add subnet
hcloud network add-subnet app-net \
  --type cloud \
  --network-zone eu-central \
  --ip-range 10.0.1.0/24

# 3. Create servers attached to network
for i in 1 2 3; do
  hcloud server create \
    --name app-0${i} \
    --type cx22 \
    --image ubuntu-24.04 \
    --location fsn1 \
    --ssh-key deploy-key \
    --network app-net \
    --label env=production \
    --label role=app
done

# 4. Verify private IPs
hcloud server describe app-01 -o json | jq '.private_net'
```

---

## Load-Balanced Application

HTTP load balancer with health checks and TLS termination.

```bash
# 1. Create network + servers (see above)

# 2. Create managed TLS certificate
hcloud certificate create --name app-cert --type managed --domain app.example.com

# 3. Create load balancer
hcloud load-balancer create \
  --name app-lb \
  --type lb11 \
  --location fsn1 \
  --network app-net \
  --algorithm-type round_robin

# 4. Add HTTPS service with health check
hcloud load-balancer add-service app-lb \
  --protocol https \
  --listen-port 443 \
  --destination-port 8080 \
  --http-certificates app-cert \
  --http-redirect-http \
  --health-check-protocol http \
  --health-check-port 8080 \
  --health-check-http-path /health \
  --health-check-interval 10s \
  --health-check-timeout 5s \
  --health-check-retries 3

# 5. Add targets using private IPs
hcloud load-balancer add-target app-lb --server app-01 --use-private-ip
hcloud load-balancer add-target app-lb --server app-02 --use-private-ip
hcloud load-balancer add-target app-lb --server app-03 --use-private-ip

# Alternative: add targets by label selector (auto-discovers servers)
hcloud load-balancer add-target app-lb --label-selector "role=app" --use-private-ip

# 6. Point DNS to load balancer IP
LB_IP=$(hcloud load-balancer describe app-lb -o json | jq -r '.public_net.ipv4.ip')
hcloud zone add-records example.com --type A --name app --value "$LB_IP"
```

---

## Server with Persistent Storage

Attach a volume for persistent data.

```bash
# 1. Create server
hcloud server create --name db-01 --type cx32 --image ubuntu-24.04 --ssh-key deploy-key

# 2. Create and attach volume (auto-formatted, auto-mounted)
hcloud volume create \
  --name db-data \
  --size 100 \
  --server db-01 \
  --format ext4 \
  --automount

# Volume is mounted at /mnt/HC_Volume_<id>

# 3. Resize volume later (no data loss, grow only)
hcloud volume resize db-data --size 200
# Then on the server: resize2fs /dev/disk/by-id/scsi-0HC_Volume_<id>

# 4. Detach and reattach to another server
hcloud volume detach db-data
hcloud volume attach --server db-02 --automount db-data
```

---

## DNS Setup

Manage DNS zones and records.

```bash
# 1. Create zone
hcloud zone create --name example.com --type primary

# 2. Add common records
hcloud zone add-records example.com --type A --name @ --value 1.2.3.4
hcloud zone add-records example.com --type AAAA --name @ --value 2001:db8::1
hcloud zone add-records example.com --type CNAME --name www --value example.com.
hcloud zone add-records example.com --type MX --name @ --value "10 mail.example.com."
hcloud zone add-records example.com --type TXT --name @ --value "v=spf1 include:_spf.google.com ~all"

# 3. View all records
hcloud zone rrset list example.com

# 4. Export zone file (BIND format)
hcloud zone export-zonefile example.com > zone-backup.txt

# 5. Import zone file
hcloud zone import-zonefile --zone-file zone.txt example.com
```

---

## Server Migration / Upgrade

Upgrade a server with minimal downtime.

```bash
# Option A: In-place upgrade (requires shutdown for most types)
hcloud server shutdown my-srv
hcloud server change-type my-srv cx32

# Option B: Upgrade with disk preservation (enables downgrade later)
hcloud server shutdown my-srv
hcloud server change-type --keep-disk my-srv cx32

# Option C: Migration via snapshot
hcloud server create-image --type snapshot --description "pre-migration" my-srv
# Note the image ID from output
hcloud server create --name my-srv-new --type cx32 --image <snapshot-id> --ssh-key deploy-key
# Verify new server, then:
hcloud server delete my-srv
```

---

## Disaster Recovery with Snapshots

```bash
# Enable automatic backups (daily, Hetzner-managed window)
hcloud server enable-backup my-srv

# Manual snapshot
hcloud server create-image --type snapshot --description "before-deploy-v2.1" my-srv

# List snapshots
hcloud image list --type snapshot

# Restore from snapshot
hcloud server rebuild --image <snapshot-id> my-srv

# Or create new server from snapshot
hcloud server create --name restored-srv --type cx22 --image <snapshot-id>
```

---

## Secure Bastion Host

Jump box pattern with restricted access.

```bash
# 1. Create bastion firewall (SSH only from your IP)
hcloud firewall create --name bastion-fw
hcloud firewall add-rule bastion-fw --direction in --protocol tcp --port 22 \
  --source-ips <your-ip>/32 --description "SSH from office"
hcloud firewall add-rule bastion-fw --direction in --protocol icmp \
  --source-ips <your-ip>/32 --description "Ping from office"

# 2. Create internal firewall (SSH only from bastion network)
hcloud firewall create --name internal-fw
hcloud firewall add-rule internal-fw --direction in --protocol tcp --port 22 \
  --source-ips 10.0.1.0/24 --description "SSH from bastion subnet"

# 3. Create bastion
hcloud server create \
  --name bastion \
  --type cx22 \
  --image ubuntu-24.04 \
  --ssh-key deploy-key \
  --firewall bastion-fw \
  --network app-net \
  --label role=bastion

# 4. Create internal servers (no public IP)
hcloud server create \
  --name internal-01 \
  --type cx22 \
  --image ubuntu-24.04 \
  --ssh-key deploy-key \
  --firewall internal-fw \
  --network app-net \
  --without-ipv4 \
  --label role=internal

# 5. SSH via bastion
ssh -J root@<bastion-ip> root@10.0.1.x
```
