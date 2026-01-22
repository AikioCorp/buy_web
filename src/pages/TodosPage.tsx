import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Todo {
  id: string;
  task: string;
  is_complete: boolean;
}

export function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    getTodos();
  }, []);

  async function getTodos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setTodos(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des todos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addTodo() {
    if (!newTask.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ task: newTask, is_complete: false }])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setTodos([...data, ...todos]);
        setNewTask('');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du todo:', error);
    }
  }

  async function toggleComplete(id: string, is_complete: boolean) {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: !is_complete })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTodos(todos.map(todo => {
        if (todo.id === id) {
          return { ...todo, is_complete: !is_complete };
        }
        return todo;
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du todo:', error);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Liste des tâches</h1>

      <div className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Nouvelle tâche..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c2b]"
            onKeyPress={e => e.key === 'Enter' && addTodo()}
          />
          <button
            onClick={addTodo}
            className="bg-[#0f4c2b] text-white px-6 py-2 rounded-r-lg hover:bg-[#1a5f3a] transition-colors"
          >
            Ajouter
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-4">Chargement...</p>
      ) : todos.length === 0 ? (
        <p className="text-center py-4 text-gray-500">Aucune tâche pour le moment</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={todo.is_complete}
                  onChange={() => toggleComplete(todo.id, todo.is_complete)}
                  className="mr-3 h-5 w-5 rounded border-gray-300 text-[#0f4c2b] focus:ring-[#0f4c2b]"
                />
                <span className={todo.is_complete ? 'line-through text-gray-400' : ''}>
                  {todo.task}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
