<?php

namespace App\Entity;

use App\Repository\OrderItemRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrderItemRepository::class)]
class OrderItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Order::class, inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Order $order = null;

    #[ORM\Column]
    private int $productId = 0;

    #[ORM\Column(length: 255)]
    private string $productName = '';

    #[ORM\Column(type: 'float')]
    private float $price = 0.0;

    #[ORM\Column]
    private int $qty = 1;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $size = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $color = null;

    #[ORM\Column(length: 10, nullable: true)]
    private ?string $emoji = null;

    // ── Getters / Setters ─────────────────────────────────────

    public function getId(): ?int { return $this->id; }

    public function getOrder(): ?Order { return $this->order; }
    public function setOrder(?Order $order): static { $this->order = $order; return $this; }

    public function getProductId(): int { return $this->productId; }
    public function setProductId(int $productId): static { $this->productId = $productId; return $this; }

    public function getProductName(): string { return $this->productName; }
    public function setProductName(string $productName): static { $this->productName = $productName; return $this; }

    public function getPrice(): float { return $this->price; }
    public function setPrice(float $price): static { $this->price = $price; return $this; }

    public function getQty(): int { return $this->qty; }
    public function setQty(int $qty): static { $this->qty = $qty; return $this; }

    public function getSize(): ?string { return $this->size; }
    public function setSize(?string $size): static { $this->size = $size; return $this; }

    public function getColor(): ?string { return $this->color; }
    public function setColor(?string $color): static { $this->color = $color; return $this; }

    public function getEmoji(): ?string { return $this->emoji; }
    public function setEmoji(?string $emoji): static { $this->emoji = $emoji; return $this; }

    public function toArray(): array
    {
        return [
            'id'          => $this->id,
            'productId'   => $this->productId,
            'productName' => $this->productName,
            'price'       => $this->price,
            'qty'         => $this->qty,
            'size'        => $this->size,
            'color'       => $this->color,
            'emoji'       => $this->emoji,
            'subtotal'    => round($this->price * $this->qty, 2),
        ];
    }
}
