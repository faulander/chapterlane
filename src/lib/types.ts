export type Visibility = 'private' | 'friends' | 'public';
export type SystemCategory = 'planned' | 'active' | 'paused' | 'completed' | 'dropped';

export interface User {
	id: string;
	username: string;
	email: string;
	display_name: string | null;
	avatar_url: string | null;
	bio: string | null;
	preferred_language: string;
	profile_visibility: Visibility;
	created_at: string;
	updated_at: string;
}

export interface Session {
	id: string;
	user_id: string;
	expires_at: string;
	created_at: string;
}

export interface Book {
	id: string;
	original_title: string;
	original_language: string;
	description: string | null;
	cover_url: string | null;
	created_at: string;
	updated_at: string;
}

export interface BookTitleTranslation {
	id: string;
	book_id: string;
	language_code: string;
	translated_title: string;
}

export interface Author {
	id: string;
	name: string;
	sort_name: string | null;
}

export interface BookAuthor {
	book_id: string;
	author_id: string;
	author_order: number;
}

export interface ExternalBookRef {
	id: string;
	book_id: string;
	source: string;
	external_id: string;
}

export interface UserBook {
	id: string;
	user_id: string;
	book_id: string;
	current_status_id: string | null;
	started_at: string | null;
	finished_at: string | null;
	user_total_pages: number | null;
	current_page: number | null;
	current_percent: number | null;
	reread_count: number;
	created_at: string;
	updated_at: string;
}

export interface StatusDefinition {
	id: string;
	user_id: string | null;
	label: string;
	system_category: SystemCategory;
	sort_order: number;
	is_default: number;
	created_at: string;
}

export interface Shelf {
	id: string;
	user_id: string;
	name: string;
	description: string | null;
	visibility: Visibility;
	sort_order: number;
	created_at: string;
	updated_at: string;
}

export interface ReadingPlace {
	id: string;
	user_id: string;
	name: string;
	icon: string | null;
	color: string | null;
	sort_order: number;
	created_at: string;
}

export interface ProgressEntry {
	id: string;
	user_book_id: string;
	page: number | null;
	percent: number | null;
	reading_place_id: string | null;
	note: string | null;
	created_at: string;
}

export interface ReadingList {
	id: string;
	user_id: string;
	title: string;
	description: string | null;
	visibility: Visibility;
	created_at: string;
	updated_at: string;
}

export interface ReadingListItem {
	id: string;
	list_id: string;
	book_id: string;
	note: string | null;
	position: number;
	added_at: string;
}

export interface FriendRequest {
	id: string;
	sender_user_id: string;
	receiver_user_id: string;
	status: 'pending' | 'accepted' | 'rejected';
	created_at: string;
	responded_at: string | null;
}

export interface Friendship {
	user_id: string;
	friend_user_id: string;
	created_at: string;
}

export interface ActivityEvent {
	id: string;
	actor_user_id: string;
	event_type: string;
	object_type: string;
	object_id: string;
	visibility: Visibility;
	payload_json: string | null;
	created_at: string;
}

export interface ImportJob {
	id: string;
	user_id: string;
	source: 'goodreads' | 'storygraph' | 'calibre';
	status: 'pending' | 'parsing' | 'previewing' | 'importing' | 'completed' | 'failed';
	total_rows: number | null;
	matched_rows: number | null;
	imported_rows: number | null;
	error_message: string | null;
	started_at: string | null;
	finished_at: string | null;
	created_at: string;
}

export interface ImportRow {
	id: string;
	job_id: string;
	row_number: number;
	raw_data: string;
	parsed_title: string | null;
	parsed_author: string | null;
	parsed_status: string | null;
	parsed_pages: string | null;
	parsed_date_read: string | null;
	parsed_date_added: string | null;
	matched_book_id: string | null;
	match_confidence: number | null;
	user_action: 'pending' | 'accept' | 'skip' | 'manual_match';
	import_result: 'imported' | 'skipped' | 'error' | null;
	error_message: string | null;
}
