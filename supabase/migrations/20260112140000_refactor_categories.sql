-- 1. Add new columns for hierarchy and scope (Idempotent)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_categories' AND column_name = 'parent_id') THEN
        ALTER TABLE "financial_categories" ADD COLUMN "parent_id" UUID REFERENCES "financial_categories"("id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_categories' AND column_name = 'scope') THEN
        ALTER TABLE "financial_categories" ADD COLUMN "scope" VARCHAR(50) CHECK (scope IN ('INCOME', 'EXPENSE'));
    END IF;
END $$;

-- 2. Relax the constraint on 'type' immediately so we can insert parent categories without it
ALTER TABLE "financial_categories" ALTER COLUMN "type" DROP NOT NULL;

-- 3. Migrate existing flat structure to hierarchy
DO $$ 
DECLARE
    r RECORD;
    new_parent_id UUID;
    cat_scope VARCHAR;
BEGIN
    FOR r IN SELECT DISTINCT "type", "user_id" FROM "financial_categories" WHERE "type" IS NOT NULL LOOP
        
        -- Determine scope based on the old type string
        IF r.type = 'Receitas (Entradas)' THEN
            cat_scope := 'INCOME';
        ELSE
            cat_scope := 'EXPENSE';
        END IF;

        -- Check if a parent with this name already exists (idempotency check for re-runs)
        SELECT id INTO new_parent_id FROM "financial_categories" 
        WHERE "user_id" = r.user_id AND "name" = r.type AND "parent_id" IS NULL LIMIT 1;

        IF new_parent_id IS NULL THEN
            -- Create a new Parent Category for this type group if it doesn't exist
            INSERT INTO "financial_categories" ("user_id", "name", "scope", "description")
            VALUES (r.user_id, r.type, cat_scope, 'Categoria ' || r.type)
            RETURNING "id" INTO new_parent_id;
        END IF;

        -- Update all existing children of this type to point to the new parent
        -- We only update those that don't have a parent yet and aren't the parent themselves
        UPDATE "financial_categories"
        SET "parent_id" = new_parent_id,
            "scope" = cat_scope
        WHERE "type" = r.type 
          AND "user_id" = r.user_id 
          AND "id" != new_parent_id
          AND "parent_id" IS NULL;
        
    END LOOP;
END $$;
