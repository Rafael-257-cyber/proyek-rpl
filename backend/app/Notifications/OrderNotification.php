<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderNotification extends Notification
{
    public function __construct(
        public string $title,
        public string $message,
        public int|string $orderId,
        public ?string $actionUrl = null,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mailMessage = (new MailMessage)
            ->subject($this->title)
            ->greeting('Halo ' . ($notifiable->name ?? 'Pelanggan'))
            ->line($this->message)
            ->line('Nomor pesanan: #' . $this->orderId);

        if ($this->actionUrl) {
            $mailMessage->action('Lihat Pesanan', $this->actionUrl);
        }

        return $mailMessage;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'order_id' => $this->orderId,
            'action_url' => $this->actionUrl,
        ];
    }
}