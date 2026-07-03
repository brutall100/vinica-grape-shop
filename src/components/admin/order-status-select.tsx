"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/actions/admin";
import { Select } from "@/components/ui/input";
import type { OrderStatus } from "@prisma/client";

const options: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Laukia apmokėjimo" },
  { value: "PAID", label: "Apmokėtas" },
  { value: "SHIPPED", label: "Išsiųstas" },
  { value: "COMPLETED", label: "Įvykdytas" },
  { value: "CANCELLED", label: "Atšauktas" },
];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Select
      value={status}
      disabled={busy}
      onChange={async (e) => {
        setBusy(true);
        await updateOrderStatus(orderId, e.target.value as OrderStatus);
        setBusy(false);
        router.refresh();
      }}
      className="w-auto"
      aria-label="Užsakymo būsena"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}
