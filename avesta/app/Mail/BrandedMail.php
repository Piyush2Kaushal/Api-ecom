<?php

namespace App\Mail;

use Illuminate\Mail\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * One branded, reusable email used for every notification
 * (OTP codes, order updates, approvals, enquiries…).
 */
class BrandedMail extends Mailable
{
    /**
     * @param  array<int,string>  $lines  Paragraphs shown above the table
     * @param  array<int,array{0:string,1:string}>  $rows  Label/value rows
     * @param  array{text:string,url:string}|null  $button
     * @param  array<int,array{data:string,name:string}>  $files  Raw attachments
     */
    public function __construct(
        public string $subjectLine,
        public string $heading,
        public array $lines = [],
        public array $rows = [],
        public ?array $button = null,
        public ?string $code = null,
        public array $outro = [],
        public array $files = [],
        public ?string $replyToAddress = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine,
            replyTo: $this->replyToAddress ? [$this->replyToAddress] : [],
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.branded');
    }

    public function attachments(): array
    {
        return array_map(fn ($f) => Attachment::fromData(fn () => $f['data'], $f['name'])->withMime('application/pdf'), $this->files);
    }
}
