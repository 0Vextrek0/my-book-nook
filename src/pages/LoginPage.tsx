import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ReaderNav } from '@/components/ReaderNav';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Заповніть усі поля');
      return;
    }
    login(email, password);
    toast.success('Ви успішно увійшли!');
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <ReaderNav />
      <div className="container flex items-center justify-center py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-center text-2xl font-bold">Вхід</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Увійдіть до свого акаунту
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full font-display font-semibold">Увійти</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Немає акаунту? <Link to="/register" className="text-primary hover:underline">Зареєструватися</Link>
          </p>
          <div className="mt-4 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">Демо акаунти:</p>
            <p>Читач: olena@example.com</p>
            <p>Бібліотекар: admin@library.com</p>
            <p className="mt-1 italic">Будь-який пароль підійде</p>
          </div>
        </div>
      </div>
    </div>
  );
}
