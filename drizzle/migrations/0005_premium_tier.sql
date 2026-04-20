-- Add the premium tier to the plan enum. Must be run OUTSIDE a transaction
-- when mixing ALTER TYPE ADD VALUE with later usage, but for this one-shot
-- addition the IF NOT EXISTS guard is enough.

ALTER TYPE "plan" ADD VALUE IF NOT EXISTS 'premium';
