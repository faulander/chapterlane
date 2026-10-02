ALTER TABLE users ADD COLUMN yearly_book_goal INTEGER
	CHECK (yearly_book_goal IS NULL OR (yearly_book_goal BETWEEN 1 AND 1000));
