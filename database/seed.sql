-- Seed data for Planner Premium ULTRA

-- Insert sample user (password is 'password123' hashed)
INSERT INTO users (id, email, name, password_hash, subscription_status, trial_end_date, level, xp, streak, last_activity, paper_saved, achievements) VALUES
(gen_random_uuid(), 'admin@example.com', 'Admin User', '$2a$10$8K1p/aW1H3Ew6cY7u6Wwru4oY9e7v5e8p9o2n3m4l5k6j7i8h1g0f', 'admin', NULL, 10, 1500, 15, CURRENT_DATE, 50, ARRAY['First Task', 'Task Master', 'Week Streak']),
(gen_random_uuid(), 'user@example.com', 'Test User', '$2a$10$8K1p/aW1H3Ew6cY7u6Wwru4oY9e7v5e8p9o2n3m4l5k6j7i8h1g0f', 'trial', CURRENT_DATE + INTERVAL '14 days', 3, 250, 5, CURRENT_DATE, 12, ARRAY['First Task']);

-- Insert sample planners
INSERT INTO planners (user_email, tipo, nome) VALUES
('user@example.com', 'todo', 'Minhas Tarefas Diárias'),
('user@example.com', 'habitos', 'Hábitos Saudáveis'),
('user@example.com', 'projeto', 'Projeto Pessoal'),
('admin@example.com', 'financeiro', 'Controle Financeiro');

-- Insert sample tasks
INSERT INTO tarefas (planner_id, titulo, descricao, categoria, prioridade, data, hora, duracao, repetir, contexto, energia, tags, done) VALUES
(1, 'Completar tarefa de exemplo', 'Esta é uma tarefa de exemplo para demonstrar o sistema', 'Pessoal', 'Média', CURRENT_DATE, '09:00:00', 60, 'Nenhum', 'Casa', 'Média', ARRAY['exemplo', 'inicial'], TRUE),
(1, 'Estudar por 1 hora', 'Estudar o módulo de React Avançado', 'Estudos', 'Alta', CURRENT_DATE + INTERVAL '1 day', '14:00:00', 60, 'Diário', 'Casa', 'Alta', ARRAY['estudo', 'react'], FALSE),
(2, 'Beber 2L de água', 'Lembre-se de manter-se hidratado durante o dia', 'Saúde', 'Baixa', CURRENT_DATE, '08:00:00', 1, 'Diário', 'Qualquer lugar', 'Baixa', ARRAY['saúde', 'água'], TRUE),
(2, 'Exercício físico', '30 minutos de caminhada ou academia', 'Saúde', 'Média', CURRENT_DATE, '18:00:00', 30, 'Semanal', 'Academia', 'Média', ARRAY['exercício', 'saúde'], FALSE),
(3, 'Planejar nova funcionalidade', 'Planejar a implementação da nova funcionalidade de relatórios', 'Trabalho', 'Alta', CURRENT_DATE + INTERVAL '2 days', '10:00:00', 120, 'Nenhum', 'Escritório', 'Média', ARRAY['planejamento', 'funcionalidade'], FALSE);

-- Update user XP based on completed tasks
UPDATE users SET xp = 150 WHERE email = 'user@example.com';