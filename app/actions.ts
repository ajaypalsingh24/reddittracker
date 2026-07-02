"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { scanBrands } from "@/lib/scanner";

function parseKeywords(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/[\n,]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export async function createBrand(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) {
    return;
  }

  await prisma.brand.create({
    data: {
      name,
      keywords: parseKeywords(formData.get("keywords")),
      isActive: formData.get("isActive") === "on",
    },
  });

  revalidatePath("/");
}

export async function updateBrand(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!id || !name) {
    return;
  }

  await prisma.brand.update({
    where: { id },
    data: {
      name,
      keywords: parseKeywords(formData.get("keywords")),
      isActive: formData.get("isActive") === "on",
    },
  });

  revalidatePath("/");
}

export async function deleteBrand(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) {
    return;
  }

  await prisma.brand.delete({ where: { id } });
  revalidatePath("/");
}

export async function runManualScan(formData: FormData) {
  const brandId = String(formData.get("brandId") || "");
  await scanBrands(brandId || undefined);
  revalidatePath("/");
  redirect("/");
}
