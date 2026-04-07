-- 1. profiles テーブルのRLS設定
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 自分が自分のプロフィールを参照（SELECT）できる
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- 自分が自分のプロフィールを新規作成（INSERT）できる
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 自分が自分のプロフィールを更新（UPDATE）できる
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);


-- 2. paper_trades テーブルのRLS設定
ALTER TABLE paper_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trades" 
ON paper_trades FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades" 
ON paper_trades FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" 
ON paper_trades FOR UPDATE 
USING (auth.uid() = user_id);


-- 3. deal_reviews テーブルのRLS設定
ALTER TABLE deal_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reviews" 
ON deal_reviews FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews" 
ON deal_reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON deal_reviews FOR UPDATE 
USING (auth.uid() = user_id);


-- 4. skip_reviews テーブルのRLS設定
ALTER TABLE skip_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own skip reviews" 
ON skip_reviews FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skip reviews" 
ON skip_reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skip reviews" 
ON skip_reviews FOR UPDATE 
USING (auth.uid() = user_id);

-- ※補足: もしSupabase側で "baskets" テーブルなどがあり公開用（全員参照可）の場合は以下のようにします。
-- ALTER TABLE baskets ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Baskets are publicly viewable" ON baskets FOR SELECT USING (true);
