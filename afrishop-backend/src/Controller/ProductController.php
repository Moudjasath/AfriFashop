<?php

namespace App\Controller;

use App\Entity\Product;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/products', name: 'api_products_')]
class ProductController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ProductRepository $productRepo,
        private ValidatorInterface $validator
    ) {}

    // ── GET ALL (with filters) ─────────────────────────────
    #[Route('', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $category = $request->query->get('category');
        $search   = $request->query->get('search');
        $sort     = $request->query->get('sort', 'id');
        $order    = strtoupper($request->query->get('order', 'ASC'));
        $page     = max(1, (int) $request->query->get('page', 1));
        $limit    = min(50, max(1, (int) $request->query->get('limit', 12)));

        $qb = $this->productRepo->createQueryBuilder('p')
            ->where('p.isActive = true');

        if ($category) {
            $qb->andWhere('p.category = :cat')->setParameter('cat', $category);
        }
        if ($search) {
            $qb->andWhere('p.name LIKE :search OR p.description LIKE :search')
               ->setParameter('search', '%'.$search.'%');
        }

        $allowedSorts = ['id', 'name', 'price', 'rating', 'createdAt'];
        if (!in_array($sort, $allowedSorts)) $sort = 'id';
        $order = $order === 'DESC' ? 'DESC' : 'ASC';
        $qb->orderBy('p.'.$sort, $order);

        // Pagination
        $total = (clone $qb)->select('COUNT(p.id)')->resetDQLPart('orderBy')->getQuery()->getSingleScalarResult();
        $products = $qb->setFirstResult(($page - 1) * $limit)
                       ->setMaxResults($limit)
                       ->getQuery()->getResult();

        return $this->json([
            'data'       => array_map(fn(Product $p) => $p->toArray(), $products),
            'pagination' => [
                'total'   => (int) $total,
                'page'    => $page,
                'limit'   => $limit,
                'pages'   => (int) ceil($total / $limit),
            ],
        ]);
    }

    // ── GET ONE ────────────────────────────────────────────
    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $product = $this->productRepo->find($id);
        if (!$product || !$product->isActive()) {
            return $this->json(['error' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }
        return $this->json(['data' => $product->toArray()]);
    }

    // ── GET BY CATEGORY ────────────────────────────────────
    #[Route('/category/{category}', name: 'by_category', methods: ['GET'])]
    public function byCategory(string $category): JsonResponse
    {
        $products = $this->productRepo->findBy(['category' => $category, 'isActive' => true]);
        return $this->json([
            'data'  => array_map(fn(Product $p) => $p->toArray(), $products),
            'total' => count($products),
        ]);
    }

    // ── CREATE (Admin only) ────────────────────────────────
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        $product = new Product();
        $this->hydrate($product, $data);

        $errors = $this->validator->validate($product);
        if (count($errors) > 0) {
            $msgs = [];
            foreach ($errors as $e) $msgs[$e->getPropertyPath()] = $e->getMessage();
            return $this->json(['errors' => $msgs], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $this->em->persist($product);
        $this->em->flush();

        return $this->json(['message' => 'Product created', 'data' => $product->toArray()], Response::HTTP_CREATED);
    }

    // ── UPDATE (Admin only) ────────────────────────────────
    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $product = $this->productRepo->find($id);
        if (!$product) {
            return $this->json(['error' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $this->hydrate($product, $data);

        $this->em->flush();

        return $this->json(['message' => 'Product updated', 'data' => $product->toArray()]);
    }

    // ── DELETE (Admin only) ────────────────────────────────
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $product = $this->productRepo->find($id);
        if (!$product) {
            return $this->json(['error' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        // Soft delete
        $product->setIsActive(false);
        $this->em->flush();

        return $this->json(['message' => 'Product deleted']);
    }

    // ── PRIVATE HYDRATE ────────────────────────────────────
    private function hydrate(Product $product, array $data): void
    {
        if (isset($data['name']))         $product->setName($data['name']);
        if (isset($data['description']))  $product->setDescription($data['description']);
        if (isset($data['price']))        $product->setPrice((float) $data['price']);
        if (array_key_exists('oldPrice', $data)) $product->setOldPrice($data['oldPrice'] ? (float) $data['oldPrice'] : null);
        if (isset($data['category']))     $product->setCategory($data['category']);
        if (isset($data['colors']))       $product->setColors($data['colors']);
        if (isset($data['sizes']))        $product->setSizes($data['sizes']);
        if (array_key_exists('badge', $data))    $product->setBadge($data['badge']);
        if (isset($data['image']))        $product->setImage($data['image']);
        if (isset($data['stock']))        $product->setStock((int) $data['stock']);
        if (isset($data['rating']))       $product->setRating((float) $data['rating']);
        if (isset($data['reviewCount']))  $product->setReviewCount((int) $data['reviewCount']);
        if (isset($data['isActive']))     $product->setIsActive((bool) $data['isActive']);
    }
}