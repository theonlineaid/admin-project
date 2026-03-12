"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["admin", "seller", "customer"]),
  blocked: z.boolean().optional(),
});

type FormValues = z.infer<typeof createSchema>;

export function UserForm({
  user,
}: {
  user?: { id: string; name: string; email: string; role: string; blocked: boolean };
}) {
  const router = useRouter();
  const isEdit = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          password: "",
          role: user.role as "admin" | "seller" | "customer",
          blocked: user.blocked,
        }
      : {
          name: "",
          email: "",
          password: "",
          role: "customer",
          blocked: false,
        },
  });

  async function onSubmit(values: FormValues) {
    if (!isEdit && (!values.password || values.password.length < 6)) {
      alert("Password is required (min 6 characters)");
      return;
    }
    const url = user ? `/api/users/${user.id}` : "/api/users";
    const method = user ? "PATCH" : "POST";
    const body: Record<string, unknown> = {
      name: values.name,
      email: values.email,
      role: values.role,
      blocked: values.blocked,
    };
    if (!isEdit) body.password = values.password;
    else if (values.password && values.password.length >= 6) body.password = values.password;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(JSON.stringify(err.error || "Failed to save"));
      return;
    }

    router.push("/dashboard/customers");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit user" : "New user"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              {isEdit ? "New password (leave blank to keep current)" : "Password"}
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder={isEdit ? "••••••••" : undefined}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select {...register("role")}>
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          {isEdit && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="blocked"
                {...register("blocked")}
                className="rounded border-border"
              />
              <Label htmlFor="blocked">Blocked</Label>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Update user" : "Create user"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
