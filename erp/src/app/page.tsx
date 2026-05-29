import { Building2, Home, Users } from 'lucide-react';

const sections = [
  { icon: Home, title: 'Объявления', description: 'Модерация и управление объявлениями.' },
  { icon: Users, title: 'Пользователи', description: 'Арендаторы, арендодатели и роли.' },
  { icon: Building2, title: 'Аналитика', description: 'Показатели платформы и активность.' },
] as const;

export default function DashboardPage() {
  return (
    <main className="container py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
        <p className="mt-2 text-muted-foreground">The Spot ERP — внутренний инструмент команды.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ icon: Icon, title, description }) => (
          <article key={title} className="rounded-lg border border-border bg-card p-6">
            <Icon className="h-6 w-6 text-primary" aria-hidden />
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
