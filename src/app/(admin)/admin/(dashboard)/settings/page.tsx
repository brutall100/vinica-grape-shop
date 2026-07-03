import { getStoreSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Nustatymai</h1>
      <SettingsForm
        initial={{
          omnivaEur: (settings.omnivaPriceCents / 100).toFixed(2),
          lpExpressEur: (settings.lpExpressPriceCents / 100).toFixed(2),
          courierEur: (settings.courierPriceCents / 100).toFixed(2),
          freeFromEur:
            settings.freeShippingFromCents != null
              ? (settings.freeShippingFromCents / 100).toFixed(2)
              : "",
          contactEmail: settings.contactEmail,
          contactPhone: settings.contactPhone,
        }}
      />
    </div>
  );
}
