-- Enable RLS on all tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "review" ENABLE ROW LEVEL SECURITY;

-- 1. Public Read-Only Tables (Product, Settings)
-- Products are visible to everyone
CREATE POLICY "Public read access for products" ON "product"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Settings are visible to everyone
CREATE POLICY "Public read access for settings" ON "settings"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- 2. User Private Tables (User, Account, Session, Customer)
-- Users can only see/edit their own profile
CREATE POLICY "Users can manage their own profile" ON "user"
AS PERMISSIVE FOR ALL
TO authenticated
USING (id = auth.uid()::text)
WITH CHECK (id = auth.uid()::text);

-- Users can see their own accounts (OAuth)
CREATE POLICY "Users can view their own accounts" ON "account"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

-- Users can see their own sessions
CREATE POLICY "Users can view their own sessions" ON "session"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

-- Users can view/edit their own customer data
CREATE POLICY "Users can manage their own customer data" ON "customer"
AS PERMISSIVE FOR ALL
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- 3. Mixed Access Tables (Review, Order)
-- Reviews: Public read, Authenticated create/update own
CREATE POLICY "Public read access for reviews" ON "review"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create/edit their own reviews" ON "review"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own reviews" ON "review"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own reviews" ON "review"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (user_id = auth.uid()::text);

-- Orders: Users can see orders linked to their customer profile
-- Note: This assumes customer.user_id links to auth.uid()
CREATE POLICY "Users can view their own orders" ON "order"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  customer_id IN (
    SELECT id FROM customer WHERE user_id = auth.uid()::text
  )
);

-- Note: Insert/Update on Orders is typically handled by backend (Service Role),
-- but if we allowed direct insert:
-- CREATE POLICY "Users can create their own orders" ... 
-- We'll leave it restricted to Service Role for now for data integrity.

-- 4. Verification
-- Usually only accessed by backend/auth service
-- We can leave it private (no policies = no access for public/anon/authenticated)
-- or allow system access if needed. Service role always has access.
