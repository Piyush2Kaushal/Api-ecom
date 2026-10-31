<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Mail\BrandedMail;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ContactEnquiry;
use App\Models\Invoice;
use App\Models\NewsletterSubscriber;
use App\Models\Order;
use App\Models\Page;
use App\Models\Product;
use App\Models\TrainingCourse;
use App\Models\TrainingEnquiry;
use App\Services\InvoiceService;
use App\Services\Notifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class PageController extends Controller
{
    public function show(string $slug)
    {
        $page = Page::where('slug', $slug)->where('is_active', true)->firstOrFail();

        return Inertia::render('Store/Page', [
            'page' => $page->only(['title', 'slug', 'content', 'updated_at']),
            'meta' => $this->meta($page->meta_title ?: $page->title, $page->meta_description),
        ]);
    }

    public function contact()
    {
        return Inertia::render('Store/Contact', ['meta' => $this->meta('Contact us', 'Talk to the Avesta team about CCTV, alarms, access control and trade accounts.')]);
    }

    public function sendContact(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120', 'email' => 'required|email|max:190', 'phone' => 'nullable|string|max:40',
            'company' => 'nullable|string|max:120', 'subject' => 'nullable|string|max:190', 'message' => 'required|string|max:5000',
        ]);
        ContactEnquiry::create($data + ['user_id' => auth('web')->id()]);
        Notifier::admin(new BrandedMail(
            subjectLine: 'New enquiry — '.($data['subject'] ?: $data['name']),
            heading: 'New contact enquiry',
            lines: [$data['message']],
            rows: [['Name', $data['name']], ['Email', $data['email']], ['Phone', $data['phone'] ?? '—'], ['Company', $data['company'] ?? '—']],
            button: ['text' => 'Open in admin', 'url' => route('admin.enquiries.index')],
            replyToAddress: $data['email'],
        ));
        Notifier::send($data['email'], new BrandedMail(
            subjectLine: 'We have received your message',
            heading: 'Thanks for getting in touch',
            lines: ['Hi '.$data['name'].', thank you for contacting '.setting('site_name').'. A member of our team will reply within one working day.'],
        ));

        return back()->with('success', 'Thank you — your message has been sent.');
    }

    public function training()
    {
        return Inertia::render('Store/Training', [
            'courses' => TrainingCourse::where('is_active', true)->orderBy('sort_order')->get(),
            'intro' => setting('training_intro'),
            'termsText' => setting('training_terms_text'),
            'meta' => $this->meta('Installer training', setting('training_intro')),
        ]);
    }

    public function sendTraining(Request $request)
    {
        $data = $request->validate([
            'training_course_id' => 'required|integer|exists:training_courses,id',
            'full_name' => 'required|string|max:120', 'company_name' => 'nullable|string|max:120',
            'address' => 'nullable|string|max:500', 'postcode' => 'nullable|string|max:20',
            'phone' => 'required|string|max:40', 'email' => 'required|email|max:190',
            'message' => 'nullable|string|max:3000', 'agree' => 'accepted',
        ], ['agree.accepted' => 'Please accept the terms to continue.']);
        $course = TrainingCourse::findOrFail($data['training_course_id']);
        unset($data['agree']);
        TrainingEnquiry::create($data + ['course_title' => $course->title, 'user_id' => auth('web')->id()]);

        Notifier::admin(new BrandedMail(
            subjectLine: 'Training registration — '.$course->title,
            heading: 'New training registration',
            lines: array_filter([$data['message'] ?? null]),
            rows: [['Course', $course->title], ['Name', $data['full_name']], ['Company', $data['company_name'] ?? '—'], ['Email', $data['email']],
                ['Phone', $data['phone']], ['Address', trim(($data['address'] ?? '').' '.($data['postcode'] ?? '')) ?: '—']],
            button: ['text' => 'Open in admin', 'url' => route('admin.training.index')],
            replyToAddress: $data['email'],
        ));
        Notifier::send($data['email'], new BrandedMail(
            subjectLine: 'Your training registration — '.$course->title,
            heading: 'Registration received',
            lines: ['Hi '.$data['full_name'].', thank you for registering for '.$course->title.'. Our training team will contact you shortly to confirm your place and dates.'],
        ));

        return back()->with('success', 'Thank you — your registration has been received. We will contact you shortly.');
    }

    public function trade()
    {
        $page = Page::where('slug', 'trade-accounts')->first();

        return Inertia::render('Store/Trade', [
            'content' => $page?->content,
            'meta' => $this->meta('Trade accounts', setting('trade_cta_text')),
        ]);
    }

    public function newsletter(Request $request)
    {
        $data = $request->validate(['email' => 'required|email|max:190']);
        NewsletterSubscriber::updateOrCreate(['email' => strtolower($data['email'])], ['is_active' => true]);

        return back()->with('success', 'You are subscribed — welcome aboard.');
    }

    public function currency(Request $request)
    {
        $code = strtoupper((string) $request->input('currency'));
        $allowed = collect(\App\Support\Settings::public()['currencies'])->pluck('code')->all();
        if (in_array($code, $allowed, true)) {
            $request->session()->put('currency', $code);
        }

        return back();
    }

    public function track(Request $request)
    {
        $order = null;
        $error = null;
        if ($request->filled(['number', 'email'])) {
            $order = Order::where('number', strtoupper(trim($request->query('number'))))
                ->where('email', strtolower(trim($request->query('email'))))->with(['items', 'history', 'invoices'])->first();
            $error = $order ? null : 'We could not find an order with those details.';
        }

        return Inertia::render('Store/Track', [
            'order' => $order,
            'invoices' => $order ? $order->invoices->map(fn ($i) => ['number' => $i->number, 'type' => $i->type, 'url' => URL::signedRoute('invoice.public', $i)]) : [],
            'error' => $error,
            'query' => $request->only(['number', 'email']),
            'meta' => $this->meta('Track your order'),
        ]);
    }

    public function publicInvoice(Request $request, Invoice $invoice)
    {
        abort_unless($request->hasValidSignature(), 403);

        return InvoiceService::pdf($invoice)->download($invoice->number.'.pdf');
    }

    public function sitemap()
    {
        $urls = collect([['loc' => url('/'), 'priority' => '1.0']]);
        Category::where('is_active', true)->get(['slug', 'updated_at'])->each(fn ($c) => $urls->push(['loc' => route('category.show', $c->slug), 'lastmod' => $c->updated_at, 'priority' => '0.8']));
        Brand::where('is_active', true)->get(['slug', 'updated_at'])->each(fn ($b) => $urls->push(['loc' => route('brand.show', $b->slug), 'lastmod' => $b->updated_at, 'priority' => '0.8']));
        Product::where('is_active', true)->get(['slug', 'updated_at'])->each(fn ($p) => $urls->push(['loc' => route('product.show', $p->slug), 'lastmod' => $p->updated_at, 'priority' => '0.7']));
        Page::where('is_active', true)->get(['slug', 'updated_at'])->each(fn ($p) => $urls->push(['loc' => url($p->slug), 'lastmod' => $p->updated_at, 'priority' => '0.4']));
        foreach (['training', 'contact', 'trade', 'brands'] as $r) {
            $urls->push(['loc' => route($r), 'priority' => '0.5']);
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($urls as $u) {
            $xml .= '<url><loc>'.e($u['loc']).'</loc>'.(isset($u['lastmod']) ? '<lastmod>'.$u['lastmod']->toAtomString().'</lastmod>' : '').'<priority>'.$u['priority'].'</priority></url>';
        }

        return response($xml.'</urlset>', 200, ['Content-Type' => 'application/xml']);
    }

    public function robots()
    {
        return response("User-agent: *\nDisallow: /admin\nDisallow: /account\nDisallow: /checkout\nDisallow: /cart\nSitemap: ".route('sitemap')."\n", 200, ['Content-Type' => 'text/plain']);
    }
}
