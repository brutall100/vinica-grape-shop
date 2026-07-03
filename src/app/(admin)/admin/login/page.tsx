"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { Input, FieldLabel } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GrapeMark } from "@/components/store/logo";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <GrapeMark className="h-10 w-10" />
          <h1 className="text-xl font-bold">Vinica administravimas</h1>
          <p className="text-sm text-stone-500">Prisijunkite prie valdymo skydo</p>
        </div>
        <form action={action} className="space-y-4">
          <div>
            <FieldLabel htmlFor="email">El. paštas</FieldLabel>
            <Input id="email" name="email" type="email" required autoComplete="username" />
          </div>
          <div>
            <FieldLabel htmlFor="password">Slaptažodis</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {state.error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Jungiamasi..." : "Prisijungti"}
          </Button>
        </form>
      </div>
    </div>
  );
}
