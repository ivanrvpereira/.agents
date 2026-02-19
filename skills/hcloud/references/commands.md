# hcloud Command Reference

Complete reference for all hcloud CLI commands, subcommands, and flags.

## Table of Contents
- [server](#server)
- [network](#network)
- [firewall](#firewall)
- [load-balancer](#load-balancer)
- [volume](#volume)
- [floating-ip](#floating-ip)
- [primary-ip](#primary-ip)
- [ssh-key](#ssh-key)
- [image](#image)
- [certificate](#certificate)
- [placement-group](#placement-group)
- [storage-box](#storage-box)
- [zone](#zone)
- [context](#context)
- [config](#config)
- [Informational commands](#informational-commands)

---

## server

### server create
```
hcloud server create --name <name> --type <type> --image <image> [flags]
```
| Flag | Description |
|------|-------------|
| `--name` | Server name (required) |
| `--type` | Server type ID or name, e.g. cx22, cx32, cx42 (required) |
| `--image` | Image ID or name, e.g. ubuntu-24.04 (required) |
| `--location` | Location ID or name (fsn1, nbg1, hel1, ash, hil, sin) |
| `--ssh-key` | SSH key ID or name (repeatable) |
| `--network` | Network ID or name to attach (repeatable) |
| `--firewall` | Firewall ID or name (repeatable) |
| `--volume` | Volume ID or name to attach (repeatable) |
| `--user-data-from-file` | Cloud-init user data file (use `-` for stdin) |
| `--label` | Labels as key=value (repeatable) |
| `--placement-group` | Placement group ID or name |
| `--primary-ipv4` | Primary IPv4 ID or name |
| `--primary-ipv6` | Primary IPv6 ID or name |
| `--enable-backup` | Enable automatic backups |
| `--enable-protection` | Enable protection: delete, rebuild |
| `--automount` | Automount attached volumes |
| `--start-after-create` | Start after creation (default true) |
| `--without-ipv4` | No public IPv4 |
| `--without-ipv6` | No public IPv6 |
| `--allow-deprecated-image` | Allow deprecated images |

### server list
```
hcloud server list [-l <selector>] [-s <sort>] [--status <status>] [-o <format>]
```
Columns: age, backup_window, created, datacenter, id, included_traffic, ingoing_traffic, ipv4, ipv6, labels, location, locked, name, outgoing_traffic, placement_group, primary_disk_size, private_net, protection, rescue_enabled, status, type, volumes

### server ssh
```
hcloud server ssh [--user <user>] [--port <port>] [--ipv6] <server> [-- <ssh-args>]
```
Default user: root. Default port: 22.

### Other server subcommands
| Command | Usage |
|---------|-------|
| `describe <server>` | Detailed server info |
| `delete <server>` | Delete server |
| `update <server> --name <new>` | Rename |
| `poweron\|poweroff\|reboot\|shutdown\|reset <server>` | Power management |
| `rebuild --image <image> <server>` | Rebuild from image |
| `change-type [--keep-disk] <server> <type>` | Change server type (--keep-disk enables downgrade) |
| `create-image --type <backup\|snapshot> <server>` | Create image from server |
| `enable-backup\|disable-backup <server>` | Toggle backups |
| `enable-rescue [--ssh-key <key>] <server>` | Enable rescue mode |
| `disable-rescue <server>` | Disable rescue mode |
| `attach-to-network --network <net> [--ip <ip>] <server>` | Attach to network |
| `detach-from-network --network <net> <server>` | Detach from network |
| `attach-iso --iso <iso> <server>` | Attach ISO |
| `detach-iso <server>` | Detach ISO |
| `add-to-placement-group --placement-group <pg> <server>` | Add to placement group |
| `remove-from-placement-group <server>` | Remove from placement group |
| `ip [-6] <server>` | Print IP address |
| `metrics --type <cpu\|disk\|network> --start <time> --end <time> <server>` | Show metrics |
| `request-console <server>` | Get VNC WebSocket URL |
| `reset-password <server>` | Reset root password |
| `set-rdns --ip <ip> --hostname <hostname> <server>` | Set reverse DNS |
| `enable-protection <server> delete [rebuild]` | Enable protection |
| `disable-protection <server> delete [rebuild]` | Disable protection |
| `add-label <server> key=value` | Add label |
| `remove-label <server> key` | Remove label |

---

## network

### network create
```
hcloud network create --name <name> --ip-range <cidr> [flags]
```
| Flag | Description |
|------|-------------|
| `--name` | Network name (required) |
| `--ip-range` | IP range in CIDR, e.g. 10.0.0.0/16 (required) |
| `--label` | Labels (repeatable) |
| `--enable-protection` | Enable delete protection |
| `--expose-routes-to-vswitch` | Expose routes to vSwitch |

### network add-subnet
```
hcloud network add-subnet --type <type> --network-zone <zone> [--ip-range <cidr>] <network>
```
Types: cloud, server, vswitch. Zones: eu-central, us-east, us-west, ap-southeast.

### Other network subcommands
| Command | Usage |
|---------|-------|
| `add-route --destination <cidr> --gateway <ip> <net>` | Add route |
| `remove-route --destination <cidr> --gateway <ip> <net>` | Remove route |
| `remove-subnet --ip-range <cidr> <net>` | Remove subnet |
| `change-ip-range --ip-range <cidr> <net>` | Change IP range |
| `expose-routes-to-vswitch <net>` | Expose routes to vSwitch |

---

## firewall

### firewall create
```
hcloud firewall create --name <name> [--rules-file <file>] [--label key=val]
```

### firewall add-rule
```
hcloud firewall add-rule --direction <in|out> --protocol <proto> [--port <port>] \
  (--source-ips <cidr> | --destination-ips <cidr>) <firewall>
```
| Flag | Description |
|------|-------------|
| `--direction` | in or out (required) |
| `--protocol` | tcp, udp, icmp, esp, gre (required) |
| `--port` | Port or range, e.g. 80 or 80-85 (required for tcp/udp) |
| `--source-ips` | Source CIDRs (required for direction=in, repeatable) |
| `--destination-ips` | Dest CIDRs (required for direction=out, repeatable) |
| `--description` | Rule description |

### firewall apply-to-resource / remove-from-resource
```
hcloud firewall apply-to-resource --type server --server <server> <firewall>
hcloud firewall apply-to-resource --type label_selector --label-selector <sel> <firewall>
hcloud firewall remove-from-resource --type server --server <server> <firewall>
```

### firewall replace-rules
```
hcloud firewall replace-rules --rules-file <file> <firewall>
```
Replace all rules from a JSON file (use `-` for stdin).

---

## load-balancer

### load-balancer create
```
hcloud load-balancer create --name <name> --type <type> [--location <loc>] \
  [--network <net>] [--algorithm-type round_robin|least_connections]
```

### load-balancer add-service
```
hcloud load-balancer add-service --protocol <http|tcp|https> <lb> [flags]
```
| Flag | Description |
|------|-------------|
| `--protocol` | http, tcp, or https (required) |
| `--listen-port` | Listen port |
| `--destination-port` | Destination port on targets |
| `--http-certificates` | Certificate IDs/names (for https) |
| `--http-redirect-http` | Redirect HTTP to HTTPS |
| `--http-sticky-sessions` | Enable sticky sessions |
| `--http-cookie-name` | Cookie name for sticky sessions |
| `--http-cookie-lifetime` | Cookie lifetime |
| `--proxy-protocol` | Enable proxy protocol |
| `--health-check-protocol` | Health check protocol |
| `--health-check-port` | Health check port |
| `--health-check-interval` | Interval (default 15s) |
| `--health-check-timeout` | Timeout (default 10s) |
| `--health-check-retries` | Retries (default 3) |
| `--health-check-http-domain` | HTTP health check domain |
| `--health-check-http-path` | HTTP health check path |

### load-balancer add-target
```
hcloud load-balancer add-target (--server <s> | --label-selector <sel> | --ip <ip>) [--use-private-ip] <lb>
```

### load-balancer remove-target
```
hcloud load-balancer remove-target (--server <s> | --label-selector <sel> | --ip <ip>) <lb>
```

### Other load-balancer subcommands
- `change-algorithm --algorithm-type <type> <lb>`
- `change-type <lb> <type>`
- `attach-to-network --network <net> <lb>`
- `detach-from-network --network <net> <lb>`
- `enable-public-interface` / `disable-public-interface`
- `update-service` / `delete-service`

---

## volume

### volume create
```
hcloud volume create --name <name> --size <gb> [--server <s>] [--location <loc>] \
  [--format ext4|xfs] [--automount]
```

### Other volume subcommands
| Command | Usage |
|---------|-------|
| `attach --server <server> [--automount] <volume>` | Attach to server |
| `detach <volume>` | Detach |
| `resize --size <gb> <volume>` | Resize (grow only) |

---

## floating-ip

### floating-ip create
```
hcloud floating-ip create --type <ipv4|ipv6> (--home-location <loc> | --server <s>) \
  [--name <name>] [--description <desc>]
```

### Other floating-ip subcommands
- `assign <floating-ip> <server>` -- Assign to server
- `unassign <floating-ip>` -- Unassign
- `set-rdns --ip <ip> --hostname <hostname> <floating-ip>`

---

## primary-ip

### primary-ip create
```
hcloud primary-ip create --name <name> --type <ipv4|ipv6> [--location <loc>] \
  [--assignee-id <id>] [--auto-delete]
```

### Other primary-ip subcommands
- `assign <primary-ip> --server <server>` -- Assign
- `unassign <primary-ip>` -- Unassign

---

## ssh-key

### ssh-key create
```
hcloud ssh-key create --name <name> (--public-key <key> | --public-key-from-file <file>)
```

---

## image

| Command | Usage |
|---------|-------|
| `list [--type system\|snapshot\|backup] [-l selector]` | List images |
| `describe <image>` | Image details |
| `update <image> --description <desc>` | Update description |
| `delete <image>` | Delete (snapshots/backups only) |
| `enable-protection <image> delete` | Enable protection |

---

## certificate

### certificate create
```
# Uploaded certificate
hcloud certificate create --name <name> --cert-file <pem> --key-file <pem>

# Managed (Let's Encrypt)
hcloud certificate create --name <name> --type managed --domain <domain>
```

### Other certificate subcommands
- `retry <cert>` -- Retry issuance for managed certificates

---

## placement-group

```
hcloud placement-group create --name <name> --type spread
```
Only type currently available is `spread`.

---

## storage-box

### storage-box create
```
hcloud storage-box create --name <name> --type <type> --location <loc>
```

### Notable subcommands
- `change-type <box> <type>` -- Change type
- `reset-password <box>` -- Reset password
- `update-access-settings <box>` -- Update access (SSH, samba, webDAV, etc.)
- `enable-snapshot-plan` / `disable-snapshot-plan`
- `rollback-snapshot <box> <snapshot>`
- `subaccount` -- Manage sub-accounts
- `folders <box>` -- List folders

---

## zone

### zone create
```
hcloud zone create --name <domain> --type <primary|secondary> [--ttl <seconds>]
```

### Record management
```bash
# Add records to an RRSet
hcloud zone add-records <zone> --type A --name @ --value 1.2.3.4
hcloud zone add-records <zone> --type AAAA --name @ --value 2001:db8::1
hcloud zone add-records <zone> --type MX --name @ --value "10 mail.example.com."

# Set records (replace entire RRSet)
hcloud zone set-records <zone> --type A --name www --value 1.2.3.4

# Remove specific records
hcloud zone remove-records <zone> --type A --name www --value 1.2.3.4

# List RRSets
hcloud zone rrset list <zone>

# Export/import BIND zone files
hcloud zone export-zonefile <zone>
hcloud zone import-zonefile --zone-file <file> <zone>
```

---

## context

```bash
hcloud context create <name>         # Create (prompts for token)
hcloud context list                  # List (* = active)
hcloud context use <name>            # Switch context
hcloud context active                # Show active
hcloud context rename <old> <new>    # Rename
hcloud context delete <name>         # Delete
hcloud context unset                 # Unset active
```

---

## config

```bash
hcloud config list                                    # List all config
hcloud config get <key>                               # Get value
hcloud config set <key> <value>                       # Set value
hcloud config unset <key>                             # Unset value
hcloud config add default-ssh-keys <key-name>         # Add to list
hcloud config remove default-ssh-keys <key-name>      # Remove from list
```

### Configurable preferences
| Key | Type | Description |
|-----|------|-------------|
| `debug` | bool | Enable debug output |
| `debug-file` | string | Debug output file |
| `default-ssh-keys` | list | Default SSH keys for server create |
| `endpoint` | string | API endpoint |
| `poll-interval` | duration | Action polling interval |
| `quiet` | bool | Only error output |
| `sort.<resource>` | list | Default sorting per resource |

---

## Informational commands

```bash
hcloud server-type list          # Available server types
hcloud server-type describe <t>  # Server type details
hcloud location list             # Available locations
hcloud datacenter list           # Available datacenters
hcloud iso list                  # Available ISOs
hcloud load-balancer-type list   # LB types
hcloud storage-box-type list     # Storage box types
hcloud all list                  # List all resources in project
hcloud version                   # CLI version
```
