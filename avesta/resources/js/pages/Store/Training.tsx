import { useForm } from '@inertiajs/react';
import { Award, Briefcase, GraduationCap, Wrench } from 'lucide-react';
import { Button, Checkbox, Input, Select, Textarea } from '@/components/ui';
import { useShared } from '@/hooks/useShared';
import { cn, route } from '@/lib/utils';

interface Course { id: number; title: string; description: string | null; duration: string | null; price_label: string | null }

export default function Training({ courses, intro, termsText }: { courses: Course[]; intro: string; termsText: string }) {
    const { auth } = useShared();
    const form = useForm({ training_course_id: '' as string | number, full_name: auth?.user?.name ?? '', company_name: '', address: '', postcode: '', phone: '', email: auth?.user?.email ?? '', message: '', agree: false });
    const pillars = [
        { icon: GraduationCap, title: 'Expert instructors', text: 'Learn from engineers with real-world installation experience.' },
        { icon: Wrench, title: 'Practical training', text: 'Hands-on with the latest CCTV, alarm and access equipment.' },
        { icon: Award, title: 'Certification', text: 'Get certified and boost your career opportunities.' },
        { icon: Briefcase, title: 'Career support', text: 'Guidance to help you grow in the security industry.' },
    ];
    return (
        <>
            <section className="relative overflow-hidden bg-noir text-white">
                <img src="/images/demo/hero-training.svg" alt="" className="absolute inset-0 size-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/70 to-transparent" />
                <div className="container-x relative py-20 md:py-28">
                    <div className="eyebrow text-violet-300">Avesta Installer Training</div>
                    <h1 className="mt-4 max-w-2xl font-display text-[44px] font-semibold leading-[1.02] tracking-tight md:text-[68px]">Learn today.<br />Install tomorrow.</h1>
                    <p className="mt-5 max-w-lg text-[17px] text-white/65">{intro}</p>
                    <Button className="mt-8" size="lg" href="#register">Register your interest</Button>
                </div>
            </section>
            <section className="border-b border-mist">
                <div className="container-x grid gap-px bg-mist sm:grid-cols-2 lg:grid-cols-4">
                    {pillars.map(({ icon: Icon, title, text }) => (
                        <div key={title} className="bg-white p-7">
                            <Icon className="size-6 text-violet-600" strokeWidth={1.75} />
                            <div className="mt-4 font-semibold">{title}</div>
                            <div className="mt-1 text-sm text-slate">{text}</div>
                        </div>
                    ))}
                </div>
            </section>
            <div className="container-x grid gap-10 py-14 md:py-20 lg:grid-cols-[1fr_1.15fr]">
                <div>
                    <h2 className="font-display text-3xl font-semibold">Courses</h2>
                    <div className="mt-6 space-y-3">
                        {courses.map((c) => (
                            <button key={c.id} type="button" onClick={() => { form.setData('training_course_id', c.id); document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' }); }} className={cn('block w-full rounded-3xl border p-5 text-left transition', String(form.data.training_course_id) === String(c.id) ? 'border-violet-600 bg-violet-50/40 ring-1 ring-violet-600' : 'border-mist hover:border-fog')}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="font-semibold">{c.title}</div>
                                    <div className="shrink-0 text-right text-xs text-slate">{c.duration}<br />{c.price_label}</div>
                                </div>
                                {c.description && <p className="mt-2 text-sm leading-relaxed text-slate">{c.description}</p>}
                            </button>
                        ))}
                    </div>
                </div>
                <form id="register" onSubmit={(e) => { e.preventDefault(); form.post(route('training.store'), { preserveScroll: true, onSuccess: () => form.reset('message', 'agree') }); }} className="scroll-mt-28 rounded-3xl bg-porcelain p-6 md:p-8">
                    <h2 className="text-xl font-semibold">Registration form</h2>
                    <p className="mt-1 text-sm text-slate">We will contact you to confirm dates and your place.</p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <Select label="Choose a course" required placeholder="Select a course" value={String(form.data.training_course_id)} onChange={(e) => form.setData('training_course_id', e.target.value)} options={courses.map((c) => ({ value: c.id, label: c.title }))} error={form.errors.training_course_id} wrapperClassName="sm:col-span-2" />
                        <Input label="Full name" required value={form.data.full_name} onChange={(e) => form.setData('full_name', e.target.value)} error={form.errors.full_name} />
                        <Input label="Company name" value={form.data.company_name} onChange={(e) => form.setData('company_name', e.target.value)} />
                        <Input label="Street address" value={form.data.address} onChange={(e) => form.setData('address', e.target.value)} wrapperClassName="sm:col-span-2" />
                        <Input label="Postcode" value={form.data.postcode} onChange={(e) => form.setData('postcode', e.target.value.toUpperCase())} />
                        <Input label="Contact number" required type="tel" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} error={form.errors.phone} />
                        <Input label="Email address" required type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} wrapperClassName="sm:col-span-2" />
                        <Textarea label="Anything we should know? (optional)" rows={3} value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} wrapperClassName="sm:col-span-2" />
                    </div>
                    <Checkbox className="mt-5" checked={form.data.agree} onChange={(v) => form.setData('agree', v)} label={termsText} error={form.errors.agree} />
                    <Button className="mt-6" size="lg" loading={form.processing}>Submit registration</Button>
                </form>
            </div>
        </>
    );
}
