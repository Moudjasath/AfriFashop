<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\User;
use App\Repository\OrderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/orders', name: 'api_orders_')]
class OrderController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private OrderRepository $orderRepo
    ) {}

    // ── GET all orders for the current user ────────────────
    #[Route('', name: 'index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $orders = $this->orderRepo->findBy(['user' => $user], ['createdAt' => 'DESC']);

        return $this->json([
            'data'  => array_map(fn(Order $o) => $o->toArray(), $orders),
            'total' => count($orders),
        ]);
    }

    // ── GET single order ───────────────────────────────────
    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        /** @var User $user */
        $user  = $this->getUser();
        $order = $this->orderRepo->find($id);

        if (!$order || $order->getUser() !== $user) {
            return $this->json(['error' => 'Order not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(['data' => $order->toArray()]);
    }

    // ── CREATE order from cart ─────────────────────────────
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $body = json_decode($request->getContent(), true);

        if (!$body || empty($body['items']) || empty($body['shippingAddress'])) {
            return $this->json(
                ['error' => 'Missing required fields: items, shippingAddress'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Validate shipping address fields
        $required = ['firstName', 'lastName', 'address', 'city', 'country'];
        foreach ($required as $field) {
            if (empty($body['shippingAddress'][$field])) {
                return $this->json(
                    ['error' => "Missing shipping field: $field"],
                    Response::HTTP_BAD_REQUEST
                );
            }
        }

        $order = new Order();
        $order->setUser($user);
        $order->setShippingAddress($body['shippingAddress']);
        $order->setStatus('pending');

        $total = 0.0;
        foreach ($body['items'] as $raw) {
            if (!isset($raw['productId'], $raw['productName'], $raw['price'], $raw['qty'])) {
                continue;
            }
            $item = new OrderItem();
            $item->setProductId((int) $raw['productId']);
            $item->setProductName((string) $raw['productName']);
            $item->setPrice((float) $raw['price']);
            $item->setQty(max(1, (int) $raw['qty']));
            $item->setSize($raw['size'] ?? null);
            $item->setColor($raw['color'] ?? null);
            $item->setEmoji($raw['emoji'] ?? null);

            $total += $item->getPrice() * $item->getQty();
            $order->addItem($item);
        }

        if ($order->getItems()->isEmpty()) {
            return $this->json(['error' => 'Order must contain at least one item'], Response::HTTP_BAD_REQUEST);
        }

        $order->setTotal(round($total, 2));

        $this->em->persist($order);
        $this->em->flush();

        return $this->json(
            ['message' => 'Order placed successfully', 'data' => $order->toArray()],
            Response::HTTP_CREATED
        );
    }
}
