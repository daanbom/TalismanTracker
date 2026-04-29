-- Rollback for issue #87 house-rules-per-group migration.

drop function if exists replace_group_house_rules_blocks(uuid, jsonb);

drop trigger if exists trg_group_house_rules_blocks_touch on group_house_rules_blocks;

drop function if exists touch_group_house_rules_blocks_updated_at();

drop table if exists group_house_rules_blocks;
