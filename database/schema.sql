-- Supabase Database Schema for Planner Premium ULTRA

-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT,
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'admin')),
    trial_end_date TIMESTAMP WITH TIME ZONE,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_activity DATE,
    paper_saved INTEGER DEFAULT 0,
    achievements TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Planners table
CREATE TABLE planners (
    id SERIAL PRIMARY KEY,
    user_email TEXT REFERENCES users(email) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('todo', 'projeto', 'habitos', 'financeiro', 'diario')),
    nome TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tarefas (tasks) table
CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    planner_id INTEGER REFERENCES planners(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT CHECK (categoria IN ('Trabalho', 'Pessoal', 'Saúde', 'Estudos', 'Finanças', 'Outro')),
    prioridade TEXT CHECK (prioridade IN ('Baixa', 'Média', 'Alta', 'Urgente', 'Crítica')),
    data DATE,
    hora TIME,
    duracao INTEGER, -- in minutes
    repetir TEXT CHECK (repetir IN ('Nenhum', 'Diário', 'Semanal', 'Mensal')),
    contexto TEXT CHECK (contexto IN ('Qualquer lugar', 'Casa', 'Escritório', 'Online')),
    energia TEXT CHECK (energia IN ('Baixa', 'Média', 'Alta')),
    tags TEXT[] DEFAULT '{}',
    lembretes JSONB, -- array of reminder objects
    subtarefas JSONB, -- array of subtask objects
    anexos TEXT[] DEFAULT '{}',
    done BOOLEAN DEFAULT FALSE,
    em_progresso BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE planners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only access their own data
CREATE POLICY "Users can access own data" ON users
    FOR ALL USING (auth.uid() = id OR email = auth.jwt() ->> 'email');

CREATE POLICY "Users can access own planners" ON planners
    FOR ALL USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can access own tasks" ON tarefas
    FOR ALL USING (EXISTS (
        SELECT 1 FROM planners 
        WHERE planners.id = tarefas.planner_id 
        AND planners.user_email = auth.jwt() ->> 'email'
    ));

-- Create indexes for better performance
CREATE INDEX idx_planners_user_email ON planners(user_email);
CREATE INDEX idx_tarefas_planner_id ON tarefas(planner_id);
CREATE INDEX idx_tarefas_data ON tarefas(data);
CREATE INDEX idx_tarefas_done ON tarefas(done);
CREATE INDEX idx_tarefas_categoria ON tarefas(categoria);
CREATE INDEX idx_users_email ON users(email);

-- Create a function to update the last_activity field
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET last_activity = CURRENT_DATE 
    WHERE email = NEW.user_email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update last_activity when a new planner is created
CREATE TRIGGER update_last_activity_planner
    AFTER INSERT ON planners
    FOR EACH ROW
    EXECUTE FUNCTION update_last_activity();

-- Create a trigger to update last_activity when a new task is created
CREATE TRIGGER update_last_activity_task
    AFTER INSERT ON tarefas
    FOR EACH ROW
    EXECUTE FUNCTION update_last_activity();