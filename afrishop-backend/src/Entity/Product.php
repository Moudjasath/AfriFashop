<?php

namespace App\Entity;

use App\Repository\ProductRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 200)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 3, max: 200)]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Assert\NotBlank]
    private ?string $description = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Assert\NotBlank]
    #[Assert\Positive]
    private ?string $price = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $oldPrice = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['Dresses', 'Tops', 'Accessories', 'Sets'])]
    private ?string $category = null;

    #[ORM\Column(type: Types::JSON)]
    private array $colors = [];

    #[ORM\Column(type: Types::JSON)]
    private array $sizes = [];

    #[ORM\Column(length: 10, nullable: true)]
    private ?string $badge = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $image = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 3, scale: 1, options: ['default' => 5.0])]
    private string $rating = '5.0';

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $reviewCount = 0;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $stock = 0;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $isActive = true;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    // Getters & Setters
    public function getId(): ?int { return $this->id; }

    public function getName(): ?string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(string $description): static { $this->description = $description; return $this; }

    public function getPrice(): ?float { return $this->price !== null ? (float) $this->price : null; }
    public function setPrice(float $price): static { $this->price = (string) $price; return $this; }

    public function getOldPrice(): ?float { return $this->oldPrice !== null ? (float) $this->oldPrice : null; }
    public function setOldPrice(?float $oldPrice): static { $this->oldPrice = $oldPrice !== null ? (string) $oldPrice : null; return $this; }

    public function getCategory(): ?string { return $this->category; }
    public function setCategory(string $category): static { $this->category = $category; return $this; }

    public function getColors(): array { return $this->colors; }
    public function setColors(array $colors): static { $this->colors = $colors; return $this; }

    public function getSizes(): array { return $this->sizes; }
    public function setSizes(array $sizes): static { $this->sizes = $sizes; return $this; }

    public function getBadge(): ?string { return $this->badge; }
    public function setBadge(?string $badge): static { $this->badge = $badge; return $this; }

    public function getImage(): ?string { return $this->image; }
    public function setImage(?string $image): static { $this->image = $image; return $this; }

    public function getRating(): float { return (float) $this->rating; }
    public function setRating(float $rating): static { $this->rating = (string) $rating; return $this; }

    public function getReviewCount(): int { return $this->reviewCount; }
    public function setReviewCount(int $reviewCount): static { $this->reviewCount = $reviewCount; return $this; }

    public function getStock(): int { return $this->stock; }
    public function setStock(int $stock): static { $this->stock = $stock; return $this; }

    public function isActive(): bool { return $this->isActive; }
    public function setIsActive(bool $isActive): static { $this->isActive = $isActive; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }

    public function toArray(): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'price'       => (float) $this->price,
            'oldPrice'    => $this->oldPrice ? (float) $this->oldPrice : null,
            'category'    => $this->category,
            'colors'      => $this->colors,
            'sizes'       => $this->sizes,
            'badge'       => $this->badge,
            'image'       => $this->image,
            'rating'      => (float) $this->rating,
            'reviews'     => $this->reviewCount,
            'stock'       => $this->stock,
            'isActive'    => $this->isActive,
            'createdAt'   => $this->createdAt?->format('Y-m-d H:i:s'),
        ];
    }
}