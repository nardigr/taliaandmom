-- Collections table + migrate Product.season from enum keys to slugs

CREATE TABLE IF NOT EXISTS "Collection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Collection_slug_key" ON "Collection"("slug");

INSERT INTO "Collection" ("id", "slug", "label", "sortOrder", "active", "createdAt", "updatedAt")
VALUES
  ('col_pranvere', 'pranvere', 'Pranverë', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('col_vere', 'vere', 'Verë', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('col_vjeshte', 'vjeshte', 'Vjeshtë', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('col_dimer', 'dimer', 'Dimër', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- Convert Product.season enum → text slug
ALTER TABLE "Product" ALTER COLUMN "season" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "season" TYPE TEXT USING (
  CASE "season"::text
    WHEN 'PRANVERE' THEN 'pranvere'
    WHEN 'VERE' THEN 'vere'
    WHEN 'VJESHTE' THEN 'vjeshte'
    WHEN 'DIMER' THEN 'dimer'
    ELSE lower("season"::text)
  END
);

DROP TYPE IF EXISTS "Season";

CREATE INDEX IF NOT EXISTS "Product_season_idx" ON "Product"("season");
