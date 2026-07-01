-- Draft tables for the next implementation step.
-- Review names, status values, and RLS policies before running this in Supabase.

CREATE TABLE tasks (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    status VARCHAR NOT NULL DEFAULT 'todo',
    priority VARCHAR NOT NULL DEFAULT 'normal',
    assignee_id INT,
    due_date DATE,
    completed_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_task_assignee FOREIGN KEY (assignee_id) REFERENCES users(id),
    CONSTRAINT chk_task_status CHECK (status IN ('todo', 'doing', 'review', 'done')),
    CONSTRAINT chk_task_priority CHECK (priority IN ('low', 'normal', 'high'))
);

CREATE TABLE project_progress_snapshots (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id INT NOT NULL,
    completed_tasks INT NOT NULL DEFAULT 0,
    total_tasks INT NOT NULL DEFAULT 0,
    progress_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
    measured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_progress_project FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE lt_talks (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    speaker_user_id INT,
    speaker_name VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    summary TEXT NOT NULL,
    category VARCHAR,
    material_url VARCHAR,
    talk_date DATE NOT NULL,
    estimated_minutes INT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lt_speaker FOREIGN KEY (speaker_user_id) REFERENCES users(id)
);

CREATE TABLE notices (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR NOT NULL,
    body TEXT,
    author VARCHAR NOT NULL DEFAULT 'AI研究会運営',
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE lt_talks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
