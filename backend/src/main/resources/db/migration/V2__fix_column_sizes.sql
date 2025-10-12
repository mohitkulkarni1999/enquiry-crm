-- Fix column sizes to prevent data truncation errors
ALTER TABLE enquiry 
  MODIFY COLUMN status VARCHAR(128) NULL,
  MODIFY COLUMN interest_level VARCHAR(128) NULL,
  MODIFY COLUMN property_type VARCHAR(128) NULL,
  MODIFY COLUMN budget_range VARCHAR(128) NULL,
  MODIFY COLUMN source VARCHAR(128) NULL;
