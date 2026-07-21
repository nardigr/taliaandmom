import { z } from "zod";
import { slugify } from "@/lib/admin/slug";
import { t } from "@/lib/i18n/sq";

export const collectionFormSchema = z.object({
  label: z.string().trim().min(1, t.fushaDetyrueshme).max(80),
  slug: z
    .string()
    .trim()
    .min(1, t.fushaDetyrueshme)
    .max(60)
    .transform((value) => slugify(value))
    .refine((value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
      message: t.slugInvalid,
    }),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  active: z.coerce.boolean(),
  coverImageUrl: z.string().trim().optional().or(z.literal("")),
});

export type CollectionFormValues = z.infer<typeof collectionFormSchema>;
