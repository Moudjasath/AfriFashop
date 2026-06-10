<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\Product;
use App\Entity\User;
use App\Repository\OrderRepository;
use App\Repository\ProductRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin', name: 'api_admin_')]
class AdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ProductRepository $productRepo,
        private OrderRepository $orderRepo,
        private UserRepository $userRepo
    ) {}

    // ── GET /api/admin/stats ───────────────────────────────
    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $totalProducts = (int) $this->productRepo->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.isActive = true')
            ->getQuery()->getSingleScalarResult();

        $totalOrders = (int) $this->orderRepo->createQueryBuilder('o')
            ->select('COUNT(o.id)')
            ->getQuery()->getSingleScalarResult();

        $revenue = (float) $this->orderRepo->createQueryBuilder('o')
            ->select('SUM(o.total)')
            ->where('o.status != :cancelled')
            ->setParameter('cancelled', 'cancelled')
            ->getQuery()->getSingleScalarResult();

        $outOfStock = (int) $this->productRepo->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.stock = 0')
            ->andWhere('p.isActive = true')
            ->getQuery()->getSingleScalarResult();

        $lowStockProducts = $this->productRepo->createQueryBuilder('p')
            ->where('p.stock >= 1')
            ->andWhere('p.stock <= 5')
            ->andWhere('p.isActive = true')
            ->getQuery()->getResult();

        $byStatus = [];
        foreach (Order::STATUSES as $s) {
            $byStatus[$s] = (int) $this->orderRepo->createQueryBuilder('o')
                ->select('COUNT(o.id)')
                ->where('o.status = :status')
                ->setParameter('status', $s)
                ->getQuery()->getSingleScalarResult();
        }

        $recentOrders = $this->orderRepo->createQueryBuilder('o')
            ->orderBy('o.createdAt', 'DESC')
            ->setMaxResults(5)
            ->getQuery()->getResult();

        return $this->json([
            'totalProducts' => $totalProducts,
            'totalOrders'   => $totalOrders,
            'revenue'       => round($revenue, 2),
            'outOfStock'    => $outOfStock,
            'lowStock'      => array_map(fn(Product $p) => $p->toArray(), $lowStockProducts),
            'byStatus'      => $byStatus,
            'recentOrders'  => array_map(fn(Order $o) => $this->orderWithUser($o), $recentOrders),
        ]);
    }

    // ── GET /api/admin/orders ──────────────────────────────
    #[Route('/orders', name: 'orders', methods: ['GET'])]
    public function orders(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $status = $request->query->get('status');
        $page   = max(1, (int) $request->query->get('page', 1));
        $limit  = min(100, max(1, (int) $request->query->get('limit', 20)));

        $qb = $this->orderRepo->createQueryBuilder('o')
            ->orderBy('o.createdAt', 'DESC');

        if ($status && in_array($status, Order::STATUSES)) {
            $qb->where('o.status = :status')->setParameter('status', $status);
        }

        $total = (int) (clone $qb)->select('COUNT(o.id)')->resetDQLPart('orderBy')->getQuery()->getSingleScalarResult();

        $orders = $qb->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()->getResult();

        return $this->json([
            'data'       => array_map(fn(Order $o) => $this->orderWithUser($o), $orders),
            'pagination' => [
                'total' => $total,
                'page'  => $page,
                'limit' => $limit,
                'pages' => (int) ceil($total / $limit),
            ],
        ]);
    }

    // ── PATCH /api/admin/orders/{id}/status ────────────────
    #[Route('/orders/{id}/status', name: 'order_status', methods: ['PATCH'])]
    public function updateOrderStatus(int $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $order = $this->orderRepo->find($id);
        if (!$order) {
            return $this->json(['error' => 'Order not found'], Response::HTTP_NOT_FOUND);
        }

        $data   = json_decode($request->getContent(), true);
        $status = $data['status'] ?? null;

        if (!$status || !in_array($status, Order::STATUSES)) {
            return $this->json(
                ['error' => 'Invalid status. Allowed: ' . implode(', ', Order::STATUSES)],
                Response::HTTP_BAD_REQUEST
            );
        }

        $order->setStatus($status);
        $this->em->flush();

        return $this->json(['message' => 'Status updated', 'data' => $this->orderWithUser($order)]);
    }

    // ── GET /api/admin/users ───────────────────────────────
    #[Route('/users', name: 'users', methods: ['GET'])]
    public function users(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $search = $request->query->get('search');
        $page   = max(1, (int) $request->query->get('page', 1));
        $limit  = min(100, max(1, (int) $request->query->get('limit', 20)));

        $qb = $this->userRepo->createQueryBuilder('u')
            ->orderBy('u.createdAt', 'DESC');

        if ($search) {
            $qb->where('u.email LIKE :s OR u.fullName LIKE :s')
               ->setParameter('s', '%'.$search.'%');
        }

        $total = (int) (clone $qb)->select('COUNT(u.id)')->resetDQLPart('orderBy')->getQuery()->getSingleScalarResult();
        $users = $qb->setFirstResult(($page - 1) * $limit)
                    ->setMaxResults($limit)
                    ->getQuery()->getResult();

        return $this->json([
            'data'       => array_map(fn(User $u) => $u->toArray(), $users),
            'pagination' => [
                'total' => $total,
                'page'  => $page,
                'limit' => $limit,
                'pages' => (int) ceil($total / $limit),
            ],
        ]);
    }

    // ── PATCH /api/admin/users/{id}/role ───────────────────
    #[Route('/users/{id}/role', name: 'user_role', methods: ['PATCH'])]
    public function updateUserRole(int $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        /** @var User $me */
        $me = $this->getUser();

        $user = $this->userRepo->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($user->getId() === $me->getId()) {
            return $this->json(['error' => 'Impossible de modifier votre propre rôle'], Response::HTTP_FORBIDDEN);
        }

        $data   = json_decode($request->getContent(), true);
        $action = $data['action'] ?? null; // 'promote' | 'revoke'

        $roles = array_filter($user->getRoles(), fn($r) => $r !== 'ROLE_USER');

        if ($action === 'promote') {
            $roles[] = 'ROLE_ADMIN';
        } elseif ($action === 'revoke') {
            $roles = array_filter($roles, fn($r) => $r !== 'ROLE_ADMIN');
        } else {
            return $this->json(['error' => 'Action invalide. Valeurs : promote, revoke'], Response::HTTP_BAD_REQUEST);
        }

        $user->setRoles(array_values(array_unique($roles)));
        $this->em->flush();

        return $this->json(['message' => 'Rôle mis à jour', 'user' => $user->toArray()]);
    }

    // ── Private helper ─────────────────────────────────────
    private function orderWithUser(Order $order): array
    {
        $data = $order->toArray();
        $user = $order->getUser();
        $data['user'] = $user ? [
            'id'       => $user->getId(),
            'fullName' => $user->getFullName(),
            'email'    => $user->getUserIdentifier(),
        ] : null;
        return $data;
    }
}
