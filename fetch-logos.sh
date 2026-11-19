#!/usr/bin/env bash
# Downloads icons for carriers with no logo file yet -> assets/img/carriers/<slug>-icon.png
# Optional: export LOGO_DEV_TOKEN=pk_xxx (free key from logo.dev) for sharper brand logos.
# Otherwise uses Google's favicon service. Run: bash scripts/fetch-logos.sh
cd "$(dirname "$0")/.." || exit 1; D=assets/img/carriers; mkdir -p $D
while IFS='|' read -r slug domain; do
  [ -f "$D/$slug.png" ] && continue
  if [ -n "$LOGO_DEV_TOKEN" ]; then U="https://img.logo.dev/$domain?token=$LOGO_DEV_TOKEN&size=256&format=png"; else U="https://www.google.com/s2/favicons?domain=$domain&sz=256"; fi
  if curl -fsSL "$U" -o "$D/$slug-icon.png"; then echo "ok   $slug"; else echo "FAIL $slug"; rm -f "$D/$slug-icon.png"; fi
done <<'LIST'
kaiser-permanente|kp.org
florida-blue|floridablue.com
community-health-choice|communityhealthchoice.org
baylor-scott-white-health-plan|swhp.org
imperial-health|imperialhealth.com
state-farm|statefarm.com
progressive|progressive.com
geico|geico.com
allstate|allstate.com
farmers-insurance|farmers.com
usaa|usaa.com
liberty-mutual|libertymutual.com
travelers|travelers.com
american-family|amfam.com
chubb|chubb.com
safeco|safeco.com
homesite|homesite.com
mercury-insurance|mercuryinsurance.com
texas-farm-bureau|txfb-ins.com
auto-owners|auto-owners.com
amica|amica.com
foremost|foremost.com
openly|openly.com
hippo|hippo.com
stillwater-insurance|stillwater.com
universal-property|universalproperty.com
branch-insurance|hellobranch.com
lemonade|lemonade.com
kin-insurance|kin.com
LIST
