-- Ensure enum-like columns can store full string values
ALTER TABLE enquiry 
  MODIFY status VARCHAR(64) NULL,
  MODIFY interest_level VARCHAR(64) NULL,
  MODIFY property_type VARCHAR(64) NULL,
  MODIFY budget_range VARCHAR(64) NULL,
  MODIFY source VARCHAR(64) NULL;


