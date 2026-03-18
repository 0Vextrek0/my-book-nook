import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ReaderNav } from '@/components/ReaderNav';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      toast.error('Заповніть усі обов\'язкові поля');
      return;
    }
    if (!agreed) {
      toast.error('Прийміть правила бібліотеки');
      return;
    }
    if (password.length < 6) {
      toast.error('Пароль має містити щонайменше 6 символів');
      return;
    }
    register(name, email, phone, password);
    toast.success('Реєстрація успішна!');
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <ReaderNav />
      <div className="container flex items-center justify-center py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-center text-2xl font-bold">Реєстрація</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Створіть акаунт читача
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="name">ПІБ *</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Іванов Іван Іванович" />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="phone">Телефон *</Label>
              <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+380501234567" />
            </div>
            <div>
              <Label htmlFor="password">Пароль *</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Мінімум 6 символів" />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="agree" checked={agreed} onCheckedChange={(c) => setAgreed(c === true)} />
              <Label htmlFor="agree" className="text-sm text-muted-foreground leading-tight">
                Я погоджуюся з правилами бібліотеки та обробкою персональних даних
              </Label>
            </div>
            <Button type="submit" className="w-full font-display font-semibold">Зареєструватися</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Вже маєте акаунт? <Link to="/login" className="text-primary hover:underline">Увійти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
