-- Add floor_plan_urls column to support multiple floor plans
ALTER TABLE listings ADD COLUMN floor_plan_urls text[] DEFAULT '{}';

-- Migrate existing floor_plan_url data to the new array column
UPDATE listings 
SET floor_plan_urls = ARRAY[floor_plan_url] 
WHERE floor_plan_url IS NOT NULL AND floor_plan_url != '';